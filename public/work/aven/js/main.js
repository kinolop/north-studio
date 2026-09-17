/* ==========================================================================
   AVEN, моторика страницы
   --------------------------------------------------------------------------
   GSAP + ScrollTrigger + SplitText, плавная прокрутка на Lenis. Всё лежит
   рядом в js/vendor, внешних CDN нет.

   Порядок сборки важен: сначала закрепляемые секции (лента проектов,
   чертёж), потом всё остальное. Иначе ScrollTrigger посчитает позиции
   нижних блоков без учёта места, которое занимают закрепления.

   Без GSAP страница остаётся статичной и целиком читаемой. При
   prefers-reduced-motion нет ни заставки, ни закреплений, ни параллакса.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  clearTimeout(window.__avenFailsafe);

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var canSplit = hasGsap && !!window.SplitText;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var motion = hasGsap && !reduce;
  var lenis = null;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  /* ------------------------------------------------------------------------
     То, что работает всегда: меню, якоря, вопросы, просмотр проекта
     ------------------------------------------------------------------------ */
  var menu = initMenu();
  initAnchors();
  initFaq();
  initViewer();

  if (!hasGsap) {
    staticMode();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  if (canSplit) gsap.registerPlugin(SplitText);

  if (!motion) {
    root.classList.add('is-static');
    removeLoader();
    initServices();
    initChrome();
    ScrollTrigger.refresh();
    return;
  }

  /* ------------------------------------------------------------------------
     Плавная прокрутка
     ------------------------------------------------------------------------ */
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  runLoader();

  /* ========================================================================
     ЗАСТАВКА
     ======================================================================== */
  function runLoader() {
    var line = $('#loaderLine');
    var letters = $$('.loader__mark span');
    var seen = false;
    try { seen = sessionStorage.getItem('aven-seen') === '1'; } catch (e) { /* приватный режим */ }

    gsap.set(letters, { yPercent: 110 });
    gsap.set('.loader__mark', { opacity: 1 });
    gsap.timeline()
      .to(letters, { yPercent: 0, duration: seen ? 0.6 : 1.1, ease: 'expo.out', stagger: 0.07 })
      .fromTo('.loader__caption', { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' }, seen ? 0.1 : 0.35);

    // Линия растёт сама, но дотягивается до конца только когда всё готово
    var grow = gsap.to(line, { scaleX: 0.84, duration: seen ? 1 : 2.6, ease: 'power2.out' });
    var started = performance.now();
    var minTime = seen ? 700 : 1600;

    whenReady().then(function () {
      var wait = Math.max(0, minTime - (performance.now() - started));
      window.setTimeout(function () {
        var heroSplit = build();
        openStage(grow, line, letters, heroSplit);
      }, wait);
    });
  }

  function whenReady() {
    var img = $('#heroImg');
    var image = img.complete && img.naturalWidth
      ? Promise.resolve()
      : new Promise(function (done) {
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
      });
    var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    var timeout = new Promise(function (done) { window.setTimeout(done, 4500); });
    return Promise.race([Promise.all([image, fonts]), timeout]);
  }

  function openStage(grow, line, letters, heroSplit) {
    grow.kill();

    gsap.timeline({ onComplete: finish })
      .to(line, { scaleX: 1, duration: 0.55, ease: 'power3.inOut' })
      .to(letters, { yPercent: -110, duration: 0.6, ease: 'power3.in', stagger: 0.05 }, '+=0.12')
      .to('.loader__caption', { autoAlpha: 0, y: -8, duration: 0.4, ease: 'power2.in' }, '<')
      // Одна линия становится двумя краями, которые расходятся
      .set('.loader__half', { '--edge': 1 })
      .set(line, { autoAlpha: 0 })
      .addLabel('open')
      .to('.loader__half--top', { yPercent: -100, duration: 1.4, ease: 'expo.inOut' }, 'open')
      .to('.loader__half--bottom', { yPercent: 100, duration: 1.4, ease: 'expo.inOut' }, 'open')
      .fromTo('#heroImg', { scale: 1.22 }, { scale: 1, duration: 2.6, ease: 'expo.out' }, 'open+=0.2')
      .add(heroIntro(heroSplit), 'open+=0.75');
  }

  function heroIntro(heroSplit) {
    var tl = gsap.timeline();
    tl.set('#heroTitle', { visibility: 'visible' });

    if (heroSplit) {
      tl.to(heroSplit.lines, {
        yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.085,
        onComplete: function () { heroSplit.revert(); }
      });
    } else {
      tl.from('#heroTitle', { autoAlpha: 0, y: 30, duration: 1.2, ease: 'power3.out' });
    }

    // Везде fromTo с явным концом: from() взял бы конечное значение из
    // вычисленного стиля и мог поймать CSS-переход на середине
    tl.fromTo('[data-intro]', { autoAlpha: 0, y: 24 }, {
      autoAlpha: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.1, clearProps: 'opacity,visibility,transform'
    }, 0.35)
      .fromTo(['.nav__logo', '.nav__links', '.nav__cta', '.nav__burger'], { autoAlpha: 0, y: -14 }, {
        autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.06, clearProps: 'opacity,visibility,transform'
      }, 0.5)
      .fromTo('#datum', { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, ease: 'power2.out', clearProps: 'opacity,visibility' }, 0.9);

    return tl;
  }

  function finish() {
    removeLoader();
    try { sessionStorage.setItem('aven-seen', '1'); } catch (e) { /* ничего */ }
    if (lenis) lenis.start();
    ScrollTrigger.refresh();
  }

  function removeLoader() {
    var loader = $('#loader');
    if (loader) loader.remove();
  }

  /* ========================================================================
     СБОРКА ВСЕХ СЦЕН (под заставкой, когда шрифты уже на месте)
     ======================================================================== */
  function build() {
    var mm = gsap.matchMedia();

    // 1. Закрепления идут первыми
    mm.add('(min-width: 1024px)', function () { worksPan(); return processScene(true); });
    mm.add('(max-width: 1023px)', function () { worksStack(); return processScene(false); });

    // 2. Первый экран
    var heroSplit = null;
    if (canSplit) {
      heroSplit = SplitText.create('#heroTitle', { type: 'lines', mask: 'lines', linesClass: 'line' });
      gsap.set(heroSplit.lines, { yPercent: 110 });
    }

    gsap.to('#heroMedia', {
      yPercent: 9, scale: 1.06, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('#heroBody', {
      yPercent: -14, opacity: 0.15, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });

    // 3. Появления по ходу страницы
    splitHeadings();
    fades();
    staggers();
    wipes();
    drifts();
    initServices();

    gsap.fromTo('#ctaMedia img', { scale: 1.16, opacity: 0.35 }, {
      scale: 1, opacity: 1, ease: 'none',
      scrollTrigger: { trigger: '#contact', start: 'top bottom', end: 'top top', scrub: true }
    });

    // 4. Оформление: тема, шкала, шапка
    initChrome();

    ScrollTrigger.refresh();
    return heroSplit;
  }

  /* ------------------------------------------------------------------------
     Появления
     ------------------------------------------------------------------------ */
  function splitHeadings() {
    $$('[data-split]').forEach(function (el) {
      if (!canSplit) {
        gsap.set(el, { visibility: 'visible' });
        gsap.from(el, {
          autoAlpha: 0, y: 30, duration: 1.1, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 86%', once: true }
        });
        return;
      }

      var split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'line' });
      gsap.set(el, { visibility: 'visible' });
      gsap.from(split.lines, {
        yPercent: 112, duration: 1.2, ease: 'expo.out', stagger: 0.09,
        scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        // После появления возвращаем исходную разметку: так заголовок
        // корректно переносится при изменении ширины окна
        onComplete: function () { split.revert(); }
      });
    });
  }

  function fades() {
    $$('[data-fade]').forEach(function (el) {
      gsap.fromTo(el, { autoAlpha: 0, y: 28 }, {
        autoAlpha: 1, y: 0, duration: 1.1, ease: 'power3.out', clearProps: 'opacity,visibility,transform',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });
  }

  function staggers() {
    $$('[data-stagger]').forEach(function (group) {
      // У строк есть CSS-переходы для наведения: на время появления их
      // выключаем, иначе они сглаживают каждый кадр GSAP и движение вязнет
      group.classList.add('is-revealing');
      gsap.fromTo(group.children, { autoAlpha: 0, y: 30 }, {
        autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.12,
        // Инлайновая прозрачность перебила бы приглушение соседей на наведении
        clearProps: 'opacity,visibility,transform',
        scrollTrigger: { trigger: group, start: 'top 85%', once: true },
        onComplete: function () { group.classList.remove('is-revealing'); }
      });
    });
  }

  function wipes() {
    $$('[data-wipe]').forEach(function (figure) {
      var img = $('img', figure);
      gsap.timeline({ scrollTrigger: { trigger: figure, start: 'top 80%', once: true } })
        .fromTo(figure, { clipPath: 'inset(0% 100% 0% 0%)' }, {
          clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut'
        })
        .fromTo(img, { scale: 1.14 }, { scale: 1, duration: 2.1, ease: 'expo.out' }, 0.15);
    });
  }

  function drifts() {
    $$('[data-drift]').forEach(function (img) {
      gsap.fromTo(img, { yPercent: -5 }, {
        yPercent: 5, ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  /* ------------------------------------------------------------------------
     Проекты: лента вбок на широком экране
     ------------------------------------------------------------------------ */
  function worksPan() {
    var track = $('#worksTrack');
    var distance = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
    var end = function () { return '+=' + distance(); };

    var pan = gsap.to(track, {
      x: function () { return -distance(); },
      ease: 'none',
      scrollTrigger: {
        trigger: '#projects', start: 'top top', end: end,
        pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1
      }
    });

    // Слово отстаёт от ленты: крупный план и дальний план едут с разной скоростью
    gsap.to('#worksWord', {
      x: function () { return distance() * 0.16; },
      ease: 'none',
      scrollTrigger: { trigger: '#projects', start: 'top top', end: end, scrub: 1, invalidateOnRefresh: true }
    });

    $$('[data-work]').forEach(function (card) {
      var frame = $('.work__frame', card);
      var img = $('img', frame);
      var meta = $('.work__meta', card);
      var reveal = function () {
        return { trigger: card, containerAnimation: pan, start: 'left 88%', toggleActions: 'play none none none' };
      };

      gsap.fromTo(img, { xPercent: -6 }, {
        xPercent: 6, ease: 'none',
        scrollTrigger: { trigger: card, containerAnimation: pan, start: 'left right', end: 'right left', scrub: true }
      });
      gsap.fromTo(frame, { clipPath: 'inset(0% 0% 0% 100%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: reveal()
      });
      gsap.fromTo(meta, { autoAlpha: 0, y: 16 }, {
        autoAlpha: 1, y: 0, duration: 1, delay: 0.4, ease: 'power3.out', clearProps: 'opacity,visibility,transform',
        scrollTrigger: reveal()
      });
    });
  }

  function worksStack() {
    $$('[data-work] .work__frame').forEach(function (frame) {
      gsap.fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut',
        scrollTrigger: { trigger: frame, start: 'top 85%', once: true }
      });
    });
  }

  /* ------------------------------------------------------------------------
     Процесс: из линий чертежа проступает дом
     ------------------------------------------------------------------------ */
  function processScene(pinned) {
    var phases = $$('#phases .phase');
    var fill = $('#phasesFill');

    var trigger = pinned
      ? { trigger: '#process', start: 'top top', end: '+=280%', pin: true, scrub: 1, anticipatePin: 1 }
      : { trigger: '#processFrame', start: 'top 75%', end: 'bottom 20%', scrub: 1 };

    var tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: trigger });

    tl.addLabel('site')
      .to('.drawing__site path', { strokeDashoffset: 0, duration: 1, stagger: 0.25 })
      .addLabel('mass', '+=0.15')
      .to('.drawing__mass path', { strokeDashoffset: 0, duration: 1, stagger: 0.2 }, 'mass')
      .addLabel('detail', '+=0.15')
      .to('.drawing__detail path', { strokeDashoffset: 0, duration: 0.7, stagger: 0.08 }, 'detail')
      .to('.drawing__notes text', { opacity: 1, duration: 0.4, stagger: 0.12 }, 'detail+=0.5')
      .addLabel('build', '+=0.2')
      .to('#processPhoto', { opacity: 1, duration: 1.1 }, 'build')
      .fromTo('#processPhoto', { scale: 1.08 }, { scale: 1, duration: 1.1 }, 'build')
      .to('#drawing', { opacity: 0, duration: 0.9 }, 'build+=0.35')
      .to({}, { duration: 0.35 });

    var marks = [tl.labels.site, tl.labels.mass, tl.labels.detail, tl.labels.build];
    var current = -1;

    tl.eventCallback('onUpdate', function () {
      var t = tl.time();
      var step = 0;
      for (var i = marks.length - 1; i >= 0; i--) { if (t >= marks[i]) { step = i; break; } }
      gsap.set(fill, { scaleY: tl.progress() });
      if (step === current) return;
      current = step;
      phases.forEach(function (phase, k) {
        phase.classList.toggle('is-active', k === step);
        phase.classList.toggle('is-done', k < step);
      });
    });

    if (pinned) {
      // Кадр слегка плывёт относительно текста, пока секция стоит
      gsap.fromTo('#processFrame', { yPercent: 3 }, {
        yPercent: -3, ease: 'none',
        scrollTrigger: { trigger: '#process', start: 'top top', end: '+=280%', scrub: true }
      });
    }

    return function () {
      phases.forEach(function (phase) { phase.classList.remove('is-active', 'is-done'); });
      phases[0].classList.add('is-active');
    };
  }

  /* ------------------------------------------------------------------------
     Услуги: активная строка меняет кадрирование фотографии
     ------------------------------------------------------------------------ */
  function initServices() {
    var list = $('#servicesList');
    var crop = $('#servicesCrop');
    if (!list || !crop) return;

    var items = $$('.service', list);
    var crops = [
      { scale: 1.06, xPercent: 0, yPercent: 0 },
      { scale: 1.18, xPercent: -6, yPercent: 3 },
      { scale: 1.15, xPercent: 5, yPercent: -3 }
    ];
    var current = 0;
    var hovering = false;

    gsap.set(crop, crops[0]);

    function activate(i) {
      if (i === current) return;
      current = i;
      items.forEach(function (item, k) { item.classList.toggle('is-active', k === i); });
      if (motion) {
        gsap.to(crop, Object.assign({ duration: 1.6, ease: 'power3.out', overwrite: 'auto' }, crops[i]));
      } else {
        gsap.set(crop, crops[i]);
      }
    }

    items.forEach(function (item, i) {
      item.addEventListener('pointerenter', function (event) {
        if (event.pointerType === 'touch') return;
        hovering = true;
        list.classList.add('is-hovering');
        activate(i);
      });
    });
    list.addEventListener('pointerleave', function () {
      hovering = false;
      list.classList.remove('is-hovering');
    });

    // Без наведения строка выбирается сама, по ходу прокрутки
    ScrollTrigger.create({
      trigger: list, start: 'top 70%', end: 'bottom 45%',
      onUpdate: function (self) {
        if (hovering) return;
        activate(Math.min(items.length - 1, Math.floor(self.progress * items.length)));
      }
    });
  }

  /* ========================================================================
     ОФОРМЛЕНИЕ: тема страницы, шкала-датум, шапка
     ======================================================================== */
  function initChrome() {
    var sections = $$('[data-section]');
    var nav = $('#nav');
    var links = $$('.nav__links a');
    var datum = $('#datum');
    var mark = $('#datumMark');
    var ticks = $('#datumTicks');
    var indexEl = $('#datumIndex');
    var labelEl = $('#datumLabel');
    var rule = $('#datumRule');
    var ruleWidth = 0;
    var active = null;

    // Секция в закреплении обёрнута в pin-spacer: мерить надо его
    function box(section) {
      var parent = section.parentElement;
      return parent && parent.classList.contains('pin-spacer') ? parent : section;
    }

    function layTicks() {
      ruleWidth = rule.getBoundingClientRect().width;
      var max = ScrollTrigger.maxScroll(window) || 1;
      ticks.textContent = '';
      sections.forEach(function (section) {
        var top = box(section).getBoundingClientRect().top + window.scrollY;
        var pin = document.createElement('i');
        pin.style.left = (Math.min(1, top / max) * 100).toFixed(2) + '%';
        ticks.appendChild(pin);
      });
    }

    function setSection(section) {
      if (section === active) return;
      active = section;
      var i = sections.indexOf(section);

      root.setAttribute('data-theme', section.dataset.theme);
      root.setAttribute('data-section', String(i));
      links.forEach(function (a) {
        a.classList.toggle('is-current', a.getAttribute('href') === '#' + section.id);
      });

      var num = String(i + 1).padStart(2, '0');
      var text = section.dataset.label;
      if (!motion) {
        indexEl.textContent = num;
        labelEl.textContent = text;
        return;
      }
      gsap.timeline()
        .to([indexEl, labelEl], { autoAlpha: 0, y: -6, duration: 0.25, ease: 'power2.in' })
        .add(function () { indexEl.textContent = num; labelEl.textContent = text; })
        .fromTo([indexEl, labelEl], { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power3.out' });
    }

    function update(self) {
      var middle = window.innerHeight / 2;
      for (var i = sections.length - 1; i >= 0; i--) {
        if (sections[i].getBoundingClientRect().top <= middle) { setSection(sections[i]); break; }
      }

      mark.style.setProperty('--x', (self.progress * ruleWidth).toFixed(1) + 'px');

      var y = self.scroll();
      nav.classList.toggle('is-docked', y > window.innerHeight * 0.6);
      nav.classList.toggle('is-hidden', y > window.innerHeight && self.direction === 1 && !root.classList.contains('menu-open'));
    }

    var progress = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: update });
    ScrollTrigger.addEventListener('refresh', function () {
      layTicks();
      update(progress);
    });
    setSection(sections[0]);
    layTicks();
  }

  /* ========================================================================
     БЕЗ GSAP: только тема по пересечению, всё остальное статично
     ======================================================================== */
  function staticMode() {
    root.classList.add('is-static');
    removeLoader();
    var datum = $('#datum');
    if (datum) datum.hidden = true;
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) root.setAttribute('data-theme', entry.target.dataset.theme);
      });
    }, { rootMargin: '-50% 0px -50% 0px' });
    $$('[data-section]').forEach(function (section) { io.observe(section); });
  }

  /* ========================================================================
     МЕНЮ, ЯКОРЯ, ВОПРОСЫ
     ======================================================================== */
  function initMenu() {
    var burger = $('#burger');
    var panel = $('#menu');
    if (!burger || !panel) return { close: function () {} };

    $$('a span', panel).forEach(function (span, i) {
      span.style.setProperty('--d', (0.08 + i * 0.06).toFixed(2) + 's');
    });

    function open() {
      panel.hidden = false;
      root.classList.add('menu-open');
      requestAnimationFrame(function () { panel.classList.add('is-open'); });
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Закрыть меню');
      if (lenis) lenis.stop();
    }

    function close() {
      if (burger.getAttribute('aria-expanded') !== 'true') return;
      panel.classList.remove('is-open');
      root.classList.remove('menu-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Открыть меню');
      if (lenis) lenis.start();
      window.setTimeout(function () {
        if (!panel.classList.contains('is-open')) panel.hidden = true;
      }, 600);
    }

    burger.addEventListener('click', function () {
      if (burger.getAttribute('aria-expanded') === 'true') close(); else open();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        close();
        burger.focus();
      }
    });

    return { close: close };
  }

  function initAnchors() {
    $$('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var hash = link.getAttribute('href');
        var target = hash === '#top' ? document.body : $(hash);
        if (!target) return;
        event.preventDefault();
        menu.close();

        if (lenis) {
          lenis.scrollTo(hash === '#top' ? 0 : target, {
            duration: 1.6,
            easing: function (t) { return 1 - Math.pow(1 - t, 4); }
          });
        } else {
          target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
        }

        if (hash === '#main') {
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }
      });
    });
  }

  function initFaq() {
    $$('.qa').forEach(function (qa) {
      var summary = $('summary', qa);
      var body = $('.qa__a', qa);

      summary.addEventListener('click', function (event) {
        if (!motion) return;
        event.preventDefault();

        if (qa.open) {
          qa.classList.add('is-closing');
          gsap.to(body, {
            height: 0, duration: 0.6, ease: 'power3.inOut',
            onComplete: function () {
              qa.open = false;
              qa.classList.remove('is-closing');
              gsap.set(body, { clearProps: 'height' });
              ScrollTrigger.refresh();
            }
          });
        } else {
          qa.open = true;
          gsap.fromTo(body, { height: 0 }, {
            height: 'auto', duration: 0.75, ease: 'power3.out',
            onComplete: function () {
              gsap.set(body, { clearProps: 'height' });
              ScrollTrigger.refresh();
            }
          });
        }
      });
    });
  }

  /* ========================================================================
     ПРОСМОТР ПРОЕКТА
     ======================================================================== */
  function initViewer() {
    var dialog = $('#viewer');
    var source = $('#worksData');
    if (!dialog || !source || typeof dialog.showModal !== 'function') return;

    var works = JSON.parse(source.textContent);
    var media = $('#viewerMedia');
    var img = $('#viewerImg');
    var body = $('#viewerBody');
    var title = $('#viewerTitle');
    var place = $('#viewerPlace');
    var text = $('#viewerText');
    var facts = $('#viewerFacts');
    var prevName = $('#viewerPrevName');
    var nextName = $('#viewerNextName');
    var index = 0;
    var busy = false;

    function src(work) { return '/work/aven/images/' + work.image + '.jpg'; }
    function at(i) { return (i + works.length) % works.length; }

    function fillText(i) {
      var work = works[i];
      title.textContent = work.name;
      place.textContent = work.place;
      text.textContent = work.text;
      facts.textContent = '';
      work.facts.forEach(function (fact) {
        var row = document.createElement('div');
        var dt = document.createElement('dt');
        var dd = document.createElement('dd');
        dt.textContent = fact[0];
        dd.textContent = fact[1];
        row.appendChild(dt);
        row.appendChild(dd);
        facts.appendChild(row);
      });
      prevName.textContent = works[at(i - 1)].name;
      nextName.textContent = works[at(i + 1)].name;
    }

    function open(i) {
      index = i;
      img.src = src(works[i]);
      img.alt = works[i].alt;
      fillText(i);
      dialog.showModal();
      if (lenis) lenis.stop();

      if (!motion) return;
      gsap.timeline()
        .fromTo(dialog, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' })
        .fromTo(media, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.inOut' }, 0)
        .fromTo(img, { scale: 1.15 }, { scale: 1, duration: 1.9, ease: 'expo.out' }, 0.1)
        .fromTo(body.children, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.07 }, 0.35);
    }

    function close() {
      function done() {
        dialog.close();
        if (motion) gsap.set([dialog, media, img], { clearProps: 'all' });
        if (lenis) lenis.start();
      }
      if (!motion) { done(); return; }
      gsap.to(dialog, { autoAlpha: 0, duration: 0.45, ease: 'power2.in', onComplete: done });
    }

    // Мягкий переход между проектами: новый кадр проявляется поверх старого
    function go(step) {
      if (busy) return;
      var next = at(index + step);
      index = next;

      if (!motion) {
        img.src = src(works[next]);
        img.alt = works[next].alt;
        fillText(next);
        return;
      }

      busy = true;
      var layer = img.cloneNode();
      layer.removeAttribute('id');
      layer.src = src(works[next]);
      layer.alt = '';
      media.appendChild(layer);

      var ready = layer.decode ? layer.decode().catch(function () {}) : Promise.resolve();
      ready.then(function () {
        gsap.timeline({
          onComplete: function () {
            img.src = layer.src;
            img.alt = works[next].alt;
            var settle = img.decode ? img.decode().catch(function () {}) : Promise.resolve();
            settle.then(function () { layer.remove(); busy = false; });
          }
        })
          .to(body.children, { autoAlpha: 0, y: -10, duration: 0.35, ease: 'power2.in', stagger: 0.03 }, 0)
          .fromTo(layer, { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.inOut' }, 0)
          .add(function () { fillText(next); }, 0.4)
          .fromTo(body.children, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06 }, 0.45);
      });
    }

    $$('[data-open]').forEach(function (button) {
      button.addEventListener('click', function () { open(Number(button.dataset.open)); });
    });
    $('#viewerClose').addEventListener('click', close);
    $('#viewerPrev').addEventListener('click', function () { go(-1); });
    $('#viewerNext').addEventListener('click', function () { go(1); });

    dialog.addEventListener('cancel', function (event) {
      event.preventDefault();
      close();
    });
    dialog.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight') go(1);
      if (event.key === 'ArrowLeft') go(-1);
    });
  }
})();
