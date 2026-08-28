/* ==========================================================================
   DOMSTROY: сценарии страницы
   --------------------------------------------------------------------------
   01. Общее: помощники и формула стоимости
   02. Появление элементов при прокрутке
   03. Счётчики чисел
   04. Шапка и мобильное меню
   05. Главный экран
   06. Квиз-калькулятор
   07. География работ: карта и районы
   08. Живой калькулятор
   09. Карточка проекта
   --------------------------------------------------------------------------
   Прокрутка нигде не слушается через window.onscroll: состояния считает
   IntersectionObserver, параллакс делает CSS animation-timeline.
   ========================================================================== */
(function () {
  "use strict";

  /* ========================================================================
     01. ОБЩЕЕ
     ======================================================================== */
  var $  = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var calmMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
  var isCalm = function () { return calmMedia.matches; };

  var nf = new Intl.NumberFormat("ru-RU");
  var money = function (n) { return nf.format(n); };

  /* Единая формула для квиза и калькулятора, чтобы цифры не расходились.
     Ставки в рублях за квадратный метр под ключ. */
  var RATE    = { frame: 37500, timber: 43500, block: 46500 };
  var FLOOR_K = { "1": 1, "2": 0.96, attic: 0.98 };

  /* Дома больше 90 м² дешевле в пересчёте на метр: фундамент и кровля общие */
  function scaleOf(area) {
    return 1 - Math.min(Math.max(area - 90, 0) / 90, 1) * 0.06;
  }

  function priceOf(area, tech, floors) {
    var rate = RATE[tech] || RATE.frame;
    var k = FLOOR_K[floors] || 1;
    return Math.round((area * rate * scaleOf(area) * k) / 10000) * 10000;
  }

  function daysOf(area, floors) {
    var base = 55 + (area - 90) * 0.32 + (floors === "1" ? 0 : 8);
    return Math.max(45, Math.round(base / 5) * 5);
  }

  /* Блокировка прокрутки без скачка вёрстки на ширину полосы */
  var lockPad = 0;
  function lockScroll(on) {
    if (on) {
      lockPad = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = lockPad > 0 ? lockPad + "px" : "";
      document.body.classList.add("is-locked");
    } else {
      document.body.classList.remove("is-locked");
      document.body.style.paddingRight = "";
    }
  }


  /* ========================================================================
     02. ПОЯВЛЕНИЕ ЭЛЕМЕНТОВ ПРИ ПРОКРУТКЕ
     Сквозная идея «замер и сборка»: текст поднимается из-под маски,
     размерные линии вычерчиваются слева направо.
     ======================================================================== */
  function initReveal() {
    var items = $$("[data-reveal]");
    var extra = $$("#steps");

    items.forEach(function (el) {
      var d = el.getAttribute("data-reveal-delay");
      if (d) el.style.setProperty("--rd", d + "ms");
    });

    if (isCalm() || !("IntersectionObserver" in window)) {
      items.concat(extra).forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.15 });

    items.concat(extra).forEach(function (el) { io.observe(el); });
  }


  /* ========================================================================
     03. СЧЁТЧИКИ ЧИСЕЛ
     ======================================================================== */
  function countTo(el, to, dur) {
    var start = null;
    var done = false;
    var ease = function (t) { return 1 - Math.pow(1 - t, 3); };

    function tick(now) {
      if (done) return;
      if (start === null) start = now;
      var t = Math.min((now - start) / dur, 1);
      el.textContent = money(Math.round(to * ease(t)));
      if (t < 1) requestAnimationFrame(tick);
      else done = true;
    }
    requestAnimationFrame(tick);

    /* Страховка: если кадры не идут (фоновая вкладка, слабое устройство),
       число всё равно окажется на месте, а не застрянет на нуле */
    setTimeout(function () {
      if (done) return;
      done = true;
      el.textContent = money(to);
    }, dur + 400);
  }

  function initCounters() {
    var nodes = $$("[data-count]");
    if (!nodes.length) return;

    if (isCalm() || !("IntersectionObserver" in window)) {
      nodes.forEach(function (el) { el.textContent = money(+el.dataset.count); });
      return;
    }

    /* В разметке лежит готовое число: если скрипты не отработают, читатель
       увидит сумму, а не ноль. Обнуляем только когда счётчик точно оживёт. */
    nodes.forEach(function (el) { el.textContent = "0"; });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var to = +e.target.dataset.count;
        countTo(e.target, to, to > 10000 ? 1600 : 1100);
        io.unobserve(e.target);
      });
    }, { threshold: 0.6 });

    nodes.forEach(function (el) { io.observe(el); });
  }


  /* ========================================================================
     04. ШАПКА И МОБИЛЬНОЕ МЕНЮ
     ======================================================================== */
  function initHeader() {
    var hdr = $("#hdr");
    var sentinel = $("#top-sentinel");
    if (!hdr) return;

    if (sentinel && "IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        hdr.classList.toggle("is-stuck", !entries[0].isIntersecting);
      }, { threshold: 0 }).observe(sentinel);
    }

    var burger = $("#burger");
    var nav = $("#nav");
    if (!burger || !nav) return;

    function setMenu(open) {
      nav.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
      document.body.classList.toggle("is-locked", open);
    }

    burger.addEventListener("click", function () {
      setMenu(burger.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setMenu(false);
        burger.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 960 && nav.classList.contains("is-open")) setMenu(false);
    });
  }


  /* ========================================================================
     05. ГЛАВНЫЙ ЭКРАН
     ======================================================================== */
  function initHero() {
    var hero = $("#hero");
    if (!hero) return;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { hero.classList.add("is-ready"); });
    });
  }


  /* ========================================================================
     06. КВИЗ-КАЛЬКУЛЯТОР
     ======================================================================== */
  function initQuiz() {
    var form = $("#quizForm");
    if (!form) return;

    var panes = $$(".quiz__pane", form);
    var label = $("#quizStep");
    var bar = $("#quizBar");
    var next = $("#quizNext");
    var back = $("#quizBack");
    var note = $("#quizNote");
    var priceOut = $("#quizPrice");
    var daysOut = $("#quizDays");
    var phone = $("#quizPhone");

    var LAST = 4;
    var step = 1;

    function pick(name) {
      var el = form.querySelector('input[name="' + name + '"]:checked');
      return el ? el.value : null;
    }

    function render() {
      panes.forEach(function (p) {
        p.classList.toggle("is-active", +p.dataset.step === step);
      });

      var done = step > LAST;
      label.textContent = done ? "Расчёт готов" : "Шаг " + step + " из " + LAST;
      bar.style.transform = "scaleX(" + (done ? 1 : step / LAST) + ")";

      next.textContent = done ? "Получить расчёт" : (step === LAST ? "Показать расчёт" : "Далее");
      back.hidden = step === 1;
      note.textContent = done
        ? "Инженер перезвонит в рабочее время"
        : "Это бесплатно и ни к чему не обязывает";

      var active = panes.filter(function (p) { return +p.dataset.step === step; })[0];
      var first = active && active.querySelector("input, select");
      if (first && step > 1) first.focus({ preventScroll: true });
    }

    function showResult() {
      var area = +pick("area");
      var price = priceOf(area, pick("tech"), pick("floors"));
      var days = daysOf(area, pick("floors"));

      if (isCalm()) {
        priceOut.textContent = "от " + money(price);
      } else {
        priceOut.textContent = "0";
        countTo(priceOut, price, 1200);
        setTimeout(function () { priceOut.textContent = "от " + money(price); }, 1300);
      }
      daysOut.textContent = String(days);
    }

    function succeed() {
      form.innerHTML =
        '<div class="quiz__pane is-active quiz__result">' +
        '<p class="quiz__q">Заявка принята</p>' +
        '<p class="quiz__price-note">Мы позвоним на указанный номер и пришлём подробный расчёт ' +
        'с планировкой. Обычно это занимает не больше двух часов в рабочее время.</p>' +
        "</div>";
      label.textContent = "Готово";
      bar.style.transform = "scaleX(1)";
    }

    next.addEventListener("click", function () {
      if (step > LAST) {
        var digits = (phone && phone.value ? phone.value : "").replace(/\D/g, "");
        if (digits.length < 11) {
          phone.focus();
          phone.style.borderColor = "#B8874E";
          return;
        }
        succeed();
        return;
      }
      step += 1;
      if (step > LAST) showResult();
      render();
    });

    back.addEventListener("click", function () {
      if (step > 1) { step -= 1; render(); }
    });

    if (phone) {
      phone.addEventListener("input", function () {
        phone.style.borderColor = "";
        var d = phone.value.replace(/\D/g, "").replace(/^8/, "7").slice(0, 11);
        if (!d) { phone.value = ""; return; }
        if (d[0] !== "7") d = "7" + d.slice(0, 10);
        var out = "+7";
        if (d.length > 1) out += " (" + d.slice(1, 4);
        if (d.length >= 5) out += ") " + d.slice(4, 7);
        if (d.length >= 8) out += "-" + d.slice(7, 9);
        if (d.length >= 10) out += "-" + d.slice(9, 11);
        phone.value = out;
      });
    }

    form.addEventListener("submit", function (e) { e.preventDefault(); });
    render();
  }


  /* ========================================================================
     07. ГЕОГРАФИЯ РАБОТ
     Порядок совпадает с порядком пинов и строк районов в разметке.
     ======================================================================== */
  var OBJECTS = [
    { place: "Одинцовский район",    name: "Д-176", area: "176 м²", rooms: "4", price: 6240000, days: 84, img: "/work/domstroy/images/works/work-1.jpg" },
    { place: "Дмитровский район",    name: "Д-198", area: "198 м²", rooms: "4", price: 6890000, days: 90, img: "/work/domstroy/images/projects/d-198.jpg" },
    { place: "Истринский район",     name: "Д-156", area: "156 м²", rooms: "3", price: 5650000, days: 75, img: "/work/domstroy/images/projects/d-156.jpg" },
    { place: "Ленинский округ",      name: "Д-138", area: "138 м²", rooms: "3", price: 5020000, days: 70, img: "/work/domstroy/images/works/work-3.jpg" },
    { place: "Раменский район",      name: "Д-112", area: "112 м²", rooms: "3", price: 4120000, days: 60, img: "/work/domstroy/images/projects/d-112.jpg" },
    { place: "Пушкинский район",     name: "Д-204", area: "204 м²", rooms: "5", price: 7180000, days: 96, img: "/work/domstroy/images/works/work-2.jpg" },
    { place: "Химки",                name: "Д-124", area: "124 м²", rooms: "3", price: 4460000, days: 64, img: "/work/domstroy/images/hero.jpg" },
    { place: "Наро-Фоминский округ", name: "Д-165", area: "165 м²", rooms: "4", price: 5890000, days: 78, img: "/work/domstroy/images/works/work-4.jpg" }
  ];

  function initGeo() {
    var pins = $$("#mapPins .pin");
    var rows = $$("#dists .dist");
    var card = $("#objCard");
    if (!card || (!pins.length && !rows.length)) return;

    var out = {
      img: $("#objImg"), name: $("#objName"), place: $("#objPlace"),
      area: $("#objArea"), rooms: $("#objRooms"), days: $("#objDays"), price: $("#objPrice")
    };

    function select(i) {
      var o = OBJECTS[i];
      if (!o) return;

      pins.forEach(function (p) { p.classList.toggle("is-active", +p.dataset.obj === i); });
      rows.forEach(function (r) { r.classList.toggle("is-active", +r.dataset.obj === i); });

      out.img.src = o.img;
      out.img.alt = "Дом " + o.name + ", " + o.place;
      out.name.textContent = o.name;
      out.place.textContent = o.place;
      out.area.textContent = o.area;
      out.rooms.textContent = o.rooms;
      out.days.textContent = o.days + " дней";
      out.price.textContent = money(o.price) + " ₽";

      card.classList.remove("is-swap");
      void card.offsetWidth;
      if (!isCalm()) card.classList.add("is-swap");
    }

    pins.forEach(function (pin) {
      var i = +pin.dataset.obj;
      pin.addEventListener("click", function () { select(i); });
      pin.addEventListener("mouseenter", function () { select(i); });
      pin.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(i); }
      });
    });

    /* У строк списка наведение не ловим: при беглом движении мышью карточка
       мигала бы. Наведение оставлено пинам, где это уместно. */
    rows.forEach(function (row) {
      var i = +row.dataset.obj;
      row.addEventListener("click", function () { select(i); });
      row.addEventListener("focus", function () { select(i); });
    });

    select(0);
  }


  /* ========================================================================
     08. ЖИВОЙ КАЛЬКУЛЯТОР
     ======================================================================== */
  function initCalc() {
    var form = $("#calcForm");
    if (!form) return;

    var area = $("#calcArea");
    var areaOut = $("#calcAreaOut");
    var floors = $("#calcFloors");
    var tech = $("#calcTech");
    var priceOut = $("#calcPrice");
    var daysOut = $("#calcDays");

    var shown = 0, raf = null, guard = null;

    function paint(target) {
      if (isCalm()) { priceOut.textContent = money(target); shown = target; return; }
      if (raf) cancelAnimationFrame(raf);
      if (guard) clearTimeout(guard);
      var from = shown, t0 = null;

      function tick(now) {
        if (t0 === null) t0 = now;
        var t = Math.min((now - t0) / 480, 1);
        var e = 1 - Math.pow(1 - t, 3);
        shown = Math.round(from + (target - from) * e);
        priceOut.textContent = money(shown);
        if (t < 1) raf = requestAnimationFrame(tick);
      }
      raf = requestAnimationFrame(tick);

      guard = setTimeout(function () {
        if (shown === target) return;
        shown = target;
        priceOut.textContent = money(target);
      }, 900);
    }

    function update() {
      var a = +area.value;
      areaOut.textContent = a;
      paint(priceOf(a, tech.value, floors.value));
      daysOut.textContent = String(daysOf(a, floors.value));
    }

    ["input", "change"].forEach(function (ev) { form.addEventListener(ev, update); });
    form.addEventListener("submit", function (e) { e.preventDefault(); });

    update();
  }


  /* ========================================================================
     09. КАРТОЧКА ПРОЕКТА
     Порядок совпадает с порядком карточек в секции «Выберите свой дом».
     ======================================================================== */
  var PROJECTS = [
    {
      name: "Д-198", img: "/work/domstroy/images/projects/d-198.jpg",
      area: "198 м²", floors: "2 этажа", beds: "4 спальни", baths: "2 санузла",
      tech: "Каркас", price: 6890000, days: 90,
      includes: [
        "Свайно-ростверковый фундамент с расчётом под ваш грунт",
        "Каркас из сухой строганой доски камерной сушки",
        "Фальцевая кровля, утепление контура 250 мм",
        "Панорамное остекление с двухкамерным стеклопакетом",
        "Электрика, отопление, водоснабжение и вентиляция",
        "Черновая и чистовая отделка по согласованным материалам"
      ],
      plan: [
        ["Первый этаж", "Гостиная-столовая, кухня, кабинет, санузел, котельная, терраса 24 м²"],
        ["Второй этаж", "Четыре спальни, гардеробная, санузел, балкон"]
      ]
    },
    {
      name: "Д-156", img: "/work/domstroy/images/projects/d-156.jpg",
      area: "156 м²", floors: "Этаж с мансардой", beds: "3 спальни", baths: "2 санузла",
      tech: "Каркас", price: 5650000, days: 75,
      includes: [
        "Утеплённая шведская плита под всей площадью дома",
        "Каркас из сухой строганой доски камерной сушки",
        "Фальцевая кровля, утепление контура 250 мм",
        "Панорамные окна в гостиной, остальные с энергосбережением",
        "Электрика, отопление, водоснабжение и вентиляция",
        "Черновая и чистовая отделка по согласованным материалам"
      ],
      plan: [
        ["Первый этаж", "Гостиная с камином, кухня-столовая, санузел, котельная, терраса 18 м²"],
        ["Мансарда", "Три спальни, гардеробная, санузел"]
      ]
    },
    {
      name: "Д-112", img: "/work/domstroy/images/projects/d-112.jpg",
      area: "112 м²", floors: "Этаж с мансардой", beds: "3 спальни", baths: "1 санузел",
      tech: "Каркас", price: 4120000, days: 60,
      includes: [
        "Свайно-винтовой фундамент с обвязкой по периметру",
        "Каркас из сухой строганой доски камерной сушки",
        "Металлочерепица, утепление контура 200 мм",
        "Окна с энергосберегающим стеклопакетом",
        "Электрика, отопление, водоснабжение и вентиляция",
        "Черновая отделка, чистовая по отдельной смете"
      ],
      plan: [
        ["Первый этаж", "Гостиная-кухня, спальня, санузел, котельная, терраса 14 м²"],
        ["Мансарда", "Две спальни, кладовая"]
      ]
    }
  ];

  function initModal() {
    var modal = $("#modal");
    var body = $("#modalBody");
    var win = $(".modal__win", modal);
    var buttons = $$(".pcard__open");
    if (!modal || !body || !buttons.length) return;

    var lastFocus = null;

    function build(p) {
      var specs = [
        ["Площадь", p.area], ["Этажность", p.floors],
        ["Спальни", p.beds], ["Санузлы", p.baths],
        ["Технология", p.tech], ["Срок", p.days + " дней"]
      ].map(function (s) {
        return "<div><dt>" + s[0] + "</dt><dd>" + s[1] + "</dd></div>";
      }).join("");

      var inc = p.includes.map(function (t) {
        return '<li><svg class="ic" aria-hidden="true"><use href="#i-circle-check"></use></svg><span>' + t + "</span></li>";
      }).join("");

      var plan = p.plan.map(function (f) {
        return "<div class=\"mdl__floor\"><b>" + f[0] + "</b><span>" + f[1] + "</span></div>";
      }).join("");

      return '' +
        '<div class="mdl__media"><img src="' + p.img + '" alt="Проект ' + p.name + '" loading="lazy" decoding="async"></div>' +
        '<div class="mdl__body">' +
          '<div class="mdl__head">' +
            '<div>' +
              '<p class="mdl__eyebrow mono">Проект под ключ</p>' +
              '<h2 class="mdl__name" id="modalName">' + p.name + "</h2>" +
            "</div>" +
            '<p class="mdl__price">от ' + money(p.price) + ' <span>₽</span>' +
              "<small>Цена фиксируется в договоре</small></p>" +
          "</div>" +
          '<dl class="mdl__specs">' + specs + "</dl>" +
          '<div class="mdl__cols">' +
            '<div><h3 class="mdl__h">Что входит в стоимость</h3><ul class="mdl__list">' + inc + "</ul></div>" +
            '<div><h3 class="mdl__h">Планировка</h3><div class="mdl__plan">' + plan + "</div></div>" +
          "</div>" +
          '<div class="mdl__foot">' +
            '<p class="mdl__note">Планировку можно изменить под вашу семью. Смета пересчитывается до подписания договора.</p>' +
            '<a class="btn btn--primary" href="#contacts" data-close>Обсудить проект</a>' +
          "</div>" +
        "</div>";
    }

    function focusables() {
      return $$('a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])', modal)
        .filter(function (el) { return el.offsetParent !== null; });
    }

    function onKey(e) {
      if (e.key === "Escape") { close(); return; }
      if (e.key !== "Tab") return;
      var f = focusables();
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    function open(i) {
      var p = PROJECTS[i];
      if (!p) return;
      lastFocus = document.activeElement;
      body.innerHTML = build(p);
      modal.hidden = false;
      lockScroll(true);
      /* Принудительный пересчёт вместо requestAnimationFrame: кадры могут быть
         заморожены, и тогда окно осталось бы прозрачным, но перекрыло страницу */
      void modal.offsetWidth;
      modal.classList.add("is-open");
      win.scrollTop = 0;
      $(".modal__x", modal).focus();
      document.addEventListener("keydown", onKey);
    }

    function close() {
      if (modal.hidden) return;
      modal.classList.remove("is-open");
      document.removeEventListener("keydown", onKey);
      lockScroll(false);
      var hide = function () { modal.hidden = true; body.innerHTML = ""; };
      if (isCalm()) hide(); else setTimeout(hide, 350);
      if (lastFocus) lastFocus.focus();
    }

    buttons.forEach(function (btn, i) {
      btn.addEventListener("click", function (e) { e.preventDefault(); open(i); });
    });

    modal.addEventListener("click", function (e) {
      if (e.target.closest("[data-close]")) close();
    });
  }


  /* ========================================================================
     ЗАПУСК
     ======================================================================== */
  function boot() {
    initReveal();
    initCounters();
    initHeader();
    initHero();
    initQuiz();
    initGeo();
    initCalc();
    initModal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
