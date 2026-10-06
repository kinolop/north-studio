"use client";

import { Coffee } from "./Coffee";
import { Counter } from "./Counter";
import { Craft } from "./Craft";
import { Entrance } from "./Entrance";
import { Oven } from "./Oven";
import { Place } from "./Place";
import { Preorder } from "./Preorder";

/**
 * The page, top to bottom: walking in, the oven's day, the counter, how the
 * bread is made, the building, coffee, setting bread aside. The way back
 * to the door is the footer.
 */
export function KotelnayaHome() {
  return (
    <>
      <Entrance />
      <Oven />
      <Counter />
      <Craft />
      <Place />
      <Coffee />
      <Preorder />
    </>
  );
}
