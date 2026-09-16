import type { Metadata } from "next";

import { AgentCase } from "@/components/agent/AgentCase";
import { STUDIO } from "@/lib/studio";

export const metadata: Metadata = {
  title: "North Agent - AI-ассистент, который отвечает клиентам",
  description:
    "North Agent отвечает клиентам за секунды в любое время, выясняет, что им нужно, и передаёт менеджеру готового к покупке клиента. Демо-концепт North Studio.",
  alternates: { canonical: "/work/north-agent" },
  openGraph: {
    type: "article",
    siteName: STUDIO.name,
    url: "/work/north-agent",
    title: "North Agent - AI-ассистент, который отвечает клиентам",
    description: "Поговорите с агентом и посмотрите, какую карточку клиента он собирает. Демо-концепт North Studio.",
  },
};

export default function NorthAgentPage() {
  return <AgentCase />;
}
