import type { Locale } from "./i18n";

/**
 * ============================================================================
 *  THE SEAM
 * ============================================================================
 *
 * `getAgentReply` is the only thing standing between this demo and a live
 * agent. Everything above it — the chat window, the typing indicator, the
 * timing, the transcript — talks to this one async function and knows
 * nothing about where the answer comes from.
 *
 * To make it real, replace the body of `getAgentReply` with a fetch and
 * change nothing else in the codebase:
 *
 *   export async function getAgentReply(message, locale) {
 *     const res = await fetch("/api/agent", {
 *       method: "POST",
 *       headers: { "Content-Type": "application/json" },
 *       body: JSON.stringify({ message, locale }),
 *     });
 *     const { reply } = await res.json();
 *     return reply;
 *   }
 *
 * …with a route handler at `app/api/agent/route.ts` holding the API key
 * server-side (the same shape as `app/api/contact/route.ts` already uses —
 * the key must never reach the browser). Any Anthropic- or
 * OpenAI-compatible endpoint fits; the function returns a string either way.
 *
 * Because it is already async, the UI's typing indicator and error handling
 * work unchanged against real latency.
 *
 * ----------------------------------------------------------------------------
 * Until then: keyword matching over the questions this fictional school
 * would actually be asked. Deliberately small. It is honest about being a
 * script — the panel says so — and it degrades to an offer of a human
 * rather than bluffing at anything it was not written for.
 */

type Intent =
  | "start"
  | "price"
  | "instalments"
  | "duration"
  | "format"
  | "certificate"
  | "job"
  | "trial"
  | "human";

/** Both locales, because the demo is shown in both. */
const PATTERNS: Record<Intent, RegExp> = {
  start: /start|begin|when|дат|старт|начин|когда|поток/i,
  price: /price|cost|how much|скольк|цена|стоим/i,
  instalments: /instal|payment plan|split|рассроч|части|оплат/i,
  duration: /how long|duration|months|weeks|длит|сколько длит|продолж|недел|месяц/i,
  format: /online|offline|record|live|format|формат|запис|онлайн|очно/i,
  certificate: /certificate|diploma|serti|сертиф|диплом/i,
  job: /job|work|hire|employ|работ|трудоустр|вакан/i,
  trial: /trial|free|demo lesson|пробн|бесплат|демо-урок/i,
  human: /human|person|manager|call me|человек|менеджер|позвон/i,
};

const REPLIES: Record<Locale, Record<Intent, string>> = {
  en: {
    start: "The next cohort starts on the 3rd, with morning and evening groups running in parallel. Which would suit your week better?",
    price: "I would rather not guess at that in a chat window — the team fixes it with you on a short call, and it does not move afterwards. Shall I have someone reach out today?",
    instalments: "Yes — six months, no interest added. It can be set up at the same time as the enrolment, so nothing needs doing twice.",
    duration: "Four months, with two live sessions a week and everything recorded. Most people watch the recordings and keep one session live.",
    format: "Fully online. Sessions are live so you can ask questions, and every one of them is recorded if you miss it.",
    certificate: "Yes, on completion — and more usefully, three finished projects you can actually show someone.",
    job: "There is help with the portfolio and with interviews. Nobody promises a job, and you should be suspicious of anyone who does.",
    trial: "There is a free first session. I can hold you a place in it now if you would like.",
    human: "Of course — leave me a Telegram handle or an email and a person will come back to you today.",
  },
  ru: {
    start: "Ближайший поток стартует 3 числа, утренняя и вечерняя группы идут параллельно. Какая удобнее по вашей неделе?",
    price: "Не хочу угадывать это в чате: команда фиксирует цену с вами на коротком созвоне, и дальше она не меняется. Попросить связаться с вами сегодня?",
    instalments: "Да, на 6 месяцев без переплаты. Оформляется вместе с записью, так что дважды ничего делать не придётся.",
    duration: "Четыре месяца, две живые встречи в неделю, всё записывается. Обычно одну встречу смотрят в записи, а на второй разбирают вопросы.",
    format: "Полностью онлайн. Встречи живые, чтобы можно было задавать вопросы, и каждая остаётся в записи.",
    certificate: "Да, по окончании. И, что полезнее, три готовых проекта, которые не стыдно показать.",
    job: "Помогаем с портфолио и подготовкой к собеседованиям. Трудоустройство никто не обещает, и к тем, кто обещает, стоит присмотреться внимательнее.",
    trial: "Первое занятие бесплатное. Могу забронировать вам место прямо сейчас.",
    human: "Конечно. Оставьте Telegram или почту - человек вернётся к вам сегодня.",
  },
};

/** Shown when nothing matched: hand over rather than improvise. */
const FALLBACK: Record<Locale, string> = {
  en: "That one is worth a person rather than a script. Leave me a Telegram handle or an email and someone will come back to you today — and in the live version, this is where I would have booked the call myself.",
  ru: "Здесь лучше ответит человек, а не сценарий. Оставьте Telegram или почту - вам ответят сегодня. В живой версии я бы уже сам записал вас на созвон.",
};

/** Mimics thinking time so the demo does not feel instant and fake. */
const LATENCY_MS = 700;

export async function getAgentReply(
  message: string,
  locale: Locale,
): Promise<string> {
  const table = REPLIES[locale];

  const intent = (Object.keys(PATTERNS) as Intent[]).find((key) =>
    PATTERNS[key].test(message),
  );

  const reply = intent ? table[intent] : FALLBACK[locale];

  await new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
  return reply;
}
