import type { Copy } from "./types";

export const en = {
  localeName: "English",

  studio: {
    availability: "Two project slots open",
    startProject: "Get in touch",
    languageLabel: "Language",
  },

  sections: {
    origin: "Origin",
    studio: "Studio",
    founder: "Founder",
    services: "Services",
    agent: "Live agent",
    work: "Work",
    process: "Process",
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
  },

  hero: {
    // Split across two lines deliberately — the break carries the emphasis.
    headline: ["Sites, AI agents", "and automation."],
    lede: "One studio for three jobs: a site that brings people in, an agent that answers them, and automation that takes the routine off your desk.",
    scrollHint: "Scroll",
    founderLed: "Founder-led",
  },

  manifesto: {
    title: ["We don't ship pages.", "We ship working machinery."],
    body: [
      "A site brings people in. An agent answers them while you sleep. Automation makes sure nothing is lost between the two. Separately they are tools; together they are a system that runs without you.",
      "North Studio is founder-led. The person you brief is the person who designs it and the person who writes the code. Nothing is translated through a project manager, and nothing arrives diluted.",
      "Our pipeline is AI-assisted, which is not the same as AI-generated. The mechanical hours collapse — scaffolding, variants, the fourth pass. The hours that remain go into judgement. That is why work an agency would quote at a quarter takes us weeks.",
    ],
    principles: [
      { term: "Restraint", definition: "The luxury is in what we left out." },
      { term: "Speed", definition: "Weeks, not quarters — the pipeline is built, not improvised." },
      { term: "Ownership", definition: "You leave with the code, the accounts and the keys." },
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
    title: ["Three directions.", "One team."],
    lede: "Take one, or take all three — they are built to fit together.",
    ghost: "SERVICES",
    discuss: "Discuss",
    items: [
      {
        key: "sites",
        name: "Sites and landing pages",
        short: "Site",
        summary:
          "A page, or a whole site, that explains why you are the better choice and carries a visitor to the point of asking. Direction, copy and build in one pass.",
        includes: [
          "Art direction and the words",
          "Motion and interaction design",
          "Built, deployed, handed over",
        ],
      },
      {
        key: "agents",
        name: "AI agents · North Agent",
        short: "Agent",
        summary:
          "An assistant that answers your clients in seconds at any hour, works out what they actually need, and hands you someone already warm.",
        includes: [
          "Trained on how you actually sell",
          "Qualifies before it hands over",
          "Lives where your clients already are",
        ],
      },
      {
        key: "automation",
        name: "Automation · North Flow",
        short: "Automation",
        summary:
          "Every enquiry from every channel in one place, sorted and filed in your CRM, with the morning report waiting in Telegram. Nothing retyped, nothing lost.",
        includes: [
          "Routed the moment it lands",
          "Your tools wired to each other",
          "Reports that arrive without asking",
        ],
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
        text: "That depends on the scope, and we give you a real number once we understand the job rather than guess at it here. Two quick questions and you'll have an answer today. What's the page for?",
      },
      { from: "visitor", text: "We're launching a coffee subscription." },
      {
        from: "agent",
        text: "Good — one page, one action, nothing in the way of it. Roughly when would you want it live?",
      },
      { from: "visitor", text: "Some time next month." },
      {
        from: "agent",
        text: "That's comfortable. Leave a Telegram handle or an email and we come back today with the scope and a fixed price.",
      },
    ],
    reply:
      "Noted. In the real agent this is where I would take your details and hand you to a person. Here, the button below is faster.",
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
      hero: "HERO BG · hero-bg.png · REPLACE · 16:9 · hero.mp4 overrides if present",
      cta: "CTA BG · cta-bg.png · REPLACE · 16:9 · dark, low-key",
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
      mascot:
        "REUSES THE NORTH AGENT MASCOT · /work/north-agent/assets/mascot.png · ~1:1",
    },
  },

  orbitaCase: {
    demoTag: "Demo concept",
    getApp: "Get the app",
    nav: [
      { key: "product", label: "Product", href: "#product" },
      { key: "security", label: "Security", href: "#security" },
      { key: "start", label: "Plans", href: "#plans" },
    ],

    hero: {
      headline: ["Your money, finally", "in one orbit."],
      subtitle:
        "Every bank, card and wallet you already use, in a single view — with transfers that land while you are still looking at the screen.",
      primary: "Get the app",
      secondary: "See how it works",
    },

    trust: [
      {
        key: "security",
        label: "Bank-grade security",
        note: "Encrypted on your device, before anything leaves it",
      },
      {
        key: "instant",
        label: "Instant transfers",
        note: "Between your own accounts, in a single tap",
      },
      {
        key: "fees",
        label: "No hidden fees",
        note: "Nothing appears on your statement that you did not choose",
      },
    ],

    features: {
      eyebrow: "Product",
      title: "Everything you own, in one place.",
      items: [
        {
          key: "unify",
          eyebrow: "Accounts",
          title: "Every bank in one clean view",
          body: "Connect the accounts you already have and ORBITA keeps them in a single balance that updates while you watch. No refreshing, no exports, no spreadsheet on a Sunday.",
          points: [
            "One live balance across every account",
            "Cards, savings and the broker together",
            "Nothing to migrate, nothing to close",
          ],
        },
        {
          key: "transfer",
          eyebrow: "Transfers",
          title: "Money that arrives while you watch",
          body: "Move funds between your own accounts in a single tap. It lands before the animation has finished, and it costs nothing to do.",
          points: [
            "One tap between your own accounts",
            "Confirmed in under a second",
            "Free, every time",
          ],
        },
        {
          key: "insights",
          eyebrow: "Insights",
          title: "See exactly where it goes",
          body: "Spending explained in a sentence rather than a pie chart: what changed this month, what caused it, and what it means for the rest of the year.",
          points: [
            "Categories that match how you actually spend",
            "A plain-language summary each month",
            "No spreadsheet needed, ever",
          ],
        },
      ],
    },

    ticker: [
      "One balance",
      "Instant transfers",
      "Bank-grade security",
      "Smart insights",
      "No hidden fees",
      "180+ banks",
      "Read-only by default",
    ],

    counters: {
      note: "Illustrative figures for a concept product.",
      items: [
        {
          key: "transfers",
          value: 1.2,
          decimals: 1,
          suffix: "M+",
          label: "Transfers moved every day",
        },
        {
          key: "banks",
          value: 180,
          suffix: "+",
          label: "Banks and wallets connected",
        },
        { key: "fees", value: 0, suffix: "", label: "Hidden fees, ever" },
      ],
    },

    plans: {
      eyebrow: "Plans",
      title: "Start free. Upgrade when it earns its place.",
      note: "Every plan includes the full security model — encryption on your device, read-only connections and no advertising. The paid tiers add reach, not safety.",
      popularLabel: "Most popular",
      disclaimer: "Illustrative pricing for a concept product. Nothing here is charged.",
      items: [
        {
          key: "free",
          name: "Free",
          price: "€0",
          cadence: "forever",
          line: "Everything one person needs to see the whole picture.",
          features: [
            "Up to 3 connected accounts",
            "One live balance across all of them",
            "Instant transfers between your own accounts",
            "Monthly spending summary",
          ],
          cta: "Get started",
        },
        {
          key: "plus",
          name: "Plus",
          price: "from €4.90",
          cadence: "a month",
          line: "For anyone whose money lives in more than a few places.",
          features: [
            "Unlimited connected accounts",
            "Categories you can shape yourself",
            "Weekly insight, not just monthly",
            "Shared view for a partner",
          ],
          cta: "Choose Plus",
          popular: true,
        },
        {
          key: "premium",
          name: "Premium",
          price: "from €11.90",
          cadence: "a month",
          line: "For people with a broker, a business and an accountant.",
          features: [
            "Investments and business accounts",
            "Export to your accountant in one tap",
            "Forecast to the end of the year",
            "Priority support from a person",
          ],
          cta: "Choose Premium",
        },
      ],
    },

    appForm: {
      placeholder: "you@example.com",
      action: "Get the app",
      note: "A concept page — this field is decorative and sends nothing.",
    },

    security: {
      eyebrow: "Security",
      title: "Careful where it matters.",
      body: "Speed is the easy half. The other half is never having to wonder what we can see.",
      items: [
        {
          key: "keys",
          title: "Your keys stay yours",
          body: "Encrypted on your device before anything leaves it. What we store, we cannot read.",
        },
        {
          key: "readonly",
          title: "Read-only by default",
          body: "ORBITA connects to your banks with permission to look, never to spend. You grant more only when you ask it to move something.",
        },
        {
          key: "ads",
          title: "You are not the product",
          body: "No adverts, no offers, nothing sold on about where your money goes.",
        },
      ],
    },

    lifestyle: {
      line: "Money should take five minutes a week.",
      note: "Not an evening with a spreadsheet and four banking apps open.",
    },

    steps: {
      eyebrow: "Getting started",
      title: "In orbit in three steps.",
      items: [
        {
          key: "download",
          title: "Download",
          body: "ORBITA is on the App Store and Google Play. It opens in seconds.",
        },
        {
          key: "connect",
          title: "Connect your accounts",
          body: "Link the banks and cards you already use — read-only, and it takes about a minute.",
        },
        {
          key: "ready",
          title: "You are in orbit",
          body: "Everything in one place, updating on its own, from that moment on.",
        },
      ],
    },

    close: {
      title: ["Your money,", "finally in one orbit."],
      body: "Join the people who stopped keeping four apps open just to know where they stand.",
      action: "Get the app",
    },

    footer: {
      tagline: "One account for everything you already have.",
      columns: [
        {
          key: "product",
          title: "Product",
          links: ["Accounts", "Transfers", "Insights", "Security"],
        },
        {
          key: "company",
          title: "Company",
          links: ["About", "Careers", "Press", "Contact"],
        },
        { key: "legal", title: "Legal", links: ["Privacy", "Terms", "Cookies"] },
      ],
      legal:
        "ORBITA is an invented product. Every figure and screen on this page is illustrative.",
      credit: "A demo concept by North Studio",
    },

    slots: {
      hero: "hero-visual.png · hero product visual · 16:9",
      heroVideo: "hero.mp4 · hero motion · poster is hero-visual.png",
      bgHero: "bg-hero.png · hero background",
      bgBand: "bg-band.png · section band background",
      bgCta: "bg-cta.png · closing background",
      appHero: "app-hero.png · balance and accounts screen",
      appTransfer: "app-transfer.png · transfer confirmation screen",
      appInsights: "app-insights.png · spending insights screen",
      security: "feature-security.png · security visual · 16:9",
      lifestyle: "lifestyle.png · lifestyle photograph · 16:9",
    },
  },

  work: {
    title: ["Open one", "and try it."],
    lede: "Four cases you can actually use: our agent, our automation, and two whole brands we invented and built end to end.",
    caseCta: "Open the case",
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
        key: "noctura",
        name: "NOCTURA",
        discipline: "Demo concept / Hotel brand and site",
        summary:
          "A five-star hotel that does not exist, presented the way it would present itself — its own dark-and-gold identity, full-bleed film, and a lift that carries you between the room floors. A Russian-language concept, built whole.",
        year: "2026",
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
        name: "Getting to know it",
        body: "You write on whatever channel suits you and say what you need. We answer the same day with what we would build and how long it takes.",
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

  questions: {
    title: ["Before you", "ask."],
    items: [
      {
        key: "speed",
        q: "How fast is fast?",
        a: "A landing page runs about two weeks, a full site four to five. An agent or an automation is usually quicker than either. The clock starts when the content exists — and since waiting on content is the single biggest cause of delay, we write it for you unless you'd rather not.",
      },
      {
        key: "ai",
        q: "What does “AI-assisted” actually mean?",
        a: "The mechanical hours compress: scaffolding, layout variants, refactors, boilerplate. It does not mean a model generates your product. Every design decision, every line of copy and every interaction was chosen by a person. The pipeline buys time; the time goes into craft.",
      },
      {
        key: "ownership",
        q: "Do I own it?",
        a: "Completely. Source code, design files, domain, hosting, analytics, and the agent's scenarios. No licence, no lock-in, no monthly fee to keep your own work online. If you want a different studio to take it over next year, they can.",
      },
      {
        key: "price",
        q: "Why does this cost more than a freelancer?",
        a: "Because you're not buying pages. You're buying the judgement that decides what goes on them, and a build that still looks current in three years. If price is the deciding factor, a template will serve you better — and we'll say so.",
      },
      {
        key: "revisions",
        q: "How many revisions do I get?",
        a: "Two structured rounds per phase, which is enough because you approve direction before anything gets built. We've never reached the limit. It exists to keep scope finite, not to bill you.",
      },
      {
        key: "input",
        q: "What do you need from me?",
        a: "Half an hour of your attention, your logo and any photography you own, and one person who can say yes. That is the entire list.",
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
      "Sites, agents, automation",
      "Two slots open",
    ],
  },

  cta: {
    title: ["Tell us what", "you need."],
    lede: "Call or write — Telegram, WhatsApp or email. We answer the same day, with what we would build and how long it takes.",
    action: "Call or write",
    channel: "Our channel",
    directLabel: "Or reach us directly",
  },

  channels: {
    overlayTitle: "How do you want to talk?",
    overlayLede: "Pick a channel. Every one of them reaches us directly.",
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
    privacy: "Privacy policy",
  },
} as const satisfies Copy;
