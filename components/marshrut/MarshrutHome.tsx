import { Hero } from "./Hero";
import { Density } from "./sections/Density";
import { Docs } from "./sections/Docs";
import { Faq } from "./sections/Faq";
import { Modes } from "./sections/Modes";
import { Request } from "./sections/Request";
import { Tracking } from "./sections/Tracking";
import { World } from "./World";

/**
 * The whole page: one journey, from the warehouse in China to the
 * marketplace's in Russia.
 *
 * The world (the map, the cargo, the lettering on the map) is fixed behind
 * everything; the chapters scroll over it, and the scroll moves the camera
 * and the cargo through it. The chapters are in the order the shipment
 * meets them: the cargo on the dock, the choice of route, the road, the
 * border, the last stretch, the warehouse.
 *
 * The studio's root layout already wraps every route in `<main id="main">`,
 * so this is a plain container; its id is the target of the layout's
 * "skip to content" link, and the director watches it for changes of height.
 */
export function MarshrutHome() {
  return (
    <>
      <World />
      <div id="origin" className="mr-chapters">
        <Hero />
        <Density />
        <Modes />
        <Tracking />
        <Docs />
        <Faq />
        <Request />
      </div>
    </>
  );
}
