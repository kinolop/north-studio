/**
 * The configurator's logic, kept out of the component.
 *
 * It used to produce a rouble range. It does not any more, and that is the
 * point rather than a simplification: the studio's promise is that scope
 * and price are settled in a conversation, so a page that quotes a number
 * before that conversation undercuts its own pitch. What the visitor gets
 * instead is the thing they actually came for — which of the three
 * directions their job belongs to, and roughly how long it takes.
 */

export type Direction = "sites" | "agents" | "automation";
export type TimelineKey = "fast" | "standard" | "relaxed";

export interface Answers {
  need?: Direction;
  scope?: "one" | "few" | "system";
  copy?: "yes" | "partly" | "no";
  timing?: TimelineKey;
}

export interface Recommendation {
  direction: Direction;
  timeline: TimelineKey;
}

/**
 * Timeline shifts one step slower when the job is large or when we are
 * writing the words — both are real work, and pretending otherwise is how
 * a project runs late.
 */
function resolveTimeline(answers: Answers): TimelineKey {
  const order: TimelineKey[] = ["fast", "standard", "relaxed"];
  const base = order.indexOf(answers.timing ?? "standard");

  let shift = 0;
  if (answers.scope === "system") shift += 1;
  if (answers.copy === "no") shift += 1;

  return order[Math.min(base + shift, order.length - 1)] ?? "standard";
}

export function recommend(answers: Answers): Recommendation {
  return {
    // The direction is simply what they told us they need. Inferring
    // something cleverer would only ever be a way to upsell.
    direction: answers.need ?? "sites",
    timeline: resolveTimeline(answers),
  };
}

export function isComplete(answers: Answers, questionCount: number): boolean {
  return Object.keys(answers).length === questionCount;
}
