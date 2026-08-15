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
    "flow-hero": "North Flow",
    "flow-conveyor": "The line",
    "flow-inside": "Inside",
    "flow-deploy": "Deployment",
    "flow-start": "Start",
    "orbita-hero": "ORBITA",
    "orbita-shift": "The shift",
    "orbita-product": "Product",
    "orbita-trust": "Trust",
    "orbita-north": "By North",
    "orbita-start": "Start",
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

  flowCase: {
    demoTag: "Demo concept",
    backToWork: "All work",
    productName: "North Flow",
    promise: [
      "Leads that handle themselves —",
      "collected, qualified and filed",
      "while you sleep.",
    ],
    heroCta: "Want North Flow running your leads?",
    brand: "VOLNA",
    brandNote:
      "The store below is invented, and so is every figure on this page. It exists so the line can be shown running on something concrete rather than in the abstract.",

    conveyor: {
      title: ["A night's worth of leads,", "filing themselves."],
      lede: "Everything that reaches VOLNA — a form on the site, Telegram, WhatsApp, Avito, a missed call — enters the same line. It is read, tagged warm or cold, handed to the manager who should have it, and filed. Nobody retypes anything, and nothing waits until morning.",
      lineLabel: "North Flow · line 01",
      runningLabel: "Running",
      clientLabel: "VOLNA · online store",
      stages: [
        { key: "in", name: "New lead", note: "Every channel, one queue" },
        {
          key: "qualify",
          name: "AI qualification",
          note: "Warm or cold, and how urgent",
        },
        {
          key: "route",
          name: "Manager",
          note: "The person who should have it",
        },
        { key: "crm", name: "CRM card", note: "Filed with the whole thread" },
      ],
      cardsLabel: "cards",
      filedLabel: "In CRM",
      leads: [
        {
          key: "tg-size",
          channel: "Telegram",
          source: "lead from Telegram",
          tone: "warm",
          toneLabel: "warm",
          priority: "high",
          route: "Anna",
        },
        {
          key: "site-cart",
          channel: "Site",
          source: "form on the site",
          tone: "warm",
          toneLabel: "warm",
          priority: "normal",
          route: "Igor",
        },
        {
          key: "avito-price",
          channel: "Avito",
          source: "message on Avito",
          tone: "cold",
          toneLabel: "cold",
          priority: "low",
          route: "nurture",
        },
        {
          key: "call-missed",
          channel: "Call",
          source: "missed call",
          tone: "warm",
          toneLabel: "warm",
          priority: "high",
          route: "Mira",
        },
        {
          key: "wa-delivery",
          channel: "WhatsApp",
          source: "lead on WhatsApp",
          tone: "warm",
          toneLabel: "warm",
          priority: "normal",
          route: "Pavel",
        },
        {
          key: "site-bulk",
          channel: "Site",
          source: "wholesale form on the site",
          tone: "warm",
          toneLabel: "warm",
          priority: "high",
          route: "Anna",
        },
        {
          key: "tg-return",
          channel: "Telegram",
          source: "returns question in Telegram",
          tone: "cold",
          toneLabel: "cold",
          priority: "low",
          route: "nurture",
        },
        {
          key: "avito-stock",
          channel: "Avito",
          source: "message on Avito",
          tone: "warm",
          toneLabel: "warm",
          priority: "normal",
          route: "Igor",
        },
        {
          key: "site-night",
          channel: "Site",
          source: "form on the site, night",
          tone: "warm",
          toneLabel: "warm",
          priority: "normal",
          route: "Mira",
        },
        {
          key: "wa-photo",
          channel: "WhatsApp",
          source: "photo on WhatsApp",
          tone: "cold",
          toneLabel: "cold",
          priority: "low",
          route: "nurture",
        },
        {
          key: "call-second",
          channel: "Call",
          source: "second missed call",
          tone: "warm",
          toneLabel: "warm",
          priority: "high",
          route: "Pavel",
        },
        {
          key: "tg-gift",
          channel: "Telegram",
          source: "gift sets, in Telegram",
          tone: "warm",
          toneLabel: "warm",
          priority: "normal",
          route: "Anna",
        },
      ],

      journal: {
        title: "Automation journal",
        liveLabel: "Live",
        note: "Every line is the machine writing down what it just did.",
      },

      tally: {
        label: "This demo, since the line started",
        hoursSuffix: " h",
        items: [
          { key: "processed", label: "Leads processed" },
          { key: "warm", label: "Warm" },
          { key: "cold", label: "To nurture" },
          { key: "hours", label: "Hours saved" },
        ],
      },

      stats: {
        disclaimer:
          "Demo concept — illustrative figures, not measured client results.",
        items: [
          {
            key: "qualify",
            value: 0.8,
            decimals: 1,
            suffix: " s",
            label: "To read and tag a lead",
          },
          {
            key: "always",
            value: null,
            suffix: "",
            literal: "24/7",
            label: "The line never sleeps",
          },
          { key: "missed", value: 0, suffix: "", label: "Leads missed" },
        ],
      },

      stillLabel:
        "Held still — your system asks for reduced motion, so the line is drawn as it stands.",
    },

    inside: {
      title: ["What it wires", "together."],
      lede: "Six jobs, none of which anyone should still be doing by hand.",
      items: [
        {
          key: "collect",
          name: "One queue for every channel",
          body: "Site forms, Telegram, WhatsApp, Avito, missed calls. They land in one place, in one format, with the source kept.",
        },
        {
          key: "qualify",
          name: "AI qualification",
          body: "Warm or cold, how urgent it is and what the person actually wants — decided in under a second and written onto the lead.",
        },
        {
          key: "write",
          name: "Straight into your CRM",
          body: "A card with the whole thread, the source and the tag. Your sheets updated, and a Telegram notification the moment it lands.",
        },
        {
          key: "reply",
          name: "The client is answered first",
          body: "An instant first reply that holds the conversation — polite, specific, in your voice — while your manager is asleep.",
        },
        {
          key: "report",
          name: "A morning report in Telegram",
          body: "Volume, sources, conversion and who is carrying the load. Waiting for you before the first coffee, without anyone assembling it.",
        },
        {
          key: "always",
          name: "The same speed at 3am",
          body: "It runs around the clock, at peak ad spend and on a dead Tuesday. It does not tire, and it does not forget one.",
        },
      ],
    },

    deploy: {
      title: ["How we put it", "on your channels."],
      items: [
        {
          key: "connects",
          name: "Connects to what you have",
          body: "Your CRM, your messengers, your sheets. No migration and nothing to relearn.",
        },
        {
          key: "process",
          name: "Built around your process",
          body: "We map how a lead actually travels through your team, then wire that — not a template of it.",
        },
        {
          key: "live",
          name: "Live in days",
          body: "A working line on your real channels within days, watched closely through the first week.",
        },
        {
          key: "yours",
          name: "Yours to keep",
          body: "The scenarios, the keys and the documentation. No monthly fee to keep your own automation running.",
        },
      ],
    },

    cta: {
      title: ["Want North Flow", "running your leads?"],
      lede: "Tell us where your leads come in and where they go missing. We will show you this line built on your own channels.",
      action: "Start a project",
    },

    slots: {
      hero: "HERO BG · REPLACE · 16:9 · hero.mp4 overrides if present",
      mascot:
        "REUSES THE NORTH AGENT MASCOT · /work/north-agent/assets/mascot.png · ~1:1",
    },
  },

  orbitaCase: {
    demoTag: "Demo concept",
    backToWork: "All work",

    frame: {
      clientLabel: "Client",
      client: "ORBITA",
      roleLabel: "Role",
      role: "Brand · Art direction · Build",
      yearLabel: "Year",
      year: "2026",
      note: "ORBITA is invented — a brand we drew, wrote and built end to end so this page can show the work rather than describe it. Everything below speaks in ORBITA's voice, not ours, and every figure on it is illustrative.",
    },

    hero: {
      wordmark: "ORBITA",
      promise: ["Your money, finally", "in one orbit."],
      lede: "One account for everything you already have. ORBITA pulls your banks, your cards and the wallet you forgot about into a single view, and keeps them there.",
      cta: "See it in motion",
    },

    shift: {
      title: ["Money stopped living", "in one place."],
      body: [
        "Two banks, a card kept for travel, a wallet holding the subscriptions, something sitting with a broker. Each one is certain it is the main one. None of them agree on what you actually have.",
        "ORBITA does not ask you to move anything. It connects what you already use and becomes the one screen that tells the truth about it.",
      ],
      fromLabel: "Now",
      toLabel: "With ORBITA",
      pairs: [
        { key: "apps", from: "Four apps", to: "One screen" },
        { key: "numbers", from: "Four numbers", to: "One, and it is right" },
        { key: "moving", from: "Transfers by hand", to: "One tap, instant" },
      ],
    },

    product: {
      title: ["Everything you own,", "in one place, in real time."],
      lede: "Three things ORBITA does that your banking app does not.",
      items: [
        {
          key: "accounts",
          name: "Every account, one balance",
          body: "Banks, cards, wallets and the broker in a single figure that updates while you are looking at it. No refreshing, no exports, no spreadsheet on a Sunday.",
          slotLabel: "ORBITA · SHOT 1 · ACCOUNTS · REPLACE · 4:5",
        },
        {
          key: "transfer",
          name: "Transfers that land while you watch",
          body: "Move money between your own accounts in one tap. It arrives before the screen has finished animating, and it costs nothing to do.",
          slotLabel: "ORBITA · SHOT 2 · TRANSFER · REPLACE · 4:5",
        },
        {
          key: "insight",
          name: "It tells you what it means",
          body: "Not a chart you have to interpret. One sentence: what changed this month, what caused it, and what it does to the rest of the year.",
          slotLabel: "ORBITA · SHOT 3 · INSIGHT · REPLACE · 4:5",
        },
      ],

      mock: {
        totalLabel: "Across all accounts",
        total: "$ 48 290.40",
        moreLabel: "+2 more",
        accounts: [
          { key: "everyday", name: "Everyday", meta: "•••• 4417", amount: "$ 12 480.10" },
          { key: "savings", name: "Savings", meta: "4.1% a year", amount: "$ 31 060.00" },
          { key: "broker", name: "Broker", meta: "Long-term", amount: "$ 4 750.30" },
        ],
        transfer: {
          title: "Transfer",
          fromLabel: "From",
          from: "Everyday •••• 4417",
          toLabel: "To",
          to: "Savings",
          amount: "$ 1 200.00",
          status: "Arrived · 0.9 s",
        },
        insight: {
          title: "This month",
          sentence:
            "Subscriptions rose by two this month. At this rate they cost you a fortnight of savings by December.",
          deltaLabel: "Vs last month",
          delta: "+ 8.4%",
          months: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        },
      },
    },

    trust: {
      title: ["Quick where it counts.", "Careful where it matters."],
      lede: "Speed is the easy half. The other half is never having to wonder what we can see.",
      items: [
        {
          key: "keys",
          name: "Your keys stay yours",
          body: "Encrypted on your device before anything leaves it. What we store, we cannot read.",
        },
        {
          key: "readonly",
          name: "Read-only by default",
          body: "ORBITA connects to your banks with permission to look, never to spend. You grant more only when you ask it to move something.",
        },
        {
          key: "ads",
          name: "You are not the product",
          body: "No adverts, no offers, nothing sold on about where your money goes. There is nothing in here for anyone to click.",
        },
      ],
      disclaimer:
        "Demo concept — illustrative figures for an invented product, not measured results.",
      stats: [
        { key: "transfer", value: 0.9, decimals: 1, suffix: " s", label: "Average transfer" },
        { key: "sync", value: null, suffix: "", literal: "24/7", label: "Accounts in sync" },
        { key: "banks", value: 40, suffix: "+", label: "Banks connected" },
        { key: "crypto", value: null, suffix: "", literal: "AES-256", label: "At rest and in flight" },
      ],
    },

    north: {
      title: ["Designed and built", "by North."],
      body: [
        "The brand, its mark, the motion, the words and the code — one pass, one team, no handover in the middle where the intent usually goes missing.",
        "ORBITA does not exist, and that is deliberate. A case with no client to hide behind is the only honest way to show what we would do with a brand of your own.",
      ],
      didLabel: "What we did",
      did: [
        "Brand and mark",
        "Art direction",
        "Motion system",
        "Design and build",
        "Copy, EN and RU",
      ],
    },

    cta: {
      title: ["Want a site", "like this?"],
      lede: "Tell us what you are building. You will see a direction on your own brand in the first week, not a moodboard.",
      action: "Start a project",
    },

    slots: {
      hero: "ORBITA HERO BG · REPLACE · 16:9 · hero.mp4 overrides if present",
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
    lede: "Three cases you can open: our two products, running rather than described, and a whole brand we invented to show what a site of ours actually looks like. Then client work, each piece chosen because it solved a different problem.",
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
        key: "north-flow",
        name: "North Flow",
        discipline: "Our own product / Automation",
        summary:
          "The line we build for clients, running live on the page: leads arrive from every channel, get qualified, routed to a manager and filed in the CRM. A demo concept you can stand and watch.",
        year: "2026",
      },
      {
        key: "orbita",
        name: "ORBITA",
        discipline: "Demo concept / Brand and landing",
        summary:
          "A fintech brand invented from nothing and built end to end — mark, art direction, motion system, copy and code — so the site work can be judged on a whole brand rather than on a screenshot.",
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
