import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

import type { Plane } from "@/lib/marshrut/geo";
import type { ModeId } from "@/lib/marshrut/data";
import { MODES } from "@/lib/marshrut/data";
import type { Quote } from "@/lib/marshrut/model";
import { along, buildRoute, type RoutePlan } from "@/lib/marshrut/route";
import { clamp, clamp01, easeInOut, lerp, seg, smoother } from "@/lib/marshrut/util";

import { CargoRig } from "./cargo";
import { copyView, planFlight, type Flight, type View } from "./flight";
import { buildGeoField } from "./geoField";
import { CityLights } from "./lights";
import { MapLines } from "./mapLines";
import { QueueLights } from "./queue";
import { Plate } from "./plate";
import { RouteLines, legWidth } from "./routeLines";
import { TrainConsist, beamTexture } from "./train";
import { CAPACITY, TRAILER, TRUCK_LENGTH, TruckRig } from "./truck";
import { buildToken } from "./vehicles";

/**
 * The stage: one renderer, one ground, and a camera that can be four metres
 * above a pallet or six thousand kilometres above Asia, at night.
 *
 * The page drives it through a rig (`setRig`): where the camera should be,
 * how far along the route the cargo is, whether the pallet is in the
 * trailer. The rig is a pure function of the scroll position, worked out by
 * the director, so any point of the page lands on the same picture however
 * it was reached. The camera eases toward the rig rather than jumping to it,
 * which is what gives a scroll its weight. Only the opening and the dip to
 * the pallet when the cargo changes are played on a clock, as flights, and
 * the rig takes over again where each one ends.
 */

export const COLORS = {
  night: "#0c0d0f",
  land: "#16181b",
  sea: "#0a0b0c",
  floor: "#18191b",
  bone: "#e7e3da",
  water: "#5a6674",
  amber: "#dc9f4b",
  hot: "#f1d09a",
  lamp: "#7a5226",
  warm: "#e9ae5c",
  cream: "#f7e6c4",
  kraft: "#c9a56f",
  pine: "#d8bd90",
} as const;

export const FOV = 28;
const HALF = Math.tan((FOV * Math.PI) / 360);

/** Where the truck's own centre is, measured from the pallet's starting place. */
export const CENTER_FROM_PALLET = TRUCK_LENGTH / 2 + 2.4;
const PALLET_START_X = -2.4;

export interface Hud {
  /** Bumped whenever anything the overlay draws has changed. */
  serial: number;
  width: number;
  height: number;
  /** Camera distance to what it looks at, metres. */
  d: number;
  pitch: number;
  /** Ground metres per pixel at the target, across and down the screen. */
  mppX: number;
  mppY: number;
  target: { x: number; z: number };
  /** Where the pointer touches the ground, when it does. */
  cursor: { x: number; z: number; on: boolean };
  /** 0 = loading dock, 1 = atlas. */
  atlas: number;
  /** 0 = the pallet is the subject, 1 = the route is. */
  focus: number;
}

export type ProjectFn = (
  x: number,
  y: number,
  z: number,
) => { x: number; y: number; visible: boolean; depth: number };

export type ViewName = "dock" | "load" | "route";

/** What the director asks of the stage for one moment of the page. */
export interface Rig {
  view: View;
  /** Pixels the picture is shifted by, so the subject clears the panel beside it. */
  frame: { x: number; y: number };
  /** Metres along the route the cargo has gone. */
  s: number;
  /** 0: the pallet stands where it was packed. 1: it is in the trailer. */
  load: number;
  /** Strength of the route still to come, 0..1. */
  ahead: number;
  /** Once the cargo is under way a non-road mode shows its own vehicle. */
  moving: boolean;
  /** Strength of the routes not taken, 0..1. */
  alts: number;
  /** The queue of trucks at the crossing, 0..1. */
  queue: number;
}

interface Tween {
  t0: number;
  seconds: number;
  update: (t: number) => void;
  done?: () => void;
}

export class MarshrutEngine {
  readonly renderer: THREE.WebGLRenderer;
  /** The ground itself. */
  private base = new THREE.Scene();
  /** Everything that stands on it. */
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(FOV, 1, 0.05, 1e9);
  readonly hud: Hud = {
    serial: 0,
    width: 1,
    height: 1,
    d: 1,
    pitch: 0.5,
    mppX: 1,
    mppY: 1,
    target: { x: 0, z: 0 },
    cursor: { x: 0, z: 0, on: false },
    atlas: 0,
    focus: 0,
  };

  private plate: Plate;
  private lines: MapLines | null = null;
  private lights: CityLights;
  private queue: QueueLights;
  private routes = new RouteLines({ amber: COLORS.amber, hot: COLORS.hot, night: COLORS.night, bone: COLORS.bone });

  private hemi = new THREE.HemisphereLight(0x2e3238, 0x0c0d0f, 0.45);
  private key = new THREE.DirectionalLight(0xffeedd, 3.0);
  private rim = new THREE.DirectionalLight(0x9aa4b0, 0.5);
  private catcher: THREE.Mesh;
  private blob: THREE.Mesh;

  private vehicleRoot = new THREE.Group();
  private vehicleScale = new THREE.Group();
  private truck: TruckRig;
  private cargo: CargoRig;
  private train: TrainConsist;
  /** How closed the trailer is because it has been loaded, 0..1. */
  private closedByLoad = 0;
  /** 0: the truck carries the cargo; 1: the mode's own vehicle does. Runs in time, not with the scroll. */
  private handoff = 0;

  private quote: Quote | null = null;
  private route: RoutePlan | null = null;
  private heading = 0;
  private vehicleS = CENTER_FROM_PALLET;
  private loadT = 0;

  /** The vehicle that stands in for the truck once the trip begins, if the mode is not road. */
  private token: THREE.Group | null = null;
  private tokenMode: ModeId | null = null;

  private view: View = { x: 0, y: 0.8, z: 0, d: 5, pitch: 0.42, yaw: -0.6 };
  private rig: Rig | null = null;
  private framing = { x: 0, y: 0 };
  private flight: { plan: Flight; t0: number; seconds: number; done?: () => void } | null = null;
  private tweens: Tween[] = [];
  private pointer = { x: 0, y: 0, inside: false };
  private smoothPointer = { x: 0, y: 0 };
  private raf = 0;
  private active = true;
  private dirty = true;
  private disposed = false;
  private last = 0;
  private clock = 0;
  private w = 1;
  private h = 1;
  private tmp = new THREE.Vector3();
  private ray = new THREE.Raycaster();
  private ndc = new THREE.Vector2();
  private hit = new THREE.Vector3();
  private floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private onFrame: Array<(hud: Hud) => void> = [];
  private beforeFrame: Array<(dt: number) => void> = [];
  private lampAt = { x: 0, z: 0, r: 6 };

  constructor(
    private canvas: HTMLCanvasElement,
    private opts: { low: boolean; reduced: boolean },
  ) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !opts.low,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(new THREE.Color(COLORS.night), 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 1;
    // Passes are composed by hand: ground, hairlines, lights, route, then the objects on it.
    this.renderer.autoClear = false;
    this.renderer.shadowMap.enabled = !opts.low;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    this.plate = new Plate(null, {
      night: COLORS.night,
      land: COLORS.land,
      sea: COLORS.sea,
      floor: COLORS.floor,
      bone: COLORS.bone,
      lamp: COLORS.lamp,
    });
    this.base.add(this.plate.mesh);
    this.lights = new CityLights({ warm: COLORS.warm, cream: COLORS.cream });
    this.queue = new QueueLights(COLORS.cream);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.1;
    pmrem.dispose();

    // A sodium lamp high over the pallet, and the cold of the night sky from behind.
    this.key.castShadow = !opts.low;
    this.key.shadow.mapSize.set(2048, 2048);
    this.key.shadow.bias = -0.0004;
    this.key.shadow.normalBias = 0.03;
    this.key.shadow.radius = 6;
    this.scene.add(this.hemi, this.key, this.key.target, this.rim, this.rim.target);

    // The floor catches shadows and nothing else, so the cargo looks set down
    // on the concrete instead of pasted over it.
    this.catcher = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.ShadowMaterial({ color: new THREE.Color("#000000"), opacity: 0.5 }),
    );
    this.catcher.rotation.x = -Math.PI / 2;
    this.catcher.position.y = 0.004;
    this.catcher.receiveShadow = true;
    this.catcher.renderOrder = 1;
    this.scene.add(this.catcher);

    this.truck = new TruckRig(COLORS.kraft);
    this.cargo = new CargoRig({ kraft: COLORS.kraft, pine: COLORS.pine });
    this.truck.group.position.x = -TRUCK_LENGTH / 2;
    this.truck.group.add(this.cargo.group);
    this.vehicleScale.add(this.truck.group);
    this.vehicleRoot.add(this.vehicleScale);
    this.scene.add(this.vehicleRoot);
    this.truck.setLights(1);

    // The train is laid along the line car by car, so it lives in the world, not in the vehicle's frame.
    this.train = new TrainConsist(beamTexture());
    this.train.group.visible = false;
    this.scene.add(this.train.group);

    // A soft ellipse under the vehicle for when it is too big for the light's
    // shadow map to cover: at any zoom the truck should touch the ground.
    const blobCanvas = document.createElement("canvas");
    blobCanvas.width = blobCanvas.height = 128;
    const bctx = blobCanvas.getContext("2d");
    if (bctx) {
      const grad = bctx.createRadialGradient(64, 64, 4, 64, 64, 62);
      grad.addColorStop(0, "rgba(0,0,0,0.7)");
      grad.addColorStop(0.6, "rgba(0,0,0,0.3)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      bctx.fillStyle = grad;
      bctx.fillRect(0, 0, 128, 128);
    }
    const blobTexture = new THREE.CanvasTexture(blobCanvas);
    blobTexture.colorSpace = THREE.SRGBColorSpace;
    this.blob = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ map: blobTexture, transparent: true, depthWrite: false, opacity: 0 }),
    );
    this.blob.rotation.x = -Math.PI / 2;
    this.blob.scale.set(TRUCK_LENGTH * 1.35, 5.4, 1);
    this.blob.position.y = 0.03;
    this.blob.renderOrder = 1;
    this.vehicleScale.add(this.blob);

    this.applyCamera(this.view);
  }

  /** Builds the distance field and the hairlines for the atlas. */
  async loadMap() {
    const field = await buildGeoField();
    if (this.disposed) return;
    this.plate.setField(field);
    this.lines = new MapLines(field.lines, COLORS.bone, COLORS.water);
    this.sizeLayers();
    this.dirty = true;
  }

  /** Compiles every shader once, so the first real frame does not stutter. */
  warm() {
    this.renderer.compile(this.base, this.camera);
    this.renderer.compile(this.scene, this.camera);
    this.dirty = true;
  }

  subscribe(fn: (hud: Hud) => void) {
    this.onFrame.push(fn);
    return () => {
      this.onFrame = this.onFrame.filter((f) => f !== fn);
    };
  }

  /** Runs at the start of every frame, before the camera is placed. */
  onBeforeFrame(fn: (dt: number) => void) {
    this.beforeFrame.push(fn);
    return () => {
      this.beforeFrame = this.beforeFrame.filter((f) => f !== fn);
    };
  }

  /* ---------------------------------------------------------- the quote */

  /**
   * Hands the stage a new calculation. Anything that changed is redrawn:
   * the cartons if the product or count did, the ribbons if the route did.
   */
  setQuote(q: Quote, opts?: { animate?: boolean }) {
    const prev = this.quote;
    this.quote = q;
    const animate = !!opts?.animate && !this.opts.reduced;

    const routeChanged =
      !prev ||
      prev.input.origin !== q.input.origin ||
      prev.input.dest !== q.input.dest ||
      prev.input.mode !== q.input.mode;
    const cargoChanged =
      !prev ||
      prev.input.product !== q.input.product ||
      prev.pallets.perPallet !== q.pallets.perPallet ||
      prev.pallets.pallets !== q.pallets.pallets ||
      prev.cartons !== q.cartons;

    if (routeChanged) {
      this.route = q.route;
      this.heading = along(q.route, CENTER_FROM_PALLET).heading;
      const alternatives = MODES.filter((m) => m.id !== q.input.mode).map((m) =>
        buildRoute(q.input.origin, m.id as ModeId, q.input.dest),
      );
      this.routes.set(q.route, alternatives);
      this.queue.set(q.route);
      this.tokenMode = null;
      this.useToken(null);
      this.placeVehicle(this.vehicleS);
      if (animate) this.animateRoute();
    }
    this.routes.setWidths([legWidth(q.legs[0].share), legWidth(q.legs[1].share), legWidth(q.legs[2].share)]);

    if (cargoChanged) {
      this.cargo.build(q.pallets, q.product);
      this.truck.setLoad(q.pallets.pallets, q.pallets.height, true);
      this.applyLoad();
      if (animate && this.loadT < 0.5) this.animateDrop();
    } else if (prev) {
      // The total may have changed without the layout changing.
      this.truck.setLoad(q.pallets.pallets, q.pallets.height, true);
    }
    this.dirty = true;
  }

  private placeVehicle(s: number) {
    if (!this.route) return;
    this.vehicleS = s;
    const p = along(this.route, s);
    this.vehicleRoot.position.set(p.x, p.lift, p.z);
    this.vehicleRoot.rotation.y = -p.heading;
    this.dirty = true;
  }

  /** Puts the hero pallet on the ground behind the truck (0) or in the trailer (1). */
  private applyLoad() {
    if (!this.quote) return;
    const t = this.loadT;
    const slot = this.truck.slot(Math.max(0, Math.min(CAPACITY, this.quote.pallets.pallets) - 1));
    // Two moves that overlap: lift to the trailer's floor while still
    // outside, then slide in to the place this pallet was always going to take.
    const a = smoother(seg(t, 0, 0.45));
    const b = smoother(seg(t, 0.35, 1));
    const x = lerp(lerp(PALLET_START_X, -0.2, a), slot.x, b);
    this.cargo.group.position.set(x, a * (TRAILER.floor + 0.07), slot.z * b);
    this.dirty = true;
  }

  /** Lets the cartons land on the pallet again, for when the camera is there to watch. */
  dropCartons() {
    if (this.opts.reduced) return;
    this.animateDrop();
  }

  private animateDrop() {
    this.cargo.drop(0);
    this.tween(1.5, (t) => this.cargo.drop(t));
  }

  private animateRoute() {
    this.routes.progress = 0;
    const length = this.route?.length ?? 1;
    this.tween(1.6, (t) => {
      this.routes.progress = easeInOut(t) * length * 1.02;
      if (t >= 1) this.routes.progress = 1e12;
    });
  }

  private tween(seconds: number, update: (t: number) => void, done?: () => void) {
    if (this.opts.reduced) {
      update(1);
      done?.();
      return;
    }
    this.tweens.push({ t0: performance.now(), seconds, update, done });
    this.dirty = true;
  }

  /** The route currently drawn. */
  get routePlan(): RoutePlan | null {
    return this.route;
  }

  /** Dims every leg but one on the map; -1 restores them. */
  highlightLeg(leg: number) {
    this.routes.highlight(leg);
    this.dirty = true;
  }

  /** Lights up a route not taken, for as long as the timetable points at it. */
  previewMode(mode: ModeId | null) {
    this.routes.preview = mode;
    this.dirty = true;
  }

  /** A point in the hero pallet's own frame (origin at its centre on the floor), in world metres. */
  cargoPoint(x: number, y: number, z: number): THREE.Vector3 {
    this.scene.updateMatrixWorld();
    return this.cargo.group.localToWorld(new THREE.Vector3(x, y, z));
  }

  /** Where the camera is, in the hero pallet's own frame: tells the overlay which sides face us. */
  cameraInCargoFrame(): THREE.Vector3 {
    this.scene.updateMatrixWorld();
    return this.cargo.group.worldToLocal(this.camera.position.clone());
  }

  get cargoDims() {
    return this.cargo.dims;
  }

  private useToken(mode: ModeId | null) {
    if (this.token) this.vehicleScale.remove(this.token);
    this.token = null;
    if (mode === "sea" || mode === "air") {
      this.token = buildToken(mode);
      this.vehicleScale.add(this.token);
    }
    // A new vehicle comes in from nothing rather than replacing the old one in a frame.
    this.handoff = Math.min(this.handoff, 0.45);
    this.dirty = true;
  }

  /** Stops every animation where it stands: the opening, skipped. */
  settle() {
    this.tweens = [];
    this.flight = null;
    this.dirty = true;
  }

  /** How far along the route the vehicle is, metres. */
  get travelled() {
    return this.vehicleS;
  }

  /** Where the cargo is in the world. */
  get cargoPosition(): { x: number; y: number; z: number } {
    const p = this.vehicleRoot.position;
    return { x: p.x, y: p.y, z: p.z };
  }

  get isFlying() {
    return this.flight !== null;
  }

  /* ---------------------------------------------------------------- rig */

  /** Hands the stage the director's picture of this moment. */
  setRig(rig: Rig) {
    this.rig = rig;
    if (Math.abs(rig.s - this.vehicleS) > 1e-3) this.placeVehicle(rig.s);
    if (Math.abs(rig.load - this.loadT) > 1e-4) {
      this.loadT = rig.load;
      this.applyLoad();
    }
    // The cutaway closes once the last pallet is in: from then on it is a truck on the road.
    this.closedByLoad = smoother(seg(rig.load, 0.82, 1));
    const want = this.quote ? this.quote.input.mode : null;
    if (want !== this.tokenMode) {
      this.tokenMode = want;
      this.useToken(want);
    }
    this.routes.travelled = rig.s;
    this.routes.ahead = rig.ahead;
    this.routes.altStrength = rig.alts;
    // A queue of trucks belongs to a land crossing.
    const land = this.quote ? this.quote.input.mode === "road" || this.quote.input.mode === "rail" : false;
    this.queue.fade = land ? rig.queue : 0;
    this.dirty = true;
  }

  /** Drops the rig's hold on the camera, for the opening. */
  releaseRig() {
    this.rig = null;
  }

  /* ------------------------------------------------------------- camera */

  get current(): View {
    return copyView(this.view);
  }

  setView(v: View) {
    this.flight = null;
    this.view = copyView(v);
    this.dirty = true;
  }

  flyTo(target: View, opts?: { seconds?: number; done?: () => void }) {
    if (this.opts.reduced) {
      this.setView(target);
      opts?.done?.();
      return;
    }
    const plan = planFlight(copyView(this.view), target);
    this.flight = {
      plan,
      t0: performance.now(),
      seconds: opts?.seconds ?? plan.seconds,
      done: opts?.done,
    };
    this.dirty = true;
  }

  /** Yaw that puts the camera behind and to one side of something heading `heading`. */
  yawBehind(heading: number, side: number) {
    return Math.PI / 2 - (heading + Math.PI + side);
  }

  /** The named viewpoints. */
  viewFor(name: ViewName, rectFor?: () => { x0: number; x1: number; y0: number; y1: number }): View {
    const q = this.quote;
    const stack = q ? q.pallets.height : 1.2;
    if (name === "dock") {
      return {
        x: 0,
        y: Math.max(0.6, stack * 0.55),
        z: 0,
        d: 3.6 + stack * 1.5,
        pitch: 0.36,
        yaw: this.yawBehind(this.heading, 0.75),
      };
    }
    if (name === "load") {
      const ahead = 9.5;
      return {
        x: Math.cos(this.heading) * ahead,
        y: 1.7,
        z: Math.sin(this.heading) * ahead,
        d: 27,
        pitch: 0.4,
        yaw: this.yawBehind(this.heading, 1.15),
      };
    }
    const route = this.route;
    const rect = rectFor?.() ?? { x0: -0.86, x1: 0.86, y0: -0.12, y1: 0.78 };
    if (!route) return { x: 0, y: 0, z: 0, d: 8e6, pitch: 1, yaw: 0.06 };
    // A flight rises off the ground, so its apex is part of what has to fit.
    const lifted = route.points.map((pt, i) => ({ x: pt.x, y: route.lift[i] ?? 0, z: pt.z }));
    return this.fit(lifted, rect, { pitch: 0.9, yaw: -0.32 });
  }

  /**
   * The view that puts every point in `points` inside a rectangle of the
   * screen. Solved by iterating: project, see how much too big or off-centre
   * it is, correct, repeat. Eight passes is more than it ever needs.
   */
  fit(
    points: (Plane & { y?: number })[],
    rect: { x0: number; x1: number; y0: number; y1: number },
    angles: { pitch: number; yaw: number },
  ): View {
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    for (const p of points) {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minZ = Math.min(minZ, p.z);
      maxZ = Math.max(maxZ, p.z);
    }
    const v: View = {
      x: (minX + maxX) / 2,
      y: 0,
      z: (minZ + maxZ) / 2,
      d: Math.max(maxX - minX, maxZ - minZ) * 1.6,
      pitch: angles.pitch,
      yaw: angles.yaw,
    };

    const cam = new THREE.PerspectiveCamera(FOV, this.w / this.h, 1, 1e10);
    const place = () => {
      const cp = Math.cos(v.pitch);
      cam.position.set(
        v.x + v.d * cp * Math.sin(v.yaw),
        v.y + v.d * Math.sin(v.pitch),
        v.z + v.d * cp * Math.cos(v.yaw),
      );
      cam.lookAt(v.x, v.y, v.z);
      cam.updateMatrixWorld(true);
      cam.updateProjectionMatrix();
    };
    const box = () => {
      const v3 = new THREE.Vector3();
      let x0 = Infinity;
      let x1 = -Infinity;
      let y0 = Infinity;
      let y1 = -Infinity;
      for (const p of points) {
        v3.set(p.x, p.y ?? 0, p.z).project(cam);
        x0 = Math.min(x0, v3.x);
        x1 = Math.max(x1, v3.x);
        y0 = Math.min(y0, v3.y);
        y1 = Math.max(y1, v3.y);
      }
      return { x0, x1, y0, y1 };
    };
    const ground = (nx: number, ny: number) => {
      const r = new THREE.Raycaster();
      r.setFromCamera(new THREE.Vector2(nx, ny), cam);
      return r.ray.intersectPlane(this.floor, new THREE.Vector3());
    };

    for (let i = 0; i < 8; i++) {
      place();
      let b = box();
      const s = Math.min(
        (rect.x1 - rect.x0) / Math.max(1e-6, b.x1 - b.x0),
        (rect.y1 - rect.y0) / Math.max(1e-6, b.y1 - b.y0),
      );
      v.d /= s;
      place();
      b = box();
      const a = ground((b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2);
      const c = ground((rect.x0 + rect.x1) / 2, (rect.y0 + rect.y1) / 2);
      if (a && c) {
        v.x += a.x - c.x;
        v.z += a.z - c.z;
      }
    }
    return v;
  }

  private applyOffset() {
    const { x, y } = this.framing;
    if (Math.abs(x) < 0.01 && Math.abs(y) < 0.01) this.camera.clearViewOffset();
    else this.camera.setViewOffset(this.w, this.h, -x, -y, this.w, this.h);
  }

  private applyCamera(v: View) {
    // Parallax is generous next to the pallet and nearly gone over the continent,
    // where the same angle would slide the whole route out from under the words.
    const amp = lerp(0.05, 0.011, clamp((Math.log10(v.d) - 1) / 4, 0, 1));
    const yaw = v.yaw + this.smoothPointer.x * amp;
    const pitch = clamp(v.pitch - this.smoothPointer.y * amp * 0.6, 0.1, 1.5);
    const cp = Math.cos(pitch);
    this.camera.position.set(
      v.x + v.d * cp * Math.sin(yaw),
      v.y + v.d * Math.sin(pitch),
      v.z + v.d * cp * Math.cos(yaw),
    );
    this.camera.lookAt(v.x, v.y, v.z);
    this.camera.near = Math.max(0.02, v.d * 0.012);
    this.camera.far = v.d * 90;
    this.applyOffset();
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld(true);
  }

  /**
   * Eases the camera toward the rig. Distance is chased in log space, so a
   * climb from a pallet to a continent takes as long per step at every
   * scale; position is chased in units of that distance for the same reason.
   */
  private chase(target: View, dt: number) {
    const v = this.view;
    const k = 1 - Math.exp(-dt * 9);
    const ld = Math.log(v.d);
    const nd = Math.exp(ld + (Math.log(target.d) - ld) * k);
    const dx = target.x - v.x;
    const dz = target.z - v.z;
    const far = Math.hypot(dx, dz) / Math.max(nd, 1);
    // Very far off (a jump), catch up at once rather than sliding across Asia.
    const kp = far > 40 ? 1 : k;
    let dyaw = (target.yaw - v.yaw) % (Math.PI * 2);
    if (dyaw > Math.PI) dyaw -= Math.PI * 2;
    if (dyaw < -Math.PI) dyaw += Math.PI * 2;
    const moved =
      Math.abs(nd - v.d) / v.d > 1e-5 ||
      Math.hypot(dx, dz) > nd * 1e-5 ||
      Math.abs(target.pitch - v.pitch) > 1e-5 ||
      Math.abs(dyaw) > 1e-5 ||
      Math.abs(target.y - v.y) > nd * 1e-5;
    if (!moved) return false;
    v.d = nd;
    v.x += dx * kp;
    v.z += dz * kp;
    v.y += (target.y - v.y) * k;
    v.pitch += (target.pitch - v.pitch) * k;
    v.yaw += dyaw * k;
    return true;
  }

  /* -------------------------------------------------------------- input */

  setPointer(nx: number, ny: number, inside: boolean) {
    this.pointer = { x: nx, y: ny, inside };
    this.dirty = true;
  }

  project: ProjectFn = (x, y, z) => {
    this.tmp.set(x, y, z).project(this.camera);
    return {
      x: ((this.tmp.x + 1) / 2) * this.w,
      y: ((1 - this.tmp.y) / 2) * this.h,
      visible: this.tmp.z > -1 && this.tmp.z < 1,
      depth: this.tmp.z,
    };
  };

  /* --------------------------------------------------------------- loop */

  get size() {
    return { w: this.w, h: this.h };
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    if (w === this.w && h === this.h) return false;
    this.w = w;
    this.h = h;
    const dpr = Math.min(window.devicePixelRatio || 1, this.opts.low ? 1.25 : 2);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.applyOffset();
    this.camera.updateProjectionMatrix();
    this.sizeLayers();
    this.dirty = true;
    return true;
  }

  private sizeLayers() {
    const size = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    const dpr = this.renderer.getPixelRatio();
    this.lines?.setSize(size.x, size.y, dpr);
    this.lights.setSize(size.x, size.y);
    this.queue.setSize(size.x, size.y, dpr);
    this.routes.setSize(size.x, size.y, dpr);
    this.routes.setScale(clamp(this.w / 1100, 0.66, 1));
  }

  setActive(on: boolean) {
    this.active = on;
    if (on) this.dirty = true;
  }

  start() {
    this.last = performance.now();
    const loop = (now: number) => {
      this.raf = requestAnimationFrame(loop);
      this.frame(now);
    };
    this.raf = requestAnimationFrame(loop);
  }

  /** Draws one frame now, whether or not anything changed: for the loader's last step. */
  renderNow() {
    this.dirty = true;
    this.frame(performance.now());
  }

  private frame(now: number) {
    if (!this.active || this.disposed) return;
    const dt = Math.min(0.1, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    this.clock += dt;

    for (const fn of this.beforeFrame) fn(dt);

    // Ease the pointer so the parallax has weight and never twitches.
    const tx = this.pointer.inside ? this.pointer.x : 0;
    const ty = this.pointer.inside ? this.pointer.y : 0;
    const k = 1 - Math.exp(-dt * 4);
    const nx = this.smoothPointer.x + (tx - this.smoothPointer.x) * k;
    const ny = this.smoothPointer.y + (ty - this.smoothPointer.y) * k;
    if (Math.abs(nx - this.smoothPointer.x) > 1e-4 || Math.abs(ny - this.smoothPointer.y) > 1e-4) this.dirty = true;
    this.smoothPointer.x = nx;
    this.smoothPointer.y = ny;

    if (this.tweens.length) {
      this.dirty = true;
      const finished: Tween[] = [];
      for (const tw of this.tweens) {
        const t = clamp01((now - tw.t0) / (tw.seconds * 1000));
        tw.update(t);
        if (t >= 1) finished.push(tw);
      }
      if (finished.length) {
        this.tweens = this.tweens.filter((tw) => !finished.includes(tw));
        for (const tw of finished) tw.done?.();
      }
    }

    if (this.flight) {
      const f = this.flight;
      const t = clamp01((now - f.t0) / (f.seconds * 1000));
      this.view = f.plan.at(t);
      this.dirty = true;
      if (t >= 1) {
        this.flight = null;
        this.view = f.plan.at(1);
        f.done?.();
      }
    } else if (this.rig) {
      if (this.chase(this.rig.view, dt)) this.dirty = true;
    }

    // The picture's offset follows the rig the same way the camera does.
    const fx = this.rig ? this.rig.frame.x : 0;
    const fy = this.rig ? this.rig.frame.y : 0;
    const kf = 1 - Math.exp(-dt * 8);
    if (Math.abs(fx - this.framing.x) > 0.05 || Math.abs(fy - this.framing.y) > 0.05) {
      this.framing.x += (fx - this.framing.x) * kf;
      this.framing.y += (fy - this.framing.y) * kf;
      this.dirty = true;
    }

    const v = this.view;
    // How much of the ground is atlas: none below 15 km, all above 500 km.
    const altitude = v.d * Math.sin(v.pitch);
    const atlas = easeInOut(
      clamp((Math.log(altitude) - Math.log(15_000)) / (Math.log(500_000) - Math.log(15_000)), 0, 1),
    );
    // Between the dock and the map the measuring grid spreads over the whole
    // ground, so the descent passes through its scales instead of a void.
    const wide = smoother(clamp((Math.log(altitude) - Math.log(120)) / (Math.log(2_500) - Math.log(120)), 0, 1));

    // The pulses along the route keep the map alive while it is on screen.
    const alive = atlas > 0.05 && !this.opts.reduced;
    // On the map the truck hands the cargo to the mode's own vehicle: once
    // the pallet is in and the camera has risen, the truck draws in to a
    // point and the train, ship or plane comes out of it.
    const own = this.tokenMode === "rail" || this.tokenMode === "sea" || this.tokenMode === "air";
    const handTo = own && this.loadT > 0.99 && (atlas > 0.5 || (this.rig?.moving ?? false)) ? 1 : 0;
    if (this.handoff !== handTo) {
      const step = this.opts.reduced ? 1 : dt / 0.9;
      this.handoff = handTo > this.handoff ? Math.min(handTo, this.handoff + step) : Math.max(handTo, this.handoff - step);
      this.dirty = true;
    }

    // Only a changed view is news to the overlays; a frame drawn for the pulses alone is not.
    const changed = this.dirty;
    if (!changed && !alive) return;
    this.dirty = false;

    this.applyCamera(v);

    const degPerPx = (2 * v.d * HALF) / this.h / 111_000;
    let grat = 10;
    let best = Infinity;
    for (const s of [30, 10, 5, 2, 1, 0.5, 0.2, 0.1]) {
      const score = Math.abs(Math.log(s / degPerPx / 220));
      if (score < best) {
        best = score;
        grat = s;
      }
    }

    // The vehicle keeps a constant size on screen once the camera is too far
    // to see it at its own: on the map it is still a truck, a train, a ship.
    const scale = Math.max(1, (0.042 * v.d) / TRUCK_LENGTH);
    this.vehicleScale.scale.setScalar(scale);
    // Seen from high up the truck is always a closed truck; the cutaway is for the dock.
    this.truck.setClosed(Math.max(this.closedByLoad, smoother(seg(atlas, 0.12, 0.45))));
    // A plane flies; its shadow stays on the ground.
    this.blob.position.y = (0.03 - this.vehicleRoot.position.y) / scale;
    const truckIn = 1 - smoother(seg(this.handoff, 0, 0.45));
    const ownIn = smoother(seg(this.handoff, 0.45, 1));
    this.truck.group.scale.setScalar(Math.max(1e-3, truckIn));
    this.truck.group.position.x = (-TRUCK_LENGTH / 2) * truckIn;
    this.truck.group.visible = truckIn > 0.002;
    if (this.token) {
      this.token.scale.setScalar((TRUCK_LENGTH / 16.3) * Math.max(1e-3, ownIn));
      this.token.visible = ownIn > 0.002;
    }
    this.train.group.visible = this.tokenMode === "rail" && this.handoff > 0.45;
    // A train is long: over the whole continent it is drawn shorter, or it would lie over half the route.
    const trainScale = scale * 0.6 * clamp(3.5e6 / v.d, 0.55, 1);
    if (this.train.group.visible && this.route) this.train.update(this.route, this.vehicleS, trainScale, this.handoff);
    const shadows = scale < 1.4 && !this.opts.low;
    this.key.castShadow = shadows;
    this.catcher.visible = shadows;
    (this.blob.material as THREE.MeshBasicMaterial).opacity = clamp01((scale - 1) / 2) * 0.9;

    // Light and shadow follow whatever the camera is looking at; the lamp
    // hangs over the pallet while it is on the dock.
    const ext = clamp(v.d * 0.75, 3.2, 26);
    this.scene.updateMatrixWorld();
    const pallet = this.cargo.group.getWorldPosition(this.tmp);
    const lx = atlas < 0.99 ? pallet.x : v.x;
    const lz = atlas < 0.99 ? pallet.z : v.z;
    this.lampAt.x = lx;
    this.lampAt.z = lz;
    this.lampAt.r = 3.6;
    this.key.position.set(lx - ext * 0.25, ext * 4.2, lz + ext * 0.35);
    this.key.target.position.set(lx, 0, lz);
    this.key.target.updateMatrixWorld();
    this.rim.position.set(v.x + ext * 2, ext * 1.2, v.z - ext * 2.4);
    this.rim.target.position.set(v.x, 0, v.z);
    this.rim.target.updateMatrixWorld();
    const sc = this.key.shadow.camera;
    sc.left = -ext;
    sc.right = ext;
    sc.top = ext;
    sc.bottom = -ext;
    sc.near = 0.5;
    sc.far = ext * 8;
    sc.updateProjectionMatrix();
    this.catcher.position.x = v.x;
    this.catcher.position.z = v.z;
    this.catcher.scale.set(ext * 4, ext * 4, 1);

    this.plate.update({
      cam: this.camera.position,
      target: this.tmp.set(v.x, v.y, v.z),
      dist: v.d,
      map: atlas,
      grid: 1 - atlas,
      wide,
      grat,
      contour: clamp(((2 * v.d * HALF) / this.h / 1000) * 9, 8, 90),
      lamp: this.lampAt,
    });

    // Pointer on the ground, for the coordinate readout.
    this.ndc.set(this.pointer.x, this.pointer.y);
    this.ray.setFromCamera(this.ndc, this.camera);
    const on = this.pointer.inside && this.ray.ray.intersectPlane(this.floor, this.hit) !== null;

    const mppX = (2 * v.d * HALF) / this.h;
    const hud = this.hud;
    if (changed) hud.serial++;
    hud.width = this.w;
    hud.height = this.h;
    hud.d = v.d;
    hud.pitch = v.pitch;
    hud.mppX = mppX;
    hud.mppY = mppX / Math.max(0.2, Math.sin(v.pitch));
    hud.target.x = v.x;
    hud.target.z = v.z;
    hud.cursor.on = on;
    if (on) {
      hud.cursor.x = this.hit.x;
      hud.cursor.z = this.hit.z;
    }
    hud.atlas = atlas;
    hud.focus = 1 - atlas;

    const r = this.renderer;
    const dpr = r.getPixelRatio();
    r.setRenderTarget(null);
    r.clear();
    r.render(this.base, this.camera);
    this.lines?.render(r, this.camera, atlas);
    this.lights.render(r, this.camera, atlas, v.d, dpr);
    this.queue.render(r, this.camera, atlas, this.clock);
    this.routes.pulse = this.opts.reduced ? 0 : 0.55;
    this.routes.render(r, this.camera, mppX, clamp01(atlas * 3), this.clock);
    r.render(this.scene, this.camera);
    if (changed) for (const fn of this.onFrame) fn(hud);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.plate.dispose();
    this.lines?.dispose();
    this.lights.dispose();
    this.queue.dispose();
    this.routes.dispose();
    this.truck.dispose();
    this.train.dispose();
    this.cargo.dispose();
    this.renderer.dispose();
  }
}
