import { About } from "@/components/home/About";
import { Contact } from "@/components/home/Contact";
import { Hero } from "@/components/home/Hero";
import { Pains } from "@/components/home/Pains";
import { PongTable } from "@/components/home/PongTable";
import { Process } from "@/components/home/Process";
import { Questions } from "@/components/home/Questions";
import { Services } from "@/components/home/Services";
import { TapeMarquee } from "@/components/home/TapeMarquee";
import { WorkReel } from "@/components/home/WorkReel";
import { Intro } from "@/components/paper/Intro";
import { SheetStack } from "@/components/paper/SheetStack";

/**
 * One issue, read top to bottom: the problem you strike out yourself, the
 * situations people arrive with, what I do about them, the work, a break,
 * who I am, how a project runs, the questions people ask, and where to write.
 */
export default function Page() {
  return (
    <>
      <Intro />
      <SheetStack
        under={<Hero />}
        over={
          <>
            <TapeMarquee />
            <Pains />
          </>
        }
      />
      <Services />
      <WorkReel />
      <PongTable />
      <About />
      <Process />
      <Questions />
      <Contact />
    </>
  );
}
