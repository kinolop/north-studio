import type { Metadata } from "next";

import { AgentCapabilities } from "@/components/agent/AgentCapabilities";
import { AgentChat } from "@/components/agent/AgentChat";
import { AgentCta } from "@/components/agent/AgentCta";
import { AgentDeploy } from "@/components/agent/AgentDeploy";
import { AgentHero } from "@/components/agent/AgentHero";
import { AgentNumbers } from "@/components/agent/AgentNumbers";
import { SectionRegistry } from "@/components/chrome/SectionRegistry";
import { SectionSeam } from "@/components/ui/Section";
import { AGENT_SECTIONS } from "@/lib/sections";
import { STUDIO } from "@/lib/studio";

export const metadata: Metadata = {
  title: "North Agent — the assistant that talks to your clients",
  description:
    "North Agent answers your clients instantly, around the clock: it knows your programme, qualifies the enquiry and hands a warm lead to a person. A demo concept by North Studio.",
  alternates: { canonical: "/work/north-agent" },
  openGraph: {
    type: "article",
    siteName: STUDIO.name,
    url: "/work/north-agent",
    title: "North Agent — the assistant that talks to your clients",
    description:
      "Watch it close an enrolment. A demo concept by North Studio.",
  },
};

/**
 * The North Agent product case.
 *
 * `SectionRegistry` hands this page's own compass sweep to the fixed
 * instruments, so the HUD and the scroll rail describe where you are here
 * rather than pointing at anchors that only exist on the home page.
 */
export default function NorthAgentPage() {
  return (
    <>
      <SectionRegistry sections={AGENT_SECTIONS} />
      <AgentHero />
      <AgentChat />
      <SectionSeam />
      <AgentCapabilities />
      <AgentDeploy />
      <SectionSeam />
      <AgentNumbers />
      <AgentCta />
    </>
  );
}
