"use client";

import { CaseCta } from "@/components/cases/CaseCta";
import { CaseSteps } from "@/components/cases/CaseSteps";
import { useCopy } from "@/components/i18n/CopyProvider";

import { AgentCapabilities } from "./AgentCapabilities";
import { AgentChat } from "./AgentChat";
import { AgentHero } from "./AgentHero";
import { AgentNight } from "./AgentNight";

/**
 * The North Agent case: the film, then the agent itself to talk to beside
 * the client card it produces, what it does in photographs, one night with
 * and without it, how it gets to you, and the close.
 */
export function AgentCase() {
  const copy = useCopy();
  const agent = copy.agentCase;

  return (
    <>
      <AgentHero />
      <AgentChat />
      <AgentCapabilities />
      <AgentNight />
      <CaseSteps id="agent-deploy" title={agent.deploy.title} items={agent.deploy.items} />
      <CaseCta
        id="agent-start"
        title={agent.cta.title}
        lede={agent.cta.lede}
        action={agent.cta.action}
        image="/work/north-agent/assets/cta-bg.png"
      />
    </>
  );
}
