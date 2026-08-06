import type { Copy } from "./types";

export const en = {
  localeName: "English",

  studio: {
    availability: "Two engagement slots open",
    startProject: "Start a project",
    languageLabel: "Language",
  },

  sections: {
    origin: "Origin",
    studio: "Studio",
    founder: "Founder",
    engagements: "Engagements",
    configurator: "Configurator",
    work: "Work",
    process: "Process",
    voices: "Voices",
    questions: "Questions",
    start: "Start",
  },

  hero: {
    // Split across two lines deliberately — the break carries the emphasis.
    headline: ["We make small companies", "look inevitable."],
    lede: "North Studio is a founder-led digital studio. We design and build cinematic websites for ambitious small businesses — in weeks, not quarters.",
    scrollHint: "Scroll",
    founderLed: "Founder-led",
  },

  manifesto: {
    title: ["Craft is the", "only moat left."],
    body: [
      "Every business can buy a template now. What can't be bought is judgement — knowing which four words belong on the first screen, how long a transition should hold, when to leave a space empty.",
      "North Studio is founder-led. The person you brief is the person who designs it and the person who writes the code. Nothing is translated through a project manager, and nothing arrives diluted.",
      "Our pipeline is AI-assisted, which is not the same as AI-generated. The mechanical hours collapse — scaffolding, variants, the fourth pass on a layout. The hours that remain go into taste. That is why a site an agency would quote at a quarter takes us weeks, and why it looks like this instead of like everything else.",
    ],
    principles: [
      { term: "Restraint", definition: "The luxury is in what we left out." },
      { term: "Speed", definition: "Weeks — because the pipeline is built, not improvised." },
      { term: "Ownership", definition: "You leave with the code, the files and the keys." },
    ],
  },

  founder: {
    title: ["The studio is", "one person."],
    // NOTE FOR THE FOUNDER: this is an honest draft in your voice, not a
    // biography. No names, dates, employers or numbers are asserted.
    // Confirm or rewrite before launch — and add your name to `signature`.
    body: [
      "You will not be handed to an account manager, and there is no team behind me to point at. I take the brief, I draw it, I build it, and I am the person who answers when something is wrong.",
      "That is the whole pitch. A studio this small survives only on work good enough to be passed on, so that is the only kind I take.",
    ],
    signature: "Founder, North Studio",
    portraitNote:
      "NORTH — FOUNDER PORTRAIT · REPLACE THIS · recommended 4:5, dark cinematic",
  },

  engagements: {
    title: ["Three ways to work", "with the studio."],
    lede: "Scoped on the first call and quoted as one fixed number. No hourly billing, no scope creep, no invoice you didn't expect.",
    anchorLine: "Engagements start from 60 000 ₽",
    mostPopular: "Most engagements",
    runsLabel: "Runs",
    tiers: [
      {
        key: "signal",
        name: "Signal",
        from: "from 60 000 ₽",
        tagline: "For a single, sharp message.",
        forWhom: "A launch, one product, one offer. When one page has to do one job perfectly.",
        includes: [
          "One long-form landing page",
          "Art direction and full copy",
          "Motion and interaction design",
          "Deployed, measured, handed over",
        ],
        duration: "2 weeks",
        outcome: "A first screen people finish reading.",
      },
      {
        key: "studio",
        name: "Studio",
        from: "from 140 000 ₽",
        tagline: "The full presence.",
        forWhom: "An established business whose website stopped matching what it has become.",
        includes: [
          "Six to nine section site",
          "Identity direction and full copy",
          "Custom motion system",
          "CMS for the parts you'll change",
          "Analytics, SEO, handover",
        ],
        duration: "4–5 weeks",
        outcome: "A company that reads as three times its size.",
      },
      {
        key: "bespoke",
        name: "Bespoke",
        from: "from 320 000 ₽",
        tagline: "Whatever it needs to be.",
        forWhom: "Real-time 3D, generative work, product interfaces, or a standing studio relationship.",
        includes: [
          "Scoped from a blank page",
          "Shader and real-time 3D work",
          "A design system you keep",
          "Retained availability",
        ],
        duration: "By conversation",
        outcome: "The thing your competitors get shown as a reference.",
      },
    ],
  },

  configurator: {
    title: ["Build your", "project."],
    lede: "Four questions. You get an estimated range and a rough timeline in about twenty seconds.",
    questions: [
      {
        key: "purpose",
        prompt: "What is it for?",
        choices: [
          { value: "launch", label: "A launch or one offer" },
          { value: "presence", label: "The whole company" },
          { value: "bespoke", label: "Something unusual" },
        ],
      },
      {
        key: "scope",
        prompt: "How much of it?",
        choices: [
          { value: "one", label: "One page" },
          { value: "few", label: "A few sections" },
          { value: "many", label: "Many sections" },
        ],
      },
      {
        key: "copy",
        prompt: "Do you have the words?",
        choices: [
          { value: "yes", label: "Written and ready" },
          { value: "partly", label: "Some of it" },
          { value: "no", label: "Write them for me" },
        ],
      },
      {
        key: "timing",
        prompt: "When do you need it?",
        choices: [
          { value: "relaxed", label: "No particular rush" },
          { value: "standard", label: "Next month or so" },
          { value: "fast", label: "As soon as possible" },
        ],
      },
    ],
    rangeLabel: "Estimated range",
    timelineLabel: "Rough timeline",
    matchLabel: "Closest engagement",
    disclaimer: "An estimate. The final price is fixed on the call and does not move after.",
    cta: "Take this to a conversation",
    reset: "Start over",
    progress: "Answered",
    timelines: {
      fast: "2–3 weeks, prioritised",
      standard: "3–5 weeks",
      relaxed: "4–7 weeks, unhurried",
    },
  },

  work: {
    title: ["Proof, not", "promises."],
    lede: "Three pieces, chosen because each one solved a different problem. The rest is available on the call.",
    placeholderNote: "Visuals are placeholder plates in this build — see README.md to swap in captures.",
    engagementSuffix: "engagement",
    projects: [
      {
        key: "meridian",
        name: "Meridian",
        discipline: "Roastery / Direct-to-consumer",
        summary: "A twelve-year-old roastery that read online like a market stall. Rebuilt around the one thing it had that nobody else did: the roast log.",
        year: "2026",
        engagement: "Studio",
      },
      {
        key: "halden",
        name: "Halden",
        discipline: "Architecture practice",
        summary: "Sixty projects, no way to see them. A single scrolling plan-view replaced the portfolio grid entirely.",
        year: "2025",
        engagement: "Bespoke",
      },
      {
        key: "aster",
        name: "Aster",
        discipline: "Private clinic",
        summary: "Trust before information. One page, one booking action, and every claim on it independently verifiable.",
        year: "2025",
        engagement: "Signal",
      },
    ],
  },

  process: {
    title: ["How a project", "actually runs."],
    lede: "Four movements. You know the price and the date before the second one starts.",
    ofLabel: "of",
    leavesYouWith: "Leaves you with",
    steps: [
      {
        key: "orientation",
        name: "Orientation",
        body: "A 45-minute call. We find the single thing this site has to do, and who it has to do it to. Scope and fixed price land the same day.",
        artifact: "Scope, fixed price, start date",
      },
      {
        key: "direction",
        name: "Direction",
        body: "Art direction, structure and the real copy. No wireframes, no lorem — you review the actual thing on the actual screen, in week one.",
        artifact: "Live direction, approved",
      },
      {
        key: "build",
        name: "Build",
        body: "Designed and coded in the same pass, so nothing is lost in translation. A staging link goes up on day one and you watch it assemble.",
        artifact: "Staging link, updated daily",
      },
      {
        key: "launch",
        name: "Launch",
        body: "Deployed, measured, handed over. Code, files, domain, analytics — all of it yours. Two weeks of support after go-live.",
        artifact: "Keys, and everything they open",
      },
    ],
  },

  voices: {
    title: ["What founders say", "afterwards."],
    placeholderNote: "Placeholder attributions — replace with real, credited quotes before launch.",
    items: [
      {
        key: "logistics",
        quote: "We sent the link to an investor before we'd changed anything else about the business. He asked who our design team was.",
        role: "Founder",
        sector: "B2B logistics platform",
      },
      {
        key: "architecture",
        quote: "Three weeks. I'd been quoted three months by two agencies, and neither of them had shown me a single line of copy.",
        role: "Partner",
        sector: "Architecture practice",
      },
      {
        key: "roastery",
        quote: "It's the first time our website has been the most impressive thing about us rather than the least.",
        role: "Co-founder",
        sector: "Specialty roastery",
      },
    ],
  },

  questions: {
    title: ["Before you", "ask."],
    items: [
      {
        key: "speed",
        q: "How fast is fast?",
        a: "Signal runs two weeks. Studio runs four to five. Bespoke is scoped per project. The clock starts when the content exists — and since waiting on content is the single biggest cause of delay, we write it for you unless you'd rather not.",
      },
      {
        key: "ai",
        q: "What does “AI-assisted” actually mean?",
        a: "The mechanical hours compress: scaffolding, layout variants, refactors, boilerplate. It does not mean a model generates your website. Every design decision, every line of copy and every interaction on this page was chosen by a person. The pipeline buys time; the time goes into craft.",
      },
      {
        key: "ownership",
        q: "Do I own it?",
        a: "Completely. Source code, design files, domain, hosting, analytics. No licence, no lock-in, no monthly fee to keep your own site online. If you want a different studio to take it over next year, they can.",
      },
      {
        key: "price",
        q: "Why does this cost more than a freelancer?",
        a: "Because you're not buying pages. You're buying the judgement that decides what goes on them, and a build that still looks current in three years. If price is the deciding factor, a template will serve you better — and we'll say so on the call.",
      },
      {
        key: "revisions",
        q: "How many revisions do I get?",
        a: "Two structured rounds per phase, which is enough because you approve direction before anything gets built. We've never reached the limit. It exists to keep scope finite, not to bill you.",
      },
      {
        key: "input",
        q: "What do you need from me?",
        a: "An hour for the first call, your logo and any photography you own, and one person who can say yes. That is the entire list.",
      },
    ],
  },

  trust: {
    // Qualitative and verifiable. No counts, no percentages, no client
    // names — nothing here asserts anything that isn't already true on
    // this page. See TrustStrip.tsx for where real stats go later.
    items: [
      "Founder-led",
      "Weeks, not quarters",
      "Fixed price on the first call",
      "Two slots open",
    ],
  },

  cta: {
    title: ["Tell us what", "you're building."],
    lede: "One call, 45 minutes. You leave it with a scope, a fixed price and a date — whether or not you work with us.",
    action: "Start a project",
    directLabel: "Or reach me directly",
  },

  channels: {
    overlayTitle: "How do you want to talk?",
    overlayLede: "Pick a channel. Every one of them reaches me directly.",
    close: "Close",
    back: "All channels",
    labels: {
      telegram: "Telegram",
      whatsapp: "WhatsApp",
      email: "Email",
    },
    notes: {
      telegram: "Fastest. Usually a reply within the hour.",
      whatsapp: "If Telegram isn't your thing.",
      email: "For briefs, documents, anything longer than a line.",
    },
    briefLabel: "Send a brief",
    briefNote: "Two minutes. I reply with scope and a price.",
  },

  form: {
    heading: "Send a brief",
    lede: "Three fields. Enough for me to come back with a real answer rather than a question.",
    name: "Your name",
    namePlaceholder: "Who am I replying to?",
    channel: "Where should I reply?",
    handle: "Handle, number or address",
    handlePlaceholder: "@handle, +7…, or you@company.com",
    need: "What do you need?",
    needPlaceholder: "What the site is for, and what has to change.",
    budget: "Budget",
    budgetNone: "Not sure yet",
    submit: "Send the brief",
    sending: "Sending…",
    success: "Sent. I'll reply on the channel you gave me.",
    errorLead: "That didn't send. Write to me directly instead:",
    required: "This one's needed.",
    tooShort: "A little more detail, please.",
    optional: "optional",
  },

  preloader: {
    calibrating: "Calibrating",
    skip: "Skip",
  },

  sound: {
    label: "Sound",
    enable: "Turn sound on",
    disable: "Turn sound off",
  },

  footer: {
    index: "Index",
    elsewhere: "Direct",
    colophon: "Designed and built in-house. No template was harmed.",
    place: "Moscow · Remote worldwide",
  },
} as const satisfies Copy;
