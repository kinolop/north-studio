import type { ChannelId } from "@/lib/channels";
import type {
  AgentSectionId,
  FlowSectionId,
  OrbitaSectionId,
  SectionId,
} from "@/lib/sections";

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
  /** Short form, for the work cards' footer. */
  readonly short: string;
  readonly summary: string;
  readonly includes: readonly string[];
  /** One line the configurator prints under its recommendation. */
  readonly configuratorLine: string;
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

/**
 * A counted figure. `value` is what it counts to; `literal` opts out of
 * counting entirely for things like "24/7" that are not quantities.
 */
export interface FigureCopy {
  readonly key: string;
  readonly value: number | null;
  readonly suffix: string;
  /** Decimal places, for figures like 0.8 s. Whole numbers by default. */
  readonly decimals?: number;
  readonly literal?: string;
  readonly label: string;
}

/** One piece of cargo on the North Flow conveyor. */
export interface FlowLead {
  readonly key: string;
  /** Short channel name, printed on the chip. */
  readonly channel: string;
  /** How the journal announces the arrival: "lead from Telegram". */
  readonly source: string;
  /** Drives the colour. The label beside it is authored per locale. */
  readonly tone: "warm" | "cold";
  readonly toneLabel: string;
  readonly priority: string;
  /** A manager's name, or the nurture list for the cold ones. */
  readonly route: string;
}

export interface FlowStage {
  readonly key: "in" | "qualify" | "route" | "crm";
  readonly name: string;
  readonly note: string;
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
    Record<SectionId | AgentSectionId | FlowSectionId | OrbitaSectionId, string>
  >;

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

  readonly services: {
    readonly title: readonly string[];
    readonly lede: string;
    /** The huge low-opacity word behind the trio. */
    readonly ghost: string;
    readonly discuss: string;
    readonly items: readonly Service[];
  };

  readonly agent: {
    readonly title: readonly string[];
    readonly lede: string;
    readonly demoLabel: string;
    readonly visitorRole: string;
    readonly agentRole: string;
    readonly script: readonly { readonly from: "visitor" | "agent"; readonly text: string }[];
    readonly reply: string;
    readonly placeholder: string;
    readonly send: string;
    readonly cta: string;
    readonly replaying: string;
  };

  /** The North Agent product case page at /work/north-agent. */
  readonly agentCase: {
    readonly demoTag: string;
    readonly backToWork: string;
    readonly productName: string;
    readonly promise: readonly string[];
    readonly heroCta: string;
    /** The fictional brand the demo agent is deployed for. */
    readonly brand: string;
    readonly brandNote: string;

    readonly chat: {
      readonly title: readonly string[];
      readonly lede: string;
      readonly demoLabel: string;
      readonly studentRole: string;
      readonly agentRole: string;
      readonly script: readonly { readonly from: "student" | "agent"; readonly text: string }[];
      readonly placeholder: string;
      readonly send: string;
      readonly replay: string;
    };

    readonly capabilities: {
      readonly title: readonly string[];
      readonly items: readonly {
        readonly key: "answers" | "knows" | "enroll";
        readonly name: string;
        readonly body: string;
        readonly slotLabel: string;
      }[];
    };

    readonly deploy: {
      readonly title: readonly string[];
      readonly items: readonly { readonly key: string; readonly name: string; readonly body: string }[];
    };

    readonly numbers: {
      readonly title: readonly string[];
      readonly disclaimer: string;
      readonly items: readonly FigureCopy[];
    };

    readonly cta: {
      readonly title: readonly string[];
      readonly lede: string;
      readonly action: string;
    };

    readonly slots: {
      readonly hero: string;
      readonly mascot: string;
    };
  };

  /** The North Flow product case page at /work/north-flow. */
  readonly flowCase: {
    readonly demoTag: string;
    readonly backToWork: string;
    readonly productName: string;
    readonly promise: readonly string[];
    readonly heroCta: string;
    /** The fictional online store the line is shown running for. */
    readonly brand: string;
    readonly brandNote: string;

    readonly conveyor: {
      readonly title: readonly string[];
      readonly lede: string;
      /** Mono readouts across the head of the machine. */
      readonly lineLabel: string;
      readonly runningLabel: string;
      /** Whose line this is — the invented store, named on the machine. */
      readonly clientLabel: string;
      readonly stages: readonly FlowStage[];
      /** Under the CRM station's running count. */
      readonly cardsLabel: string;
      /** The badge a chip earns once it is filed. */
      readonly filedLabel: string;
      /** Cycled through the line, in order, one per chip. */
      readonly leads: readonly FlowLead[];

      readonly journal: {
        readonly title: string;
        readonly liveLabel: string;
        readonly note: string;
      };

      readonly tally: {
        readonly label: string;
        readonly hoursSuffix: string;
        readonly items: readonly {
          readonly key: "processed" | "warm" | "cold" | "hours";
          readonly label: string;
        }[];
      };

      readonly stats: {
        readonly disclaimer: string;
        readonly items: readonly FigureCopy[];
      };

      /** Printed in place of the motion when the visitor asked for calm. */
      readonly stillLabel: string;
    };

    readonly inside: {
      readonly title: readonly string[];
      readonly lede: string;
      readonly items: readonly {
        readonly key:
          | "collect"
          | "qualify"
          | "write"
          | "reply"
          | "report"
          | "always";
        readonly name: string;
        readonly body: string;
      }[];
    };

    readonly deploy: {
      readonly title: readonly string[];
      readonly items: readonly {
        readonly key: string;
        readonly name: string;
        readonly body: string;
      }[];
    };

    readonly cta: {
      readonly title: readonly string[];
      readonly lede: string;
      readonly action: string;
    };

    readonly slots: {
      readonly hero: string;
      readonly mascot: string;
    };
  };

  /**
   * The ORBITA case at /work/orbita.
   *
   * The odd one out: this dictionary holds an *invented brand's* voice, not
   * the studio's. ORBITA speaks as a product to its own customers, and only
   * the frame at the top and the note near the end speak as North. Keep
   * that separation when editing — the case argues that we can write a
   * second brand, and a page that slips back into studio voice loses it.
   */
  readonly orbitaCase: {
    readonly demoTag: string;
    readonly backToWork: string;

    readonly frame: {
      readonly clientLabel: string;
      readonly client: string;
      readonly roleLabel: string;
      readonly role: string;
      readonly yearLabel: string;
      readonly year: string;
      readonly note: string;
    };

    readonly hero: {
      readonly wordmark: string;
      readonly promise: readonly string[];
      readonly lede: string;
      readonly cta: string;
    };

    readonly shift: {
      readonly title: readonly string[];
      readonly body: readonly string[];
      readonly fromLabel: string;
      readonly toLabel: string;
      readonly pairs: readonly {
        readonly key: string;
        readonly from: string;
        readonly to: string;
      }[];
    };

    readonly product: {
      readonly title: readonly string[];
      readonly lede: string;
      readonly items: readonly {
        readonly key: "accounts" | "transfer" | "insight";
        readonly name: string;
        readonly body: string;
        readonly slotLabel: string;
      }[];

      /** Everything printed inside the coded app screens. */
      readonly mock: {
        readonly totalLabel: string;
        readonly total: string;
        readonly moreLabel: string;
        readonly accounts: readonly {
          readonly key: string;
          readonly name: string;
          readonly meta: string;
          readonly amount: string;
        }[];
        readonly transfer: {
          readonly title: string;
          readonly fromLabel: string;
          readonly from: string;
          readonly toLabel: string;
          readonly to: string;
          readonly amount: string;
          readonly status: string;
        };
        readonly insight: {
          readonly title: string;
          readonly sentence: string;
          readonly deltaLabel: string;
          readonly delta: string;
          readonly months: readonly string[];
        };
      };
    };

    readonly trust: {
      readonly title: readonly string[];
      readonly lede: string;
      readonly items: readonly {
        readonly key: string;
        readonly name: string;
        readonly body: string;
      }[];
      readonly disclaimer: string;
      readonly stats: readonly FigureCopy[];
    };

    /** The one section that speaks as the studio again. */
    readonly north: {
      readonly title: readonly string[];
      readonly body: readonly string[];
      readonly didLabel: string;
      readonly did: readonly string[];
    };

    readonly cta: {
      readonly title: readonly string[];
      readonly lede: string;
      readonly action: string;
    };

    readonly slots: {
      readonly hero: string;
    };
  };

  readonly configurator: {
    readonly title: readonly string[];
    readonly lede: string;
    readonly questions: readonly ConfiguratorQuestion[];
    readonly timelineLabel: string;
    readonly matchLabel: string;
    readonly includesLabel: string;
    readonly disclaimer: string;
    readonly cta: string;
    readonly reset: string;
    readonly progress: string;
    readonly timelines: Readonly<Record<"fast" | "standard" | "relaxed", string>>;
  };

  readonly work: {
    readonly title: readonly string[];
    readonly lede: string;
    readonly caseCta: string;
    readonly placeholderNote: string;
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
