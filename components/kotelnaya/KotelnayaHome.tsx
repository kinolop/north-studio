"use client";

import { Breads } from "./Breads";
import { Coffee } from "./Coffee";
import { Hero } from "./Hero";
import { Oven } from "./Oven";
import { Place } from "./Place";
import { Preorder } from "./Preorder";
import { Visit } from "./Visit";

/** The page, top to bottom: the building, the oven's day, the bread, coffee, the place, setting bread aside, the way in. */
export function KotelnayaHome() {
  return (
    <>
      <Hero />
      <Oven />
      <Breads />
      <Coffee />
      <Place />
      <Preorder />
      <Visit />
    </>
  );
}
