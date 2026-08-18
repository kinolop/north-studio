/**
 * NOCTURA — an invented five-star hotel, and everything it says.
 *
 * Deliberately NOT in `lib/i18n`. That dictionary is a bilingual contract:
 * every key added to one locale must exist in the other or the build fails.
 * NOCTURA is a Russian brand and speaks Russian only - there is no language
 * switch on its page and there should never be one. Giving it its own module
 * keeps the studio's parity guarantee intact instead of forcing an English
 * translation of a hotel that does not have an English face.
 *
 * Two house rules run through every string here:
 *
 *   1. Hyphens, never em dashes.
 *   2. Nothing invented is presented as real. The hotel is fictional, the
 *      figures are illustrative, the reviews are written for the concept and
 *      say so, and the booking form states plainly that it sends nothing.
 *      The only prices on the page are the rooms' "от X ₽", and they are
 *      framed inside the concept.
 *
 * The floor addresses are not decoration. NOCTURA is a tower, the page is an
 * ascent through it, and every section is really on the floor it claims:
 * the spa is in the stone basement, the rooms climb, the restaurant and the
 * penthouse share the top. See `NocturaTower`.
 */

export const NOCTURA_ASSETS = "/work/noctura/assets";

/** Floors, in the order the page visits them. */
export const NOCTURA_SECTIONS = [
  { id: "vestibule", floor: "01", label: "Вестибюль" },
  { id: "rooms", floor: "12-40", label: "Номера" },
  { id: "spa", floor: "-2", label: "Спа" },
  { id: "dining", floor: "41", label: "Ресторан" },
  { id: "view", floor: "42", label: "Вид" },
  { id: "voices", floor: "01", label: "Гости" },
  { id: "booking", floor: "01", label: "Бронирование" },
] as const;

export type NocturaSectionId = (typeof NOCTURA_SECTIONS)[number]["id"];

export interface NocturaRoom {
  readonly key: string;
  /** The floor band this category occupies in the tower. */
  readonly floor: string;
  readonly name: string;
  /** Sits above the name - the category's one-line character. */
  readonly kicker: string;
  readonly image: string;
  readonly body: string;
  readonly features: readonly { readonly label: string; readonly value: string }[];
  /** Illustrative, and framed as such wherever it is printed. */
  readonly price: string;
}

export const NOCTURA = {
  brand: {
    name: "NOCTURA",
    /** Set in the wordmark's tracking, under the name. */
    tagline: "ОТЕЛЬ · НОЧЬ · ВЫСОТА",
    demoTag: "Демо-концепт",
    city: "Москва",
  },

  nav: [
    { id: "rooms", label: "Номера" },
    { id: "spa", label: "Спа" },
    { id: "dining", label: "Ресторан" },
    { id: "view", label: "Расположение" },
    { id: "booking", label: "Контакты" },
  ],

  hero: {
    /** Authored line breaks - the pause after the first line is the point. */
    headline: ["Ночь принадлежит", "вам."],
    subtitle:
      "Сорок два этажа тишины над городом, который не спит. NOCTURA открывается, когда всё остальное закрывается.",
    primary: "Забронировать",
    secondary: "Смотреть отель",
    scroll: "Вниз",
    /** Under the CTA row, small. */
    note: "Приём гостей круглосуточно",
  },

  manifesto: {
    eyebrow: "Вестибюль",
    title: ["Мы включаем свет", "тогда, когда город", "его выключает."],
    body: [
      "NOCTURA стоит на набережной, там, где деловые кварталы упираются в воду и обрываются. Днём это обычная башня из тёмного стекла, каких вокруг десяток. После заката она единственная остаётся тёплой: сто шестьдесят восемь окон горят низким светом, и снизу видно, что внутри кто-то живёт.",
      "Внутри нет ни одной верхней лампы. Свет собран в лужи - у изголовья, над стойкой бара, вдоль лестницы, - и между ними оставлена темнота, к которой глаз привыкает за минуту. Полы каменные, стены в тёмном ореховом шпоне, латунь не полируется до зеркала и стареет вместе с домом.",
      "Это отель для тех, кто приезжает поздно и уезжает рано. Ресепшн работает всю ночь, кухня - до пяти утра, спа в каменном подвале открыт с заката. Мы не будим вас завтраком и не спрашиваем, как вам спалось. Мы просто оставляем свет там, где он нужен.",
    ],
    /** Illustrative figures, disclaimed under the row. */
    figures: [
      { key: "floors", value: 42, suffix: "", label: "этажа над городом" },
      { key: "rooms", value: 168, suffix: "", label: "номеров и люксов" },
      { key: "years", value: 12, suffix: "", label: "лет отелю" },
      { key: "night", value: null, literal: "24/7", suffix: "", label: "стойка и консьерж" },
    ],
    figuresNote: "Цифры иллюстративные: NOCTURA - вымышленный отель, придуманный для демонстрации.",
  },

  rooms: {
    eyebrow: "Этажи 12-40",
    title: ["Три способа", "провести ночь."],
    lede: "Категории отличаются не квадратными метрами, а тем, сколько города вам достаётся. Выберите этаж - лифт поднимется сам.",
    /** Above the elevator readout. */
    floorLabel: "Этаж",
    priceLabel: "от",
    priceUnit: "₽ / ночь",
    priceNote: "Цены иллюстративные, в рамках демо-концепта.",
    cta: "Забронировать эту категорию",
    /** Screen-reader name for the selector group. */
    selectorLabel: "Категория номера",
    items: [
      {
        key: "deluxe",
        floor: "12",
        name: "Делюкс",
        kicker: "Нижние этажи",
        image: `${NOCTURA_ASSETS}/room-1.png`,
        body: "Комната, собранная вокруг кровати и одного окна во всю стену. Изголовье в тёплой коже подсвечено снизу узкой латунной полосой - это единственный верхний свет в номере, всё остальное стоит на столиках и включается по одному. Город здесь ещё близко: видно перекрёстки, фары, светофоры, слышно ровный низкий гул, который к полуночи стихает. Плотные шторы закрываются одной кнопкой у кровати и гасят улицу полностью.",
        features: [
          { label: "Вид", value: "На проспект и кварталы" },
          { label: "Площадь", value: "42 м²" },
          { label: "Кровать", value: "King size, бельё из египетского хлопка" },
          { label: "В номере", value: "Мини-бар, ночной сервис до 05:00" },
        ],
        price: "48 000",
      },
      {
        key: "panorama",
        floor: "27",
        name: "Панорамный люкс",
        kicker: "Средние этажи",
        image: `${NOCTURA_ASSETS}/room-2.png`,
        body: "Угловой люкс, где стекло идёт по двум сторонам и сходится в угол без единой опоры - стоя в этом углу, вы находитесь снаружи, оставаясь внутри. Спальня отделена от гостиной глухой панелью орехового дерева, так что свет в одной половине не мешает спать в другой. Пол под ногами - плотный шерстяной ковёр от стены до стены, шагов не слышно вообще. На двадцать седьмом этаже город уже внизу: он светится, но больше не шумит.",
        features: [
          { label: "Вид", value: "Панорама на две стороны, 180°" },
          { label: "Площадь", value: "76 м², спальня и гостиная" },
          { label: "Кровать", value: "King size и раскладной диван" },
          { label: "В номере", value: "Личный консьерж, поздняя выписка до 16:00" },
        ],
        price: "96 000",
      },
      {
        key: "penthouse",
        floor: "40",
        name: "Пентхаус",
        kicker: "Верхние этажи",
        image: `${NOCTURA_ASSETS}/room-3.png`,
        body: "Два уровня, шесть метров до потолка и люстра, которую видно с улицы. Внизу - бар с чёрной мраморной стойкой, живой камин во всю стену и выход на открытую террасу с очагом; наверху, за стеклом антресоли, спальня, до которой не доходит ни звук, ни свет снизу. Пентхаус занимает весь сороковой этаж целиком, поэтому соседей у вас нет ни за одной стеной. Его берут на одну ночь, и почти всегда остаются на вторую.",
        features: [
          { label: "Вид", value: "Круговой, терраса с очагом" },
          { label: "Площадь", value: "210 м², два уровня" },
          { label: "Кровать", value: "Спальня-антресоль, гардеробная" },
          { label: "В номере", value: "Дворецкий, трансфер, отдельный лифт" },
        ],
        price: "240 000",
      },
    ] as const satisfies readonly NocturaRoom[],
  },

  spa: {
    eyebrow: "Этаж -2",
    title: ["Каменный этаж", "под городом."],
    lede: "Два уровня ниже улицы, где нет ни одного окна и ни одной электрической лампы над водой. Термальный бассейн подсвечен свечами по всему периметру, вода держится на 38 градусах, эхо съедено камнем.",
    body: "Спа открывается на закате и работает до трёх ночи - это единственное место в отеле, куда мы просим приходить без телефона. Своды и стены выложены из тёсаного камня, тёплого на ощупь; от воды идёт пар, и в нём свет свечей рассеивается так, что не видно ни дальней стены, ни потолка.",
    treatmentsLabel: "Ритуалы",
    treatments: [
      {
        key: "night",
        name: "Ночной ритуал",
        duration: "90 минут",
        body: "Тёплое масло, медленный массаж спины и плеч, завершение в термальном бассейне. Делается в тишине, без музыки.",
      },
      {
        key: "stone",
        name: "Камень и пар",
        duration: "120 минут",
        body: "Хаммам, скраб солью, контраст горячей и ледяной воды, отдых в нише со свечой и чаем.",
      },
      {
        key: "silence",
        name: "Час тишины",
        duration: "60 минут",
        body: "Бассейн закрывается для вас одного. Ни персонала, ни других гостей - только вода и свечи.",
      },
    ],
    note: "Запись через консьержа, для гостей отеля - без предоплаты.",
  },

  dining: {
    eyebrow: "Этаж 41",
    title: ["Ужин, который", "начинается в полночь."],
    lede: "Ресторан на сорок первом этаже садится за столы после десяти вечера и работает до пяти утра. Восемнадцать столов, свеча на каждом, окно от пола до потолка за спиной у каждого второго.",
    body: "Меню меняется каждую неделю и никогда не печатается - официант рассказывает его вслух, за минуту, и уходит. Свет держится ровно на уровне свечи: достаточно, чтобы видеть тарелку и лицо напротив, недостаточно, чтобы разглядывать соседний стол. Это сделано намеренно.",
    experiencesLabel: "Что здесь есть",
    experiences: [
      {
        key: "table",
        name: "Стол у окна",
        body: "Двенадцать столов вдоль панорамного стекла. Бронируются за неделю, для гостей отеля - в день обращения.",
      },
      {
        key: "counter",
        name: "Стойка у кухни",
        body: "Шесть мест напротив открытого огня. Сет из семи подач, шеф подаёт и комментирует сам.",
      },
      {
        key: "bar",
        name: "Ночной бар",
        body: "Работает дольше кухни. Классические коктейли, выдержанные крепкие, короткая карта до рассвета.",
      },
    ],
    note: "Блюда и подача - часть демо-концепта.",
  },

  view: {
    eyebrow: "Этаж 42",
    title: ["Сорок два этажа", "и река внизу."],
    body: "NOCTURA стоит отдельно, на изгибе набережной, и это единственная причина, по которой вид отсюда не упирается в соседнюю башню. С западной стороны - излучина реки, мосты и подсветка старого центра; с восточной - деловые кварталы, которые гаснут этаж за этажом после полуночи.",
    facts: [
      { key: "airport", label: "Аэропорт", value: "40 минут на машине" },
      { key: "center", label: "Исторический центр", value: "10 минут пешком по набережной" },
      { key: "metro", label: "Метро", value: "Выход в 300 метрах" },
    ],
    /** The invented address, marked as invented in the footer. */
    address: "Набережная, 42",
  },

  voices: {
    eyebrow: "Гости",
    title: ["Что о нас", "говорят."],
    note: "Отзывы написаны для демо-концепта и не являются реальными: NOCTURA - вымышленный отель.",
    items: [
      {
        key: "one",
        quote:
          "Приехал в час ночи после двух перелётов, готовился к разговору на ресепшене. Со мной не разговаривали. Дали ключ, донесли чемодан, показали, где выключается свет. Это было лучшее, что могло произойти.",
        name: "Артём К.",
        meta: "Панорамный люкс, две ночи",
      },
      {
        key: "two",
        quote:
          "Спустилась в спа около полуночи и просидела в воде полтора часа. Ни одного человека, ни одного звука, только свечи по краю. Я забыла, что нахожусь в центре города на минус втором этаже.",
        name: "Мария Л.",
        meta: "Делюкс, одна ночь",
      },
      {
        key: "three",
        quote:
          "Брали пентхаус на день рождения, на восемь человек. Терраса с огнём, бар, свой лифт - гости так и не поняли, что это отель, а не чья-то квартира. Уехали в шесть утра.",
        name: "Дмитрий и Ольга",
        meta: "Пентхаус, одна ночь",
      },
    ],
  },

  booking: {
    eyebrow: "Бронирование",
    title: ["Оставьте даты.", "Свет будет включён."],
    lede: "Отвечаем в течение часа в любое время суток. Для пентхауса и групп больше четырёх гостей - отдельный расчёт.",
    fields: {
      arrive: "Заезд",
      depart: "Выезд",
      guests: "Гости",
      category: "Категория",
      note: "Пожелания",
      notePlaceholder: "Поздний заезд, тихий этаж, стол в ресторане",
    },
    guestOptions: ["1 гость", "2 гостя", "3 гостя", "4 гостя", "Больше четырёх"],
    submit: "Отправить запрос",
    /** Shown after the decorative submit. Says plainly that nothing was sent. */
    submitted: "Это демонстрационная форма - запрос никуда не отправлен",
    /** Permanent note under the form. */
    disclaimer:
      "Форма декоративная: NOCTURA - вымышленный отель, и бронирование здесь не работает. Чтобы обсудить такой сайт для своего проекта, напишите в студию.",
    contactLabel: "Связаться со студией",
    contactNote: "North Studio - авторы этого концепта",
  },

  footer: {
    columns: [
      {
        key: "hotel",
        title: "Отель",
        links: ["Номера", "Спа и велнес", "Ресторан", "Расположение"],
      },
      {
        key: "guests",
        title: "Гостям",
        links: ["Бронирование", "Услуги консьержа", "Трансфер", "Правила заезда"],
      },
      {
        key: "about",
        title: "О нас",
        links: ["История", "Пресса", "Карьера", "Контакты"],
      },
    ],
    /** Amenities marquee, set in the brass label voice. */
    marquee: [
      "Круглосуточная стойка",
      "Консьерж",
      "Термальный бассейн",
      "Ресторан до 05:00",
      "Ночной бар",
      "Трансфер",
      "Спа-ритуалы",
      "Подземный паркинг",
      "Поздняя выписка",
      "Обслуживание в номере",
    ],
    legal:
      "NOCTURA - вымышленный отель. Адрес, цифры, цены и отзывы на этой странице придуманы для демонстрации и ничего не описывают в реальности.",
    credit: "Демо-концепт, North Studio",
    backToStudio: "К другим работам студии",
  },

  /** Printed inside a frame while its file is missing. */
  slots: {
    hero: "hero.mp4",
    lobby: "lobby.png",
    rooms: "room-1.png / room-2.png / room-3.png",
    spa: "spa.png",
    dining: "dining.png",
    view: "view.png",
    suite: "suite.mp4",
  },
} as const;
