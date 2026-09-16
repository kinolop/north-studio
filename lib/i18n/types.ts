import type { ChannelId } from "@/lib/channels";
import type { AgentIntent } from "@/lib/northAgent";
import type { AgentSectionId, FlowSectionId, SectionId } from "@/lib/sections";

/**
 * The shape every locale must fill.
 *
 * Written as an explicit interface rather than `typeof en`, deliberately.
 * Deriving it from English would bake the English *literals* into the type
 * and every Russian string would fail to satisfy it. This way the compiler
 * checks structural parity — a key added to one locale and forgotten in the
 * other is a build error, not a blank space someone finds in production.
 */

export interface Service {
  readonly key: "sites" | "agents" | "automation";
  readonly name: string;
  /** The one word set in poster type on the services index. */
  readonly short: string;
  readonly summary: string;
  /** The situation a client is in before they write. */
  readonly problem: string;
  readonly what: readonly string[];
  readonly result: string;
  readonly term: string;
}

/** One correction on the hero's proof sheet. */
export interface ProofCopy {
  readonly key: "sites" | "agents" | "automation";
  readonly tab: string;
  readonly before: string;
  /** The words that get struck out. */
  readonly struck: string;
  /** Written above them by hand. */
  readonly fix: string;
  readonly after: string;
  readonly note: string;
}

export interface ProjectCopy {
  readonly key: string;
  readonly name: string;
  readonly discipline: string;
  readonly summary: string;
  readonly year: string;
}

export interface StepCopy {
  readonly key: string;
  readonly name: string;
  readonly body: string;
  readonly artifact: string;
}

export interface QuestionCopy {
  readonly key: string;
  readonly q: string;
  readonly a: string;
}

/** One lead in the North Flow demo: where it came from and what it says. */
export interface FlowLeadCopy {
  readonly key: string;
  readonly channel: FlowChannel;
  readonly text: string;
}

export type FlowChannel = "telegram" | "whatsapp" | "site" | "avito" | "call" | "email";

/** A moment in the agent case's night-time comparison. */
export interface MomentCopy {
  readonly time: string;
  readonly text: string;
}

export interface Copy {
  readonly localeName: string;

  readonly studio: {
    readonly availability: string;
    readonly startProject: string;
    readonly languageLabel: string;
  };

  /**
   * Human-readable name per section id, for nav, footer index and compass.
   * Covers both pages' sweeps so the compass can label whichever set the
   * current page registered.
   */
  readonly sections: Readonly<
    Record<SectionId | AgentSectionId | FlowSectionId, string>
  >;

  readonly hero: {
    /** The three items across the top of the sheet. */
    readonly runningHead: readonly string[];
    /** What the proof sheet says, for readers that cannot watch it. */
    readonly headline: string;
    readonly proofs: readonly ProofCopy[];
    readonly lede: string;
    readonly secondary: string;
    /** Invites the visitor to strike the problem out themselves. */
    readonly hint: string;
  };

  readonly marquee: {
    readonly items: readonly string[];
  };

  readonly pains: {
    readonly title: string;
    readonly lede: string;
    readonly items: readonly {
      readonly key: string;
      readonly pain: string;
      /** The words in `pain` the pen circles. Must appear in it verbatim. */
      readonly mark: string;
      readonly cost: string;
    }[];
    readonly closing: string;
  };

  readonly about: {
    readonly title: readonly string[];
    /** One paragraph, inked in word by word as it is read. */
    readonly statement: string;
    readonly signature: string;
    readonly principles: readonly {
      readonly key: "direct" | "yours" | "honest";
      readonly term: string;
      readonly definition: string;
    }[];
  };

  readonly services: {
    readonly title: readonly string[];
    readonly lede: string;
    readonly discuss: string;
    readonly labels: {
      readonly problem: string;
      readonly what: string;
      readonly result: string;
      readonly term: string;
    };
    readonly items: readonly Service[];
    /** The wiring diagram: where enquiries come from and where they end up. */
    readonly diagram: {
      readonly label: string;
      readonly inputs: readonly string[];
      readonly core: string;
      readonly outputs: readonly string[];
    };
  };

  /** The pong table that stands where the founder portrait used to. */
  readonly play: {
    readonly title: readonly string[];
    readonly lede: string;
    readonly start: string;
    readonly again: string;
    readonly you: string;
    readonly north: string;
    readonly win: string;
    readonly lose: string;
    readonly controls: string;
    readonly canvasLabel: string;
  };

  /** The North Agent product case page at /work/north-agent. */
  readonly agentCase: {
    readonly demoTag: string;
    readonly backToWork: string;
    readonly productName: string;
    readonly brandNote: string;

    readonly hero: {
      readonly title: readonly string[];
      readonly lede: string;
      readonly cta: string;
      readonly secondary: string;
    };

    readonly chat: {
      readonly title: readonly string[];
      readonly lede: string;
      readonly demoLabel: string;
      readonly visitorRole: string;
      readonly agentRole: string;
      readonly greeting: string;
      readonly suggestionsLabel: string;
      readonly suggestions: readonly string[];
      readonly placeholder: string;
      readonly send: string;
      readonly restart: string;
      readonly lead: {
        readonly title: string;
        readonly subtitle: string;
        readonly empty: string;
        readonly asked: string;
        readonly readiness: string;
        readonly next: string;
        readonly levels: { readonly cold: string; readonly warm: string; readonly hot: string };
        readonly actions: { readonly cold: string; readonly warm: string; readonly hot: string };
        readonly intents: Readonly<Record<AgentIntent, string>>;
      };
    };

    readonly capabilities: {
      readonly title: readonly string[];
      readonly items: readonly {
        readonly key: "answers" | "knows" | "enroll";
        readonly name: string;
        readonly body: string;
      }[];
    };

    readonly night: {
      readonly title: readonly string[];
      readonly lede: string;
      readonly without: string;
      readonly with: string;
      readonly withoutMoments: readonly MomentCopy[];
      readonly withMoments: readonly MomentCopy[];
      readonly withoutVerdict: string;
      readonly withVerdict: string;
    };

    readonly deploy: {
      readonly title: readonly string[];
      readonly items: readonly { readonly key: string; readonly name: string; readonly body: string }[];
    };

    readonly cta: {
      readonly title: readonly string[];
      readonly lede: string;
      readonly action: string;
    };
  };

  /** The North Flow product case page at /work/north-flow. */
  readonly flowCase: {
    readonly demoTag: string;
    readonly backToWork: string;
    readonly productName: string;
    readonly brandNote: string;

    readonly channels: Readonly<Record<FlowChannel, string>>;
    readonly stations: readonly string[];
    readonly managers: readonly string[];
    readonly nurture: string;
    readonly tones: { readonly warm: string; readonly cold: string };
    readonly priorities: { readonly high: string; readonly normal: string; readonly low: string };

    readonly hero: {
      readonly title: readonly string[];
      readonly lede: string;
      readonly cta: string;
      readonly chaosNote: string;
      readonly orderNote: string;
      readonly filedLabel: string;
      readonly leads: readonly (FlowLeadCopy & { readonly tone: "warm" | "cold" })[];
    };

    readonly lab: {
      readonly title: readonly string[];
      readonly lede: string;
      readonly channelLabel: string;
      readonly messageLabel: string;
      readonly placeholder: string;
      readonly presetsLabel: string;
      readonly presets: readonly string[];
      readonly send: string;
      readonly queued: string;
      readonly yours: string;
      readonly autoNote: string;
      readonly boardTitle: string;
      readonly journalTitle: string;
      readonly journalEmpty: string;
      readonly log: {
        readonly received: string;
        readonly qualified: string;
        readonly routed: string;
        readonly filed: string;
      };
      readonly samples: readonly FlowLeadCopy[];
    };

    readonly report: {
      readonly title: readonly string[];
      readonly lede: string;
      readonly heading: string;
      readonly time: string;
      readonly processed: string;
      readonly warm: string;
      readonly cold: string;
      readonly yours: string;
      readonly lost: string;
      readonly byManager: string;
      readonly reset: string;
    };

    readonly inside: {
      readonly title: readonly string[];
      readonly items: readonly { readonly key: string; readonly name: string; readonly body: string }[];
    };

    readonly deploy: {
      readonly title: readonly string[];
      readonly items: readonly { readonly key: string; readonly name: string; readonly body: string }[];
    };

    readonly cta: {
      readonly title: readonly string[];
      readonly lede: string;
      readonly action: string;
    };
  };

  readonly work: {
    readonly title: readonly string[];
    readonly lede: string;
    /** Tells a visitor the ribbon can be dragged. */
    readonly hint: string;
    readonly caseCta: string;
    readonly projects: readonly ProjectCopy[];
  };

  readonly process: {
    readonly title: readonly string[];
    readonly lede: string;
    readonly ofLabel: string;
    readonly leavesYouWith: string;
    readonly steps: readonly StepCopy[];
  };

  readonly questions: {
    readonly title: readonly string[];
    readonly items: readonly QuestionCopy[];
  };

  readonly cta: {
    readonly title: readonly string[];
    readonly lede: string;
    readonly action: string;
    /** Label on the link out to the studio's Telegram channel. */
    readonly channel: string;
    readonly directLabel: string;
  };

  readonly channels: {
    readonly overlayTitle: string;
    readonly overlayLede: string;
    readonly close: string;
    readonly back: string;
    readonly labels: Readonly<Record<ChannelId, string>>;
    readonly notes: Readonly<Record<ChannelId, string>>;
  };


  readonly intro: {
    readonly label: string;
    readonly skip: string;
  };

  readonly footer: {
    readonly top: string;
    readonly index: string;
    readonly elsewhere: string;
    readonly colophon: string;
    readonly place: string;
    /**
     * Label for the link to /privacy. The legal name and the tax number
     * beside it are not translatable and live in `lib/studio.ts`.
     */
    readonly privacy: string;
  };
}
