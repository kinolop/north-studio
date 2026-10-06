"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { PaperFooter } from "@/components/paper/PaperFooter";
import { PaperHeader } from "@/components/paper/PaperHeader";
import { PenTrail } from "@/components/paper/PenTrail";

/**
 * Routes that are not North Studio and must not wear its chrome.
 *
 * `/work/marshrut` is an invented cargo company, a night run with its own
 * header and footer. `/work/krug` is an invented pottery studio and
 * `/work/kotelnaya` an invented bakery, each with its own faces, colours,
 * header and footer.
 *
 * The static client cases need no entry here. `/work/aven` and
 * `/work/domstroy` are documents served straight out of `public`, so this
 * layout never runs for them at all.
 */
const FOREIGN_ROUTES = ["/work/marshrut", "/work/krug", "/work/kotelnaya"] as const;

/**
 * Every studio page is printed on the same sheet. `usePathname` resolves
 * during the server render too, so a foreign route is bare from the very
 * first byte rather than stripped after hydration.
 */
export function StudioChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";

  if (FOREIGN_ROUTES.some((route) => pathname.startsWith(route))) {
    return <main id="main">{children}</main>;
  }

  return (
    <>
      <div aria-hidden className="margin-rule hidden lg:block" />
      <PaperHeader />
      <main id="main">{children}</main>
      <PaperFooter />
      <div aria-hidden className="paper-grain" />
      <PenTrail />
    </>
  );
}
