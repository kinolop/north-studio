import type { ChannelId } from "@/lib/channels";
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
  /** Short form, for the work cards' footer. */
  readonly short: string;
  readonly summary: string;
  readonly includes: readonly string[];
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
    Record<SectionId | AgentSectionId | FlowSectionId, string>
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
      readonly cta: string;
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
      readonly mascot: string;
    };
  };

  /**
   * ORBITA — an invented fintech product, and its own landing page.
   *
   * This dictionary holds a *company's* voice, not the studio's: it speaks
   * to its own customers about their money, and North Studio appears once,
   * in a single line at the foot of the page. Keep it that way. The page it
   * feeds shares no styling with the rest of this site either — see
   * components/orbita/orbita.css.
   */
  readonly orbitaCase: {
    readonly demoTag: string;
    readonly getApp: string;
    readonly nav: readonly {
      readonly key: string;
      readonly label: string;
      readonly href: string;
    }[];

    readonly hero: {
      readonly headline: readonly string[];
      readonly subtitle: string;
      readonly primary: string;
      readonly secondary: string;
    };

    readonly trust: readonly {
      readonly key: "security" | "instant" | "fees";
      readonly label: string;
      readonly note: string;
    }[];

    readonly features: {
      readonly eyebrow: string;
      readonly title: string;
      readonly items: readonly {
        readonly key: "unify" | "transfer" | "insights";
        readonly eyebrow: string;
        readonly title: string;
        readonly body: string;
        readonly points: readonly string[];
      }[];
    };

    readonly ticker: readonly string[];

    readonly counters: {
      readonly note: string;
      readonly items: readonly {
        readonly key: string;
        readonly value: number;
        readonly decimals?: number;
        readonly suffix: string;
        readonly label: string;
      }[];
    };

    readonly plans: {
      readonly eyebrow: string;
      readonly title: string;
      readonly note: string;
      readonly popularLabel: string;
      readonly disclaimer: string;
      readonly items: readonly {
        readonly key: string;
        readonly name: string;
        readonly price: string;
        readonly cadence: string;
        readonly line: string;
        readonly features: readonly string[];
        readonly cta: string;
        readonly popular?: boolean;
      }[];
    };

    readonly appForm: {
      readonly placeholder: string;
      readonly action: string;
      readonly note: string;
    };

    readonly security: {
      readonly eyebrow: string;
      readonly title: string;
      readonly body: string;
      readonly items: readonly {
        readonly key: string;
        readonly title: string;
        readonly body: string;
      }[];
    };

    readonly lifestyle: {
      readonly line: string;
      readonly note: string;
    };

    readonly steps: {
      readonly eyebrow: string;
      readonly title: string;
      readonly items: readonly {
        readonly key: string;
        readonly title: string;
        readonly body: string;
      }[];
    };

    readonly close: {
      readonly title: readonly string[];
      readonly body: string;
      readonly action: string;
    };

    readonly footer: {
      readonly tagline: string;
      readonly columns: readonly {
        readonly key: string;
        readonly title: string;
        readonly links: readonly string[];
      }[];
      readonly legal: string;
      readonly credit: string;
    };

    /** Printed inside a frame while its file is missing. */
    readonly slots: {
      readonly hero: string;
      readonly heroVideo: string;
      readonly bgHero: string;
      readonly bgBand: string;
      readonly bgCta: string;
      readonly appHero: string;
      readonly appTransfer: string;
      readonly appInsights: string;
      readonly security: string;
      readonly lifestyle: string;
    };
  };

  readonly work: {
    readonly title: readonly string[];
    readonly lede: string;
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

  readonly trust: {
    readonly items: readonly string[];
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
    /**
     * Label for the link to /privacy. The legal name and the tax number
     * beside it are not translatable and live in `lib/studio.ts`.
     */
    readonly privacy: string;
  };
}
