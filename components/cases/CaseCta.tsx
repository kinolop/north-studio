"use client";

import Image from "next/image";

import { useChannelOverlay } from "@/components/contact/ChannelOverlayProvider";
import { InkButton } from "@/components/home/InkButton";
import { PrintLines } from "@/components/motion/PrintLines";
import { TypeText } from "@/components/motion/TypeText";
import { Section } from "@/components/ui/Section";

/**
 * The close of a case. Two faces: printed on a photographed sheet (the
 * agent, whose pictures are photographs), or on a solid sheet of cobalt
 * (the line, which is drawn entirely in code). Either way the invitation is
 * typed out and the one button opens the same chooser as everywhere else.
 */
export function CaseCta({
  id,
  title,
  lede,
  action,
  image,
}: {
  id: string;
  title: readonly string[];
  lede: string;
  action: string;
  /** A background photograph. Without one, the section is cobalt. */
  image?: string;
}) {
  const { open } = useChannelOverlay();
  const onCobalt = !image;

  return (
    <Section
      id={id}
      flush
      className={`relative overflow-hidden ${onCobalt ? "bg-cobalt text-paper" : "bg-paper text-ink"}`}
    >
      {image && (
        <Image src={image} alt="" fill sizes="100vw" className="object-cover object-right-bottom" />
      )}
      <div className="sheet relative flex min-h-[80svh] flex-col justify-center py-band">
        <TypeText
          as="h2"
          lines={title}
          speed={50}
          caretClassName={onCobalt ? "bg-paper" : "bg-cobalt"}
          className={`poster text-[clamp(3.6rem,10.5vw,11rem)] ${onCobalt ? "text-paper" : "text-ink"}`}
        />
        {/* On the photograph the right side belongs to the picture, so the button stays with the lede. */}
        <div
          className={`mt-10 flex flex-col items-start gap-8 lg:mt-14 ${onCobalt ? "lg:flex-row lg:items-end lg:justify-between" : ""}`}
        >
          <PrintLines
            text={lede}
            className={`max-w-[40ch] text-[clamp(1.2rem,1.6vw,1.5rem)] leading-[1.35] ${onCobalt ? "text-paper" : "text-ink"}`}
          />
          <div>
            <InkButton tone={onCobalt ? "paper" : "ink"} onClick={() => open()}>
              {action}
            </InkButton>
          </div>
        </div>
      </div>
    </Section>
  );
}
