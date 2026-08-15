"use client";

import { useCopy } from "@/components/i18n/CopyProvider";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SplitLines } from "@/components/ui/SplitLines";
import { sectionById } from "@/lib/sections";

import { WorkCard } from "./WorkCard";

const meta = sectionById("work");

export function Work() {
  const copy = useCopy();
  const [featured, ...rest] = copy.work.projects;

  return (
    <Section id={meta.id}>
      <div className="container-north">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <Eyebrow bearing={meta.bearing} label={copy.sections[meta.id]} />
            <SplitLines
              as="h2"
              lines={copy.work.title}
              className="mt-8 text-display font-display font-medium text-bone"
            />
          </div>

          <Reveal className="lg:col-span-5 lg:col-start-8" delay={0.08}>
            <p className="max-w-[42ch] text-body text-ash">{copy.work.lede}</p>
            <p className="label-mono mt-7 text-slate">{copy.work.placeholderNote}</p>
          </Reveal>
        </div>

        {/* One wide lead piece, then two halves. A three-up row of identical
            cards would say "we have exactly three"; this says "here is the
            one to look at first". */}
        <div className="mt-20 space-y-5">
          {featured && (
            <WorkCard
              project={featured}
              variant="lead"
              href="/work/north-agent"
              cta={copy.work.caseCta}
            />
          )}

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((project, index) => (
              <WorkCard
                key={project.key}
                project={project}
                delay={0.08 * (index + 1)}
              />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
