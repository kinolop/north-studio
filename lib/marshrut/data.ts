/**
 * What can be shipped, from where, to where, and how.
 *
 * Everything the calculator lets a visitor choose lives here as data, so a
 * new city or product is a new entry and not a new branch of code. Tariffs,
 * transit times and product specifications are invented but kept inside the
 * ranges a real forwarder would quote; the page says so where the numbers
 * are shown.
 */

export type ProductId = "tshirt" | "hoodie" | "sneakers" | "mug" | "plush" | "case";
export type OriginId = "guangzhou" | "yiwu" | "shanghai";
export type DestId = "koledino" | "spb" | "kazan" | "krasnodar" | "ekb" | "novosibirsk";
export type ModeId = "road" | "rail" | "sea" | "air";

export interface Product {
  id: ProductId;
  /** Catalogue name, nominative plural: the row in the picker. */
  name: string;
  /**
   * The noun after "Довезём 3 200": accusative singular for 1, 21, 101;
   * nominative plural for 2-4; genitive plural for everything else.
   */
  forms: readonly [string, string, string];
  unitsPerCarton: number;
  /** Outer carton in centimetres, length, width, height. */
  carton: readonly [number, number, number];
  /** Gross weight of a full carton, kilograms. */
  cartonKg: number;
  /** Purchase price per unit, yuan. */
  priceCny: number;
  /** Import duty as a share of customs value. */
  duty: number;
  /** Four-digit HS heading, the part of the code that is the same everywhere. */
  hs: string;
  /** How the goods are named on the consignment note. */
  goods: string;
  defaultUnits: number;
}

export const PRODUCTS: readonly Product[] = [
  {
    id: "tshirt",
    name: "Футболки",
    forms: ["футболку", "футболки", "футболок"],
    unitsPerCarton: 40,
    carton: [60, 40, 40],
    cartonKg: 11,
    priceCny: 18,
    duty: 0.1,
    hs: "6109",
    goods: "Футболки трикотажные хлопковые",
    defaultUnits: 3200,
  },
  {
    id: "hoodie",
    name: "Худи",
    forms: ["худи", "худи", "худи"],
    unitsPerCarton: 14,
    carton: [60, 40, 45],
    cartonKg: 8.3,
    priceCny: 65,
    duty: 0.1,
    hs: "6110",
    goods: "Худи трикотажные, флис",
    defaultUnits: 1400,
  },
  {
    id: "sneakers",
    name: "Кроссовки",
    forms: ["пару кроссовок", "пары кроссовок", "пар кроссовок"],
    unitsPerCarton: 10,
    carton: [62, 42, 36],
    cartonKg: 10,
    priceCny: 95,
    duty: 0.1,
    hs: "6404",
    goods: "Обувь спортивная с текстильным верхом",
    defaultUnits: 1200,
  },
  {
    id: "mug",
    name: "Кружки",
    forms: ["кружку", "кружки", "кружек"],
    unitsPerCarton: 48,
    carton: [50, 40, 35],
    cartonKg: 18,
    priceCny: 9,
    duty: 0.1,
    hs: "6912",
    goods: "Кружки керамические",
    defaultUnits: 5000,
  },
  {
    id: "plush",
    name: "Мягкие игрушки",
    forms: ["мягкую игрушку", "мягкие игрушки", "мягких игрушек"],
    unitsPerCarton: 20,
    carton: [70, 50, 50],
    cartonKg: 7,
    priceCny: 22,
    duty: 0.05,
    hs: "9503",
    goods: "Игрушки мягкие набивные",
    defaultUnits: 2400,
  },
  {
    id: "case",
    name: "Чехлы для телефонов",
    forms: ["чехол для телефона", "чехла для телефона", "чехлов для телефонов"],
    unitsPerCarton: 500,
    carton: [45, 35, 30],
    cartonKg: 14,
    priceCny: 3,
    duty: 0.05,
    hs: "3926",
    goods: "Чехлы для телефонов из пластика",
    defaultUnits: 12000,
  },
];

export interface Origin {
  id: OriginId;
  name: string;
  /** After "из": genitive. */
  from: string;
  lon: number;
  lat: number;
  /** Where the sea route starts when the mode is sea. */
  port: { name: string; lon: number; lat: number };
}

export const ORIGINS: readonly Origin[] = [
  {
    id: "guangzhou",
    name: "Гуанчжоу",
    from: "Гуанчжоу",
    lon: 113.26,
    lat: 23.13,
    port: { name: "порт Наньша", lon: 113.6, lat: 22.7 },
  },
  {
    id: "yiwu",
    name: "Иу",
    from: "Иу",
    lon: 120.07,
    lat: 29.31,
    port: { name: "порт Нинбо", lon: 121.9, lat: 29.9 },
  },
  {
    id: "shanghai",
    name: "Шанхай",
    from: "Шанхая",
    lon: 121.47,
    lat: 31.23,
    port: { name: "порт Яншань", lon: 122.0, lat: 30.6 },
  },
];

export interface Destination {
  id: DestId;
  name: string;
  /** After "на склад в": prepositional. */
  prep: string;
  region: string;
  lon: number;
  lat: number;
  airport: { name: string; lon: number; lat: number };
}

export const DESTINATIONS: readonly Destination[] = [
  {
    id: "koledino",
    name: "Коледино",
    prep: "Коледине",
    region: "Московская область",
    lon: 37.6,
    lat: 55.36,
    airport: { name: "Внуково", lon: 37.27, lat: 55.6 },
  },
  {
    id: "spb",
    name: "Шушары",
    prep: "Шушарах",
    region: "Санкт-Петербург",
    lon: 30.4,
    lat: 59.8,
    airport: { name: "Пулково", lon: 30.26, lat: 59.8 },
  },
  {
    id: "kazan",
    name: "Казань",
    prep: "Казани",
    region: "Татарстан",
    lon: 49.2,
    lat: 55.7,
    airport: { name: "Казань", lon: 49.28, lat: 55.61 },
  },
  {
    id: "krasnodar",
    name: "Краснодар",
    prep: "Краснодаре",
    region: "Краснодарский край",
    lon: 39.0,
    lat: 45.1,
    airport: { name: "Пашковский", lon: 39.13, lat: 45.03 },
  },
  {
    id: "ekb",
    name: "Екатеринбург",
    prep: "Екатеринбурге",
    region: "Свердловская область",
    lon: 60.7,
    lat: 56.75,
    airport: { name: "Кольцово", lon: 60.8, lat: 56.74 },
  },
  {
    id: "novosibirsk",
    name: "Новосибирск",
    prep: "Новосибирске",
    region: "Новосибирская область",
    lon: 82.9,
    lat: 55.0,
    airport: { name: "Толмачёво", lon: 82.65, lat: 55.01 },
  },
];

export interface Mode {
  id: ModeId;
  name: string;
  /** After the destination: instrumental. */
  by: string;
  /** Where the goods cross into the customs union. */
  gate: string;
  note: string;
}

export const MODES: readonly Mode[] = [
  {
    id: "road",
    name: "Фура",
    by: "фурой",
    gate: "Хоргос",
    note: "Через Казахстан без перегрузов",
  },
  {
    id: "rail",
    name: "Поезд",
    by: "поездом",
    gate: "Достык",
    note: "Контейнером, самый ровный по срокам",
  },
  {
    id: "sea",
    name: "Море и поезд",
    by: "морем и поездом",
    gate: "порт Владивосток",
    note: "Дешевле всех, но дольше всех",
  },
  {
    id: "air",
    name: "Самолёт",
    by: "самолётом",
    gate: "аэропорт",
    note: "Когда товар нужен вчера",
  },
];

export const byId = <T extends { id: string }>(list: readonly T[], id: string): T => {
  const found = list.find((item) => item.id === id);
  if (!found) throw new Error(`unknown id: ${id}`);
  return found;
};
