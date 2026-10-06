/**
 * «Котельная», a bakery and coffee bar in a former boiler house in
 * Petersburg, and everything it says.
 *
 * An invented place, presented the way a real one would be: when each bread
 * comes out of the oven, what it weighs and costs, how to find the door.
 * The page is Russian only, like the bakery. Prices are plausible for
 * Petersburg in 2026 and are nobody's real menu.
 */

export const PLACE = {
  name: "Котельная",
  kind: "Пекарня и кофе",
  city: "Петербург",
  district: "Выборгская сторона",
  address: "Лесной проспект, 19, во дворе",
  findIt: "Через арку и прямо, к кирпичной трубе. Её видно с проспекта.",
  metro: "Выборгская, 6 минут пешком",
  phone: "+7 812 000-00-00",
  /** Open hours, Moscow time, every day. */
  opens: 8,
  closes: 21,
  /** The oven is lit before the doors open. */
  ovenLit: 6,
  built: 1912,
} as const;

export type BreadId = "rye" | "baguette" | "croissant" | "focaccia" | "brioche" | "cardamom";

export interface Bread {
  readonly id: BreadId;
  readonly name: string;
  readonly weight: string;
  readonly price: number;
  readonly body: string;
  /** The product photo slug in /work/kotelnaya/photos, when there is one. */
  readonly photo: string;
}

export const BREADS: readonly Bread[] = [
  {
    id: "rye",
    name: "Ржаной на закваске",
    weight: "800 г",
    price: 290,
    body: "Закваске девять лет. Тёмная корка, кислинка, хранится неделю.",
    photo: "p-rye",
  },
  {
    id: "baguette",
    name: "Багет",
    weight: "250 г",
    price: 140,
    body: "Тесто стоит ночь в холоде. Утром и вечером, к ужину.",
    photo: "p-baguette",
  },
  {
    id: "croissant",
    name: "Круассан",
    weight: "80 г",
    price: 190,
    body: "Масло 82%, двадцать семь слоёв. Лучше всего в первый час.",
    photo: "p-croissant",
  },
  {
    id: "focaccia",
    name: "Фокачча",
    weight: "300 г",
    price: 260,
    body: "Оливковое масло, крупная соль, розмарин. К обеду.",
    photo: "p-focaccia",
  },
  {
    id: "brioche",
    name: "Бриошь",
    weight: "400 г",
    price: 340,
    body: "Плетёная, на сливочном масле и яйцах. Для тостов и французских гренок.",
    photo: "p-brioche",
  },
  {
    id: "cardamom",
    name: "Булочка с кардамоном",
    weight: "90 г",
    price: 170,
    body: "Скрученная, с жемчужным сахаром. Её берут к кофе.",
    photo: "p-cardamom",
  },
];

export const breadById = (id: BreadId) => BREADS.find((b) => b.id === id)!;

export interface Bake {
  /** Minutes after midnight, Moscow time. */
  readonly at: number;
  readonly bread: BreadId;
}

const hm = (h: number, m = 0) => h * 60 + m;

/** The oven's day. Every batch, in order; the same every day of the week. */
export const BAKES: readonly Bake[] = [
  { at: hm(7), bread: "baguette" },
  { at: hm(7, 30), bread: "rye" },
  { at: hm(8), bread: "croissant" },
  { at: hm(9), bread: "cardamom" },
  { at: hm(11), bread: "focaccia" },
  { at: hm(12), bread: "brioche" },
  { at: hm(14), bread: "rye" },
  { at: hm(15, 30), bread: "croissant" },
  { at: hm(17), bread: "baguette" },
];

/** How long a batch counts as warm. */
export const WARM_MIN = 45;

export const clock = (min: number) =>
  `${String(Math.floor(min / 60) % 24).padStart(2, "0")}:${String(Math.round(min) % 60).padStart(2, "0")}`;

/** Minutes after midnight in Moscow now, or from a `?t=HH:MM` in the address for checking by hand. */
export function moscowMinutes(now = new Date()): number {
  if (typeof window !== "undefined") {
    const t = new URLSearchParams(window.location.search).get("t");
    const m = t?.match(/^(\d{1,2}):(\d{2})$/);
    if (m) return Number(m[1]) * 60 + Number(m[2]);
  }
  const utc = now.getUTCHours() * 60 + now.getUTCMinutes() + now.getUTCSeconds() / 60;
  return (utc + 180) % 1440;
}

export type BakeState = "done" | "warm" | "next" | "later";

/** Where each batch of the day stands at a given minute. */
export function bakeStates(min: number): BakeState[] {
  let nextFound = false;
  return BAKES.map((b) => {
    if (b.at <= min) return min - b.at <= WARM_MIN ? "warm" : "done";
    if (!nextFound) {
      nextFound = true;
      return "next";
    }
    return "later";
  });
}

export const minutesWord = (n: number) => {
  const a = n % 10;
  const b = n % 100;
  if (a === 1 && b !== 11) return "минуту";
  if (a >= 2 && a <= 4 && (b < 10 || b >= 20)) return "минуты";
  return "минут";
};

/** "через 23 минуты", "через 1 ч 10 мин" */
export function inWords(delta: number): string {
  const d = Math.max(1, Math.round(delta));
  if (d < 60) return `через ${d} ${minutesWord(d)}`;
  const h = Math.floor(d / 60);
  const m = d % 60;
  return m ? `через ${h} ч ${m} мин` : `через ${h} ч`;
}

/** "12 минут назад" */
export function agoWords(delta: number): string {
  const d = Math.max(1, Math.round(delta));
  return `${d} ${minutesWord(d)} назад`;
}

export interface CoffeeItem {
  readonly name: string;
  readonly note?: string;
  readonly price: number;
}

export const COFFEE: readonly CoffeeItem[] = [
  { name: "Эспрессо", price: 160 },
  { name: "Американо", price: 190 },
  { name: "Капучино", note: "250 мл", price: 240 },
  { name: "Флэт уайт", price: 260 },
  { name: "Фильтр", note: "зерно недели", price: 220 },
  { name: "Латте с кардамоном", price: 290 },
  { name: "Какао на молоке", price: 250 },
  { name: "Чай из самовара", note: "иван-чай или чёрный", price: 180 },
];

export const rub = (n: number) => `${n.toLocaleString("ru-RU").replace(/ /g, " ")} ₽`;
