"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useChannelOverlay } from "@/components/contact/ChannelOverlayProvider";
import { useCopy } from "@/components/i18n/CopyProvider";
import { TypeText } from "@/components/motion/TypeText";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

import { InkButton } from "./InkButton";

/** Logical court. Everything is simulated here and scaled to the canvas. */
const W = 960;
const H = 540;
const PADDLE_W = 14;
const PADDLE_H = 100;
const BALL = 14;
const INSET = 26;
const TO_WIN = 5;
/** Speeds in court units per 60fps frame. */
const SERVE_SPEED = 7.4;
const MAX_SPEED = 17;
const AI_SPEED = 6.3;
const KEY_SPEED = 10;
const MAX_ANGLE = (56 * Math.PI) / 180;

type Phase = "idle" | "playing" | "over";

interface World {
  playerY: number;
  aiY: number;
  ballX: number;
  ballY: number;
  vx: number;
  vy: number;
  speed: number;
  aiError: number;
  servingAt: number;
  keys: { up: boolean; down: boolean };
}

function freshWorld(): World {
  return {
    playerY: H / 2 - PADDLE_H / 2,
    aiY: H / 2 - PADDLE_H / 2,
    ballX: W / 2 - BALL / 2,
    ballY: H / 2 - BALL / 2,
    vx: 0,
    vy: 0,
    speed: SERVE_SPEED,
    aiError: 0,
    servingAt: 0,
    keys: { up: false, down: false },
  };
}

function css(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

/**
 * A round of pong where the founder portrait used to be.
 *
 * Plain rules, plain drawing: your paddle is ink, North's is cobalt, the
 * ball is a square of type. North is beatable on purpose. It tracks with a
 * speed limit and misjudges each return by a few units, so a patient player
 * wins and a careless one does not.
 *
 * The simulation runs only while a game is being played, the table is on
 * screen and the tab is visible. React holds the score and the phase; the
 * sixty-times-a-second state lives in a ref and never re-renders anything.
 */
export function PongTable() {
  const copy = useCopy();
  const { open } = useChannelOverlay();
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const world = useRef<World>(freshWorld());
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState({ you: 0, north: 0 });
  const scoreRef = useRef(score);
  const [won, setWon] = useState(false);

  const serve = useCallback((towards: 1 | -1, delay: number) => {
    const w = world.current;
    w.ballX = W / 2 - BALL / 2;
    w.ballY = H / 2 - BALL / 2;
    w.speed = SERVE_SPEED;
    const angle = (Math.random() * 0.8 - 0.4) * MAX_ANGLE;
    w.vx = Math.cos(angle) * w.speed * towards;
    w.vy = Math.sin(angle) * w.speed;
    w.servingAt = performance.now() + delay;
    w.aiError = (Math.random() - 0.5) * 60;
  }, []);

  const start = useCallback(() => {
    world.current = freshWorld();
    scoreRef.current = { you: 0, north: 0 };
    setScore(scoreRef.current);
    setWon(false);
    setPhase("playing");
    serve(Math.random() > 0.5 ? 1 : -1, 650);
  }, [serve]);

  // Drawing and simulation.
  useEffect(() => {
    const canvas = canvasRef.current;
    const frame = frameRef.current;
    if (!canvas || !frame) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const ink = css("--color-ink", "#121211");
    const cobalt = css("--color-cobalt", "#1b2ed8");
    const ground = css("--color-paper-deep", "#e0dfd9");

    let scale = 1;
    const size = () => {
      const rect = frame.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      scale = canvas.width / W;
      draw();
    };

    const draw = () => {
      const w = world.current;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = ground;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(scale, 0, 0, canvas.height / H, 0, 0);

      ctx.fillStyle = ink;
      ctx.globalAlpha = 0.22;
      for (let y = 8; y < H; y += 28) ctx.fillRect(W / 2 - 1.5, y, 3, 14);
      ctx.globalAlpha = 1;

      ctx.fillStyle = ink;
      ctx.fillRect(INSET, w.playerY, PADDLE_W, PADDLE_H);
      ctx.fillStyle = cobalt;
      ctx.fillRect(W - INSET - PADDLE_W, w.aiY, PADDLE_W, PADDLE_H);
      ctx.fillStyle = ink;
      ctx.fillRect(w.ballX, w.ballY, BALL, BALL);
    };

    size();
    const resize = new ResizeObserver(size);
    resize.observe(frame);

    if (phase !== "playing") {
      return () => resize.disconnect();
    }

    let raf = 0;
    let last = performance.now();
    let visible = true;

    const seen = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible && !raf) {
        last = performance.now();
        raf = window.requestAnimationFrame(tick);
      }
    });
    seen.observe(frame);

    const clampPaddle = (y: number) => Math.min(Math.max(y, 0), H - PADDLE_H);

    const point = (winner: "you" | "north") => {
      const next = { ...scoreRef.current, [winner]: scoreRef.current[winner] + 1 };
      scoreRef.current = next;
      setScore(next);
      if (next[winner] >= TO_WIN) {
        setWon(winner === "you");
        setPhase("over");
        return true;
      }
      serve(winner === "you" ? 1 : -1, 700);
      return false;
    };

    function tick(now: number) {
      raf = 0;
      if (!visible || document.hidden) return;
      const step = Math.min(now - last, 40) / 16.667;
      last = now;
      const w = world.current;

      if (w.keys.up) w.playerY = clampPaddle(w.playerY - KEY_SPEED * step);
      if (w.keys.down) w.playerY = clampPaddle(w.playerY + KEY_SPEED * step);

      // North watches the ball only once it is heading its way.
      const aiCenter = w.aiY + PADDLE_H / 2;
      const target =
        w.vx > 0 && w.ballX > W * 0.3 ? w.ballY + BALL / 2 + w.aiError : H / 2;
      const delta = target - aiCenter;
      w.aiY = clampPaddle(w.aiY + Math.sign(delta) * Math.min(Math.abs(delta), AI_SPEED * step));

      if (now >= w.servingAt) {
        w.ballX += w.vx * step;
        w.ballY += w.vy * step;

        if (w.ballY <= 0 && w.vy < 0) {
          w.ballY = 0;
          w.vy *= -1;
        } else if (w.ballY + BALL >= H && w.vy > 0) {
          w.ballY = H - BALL;
          w.vy *= -1;
        }

        const hit = (paddleX: number, paddleY: number, direction: 1 | -1) => {
          const overlapsX =
            w.ballX < paddleX + PADDLE_W && w.ballX + BALL > paddleX;
          const overlapsY = w.ballY + BALL > paddleY && w.ballY < paddleY + PADDLE_H;
          if (!overlapsX || !overlapsY) return false;
          const offset =
            (w.ballY + BALL / 2 - (paddleY + PADDLE_H / 2)) / (PADDLE_H / 2);
          const angle = Math.max(-1, Math.min(1, offset)) * MAX_ANGLE;
          w.speed = Math.min(w.speed * 1.07, MAX_SPEED);
          w.vx = Math.cos(angle) * w.speed * direction;
          w.vy = Math.sin(angle) * w.speed;
          w.ballX = direction === 1 ? paddleX + PADDLE_W : paddleX - BALL;
          w.aiError = (Math.random() - 0.5) * (40 + w.speed * 5);
          return true;
        };

        if (w.vx < 0) hit(INSET, w.playerY, 1);
        else hit(W - INSET - PADDLE_W, w.aiY, -1);

        if (w.ballX + BALL < -30) {
          if (point("north")) {
            draw();
            return;
          }
        } else if (w.ballX > W + 30) {
          if (point("you")) {
            draw();
            return;
          }
        }
      }

      draw();
      raf = window.requestAnimationFrame(tick);
    }

    const onPointer = (event: PointerEvent) => {
      const rect = frame.getBoundingClientRect();
      const y = ((event.clientY - rect.top) / rect.height) * H;
      world.current.playerY = clampPaddle(y - PADDLE_H / 2);
    };

    const onKey = (event: KeyboardEvent, down: boolean) => {
      // The keys belong to the game only while the table is on screen and
      // nobody is typing: anywhere else they scroll the page and write text.
      const target = event.target as HTMLElement | null;
      const typing = !!target?.closest("input, textarea, select, [contenteditable='true']");
      if (down && (!visible || typing || event.altKey || event.ctrlKey || event.metaKey)) return;
      if (event.key === "ArrowUp" || event.key === "w" || event.key === "W") {
        world.current.keys.up = down;
        event.preventDefault();
      } else if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") {
        world.current.keys.down = down;
        event.preventDefault();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => onKey(event, true);
    const onKeyUp = (event: KeyboardEvent) => onKey(event, false);

    const onVisibility = () => {
      if (!document.hidden && !raf) {
        last = performance.now();
        raf = window.requestAnimationFrame(tick);
      }
    };

    frame.addEventListener("pointermove", onPointer);
    frame.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    document.addEventListener("visibilitychange", onVisibility);
    raf = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(raf);
      resize.disconnect();
      seen.disconnect();
      frame.removeEventListener("pointermove", onPointer);
      frame.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [phase, serve]);

  const play = copy.play;

  return (
    <Section id="play" flush className="py-band">
      <div className="sheet">
        <div className="sheet-grid gap-y-10 border-t border-ink pt-8 lg:pt-10">
          <div className="col-span-12 flex flex-col lg:order-2 lg:col-span-4">
            <TypeText as="h2" lines={play.title} className="poster text-headline text-ink" />
            <Reveal delay={0.08}>
              <p className="mt-6 max-w-[34ch] text-copy text-ink-soft">{play.lede}</p>
              <p className="mark mt-4 text-ink-mute">{play.controls}</p>
            </Reveal>

            <div
              aria-live="polite"
              className="mt-10 grid grid-cols-2 border-t border-ink pt-5 lg:mt-auto"
            >
              <div>
                <p className="text-small font-semibold text-ink">{play.you}</p>
                <p className="poster mt-1 text-[clamp(4.5rem,8vw,7.5rem)] text-ink tabular-nums">
                  {score.you}
                </p>
              </div>
              <div className="border-l border-rule pl-5">
                <p className="text-small font-semibold text-cobalt">{play.north}</p>
                <p className="poster mt-1 text-[clamp(4.5rem,8vw,7.5rem)] text-cobalt tabular-nums">
                  {score.north}
                </p>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:order-1 lg:col-span-8">
            <div
              ref={frameRef}
              className="relative aspect-[4/3] w-full overflow-hidden border-2 border-ink sm:aspect-[16/9]"
              style={{ touchAction: phase === "playing" ? "none" : "auto" }}
            >
              <canvas
                ref={canvasRef}
                role="img"
                aria-label={play.canvasLabel}
                className="absolute inset-0 h-full w-full"
              />

              {phase !== "playing" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-paper/70 px-6 text-center">
                  {phase === "over" && (
                    <p className="max-w-[24ch] text-[clamp(1.4rem,2.4vw,2.2rem)] leading-[1.1] font-semibold text-ink">
                      {won ? play.win : play.lose}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                    <InkButton onClick={start}>
                      {phase === "idle" ? play.start : play.again}
                    </InkButton>
                    {phase === "over" && won && (
                      <button
                        type="button"
                        onClick={() => open()}
                        className="ink-link text-small font-semibold text-ink"
                      >
                        {copy.studio.startProject}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
