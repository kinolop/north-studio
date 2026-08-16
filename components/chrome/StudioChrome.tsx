"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Routes that are not North Studio and must not wear its chrome.
 *
 * `/work/orbita` presents an invented company with its own light identity.
 * The compass, the preloader, the fog, the dark header and the scroll rail
 * are the studio's signature — showing them around somebody else's brand
 * would undo the entire point of that case.
 */
const FOREIGN_ROUTES = ["/work/orbita"] as const;

/**
 * Renders the studio's fixed chrome everywhere except on foreign routes.
 *
 * `usePathname` resolves during the server render too, so the chrome is
 * absent from the very first byte rather than mounted and then hidden —
 * which matters most for the preloader, whose whole job is to cover the
 * screen before anything else paints.
 */
export function StudioChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const foreign = FOREIGN_ROUTES.some((route) => pathname.startsWith(route));

  if (foreign) return null;
  return <>{children}</>;
}
