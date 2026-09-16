import type { Metadata } from "next";

import { FlowCase } from "@/components/flow/FlowCase";
import { STUDIO } from "@/lib/studio";

export const metadata: Metadata = {
  title: "North Flow - заявки, которые разбирают себя сами",
  description:
    "North Flow собирает заявки из всех каналов, размечает их и раскладывает по менеджерам в CRM. Демо-концепт North Studio, в котором можно отправить свою заявку.",
  alternates: { canonical: "/work/north-flow" },
  openGraph: {
    type: "article",
    siteName: STUDIO.name,
    url: "/work/north-flow",
    title: "North Flow - заявки, которые разбирают себя сами",
    description: "Отправьте заявку в линию и посмотрите, как она разбирается. Демо-концепт North Studio.",
  },
};

export default function NorthFlowPage() {
  return <FlowCase />;
}
