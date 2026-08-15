import type { Copy } from "./types";

export const en = {
  localeName: "English",

  studio: {
    availability: "Two project slots open",
    startProject: "Start a project",
    languageLabel: "Language",
  },

  sections: {
    origin: "Origin",
    studio: "Studio",
    founder: "Founder",
    services: "Services",
    agent: "Live agent",
    configurator: "Configurator",
    work: "Work",
    process: "Process",
    voices: "Voices",
    questions: "Questions",
    start: "Start",
    "agent-hero": "North Agent",
    "agent-chat": "Live dialog",
    "agent-capabilities": "Capabilities",
    "agent-deploy": "Deployment",
    "agent-numbers": "Numbers",
    "agent-start": "Start",
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

  services: {
    title: ["What we", "do."],
    lede: "Three directions, one outcome: clients arrive on their own and the busywork runs without you.",
    ghost: "SERVICES",
    discuss: "Discuss",
    items: [
      {
        key: "sites",
        name: "Landing pages & sites",
        short: "Site",
        summary:
          "Cinematic selling pages and whole sites — concept, copy, design and build in a single pass.",
        includes: [
          "Art direction and the words",
          "Motion and interaction design",
          "Built, deployed, handed over",
        ],
        configuratorLine:
          "Direction, copy and build in one pass, deployed and handed to you.",
      },
      {
        key: "agents",
        name: "AI agents",
        short: "Agent",
        summary:
          "Assistants that answer your clients around the clock, qualify the job, and hand it over warm.",
        includes: [
          "Trained on how you actually sell",
          "Qualifies before it hands over",
          "Lives where your clients already are",
        ],
        configuratorLine:
          "An assistant that answers instantly, qualifies, and passes a warm lead to you.",
      },
      {
        key: "automation",
        name: "Automation",
        short: "Automation",
        summary:
          "Lead handling, service integrations and reporting that run with no manual work and nothing lost.",
        includes: [
          "Leads routed the moment they land",
          "Your tools wired to each other",
          "Reports that arrive without asking",
        ],
        configuratorLine:
          "Your tools wired together so leads route themselves and nothing is retyped.",
      },
    ],
  },

  agent: {
    title: ["It answers at 03:00.", "You read it at nine."],
    lede: "A scripted demonstration of the kind of agent we build. It replies instantly, collects the contact, works out what the job actually is, and hands a warm lead to a person.",
    demoLabel: "Demo — a script, not a live model",
    visitorRole: "Visitor",
    agentRole: "North agent",
    script: [
      { from: "visitor", text: "Hi — what does a landing page cost?" },
      {
        from: "agent",
        text: "That depends on the scope, and we settle the number on a call rather than guess at it here. Two quick questions and you'll have a real answer today. What's the page for?",
      },
      { from: "visitor", text: "We're launching a coffee subscription." },
      {
        from: "agent",
        text: "Good — one page, one action, nothing in the way of it. Roughly when would you want it live?",
      },
      { from: "visitor", text: "Some time next month." },
      {
        from: "agent",
        text: "That's comfortable. Leave me a Telegram handle or an email and the founder comes back today with the scope and a fixed price.",
      },
    ],
    reply:
      "Noted. In the real agent this is where I'd check the calendar and offer you two times. Here, the button below is faster.",
    placeholder: "Type anything…",
    send: "Send",
    cta: "Build me one of these",
    replaying: "Replay",
  },

  agentCase: {
    demoTag: "Demo concept",
    backToWork: "All work",
    productName: "North Agent",
    promise: [
      "The assistant that talks to your clients",
      "for you — instantly, around the clock.",
    ],
    heroCta: "Want North Agent working for you?",
    brand: "LEKTA",
    brandNote:
      "The school below is invented, and so is every figure on this page. It exists so the agent can be shown doing its job on something concrete rather than in the abstract.",

    chat: {
      title: ["Watch it close", "an enrolment."],
      lede: "Deployed here as the assistant for LEKTA, a made-up online school. Course dates, payment, instalments, holding the seat — the questions a real school answers forty times a day.",
      demoLabel: "Scripted demo",
      studentRole: "Student",
      agentRole: "LEKTA assistant",
      script: [
        { from: "student", text: "Hi! When does the next Python cohort start?" },
        {
          from: "agent",
          text: "Hello! The next one starts on the 3rd. There are still seats in the morning and the evening group. Want me to match one to your schedule?",
        },
        { from: "student", text: "Evening. Do you do instalments?" },
        {
          from: "agent",
          text: "We do — six months, no interest added. I can hold a seat for you in the evening group and send the payment link right here.",
        },
        { from: "student", text: "Yes, please." },
        {
          from: "agent",
          text: "Done — the seat is held for 24 hours. I have sent the link and the first module's syllabus. Any questions about the course, I am here at any hour.",
        },
      ],
      placeholder: "Ask it something…",
      send: "Send",
      replay: "Replay",
    },

    capabilities: {
      title: ["What it does", "all day."],
      items: [
        {
          key: "answers",
          name: "Answers instantly, 24/7",
          body: "No question waits until morning. Nights, weekends, the hour your ads run hottest — it replies in seconds, every time.",
          slotLabel: "CAPABILITY · ANSWERS · REPLACE · 4:5",
        },
        {
          key: "knows",
          name: "Knows your programme cold",
          body: "Trained on your courses, your terms and your FAQ, answering in your brand's voice rather than a generic assistant's.",
          slotLabel: "CAPABILITY · KNOWS · REPLACE · 4:5",
        },
        {
          key: "enroll",
          name: "Drives to enrolment",
          body: "Qualifies, handles the usual objections, holds the seat and sends the link. Anything it should not decide alone goes to a person.",
          slotLabel: "CAPABILITY · ENROL · REPLACE · 4:5",
        },
      ],
    },

    deploy: {
      title: ["How it lands", "on your site."],
      items: [
        {
          key: "widget",
          name: "One line of code",
          body: "A widget on your site, or inside the chat your clients already use.",
        },
        {
          key: "trained",
          name: "Trained on your data",
          body: "Courses, terms, policies — the answers you already repeat every day.",
        },
        {
          key: "handoff",
          name: "Hands off cleanly",
          body: "Straight into your CRM and Telegram, with the whole thread attached.",
        },
        {
          key: "analytics",
          name: "Dialogue analytics",
          body: "What people actually ask, where they hesitate, what wins the seat.",
        },
      ],
    },

    numbers: {
      title: ["The shape of", "the result."],
      disclaimer: "Demo concept — illustrative figures, not measured client results.",
      items: [
        { key: "reply", value: 2, suffix: " sec", label: "Average reply" },
        { key: "hours", value: null, suffix: "", literal: "24/7", label: "Always answering" },
        { key: "missed", value: 0, suffix: "", label: "Missed enquiries" },
      ],
    },

    cta: {
      title: ["Want North Agent", "working for you?"],
      lede: "Tell us what your clients keep asking. We will show you this trained on your own answers.",
      action: "Start a project",
    },

    slots: {
      hero: "HERO BG · REPLACE · 16:9 · hero.mp4 overrides if present",
      mascot: "NORTH AGENT MASCOT · REPLACE · ~1:1 · dark chrome",
    },
  },

  configurator: {
    title: ["Point us at", "the problem."],
    lede: "Four questions. You get the direction your job belongs to and roughly how long it takes.",
    questions: [
      {
        key: "need",
        prompt: "What do you need?",
        choices: [
          { value: "sites", label: "A page or a site" },
          { value: "agents", label: "An AI agent" },
          { value: "automation", label: "Automation" },
        ],
      },
      {
        key: "scope",
        prompt: "How big is it?",
        choices: [
          { value: "one", label: "One page, one job" },
          { value: "few", label: "A few moving parts" },
          { value: "system", label: "A whole system" },
        ],
      },
      {
        key: "copy",
        prompt: "Do you have the words?",
        choices: [
          { value: "yes", label: "Written and ready" },
          { value: "partly", label: "Some of them" },
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
    timelineLabel: "Rough timeline",
    matchLabel: "Recommended direction",
    includesLabel: "What that includes",
    disclaimer: "Scope and price are settled on the first call, not here.",
    cta: "Take this to a conversation",
    reset: "Start over",
    progress: "Answered",
    timelines: {
      fast: "2–3 weeks, prioritised",
      standard: "3–5 weeks",
      relaxed: "5–8 weeks, unhurried",
    },
  },

  work: {
    title: ["Proof, not", "promises."],
    lede: "Three pieces, chosen because each one solved a different problem. The rest is available on the call.",
    caseCta: "Open the case",
    placeholderNote: "Visuals are placeholder plates in this build — see README.md to swap in captures.",
    projects: [
      {
        key: "north-agent",
        name: "North Agent",
        discipline: "Our own product / AI agent",
        summary:
          "The assistant we build for clients, shown working end to end: it answers, qualifies and closes an enrolment while you read it. A demo concept you can talk to.",
        year: "2026",
      },
      {
        key: "meridian",
        name: "Meridian",
        discipline: "Roastery / Direct-to-consumer",
        summary: "A twelve-year-old roastery that read online like a market stall. Rebuilt around the one thing it had that nobody else did: the roast log.",
        year: "2026",
      },
      {
        key: "halden",
        name: "Halden",
        discipline: "Architecture practice",
        summary: "Sixty projects, no way to see them. A single scrolling plan-view replaced the portfolio grid entirely.",
        year: "2025",
      },
      {
        key: "aster",
        name: "Aster",
        discipline: "Private clinic",
        summary: "Trust before information. One page, one booking action, and every claim on it independently verifiable.",
        year: "2025",
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
        a: "A page runs about two weeks, a full site four to five, and anything unusual is scoped on its own. Agents and automations are usually quicker than either. The clock starts when the content exists — and since waiting on content is the single biggest cause of delay, we write it for you unless you'd rather not.",
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
      "Price on the first call",
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
