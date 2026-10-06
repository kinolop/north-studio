"use client";

import { Booking } from "./Booking";
import { Hero } from "./Hero";
import { Process } from "./Process";
import { Shelf } from "./Shelf";
import { Stage } from "./Stage";
import { Studio } from "./Studio";

/**
 * The page, top to bottom: the wheel, what happens next, how to come, what
 * is on the shelf, where it is. The cup lives on its own fixed layer under
 * the first two and is covered by the rest.
 */
export function KrugHome() {
  return (
    <>
      <Stage />
      <Hero />
      <Process />
      <Booking />
      <Shelf />
      <Studio />
    </>
  );
}
