import type { Metadata } from "next";

import { SectionRegistry } from "@/components/chrome/SectionRegistry";
import { FlowConveyor } from "@/components/flow/FlowConveyor";
import { FlowCta } from "@/components/flow/FlowCta";
import { FlowDeploy } from "@/components/flow/FlowDeploy";
import { FlowHero } from "@/components/flow/FlowHero";
import { FlowInside } from "@/components/flow/FlowInside";
import { SectionSeam } from "@/components/ui/Section";
import { FLOW_SECTIONS } from "@/lib/sections";
import { STUDIO } from "@/lib/studio";

export const metadata: Metadata = {
  title: "North Flow — leads that handle themselves",
  description:
    "North Flow collects every enquiry you get, qualifies it, routes it to the right manager and files the card — while you sleep. A demo concept by North Studio, shown running for an invented online store.",
  openGraph: {
    type: "article",
    siteName: STUDIO.name,
    title: "North Flow — leads that handle themselves",
    description:
      "Watch a night's worth of leads file themselves. A demo concept by North Studio.",
  },
};

/**
 * The North Flow product case, sibling to /work/north-agent.
 *
 * `SectionRegistry` hands this page's own compass sweep to the fixed
 * instruments, so the HUD and the scroll rail describe where you are here
 * rather than pointing at anchors that only exist on the home page.
 */
export default function NorthFlowPage() {
  return (
    <>
      <SectionRegistry sections={FLOW_SECTIONS} />
      <FlowHero />
      <FlowConveyor />
      <SectionSeam />
      <FlowInside />
      <FlowDeploy />
      <FlowCta />
    </>
  );
}
