import type { ChannelId } from "@/lib/channels";
import type { AgentSectionId, SectionId } from "@/lib/sections";

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
  readonly sections: Readonly<Record<SectionId | AgentSectionId, string>>;

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
      readonly items: readonly {
        readonly key: string;
        readonly value: number | null;
        readonly suffix: string;
        readonly literal?: string;
        readonly label: string;
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
