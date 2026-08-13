import { Configurator } from "@/components/sections/Configurator";
import { Contact } from "@/components/sections/Contact";
import { AgentDemo } from "@/components/sections/AgentDemo";
import { Founder } from "@/components/sections/Founder";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Manifesto } from "@/components/sections/Manifesto";
import { Process } from "@/components/sections/Process";
import { Questions } from "@/components/sections/Questions";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { Voices } from "@/components/sections/Voices";
import { Work } from "@/components/sections/Work";
import { SectionSeam } from "@/components/ui/Section";

/**
 * One descent, eleven movements. Seams appear only where the argument
 * genuinely changes register — never between sections that are still
 * making the same point.
 *
 * The trust strip sits immediately before the close, where the visitor is
 * deciding, rather than near the top where it would read as a boast.
 */
export default function Page() {
  return (
    <>
      <Hero />
      <Manifesto />
      <Founder />
      <SectionSeam />
      <Services />
      <AgentDemo />
      <Configurator />
      <Work />
      <SectionSeam />
      <Process />
      <Voices />
      <SectionSeam />
      <Questions />
      <TrustStrip />
      <Contact />
    </>
  );
}
