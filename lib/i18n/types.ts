import type { ChannelId } from "@/lib/channels";
import type { SectionId } from "@/lib/sections";

/**
 * The shape every locale must fill.
 *
 * Written as an explicit interface rather than `typeof en`, deliberately.
 * Deriving it from English would bake the English *literals* into the type
 * and every Russian string would fail to satisfy it. This way the compiler
 * checks structural parity — a key added to one locale and forgotten in the
 * other is a build error, not a blank space someone finds in production.
 */

export interface Tier {
  readonly key: string;
  readonly name: string;
  readonly from: string;
  readonly tagline: string;
  readonly forWhom: string;
  readonly includes: readonly string[];
  readonly duration: string;
  readonly outcome: string;
}

export interface ProjectCopy {
  readonly key: string;
  readonly name: string;
  readonly discipline: string;
  readonly summary: string;
  readonly year: string;
  /** Names the tier this was delivered under. */
  readonly engagement: string;
}

export interface StepCopy {
  readonly key: string;
  readonly name: string;
  readonly body: string;
  readonly artifact: string;
}

export interface VoiceCopy {
  readonly key: string;
  readonly quote: string;
  readonly role: string;
  readonly sector: string;
}

export interface QuestionCopy {
  readonly key: string;
  readonly q: string;
  readonly a: string;
}

export interface ChoiceCopy {
  readonly value: string;
  readonly label: string;
}

export interface ConfiguratorQuestion {
  readonly key: string;
  readonly prompt: string;
  readonly choices: readonly ChoiceCopy[];
}

export interface Copy {
  readonly localeName: string;

  readonly studio: {
    readonly availability: string;
    readonly startProject: string;
    readonly languageLabel: string;
  };

  /** Human-readable name per section id, for nav, footer index and compass. */
  readonly sections: Readonly<Record<SectionId, string>>;

  readonly hero: {
    readonly headline: readonly string[];
    readonly lede: string;
    readonly scrollHint: string;
    readonly founderLed: string;
  };

  readonly manifesto: {
    readonly title: readonly string[];
    readonly body: readonly string[];
    readonly principles: readonly { readonly term: string; readonly definition: string }[];
  };

  readonly founder: {
    readonly title: readonly string[];
    readonly body: readonly string[];
    readonly signature: string;
    /** Build instruction shown inside the empty portrait frame. */
    readonly portraitNote: string;
  };

  readonly engagements: {
    readonly title: readonly string[];
    readonly lede: string;
    readonly anchorLine: string;
    readonly mostPopular: string;
    readonly runsLabel: string;
    readonly tiers: readonly Tier[];
  };

  readonly configurator: {
    readonly title: readonly string[];
    readonly lede: string;
    readonly questions: readonly ConfiguratorQuestion[];
    readonly rangeLabel: string;
    readonly timelineLabel: string;
    readonly matchLabel: string;
    readonly disclaimer: string;
    readonly cta: string;
    readonly reset: string;
    readonly progress: string;
    readonly timelines: Readonly<Record<"fast" | "standard" | "relaxed", string>>;
  };

  readonly work: {
    readonly title: readonly string[];
    readonly lede: string;
    readonly placeholderNote: string;
    readonly engagementSuffix: string;
    readonly projects: readonly ProjectCopy[];
  };

  readonly process: {
    readonly title: readonly string[];
    readonly lede: string;
    readonly ofLabel: string;
    readonly leavesYouWith: string;
    readonly steps: readonly StepCopy[];
  };

  readonly voices: {
    readonly title: readonly string[];
    readonly placeholderNote: string;
    readonly items: readonly VoiceCopy[];
  };

  readonly questions: {
    readonly title: readonly string[];
    readonly items: readonly QuestionCopy[];
  };

  readonly trust: {
    readonly items: readonly string[];
  };

  readonly cta: {
    readonly title: readonly string[];
    readonly lede: string;
    readonly action: string;
    readonly directLabel: string;
  };

  readonly channels: {
    readonly overlayTitle: string;
    readonly overlayLede: string;
    readonly close: string;
    readonly back: string;
    readonly labels: Readonly<Record<ChannelId, string>>;
    readonly notes: Readonly<Record<ChannelId, string>>;
    readonly briefLabel: string;
    readonly briefNote: string;
  };

  readonly form: {
    readonly heading: string;
    readonly lede: string;
    readonly name: string;
    readonly namePlaceholder: string;
    readonly channel: string;
    readonly handle: string;
    readonly handlePlaceholder: string;
    readonly need: string;
    readonly needPlaceholder: string;
    readonly budget: string;
    readonly budgetNone: string;
    readonly submit: string;
    readonly sending: string;
    readonly success: string;
    readonly errorLead: string;
    readonly required: string;
    readonly tooShort: string;
    readonly optional: string;
  };

  readonly preloader: {
    readonly calibrating: string;
    readonly skip: string;
  };

  readonly sound: {
    readonly label: string;
    readonly enable: string;
    readonly disable: string;
  };

  readonly footer: {
    readonly index: string;
    readonly elsewhere: string;
    readonly colophon: string;
    readonly place: string;
  };
}
