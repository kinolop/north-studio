"use client";

import { CaseCta } from "@/components/cases/CaseCta";
import { CaseSteps } from "@/components/cases/CaseSteps";
import { useCopy } from "@/components/i18n/CopyProvider";

import { FlowHero } from "./FlowHero";
import { FlowInside } from "./FlowInside";
import { FlowLab } from "./FlowLab";
import { FlowLineProvider } from "./FlowLineStore";
import { FlowReport } from "./FlowReport";

/**
 * The North Flow case, drawn entirely in code.
 *
 * It opens on the line clearing a desk of enquiries as you scroll, then
 * hands the line to you: send your own enquiry and watch it sorted, and see
 * the morning report counted from what you did. The lab and the report
 * share one line, so the report is always about this page.
 */
export function FlowCase() {
  const copy = useCopy();
  const flow = copy.flowCase;

  return (
    <>
      <FlowHero />
      <FlowLineProvider>
        <FlowLab />
        <FlowReport />
      </FlowLineProvider>
      <FlowInside />
      <CaseSteps id="flow-deploy" title={flow.deploy.title} items={flow.deploy.items} />
      <CaseCta id="flow-start" title={flow.cta.title} lede={flow.cta.lede} action={flow.cta.action} />
    </>
  );
}
