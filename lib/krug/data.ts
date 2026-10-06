/**
 * «Круг», a pottery studio in Moscow, and everything it says.
 *
 * An invented studio, presented the way a real one would be: what a first
 * evening costs and includes, how long the cup takes to come back, which
 * glazes are on the shelf. The page is Russian only, like the studio.
 * Every figure is plausible for a Moscow studio in 2026 and none of it is
 * anyone's real price list.
 */

import type { Profile } from "./profile";

export const STUDIO = {
  name: "Круг",
  kind: "Гончарная мастерская",
  city: "Москва",
  address: "Бауманская, 11, строение 4",
  entrance: "Вход со двора, с торца, зелёная дверь",
  metro: "Бауманская, 7 минут пешком",
  phone: "+7 495 000-00-00",
  /** Opening hours in Moscow time, by weekday, 0 = Sunday. Monday is the kiln's. */
  hours: [
    [11, 21],
    null,
    [12, 22],
    [12, 22],
    [12, 22],
    [12, 22],
    [11, 21],
  ] as const satisfies readonly (readonly [number, number] | null)[],
  wheels: 6,
} as const;

export type StageId = "throw" | "dry" | "bisque" | "glaze" | "fire";

export interface Stage {
  readonly id: StageId;
  readonly name: string;
  /** How long this step takes, said the way the studio says it. */
  readonly takes: string;
  /** The single number that defines the step, when there is one. */
  readonly figure?: string;
  readonly body: string;
}

/** What happens to a cup between the wheel and the reader's kitchen. In order, because it is an order. */
export const STAGES: readonly Stage[] = [
  {
    id: "throw",
    name: "Формовка",
    takes: "два часа, вы и мастер",
    body: "Центруете глину, раскрываете её и вытягиваете стенку. За вечер обычно получается две-три формы. Лучшую оставляем, остальные возвращаются в глину.",
  },
  {
    id: "dry",
    name: "Сушка и обточка",
    takes: "пять–семь дней на полке",
    body: "Чашка сохнет под плёнкой до твёрдости кожи. Мастер переворачивает её, срезает лишнее и вытачивает ножку. Дальше она сохнет до белого.",
  },
  {
    id: "bisque",
    name: "Утильный обжиг",
    takes: "сутки в печи",
    figure: "900 °C",
    body: "Первый обжиг. Глина перестаёт быть глиной: её больше нельзя размочить, но она ещё пористая и хорошо держит глазурь.",
  },
  {
    id: "glaze",
    name: "Глазурь",
    takes: "выбираете на занятии",
    body: "Пять глазурей на полке. Сырая глазурь выглядит как мел, свой цвет она показывает только в печи.",
  },
  {
    id: "fire",
    name: "Глазурный обжиг",
    takes: "ещё сутки, и чашка ваша",
    figure: "1240 °C",
    body: "Глазурь плавится и становится стеклом. Чашка готова через две-три недели после занятия. Её можно мыть в посудомойке и ставить в микроволновку.",
  },
];

export type GlazeId = "celadon" | "shino" | "tenmoku" | "ash" | "cobalt";

export interface Glaze {
  readonly id: GlazeId;
  readonly name: string;
  readonly note: string;
  /** Where the glaze runs thick: in the throwing rings and at the foot. */
  readonly pool: string;
  /** The body of the colour. */
  readonly base: string;
  /** Where it breaks thin: over the rim and on the ridges. */
  readonly thin: string;
  /** 0 matte to 1 glass. */
  readonly gloss: number;
}

export const GLAZES: readonly Glaze[] = [
  {
    id: "celadon",
    name: "Селадон",
    note: "серо-зелёное стекло, темнеет в бороздках",
    pool: "#5a7064",
    base: "#86998a",
    thin: "#b4beb0",
    gloss: 0.95,
  },
  {
    id: "shino",
    name: "Шино",
    note: "густая белая, рыжеет там, где тонкая",
    pool: "#e6dfd2",
    base: "#ddd3c2",
    thin: "#b9774a",
    gloss: 0.45,
  },
  {
    id: "tenmoku",
    name: "Тэммоку",
    note: "чёрная железная, на кромке ржавая",
    pool: "#1c1411",
    base: "#2b1e17",
    thin: "#7c4524",
    gloss: 1,
  },
  {
    id: "ash",
    name: "Зольная",
    note: "из древесной золы, течёт и зеленеет в каплях",
    pool: "#5d5f3b",
    base: "#9c9672",
    thin: "#c4b996",
    gloss: 0.7,
  },
  {
    id: "cobalt",
    name: "Кобальт",
    note: "глубокая синяя, на рельефе светлее",
    pool: "#17254d",
    base: "#2a3d70",
    thin: "#6378a6",
    gloss: 0.9,
  },
];

export const glazeById = (id: GlazeId) => GLAZES.find((g) => g.id === id) ?? GLAZES[0]!;

export type ClassId = "first" | "pair" | "course" | "hand";

export interface ClassFormat {
  readonly id: ClassId;
  readonly name: string;
  readonly length: string;
  readonly group: string;
  readonly price: number;
  readonly priceNote?: string;
  readonly body: string;
  /** Minutes, for the schedule. */
  readonly minutes: number;
  readonly seats: number;
}

export const CLASSES: readonly ClassFormat[] = [
  {
    id: "first",
    name: "Первое занятие на круге",
    length: "2 часа",
    group: "до 6 человек",
    price: 3500,
    body: "Для тех, кто ни разу не садился за круг. Глина, фартук, глазурь и два обжига включены. Одну чашку забираете через две-три недели.",
    minutes: 120,
    seats: 6,
  },
  {
    id: "pair",
    name: "Круг на двоих",
    length: "2,5 часа",
    group: "два круга рядом",
    price: 7000,
    priceNote: "за двоих",
    body: "Мастер на вас двоих, чай или вино, по чашке каждому. Чаще всего это подарок или свидание.",
    minutes: 150,
    seats: 1,
  },
  {
    id: "course",
    name: "Курс «Восемь вечеров»",
    length: "8 занятий по 3 часа",
    group: "группа до 6 человек",
    price: 28000,
    priceNote: "за курс",
    body: "От центровки до чайника с носиком и крышкой. Потом можно приходить на свободный круг по абонементу.",
    minutes: 180,
    seats: 6,
  },
  {
    id: "hand",
    name: "Лепка руками",
    length: "2 часа",
    group: "до 8 человек, дети с 8 лет",
    price: 3000,
    body: "Без круга: жгуты, пласты и щипок. Тарелки, подставки, первые неровные вазы. Спокойнее, чем круг, и интересно в любом возрасте.",
    minutes: 120,
    seats: 8,
  },
];

export interface Slot {
  readonly classId: ClassId;
  /** Local Moscow date, YYYY-MM-DD. */
  readonly date: string;
  readonly time: string;
  readonly seats: number;
  readonly taken: number;
}

/** A small stable hash, so the "taken" seats look lived-in but stay put across reloads. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

/** Today's date in Moscow, whatever the visitor's clock says. */
export function moscowNow(now = new Date()): Date {
  return new Date(now.getTime() + (now.getTimezoneOffset() + 180) * 60_000);
}

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * The next two weeks of the studio's timetable. Weekday evenings and three
 * weekend sittings; nothing on Mondays, when the kiln is loaded. Course
 * groups start on fixed Tuesdays.
 */
export function schedule(from: Date, days = 14): Slot[] {
  const out: Slot[] = [];
  for (let i = 0; i < days; i += 1) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    const wd = d.getDay();
    if (wd === 1) continue;
    const date = iso(d);
    const weekend = wd === 0 || wd === 6;
    const plan: [ClassId, string][] = weekend
      ? [
          ["first", "12:00"],
          ["hand", "13:00"],
          ["first", "15:00"],
          ["pair", "18:00"],
        ]
      : [
          ["first", "19:00"],
          ...(wd === 3 || wd === 5 ? ([["pair", "19:30"]] as [ClassId, string][]) : []),
          ...(wd === 4 ? ([["hand", "18:30"]] as [ClassId, string][]) : []),
          ...(wd === 2 && d.getDate() % 14 < 7 ? ([["course", "19:00"]] as [ClassId, string][]) : []),
        ];
    for (const [classId, time] of plan) {
      const format = CLASSES.find((c) => c.id === classId)!;
      // Nearer dates are fuller, and the weekends fullest.
      const pressure = Math.max(0, 1 - i / days) * 0.7 + (weekend ? 0.3 : 0);
      const taken = Math.min(format.seats, Math.floor(hash(date + time + classId) * format.seats * (0.45 + pressure)));
      out.push({ classId, date, time, seats: format.seats, taken });
    }
  }
  return out;
}

export interface Work {
  readonly no: string;
  readonly name: string;
  readonly glaze: GlazeId;
  readonly price: number;
  readonly profile: Profile;
}

/**
 * Pots from the studio's shelf. Each one is drawn from its own profile, the
 * same four numbers as the cup in the hero, so the shelf is a catalogue of
 * what the wheel can do rather than a set of pictures.
 */
export const WORKS: readonly Work[] = [
  {
    no: "К-014",
    name: "Пиала для чая",
    glaze: "celadon",
    price: 1600,
    profile: { foot: 2.2, belly: { r: 4.6, y: 2.2 }, neck: { r: 5.3, y: 4.2 }, lip: { r: 5.5, y: 5.4 } },
  },
  {
    no: "К-021",
    name: "Кружка, 350 мл",
    glaze: "tenmoku",
    price: 2400,
    profile: { foot: 3.6, belly: { r: 4.3, y: 3 }, neck: { r: 4.1, y: 7.6 }, lip: { r: 4.3, y: 9.8 } },
  },
  {
    no: "К-022",
    name: "Стакан",
    glaze: "shino",
    price: 1900,
    profile: { foot: 2.7, belly: { r: 3.1, y: 3.4 }, neck: { r: 3.4, y: 8.4 }, lip: { r: 3.6, y: 11.2 } },
  },
  {
    no: "К-030",
    name: "Молочник",
    glaze: "ash",
    price: 3800,
    profile: { foot: 3.4, belly: { r: 5.1, y: 4.4 }, neck: { r: 3.1, y: 10.2 }, lip: { r: 3.9, y: 13.2 } },
  },
  {
    no: "К-037",
    name: "Чаша для риса",
    glaze: "cobalt",
    price: 2100,
    profile: { foot: 2.6, belly: { r: 5.2, y: 3 }, neck: { r: 5.9, y: 5.6 }, lip: { r: 6, y: 6.8 } },
  },
  {
    no: "К-041",
    name: "Ваза под одну ветку",
    glaze: "shino",
    price: 4200,
    profile: { foot: 3.4, belly: { r: 5.2, y: 6 }, neck: { r: 1.6, y: 15.4 }, lip: { r: 2.4, y: 19.5 } },
  },
  {
    no: "К-045",
    name: "Блюдо",
    glaze: "ash",
    price: 4800,
    profile: { foot: 6, belly: { r: 10.2, y: 1.6 }, neck: { r: 11.6, y: 3 }, lip: { r: 12, y: 3.6 } },
  },
  {
    no: "К-052",
    name: "Чашка для эспрессо",
    glaze: "celadon",
    price: 1400,
    profile: { foot: 2.2, belly: { r: 3, y: 2 }, neck: { r: 3.1, y: 4.6 }, lip: { r: 3.3, y: 6.2 } },
  },
];

export const rub = (n: number) => `${n.toLocaleString("ru-RU").replace(/ /g, " ")} ₽`;
