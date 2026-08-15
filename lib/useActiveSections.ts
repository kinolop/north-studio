"use client";

import { useSyncExternalStore } from "react";

import {
  getActiveSections,
  subscribeActiveSections,
} from "./activeSections";
import { SECTIONS, type SectionMeta } from "./sections";

/** The home list on the server; whatever the page registered on the client. */
function serverSnapshot(): readonly SectionMeta[] {
  return SECTIONS;
}

export function useActiveSections(): readonly SectionMeta[] {
  return useSyncExternalStore(
    subscribeActiveSections,
    getActiveSections,
    serverSnapshot,
  );
}
