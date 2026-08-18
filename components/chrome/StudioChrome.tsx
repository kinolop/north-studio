"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Routes that are not North Studio and must not wear its chrome.
 *
 * `/work/orbita` presents an invented fintech company with its own light
 * identity; `/work/noctura` an invented hotel with its own dark-and-gold
 * one. The compass, the preloader, the fog, the dark header and the scroll
 * rail are the studio's signature — showing them around somebody else's
 * brand would undo the entire point of those cases.
 */
const FOREIGN_ROUTES = ["/work/orbita", "/work/noctura"] as const;

/**
 * Studio routes that keep the identity but not the instruments.
 *
 * The compass, the scroll rail and the intro are built around the home
 * page's sweep of bearings — they read whichever section list the page
 * registered. A legal document has no bearings, so on `/privacy` the
 * compass would sit there naming sections that are not on the page. The
 * header, the fog and the footer still belong there; the instruments do
 * not.
 */
const QUIET_ROUTES = ["/privacy"] as const;

/**
 * Renders the studio's fixed chrome everywhere except on foreign routes.
 *
 * `usePathname` resolves during the server render too, so the chrome is
 * absent from the very first byte rather than mounted and then hidden —
 * which matters most for the preloader, whose whole job is to cover the
 * screen before anything else paints.
 *
 * Wrap the compass, the rail and the intro in `<StudioChrome instruments>`;
 * those also drop out on the quiet routes above.
 */
export function StudioChrome({
  children,
  instruments = false,
}: {
  children: ReactNode;
  /** Marks section-aware chrome, which utility pages do not get. */
  instruments?: boolean;
}) {
  const pathname = usePathname() ?? "";
  const foreign = FOREIGN_ROUTES.some((route) => pathname.startsWith(route));
  if (foreign) return null;

  if (instruments && QUIET_ROUTES.some((route) => pathname.startsWith(route))) {
    return null;
  }

  return <>{children}</>;
}
