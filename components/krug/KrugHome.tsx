"use client";

import { Booking } from "./Booking";
import { Hero } from "./Hero";
import { Process } from "./Process";
import { Shelf } from "./Shelf";
import { Studio } from "./Studio";

/** The page, top to bottom: the wheel, what happens next, how to come, what is on the shelf, where it is. */
export function KrugHome() {
  return (
    <>
      <Hero />
      <Process />
      <Booking />
      <Shelf />
      <Studio />
    </>
  );
}
