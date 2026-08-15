"use client";

import { useCopy } from "@/components/i18n/CopyProvider";

import { OrbitaMark } from "./OrbitaMark";

export type ScreenVariant = "accounts" | "transfer" | "insight";

/**
 * ORBITA's product, drawn in code.
 *
 * Screenshots of a fintech app that does not exist would have to be
 * rendered, and a render is exactly the thing a visitor discounts. Built in
 * the page instead, the screens carry real type, real tabular figures and
 * the brand's own accent — and they stay sharp on any display, in both
 * languages, at zero weight. Every frame that shows one is still an
 * `AssetSlot`, so dropping a render in replaces it with no code change.
 */
export function OrbitaScreen({
  variant,
  compact = false,
}: {
  variant: ScreenVariant;
  compact?: boolean;
}) {
  const copy = useCopy();
  const mock = copy.orbitaCase.product.mock;

  return (
    <div className="w-full rounded-[10px] border border-orbita/25 bg-[linear-gradient(180deg,rgb(13_58_68/0.5),rgb(7_8_11/0.94))] p-5 shadow-[0_30px_70px_-30px_rgb(0_0_0/0.9),0_0_0_1px_rgb(78_201_220/0.06)] backdrop-blur-[1px]">
      <div className="flex items-center justify-between gap-4">
        <OrbitaMark className="h-4 w-4" />
        <span className="label-mono text-orbita/70">
          {variant === "accounts"
            ? mock.totalLabel
            : variant === "transfer"
              ? mock.transfer.title
              : mock.insight.title}
        </span>
      </div>

      {variant === "accounts" && <Accounts compact={compact} />}
      {variant === "transfer" && <Transfer />}
      {variant === "insight" && <Insight />}
    </div>
  );
}

function Accounts({ compact }: { compact: boolean }) {
  const copy = useCopy();
  const mock = copy.orbitaCase.product.mock;
  const rows = compact ? mock.accounts.slice(0, 2) : mock.accounts;

  return (
    <>
      <p className="mt-5 font-display text-[clamp(1.5rem,2.4vw,1.9rem)] leading-none font-semibold tracking-[-0.03em] tabular-nums text-bone [font-variation-settings:'wdth'_92]">
        {mock.total}
      </p>

      <ul className="mt-6 border-t border-orbita/12">
        {rows.map((account) => (
          <li
            key={account.key}
            className="flex items-baseline justify-between gap-4 border-b border-orbita/12 py-3"
          >
            <span className="min-w-0">
              <span className="block truncate text-meta text-bone">
                {account.name}
              </span>
              <span className="label-mono mt-1 block truncate">{account.meta}</span>
            </span>
            <span className="data-mono shrink-0 text-[0.8125rem] text-orbita-lift">
              {account.amount}
            </span>
          </li>
        ))}
      </ul>

      <p className="label-mono mt-3.5">{mock.moreLabel}</p>
    </>
  );
}

function Transfer() {
  const copy = useCopy();
  const transfer = copy.orbitaCase.product.mock.transfer;

  return (
    <>
      <p className="mt-5 font-display text-[clamp(1.5rem,2.4vw,1.9rem)] leading-none font-semibold tracking-[-0.03em] tabular-nums text-bone [font-variation-settings:'wdth'_92]">
        {transfer.amount}
      </p>

      <div className="mt-6 grid grid-cols-[auto_1fr] gap-x-4">
        {/* The track, with a charge running down it. Same falling light as
            the studio's scroll rail: one idea, one keyframe, two uses. */}
        <div aria-hidden className="relative flex flex-col items-center py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-orbita" />
          <span className="relative my-1 w-px flex-1 overflow-hidden bg-orbita/20">
            <span className="absolute inset-x-0 top-0 h-4 bg-[linear-gradient(180deg,transparent,var(--color-orbita))] motion-safe:animate-[railFall_2.6s_var(--ease-north)_infinite]" />
          </span>
          <span className="h-1.5 w-1.5 rounded-full border border-orbita bg-void" />
        </div>

        <div className="flex flex-col justify-between gap-5">
          <span className="block">
            <span className="label-mono block">{transfer.fromLabel}</span>
            <span className="mt-1 block truncate text-meta text-bone">
              {transfer.from}
            </span>
          </span>
          <span className="block">
            <span className="label-mono block">{transfer.toLabel}</span>
            <span className="mt-1 block truncate text-meta text-bone">
              {transfer.to}
            </span>
          </span>
        </div>
      </div>

      <p className="label-mono mt-6 inline-flex items-center gap-2 rounded-full border border-orbita/35 bg-orbita/10 px-3 py-1.5 text-orbita-lift">
        <svg aria-hidden viewBox="0 0 12 12" className="h-3 w-3 fill-none stroke-current">
          <path d="M2.5 6.4l2.4 2.4L9.6 3.6" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        {transfer.status}
      </p>
    </>
  );
}

/** Illustrative, and shaped so the last two months carry the story. */
const BARS = [46, 38, 58, 52, 74, 92] as const;

function Insight() {
  const copy = useCopy();
  const insight = copy.orbitaCase.product.mock.insight;

  return (
    <>
      <div className="mt-6 flex h-[5.5rem] items-end gap-2" aria-hidden>
        {BARS.map((height, index) => (
          <span
            key={insight.months[index] ?? index}
            style={{ height: `${height}%` }}
            className={`flex-1 rounded-[2px] ${
              index >= BARS.length - 2
                ? "bg-[linear-gradient(180deg,var(--color-orbita),rgb(78_201_220/0.25))]"
                : "bg-orbita/15"
            }`}
          />
        ))}
      </div>

      <div className="mt-2.5 flex gap-2">
        {insight.months.map((month) => (
          <span key={month} className="label-mono flex-1 text-center">
            {month}
          </span>
        ))}
      </div>

      <p className="mt-6 flex items-baseline justify-between gap-4 border-t border-orbita/12 pt-4">
        <span className="label-mono">{insight.deltaLabel}</span>
        <span className="data-mono text-[0.8125rem] text-orbita-lift">
          {insight.delta}
        </span>
      </p>

      <p className="mt-4 text-meta leading-[1.6] text-ash">{insight.sentence}</p>
    </>
  );
}

/**
 * A screen on a ground, filling a frame. This is what an empty `shot-N`
 * slot shows: not a dark rectangle with a label, but the product.
 */
export function OrbitaScreenPlate({ variant }: { variant: ScreenVariant }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(165deg,#0f2a31_0%,#080c11_58%,#0b1620_100%)]" />
      {/* The mark's geometry, enormous and almost invisible behind it. */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 aspect-square w-[128%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-orbita/10"
      >
        <div className="absolute inset-[14%] rounded-full border border-orbita/8" />
        <div className="absolute inset-[28%] rounded-full border border-dashed border-orbita/8" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(62%_44%_at_50%_18%,rgb(78_201_220/0.16),transparent_72%)]" />

      <div className="absolute inset-0 flex items-center justify-center px-7 pb-16">
        <div className="w-full max-w-[19rem]">
          <OrbitaScreen variant={variant} />
        </div>
      </div>
    </div>
  );
}
