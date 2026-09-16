import type { Copy } from "./types";

export const en = {
  localeName: "English",

  studio: {
    availability: "Taking on projects",
    startProject: "Discuss your task",
    languageLabel: "Language",
  },

  sections: {
    origin: "Origin",
    pains: "Sound familiar?",
    services: "Services",
    work: "Work",
    play: "Play",
    about: "About",
    process: "Process",
    questions: "Questions",
    start: "Contact",
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
    runningHead: ["North Studio", "Daniil Skrylev", "Websites, AI agents, automation"],
    headline:
      "Websites, AI agents and automation that bring clients in and keep them from slipping away.",
    proofs: [
      {
        key: "sites",
        tab: "Website",
        before: "You have a website, ",
        struck: "but no leads",
        fix: "and it brings leads",
        after: ".",
        note: "I rebuild the site so a visitor understands in a minute why you, and leaves a request.",
      },
      {
        key: "agents",
        tab: "AI agent",
        before: "A client wrote at 23:40 ",
        struck: "and heard back at noon",
        fix: "and got an answer at once",
        after: ".",
        note: "An AI agent answers clients day and night, finds out what they need and hands you the ones ready to buy.",
      },
      {
        key: "automation",
        tab: "Automation",
        before: "Leads ",
        struck: "get lost in chats",
        fix: "land in your CRM",
        after: ".",
        note: "I gather leads from every channel into one place. Each has an owner, and nobody forgets to call back.",
      },
    ],
    lede: "I'm Daniil. I find where a business loses clients and fix it with a website, an AI agent or automation.",
    secondary: "What I do",
    hint: "Cross the problem out",
  },

  marquee: {
    items: [
      "Websites that bring leads",
      "AI agents that answer at night",
      "No lost enquiries",
      "Code and accounts stay yours",
      "Same-day replies",
    ],
  },

  pains: {
    title: "Sound familiar?",
    lede: "Most people come to me with one of these. Each one quietly eats the leads you have already paid for.",
    items: [
      {
        key: "old",
        pain: "The site is years old and you'd rather not send the link.",
        mark: "rather not send the link",
        cost: "Someone opens it, sees it's outdated and goes to a competitor. You never find out.",
      },
      {
        key: "ads",
        pain: "The ads are running, but enquiries barely come in.",
        mark: "barely come in",
        cost: "People arrive but can't tell why you're better or what to do next. Budget goes out, the phone stays quiet.",
      },
      {
        key: "slow",
        pain: "Clients write in the evening and at weekends, and nobody answers.",
        mark: "nobody answers",
        cost: "By the time you reply, they have already agreed with whoever answered first.",
      },
      {
        key: "lost",
        pain: "Leads are scattered across WhatsApp, Telegram, email and calls.",
        mark: "scattered",
        cost: "Someone was never called back, someone was noted on a scrap of paper. Every lost lead is ad money gone.",
      },
    ],
    closing: "All of this can be fixed. Here's how I do it.",
  },

  about: {
    title: ["One person", "from idea to launch"],
    statement:
      "My name is Daniil. I work through your task myself, write the copy, design and write the code. There are no managers or contractors between you and the result, so nothing gets lost on the way and you never explain the same thing to three different people.",
    signature: "Daniil",
    principles: [
      {
        key: "direct",
        term: "Direct",
        definition: "You talk to the person doing the work. Nothing retold through a manager.",
      },
      {
        key: "yours",
        term: "It's yours",
        definition: "Code, domain and accounts stay with you. No monthly fee.",
      },
      {
        key: "honest",
        term: "Price upfront",
        definition: "You get the price and timeline before work starts, and they don't grow along the way.",
      },
    ],
  },

  services: {
    title: ["What I", "do"],
    lede: "Three directions. Start with one, but together they cover the client's whole path: from the first visit to the deal.",
    discuss: "Discuss your task",
    labels: {
      problem: "What people come with",
      what: "What I do",
      result: "What you get",
      term: "Timeline",
    },
    items: [
      {
        key: "sites",
        name: "Websites and landing pages",
        short: "Websites",
        summary: "A site that explains why to choose you and carries a visitor to the enquiry.",
        problem:
          "You have a site, but it doesn't sell: it's outdated, it's unclear what you do, or it's a business card nobody writes from.",
        what: [
          "I learn who your clients are and what stops them",
          "I write the copy and plan the structure",
          "I design and build the site",
          "I connect enquiries and analytics, hand over access",
        ],
        result: "A site you're happy to share, with a clear path from the first screen to the enquiry.",
        term: "A landing page in about two weeks, a full site in four to five.",
      },
      {
        key: "agents",
        name: "AI agents",
        short: "Agents",
        summary: "An assistant that answers your clients in seconds at any hour.",
        problem:
          "Clients wait hours for a reply, a manager spends the day on the same questions, and evening enquiries sit until morning.",
        what: [
          "I gather common questions, prices and terms",
          "I set the agent up to speak your language",
          "I connect it to your site, Telegram or WhatsApp",
          "It hands you clients who are ready to talk",
        ],
        result: "No client waits for an answer. The people who reach you already know what they want.",
        term: "Usually quicker than a website.",
      },
      {
        key: "automation",
        name: "Automation",
        short: "Automation",
        summary: "Every enquiry from every channel in one place, with no copying by hand and nothing lost.",
        problem:
          "Enquiries arrive in five places at once, get retyped by hand, and reports are pieced together in the evening.",
        what: [
          "I map how an enquiry moves through your team now",
          "I connect your site, messengers, email and CRM",
          "I set who each enquiry goes to",
          "I build a report that arrives in Telegram on its own",
        ],
        result: "Every enquiry is in place and has an owner. The report arrives without reminders.",
        term: "Live within a few days.",
      },
    ],
    diagram: {
      label: "Diagram: where enquiries come from and where they end up",
      inputs: ["Website", "Ads", "Telegram", "WhatsApp", "Calls"],
      core: "North",
      outputs: ["Reply to client", "CRM record", "Manager", "Morning report"],
    },
  },

  play: {
    title: ["While you think,", "play a round."],
    lede: "Pong against North. Your paddle is on the left, first to five wins.",
    start: "Start game",
    again: "Play again",
    you: "You",
    north: "North",
    win: "You won. Since you're here, write to me.",
    lose: "North won. Rematch?",
    controls: "Mouse, finger or arrow keys",
    canvasLabel: "Pong table",
  },

  agentCase: {
    demoTag: "Demo concept",
    backToWork: "All work",
    productName: "North Agent",
    brandNote:
      "The agent is shown working for LEKTA, an invented online school, so you can see it on a concrete example. Replies in the demo are scripted.",

    hero: {
      title: ["Answers your clients", "while you're busy"],
      lede: "An AI assistant for your site and messengers. It replies in seconds at any hour, works out what a person needs and hands you the ones ready to buy.",
      cta: "I want this agent",
      secondary: "Talk to it",
    },

    chat: {
      title: ["Talk to it", "yourself"],
      lede: "Here the agent works as an online school's assistant. Ask a question and watch the client card for the manager fill in beside the chat.",
      demoLabel: "Scripted demo",
      visitorRole: "You",
      agentRole: "LEKTA assistant",
      greeting:
        "Hello! I'm the assistant at LEKTA online school. I can help with dates, price, format and instalments. What would you like to know?",
      suggestionsLabel: "Try asking",
      suggestions: [
        "When does the next cohort start?",
        "Can I pay in instalments?",
        "How long is the course?",
        "Is there a trial lesson?",
        "Get me a person",
      ],
      placeholder: "Type your question",
      send: "Send",
      restart: "Start again",
      lead: {
        title: "Client card",
        subtitle: "How your manager sees the conversation",
        empty: "Ask a question and the card starts filling in",
        asked: "Asked about",
        readiness: "Readiness",
        next: "Next step",
        levels: { cold: "browsing", warm: "interested", hot: "ready to enrol" },
        actions: {
          cold: "send the programme",
          warm: "offer a trial lesson",
          hot: "call today",
        },
        intents: {
          start: "start date",
          price: "price",
          instalments: "instalments",
          duration: "duration",
          format: "format",
          certificate: "certificate",
          job: "jobs",
          trial: "trial lesson",
          human: "wants a person",
          other: "something else",
        },
      },
    },

    capabilities: {
      title: ["What it does", "for you"],
      items: [
        {
          key: "answers",
          name: "Replies at once, at any hour",
          body: "At night, at weekends and at peak hour the answer comes in seconds. Clients don't drift to whoever replied first.",
        },
        {
          key: "knows",
          name: "Knows your terms",
          body: "Works from your prices, terms and common questions, and answers in your voice rather than like a faceless bot.",
        },
        {
          key: "enroll",
          name: "Carries them to booking",
          body: "Finds out what they need, settles the usual doubts and hands you a client ready to buy. Hard questions go to a person.",
        },
      ],
    },

    night: {
      title: ["One enquiry", "at 23:40"],
      lede: "What happens to a client who writes late in the evening. Flip the switch and compare.",
      without: "Without the agent",
      with: "With the agent",
      withoutMoments: [
        { time: "23:40", text: "The client writes: “Any places left on the course?”" },
        { time: "23:41", text: "Silence. The working day ended hours ago." },
        { time: "09:30", text: "A manager replies in the morning." },
        { time: "09:31", text: "“Thanks, I've already signed up elsewhere.”" },
      ],
      withMoments: [
        { time: "23:40", text: "The client writes: “Any places left on the course?”" },
        { time: "23:40", text: "The agent replies: yes, it starts on the 3rd." },
        { time: "23:43", text: "It finds a format that suits them and explains instalments." },
        { time: "09:00", text: "The manager opens the CRM: the client's card and the whole conversation are there." },
      ],
      withoutVerdict: "Client lost",
      withVerdict: "Client waiting for a call",
    },

    deploy: {
      title: ["How it gets", "to you"],
      items: [
        {
          key: "widget",
          name: "One line of code",
          body: "A widget on your site, or right inside Telegram and WhatsApp where your clients already write.",
        },
        {
          key: "trained",
          name: "Trained on your answers",
          body: "Prices, terms, rules and the answers you already repeat every day.",
        },
        {
          key: "handoff",
          name: "Hands over to a person",
          body: "The client goes to your CRM and Telegram with the whole conversation attached.",
        },
        {
          key: "analytics",
          name: "Shows what people ask",
          body: "You see which questions come up most and where clients hesitate.",
        },
      ],
    },

    cta: {
      title: ["Want this agent", "working for you?"],
      lede: "Tell me what clients ask most often. I'll show you how the agent would answer your own clients.",
      action: "Discuss your task",
    },
  },

  flowCase: {
    demoTag: "Demo concept",
    backToWork: "All work",
    productName: "North Flow",
    brandNote:
      "The line is shown on an invented furniture store. The enquiries are made up; the mechanics are the ones you would get.",

    channels: {
      telegram: "Telegram",
      whatsapp: "WhatsApp",
      site: "Website",
      avito: "Marketplace",
      call: "Call",
      email: "Email",
    },
    stations: ["Intake", "AI tagging", "Manager", "CRM"],
    managers: ["Anna", "Igor", "Mira"],
    nurture: "Nurture",
    tones: { warm: "warm", cold: "nurture" },
    priorities: { high: "urgent", normal: "normal", low: "not urgent" },

    hero: {
      title: ["Enquiries that", "sort themselves"],
      lede: "North Flow gathers enquiries from every channel, tags them and hands them out to managers in your CRM. Nobody retypes anything, and no enquiry gets lost.",
      cta: "I want this line",
      chaosNote: "enquiries without a system",
      orderNote: "and after the line",
      filedLabel: "in CRM",
      leads: [
        { key: "h1", channel: "telegram", tone: "warm", text: "Do you have this sofa in grey? Need it by Friday" },
        { key: "h2", channel: "site", tone: "warm", text: "Order me 2 armchairs, paying now" },
        { key: "h3", channel: "avito", tone: "cold", text: "Any discount?" },
        { key: "h4", channel: "call", tone: "warm", text: "Missed call at 21:14" },
        { key: "h5", channel: "whatsapp", tone: "warm", text: "How much is delivery out of town?" },
        { key: "h6", channel: "email", tone: "warm", text: "Invoice for a company, 5 dressers" },
        { key: "h7", channel: "telegram", tone: "cold", text: "Just browsing, send the catalogue" },
        { key: "h8", channel: "whatsapp", tone: "warm", text: "The chair arrived chipped, what now?" },
        { key: "h9", channel: "avito", tone: "cold", text: "Still available?" },
        { key: "h10", channel: "site", tone: "warm", text: "20 tables wholesale for a cafe" },
      ],
    },

    lab: {
      title: ["Send an enquiry", "down the line"],
      lede: "Pick where the enquiry came from and write what your client would ask. The line sorts it in front of you.",
      channelLabel: "Came from",
      messageLabel: "What the client writes",
      placeholder: "For example: need a sofa by Friday, how much is delivery?",
      presetsLabel: "Or take one of these",
      presets: [
        "Need a sofa by Friday, urgent",
        "How much is delivery?",
        "Just looking around",
        "Call me back, I want to order",
      ],
      send: "Send down the line",
      queued: "queued",
      yours: "yours",
      autoNote: "While you think, the line sorts enquiries on its own",
      boardTitle: "CRM",
      journalTitle: "Line log",
      journalEmpty: "The line is waiting for enquiries",
      log: {
        received: "enquiry from {channel}",
        qualified: "AI: {tone}, {priority}",
        routed: "assigned to {route}",
        filed: "record created in CRM",
      },
      samples: [
        { key: "s1", channel: "whatsapp", text: "Can I see the armchair in the showroom today?" },
        { key: "s2", channel: "site", text: "I want to order a kitchen table, how long?" },
        { key: "s3", channel: "avito", text: "Is the price negotiable?" },
        { key: "s4", channel: "telegram", text: "What are the wardrobe dimensions?" },
        { key: "s5", channel: "call", text: "Missed call at 22:05" },
        { key: "s6", channel: "email", text: "Send the invoice, we'll pay tomorrow" },
        { key: "s7", channel: "telegram", text: "I'll look later, thanks" },
        { key: "s8", channel: "whatsapp", text: "Need 3 chairs before the weekend" },
      ],
    },

    report: {
      title: ["In the morning this", "lands in your Telegram"],
      lede: "The report is built from the enquiries that went down the line on this page: the ten above, and every one you sent.",
      heading: "North Flow, overnight report",
      time: "09:00",
      processed: "Enquiries sorted",
      warm: "Warm",
      cold: "To nurture",
      yours: "Sent by you",
      lost: "Lost",
      byManager: "By manager",
      reset: "Clear the line",
    },

    inside: {
      title: ["What the line", "takes off your hands"],
      items: [
        {
          key: "collect",
          name: "Every channel, one queue",
          body: "Website, Telegram, WhatsApp, marketplaces, email and missed calls land in one place, in one format.",
        },
        {
          key: "qualify",
          name: "AI tagging",
          body: "The line understands what the client needs and how urgent it is, and tags the enquiry in a second.",
        },
        {
          key: "route",
          name: "To the right manager",
          body: "The enquiry goes straight to whoever owns it. Nobody decides by hand who should take it.",
        },
        {
          key: "crm",
          name: "A CRM record",
          body: "With the whole conversation, the source and the tag. Nothing to copy out of messengers.",
        },
        {
          key: "reply",
          name: "A first reply to the client",
          body: "The client hears back at once, even at night, and doesn't go to whoever replied first.",
        },
        {
          key: "report",
          name: "A morning report",
          body: "How many enquiries came in, from where, and who is carrying what. No spreadsheets, no reminders.",
        },
      ],
    },

    deploy: {
      title: ["How it gets", "to you"],
      items: [
        {
          key: "map",
          name: "I map your process",
          body: "Where enquiries come from and where they get lost today.",
        },
        {
          key: "connect",
          name: "I connect your tools",
          body: "Your CRM, messengers and spreadsheets. No moving anywhere.",
        },
        {
          key: "launch",
          name: "Live within a few days",
          body: "The line runs on your real channels, and for the first week I watch it with you.",
        },
        {
          key: "yours",
          name: "It all stays yours",
          body: "Scenarios, access and instructions. No monthly fee to keep the line running.",
        },
      ],
    },

    cta: {
      title: ["Want this line", "working for you?"],
      lede: "Tell me where enquiries come from and where they get lost. I'll show you the line running on your channels.",
      action: "Discuss your task",
    },
  },

  work: {
    title: ["Work"],
    lede: "Sites for clients, a brand invented from scratch, and my own products. Every one can be opened and tried.",
    hint: "Drag the ribbon",
    caseCta: "Open",
    projects: [
      {
        key: "domstroy",
        name: "Domstroy",
        discipline: "Website for a home builder",
        summary:
          "Turnkey houses outside Moscow. A cost calculator, a map of finished builds and an open estimate.",
        year: "2026",
      },
      {
        key: "dental-clinic",
        name: "Dental Clinic",
        discipline: "Website for a dental clinic",
        summary:
          "Treatments, doctors, prices, a before-and-after slider and booking from anywhere on the page.",
        year: "2026",
      },
      {
        key: "noctura",
        name: "Noctura",
        discipline: "Hotel brand and site, concept",
        summary:
          "A hotel that does not exist: its own identity, full-screen film and a lift between floors.",
        year: "2026",
      },
      {
        key: "north-agent",
        name: "North Agent",
        discipline: "AI agent, my product",
        summary:
          "An assistant that answers clients, finds out what they need and carries them to booking. You can talk to it.",
        year: "2026",
      },
      {
        key: "north-flow",
        name: "North Flow",
        discipline: "Automation, my product",
        summary:
          "Enquiries from every channel land on one line, get tagged and filed into the CRM.",
        year: "2026",
      },
    ],
  },

  process: {
    title: ["How I", "work"],
    lede: "You know the price and timeline before I start.",
    ofLabel: "of",
    leavesYouWith: "You get",
    steps: [
      {
        key: "orientation",
        name: "Intro",
        body: "You write on whatever messenger suits you and describe the task. The same day I reply with what I'd do, what it costs and how long it takes.",
        artifact: "Plan, price and timeline",
      },
      {
        key: "direction",
        name: "Direction",
        body: "I get to know your business and clients. In week one you see the structure, copy and design on a live screen, not in a slide deck.",
        artifact: "Approved direction",
      },
      {
        key: "build",
        name: "Build",
        body: "I do design and code myself, with no hand-offs. A link to the working version exists from day one, so you see every step.",
        artifact: "Working version, updated daily",
      },
      {
        key: "launch",
        name: "Launch",
        body: "I launch, check that enquiries arrive and hand over every account. For two weeks after launch I stay in touch and fix anything needed.",
        artifact: "Code, domain, accounts and support",
      },
    ],
  },

  questions: {
    title: ["Questions"],
    items: [
      {
        key: "speed",
        q: "How long does it take?",
        a: "A landing page takes about two weeks, a full site four to five. An agent or automation is usually quicker. I give an exact timeline after our first conversation.",
      },
      {
        key: "price",
        q: "How much does it cost?",
        a: "It depends on the task. After a short conversation I name the price, and it doesn't change during the work.",
      },
      {
        key: "alone",
        q: "You work alone. Isn't that a risk?",
        a: "You deal directly with the person doing the work, so nothing gets lost between people. Code and accounts are yours from day one.",
      },
      {
        key: "agent",
        q: "Won't the AI agent tell clients something wrong?",
        a: "The agent answers only from what you give it: prices, terms, common questions. If a question is complicated, it hands the client to you.",
      },
      {
        key: "ownership",
        q: "Will the site be mine?",
        a: "Yes. Code, domain, hosting and accounts stay with you. No monthly payments to keep the site running.",
      },
      {
        key: "revisions",
        q: "What if I don't like something?",
        a: "Every stage has two rounds of changes. You approve the direction before the build, so nothing has to be redone from scratch.",
      },
      {
        key: "input",
        q: "What do you need from me?",
        a: "Half an hour to talk, your logo and any photos you have. I can write the copy myself.",
      },
    ],
  },

  cta: {
    title: ["Tell me where", "you lose", "clients"],
    lede: "Write on whatever messenger suits you. I'll reply the same day and tell you what to fix first.",
    action: "Discuss your task",
    channel: "My channel",
    directLabel: "Or write directly",
  },

  channels: {
    overlayTitle: "Where suits you?",
    overlayLede: "Every channel reaches me directly.",
    close: "Close",
    back: "All channels",
    labels: {
      telegram: "Telegram",
      whatsapp: "WhatsApp",
      email: "Email",
    },
    notes: {
      telegram: "Fastest. I usually reply within the hour.",
      whatsapp: "If Telegram isn't your thing.",
      email: "For briefs, documents and long letters.",
    },
  },

  intro: {
    label: "Loading",
    skip: "Skip",
  },

  footer: {
    top: "Back to top",
    index: "Index",
    elsewhere: "Contact",
    colophon: "Daniil Skrylev. Websites, AI agents and automation for business.",
    place: "Moscow, working remotely",
    privacy: "Privacy policy",
  },
} as const satisfies Copy;
