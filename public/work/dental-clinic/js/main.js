/* ==========================================================================
   Dental Clinic — интерактив лендинга
   Все кнопки отрабатывают нажатие, но никуда не уводят: вместо перехода —
   тост, раскрытие блока, модалка или отклик формы.
   ========================================================================== */
(function () {
  'use strict';

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var topbar = document.getElementById('topbar');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.mainnav a'));
  var toastEl = document.getElementById('toast');
  var toastTimer = null;

  /* ---------- Тост ---------- */
  function toast(text) {
    if (!toastEl) return;
    toastEl.textContent = text;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 3400);
  }

  /* ---------- Волна по клику ---------- */
  document.addEventListener('pointerdown', function (e) {
    var el = e.target.closest('.btn, .linkbtn, .pricelist__toggle');
    if (!el || calm) return;
    var box = el.getBoundingClientRect();
    var size = Math.max(box.width, box.height);
    var wave = document.createElement('span');
    wave.className = 'ripple';
    wave.style.width = wave.style.height = size + 'px';
    wave.style.left = (e.clientX - box.left - size / 2) + 'px';
    wave.style.top = (e.clientY - box.top - size / 2) + 'px';
    el.appendChild(wave);
    setTimeout(function () { wave.remove(); }, 620);
  });

  /* ---------- Плавная прокрутка с поправкой на шапку ---------- */
  function scrollToId(id) {
    var target = document.querySelector(id);
    if (!target) return;
    var offset = topbar.offsetHeight + 14;
    var y = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: Math.max(y, 0), behavior: calm ? 'auto' : 'smooth' });
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest('[data-scroll]');
    if (!link) return;
    var hash = link.getAttribute('href');
    if (!hash || hash.charAt(0) !== '#') return;
    e.preventDefault();
    closeMenu();
    scrollToId(hash);
  });

  /* ---------- Шапка: фон при прокрутке ---------- */
  function onScroll() {
    topbar.classList.toggle('is-solid', window.pageYOffset > 40);
    if (window.pageYOffset < 240) {
      navLinks.forEach(function (a) { a.classList.remove('is-active'); });
    }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Мобильное меню ---------- */
  var burger = document.querySelector('.burger');
  var mainnav = document.getElementById('mainnav');

  function closeMenu() {
    if (!burger) return;
    burger.setAttribute('aria-expanded', 'false');
    mainnav.classList.remove('is-open');
  }
  if (burger) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      mainnav.classList.toggle('is-open', !open);
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.topbar')) closeMenu();
    });
  }

  /* ---------- Активный пункт меню ---------- */
  var watched = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && watched.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    watched.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------- Появление блоков при прокрутке ---------- */
  var revealables = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealables.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Раскрывающиеся блоки ---------- */
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-toggle]');
    if (!trigger) return;
    var panel = document.getElementById(trigger.getAttribute('data-toggle'));
    if (!panel) return;
    var open = trigger.getAttribute('aria-expanded') === 'true';
    trigger.setAttribute('aria-expanded', String(!open));
    panel.hidden = open;
    var label = trigger.querySelector('span');
    if (label && trigger.classList.contains('pricelist__toggle')) {
      label.textContent = open ? 'Показать остальные позиции прайса' : 'Свернуть прайс';
    }
  });

  /* ---------- Копирование телефона и почты ---------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-copy]');
    if (!el) return;
    e.preventDefault();
    var value = el.getAttribute('data-copy');
    var done = function () { toast('Скопировано: ' + value); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(value).then(done, done);
    } else {
      done();
    }
  });

  /* ---------- Кнопки-заглушки ---------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-toast]');
    if (!el) return;
    toast(el.getAttribute('data-toast'));
  });

  /* ---------- Сравнение «до / после» ---------- */
  document.querySelectorAll('[data-ba]').forEach(function (box) {
    var range = box.querySelector('.ba__range');
    if (!range) return;
    var sync = function () { box.style.setProperty('--pos', range.value + '%'); };
    range.addEventListener('input', sync);
    sync();
  });

  /* ---------- Карусель кейсов ---------- */
  var track = document.getElementById('casesTrack');
  if (track) {
    document.querySelectorAll('[data-cases]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = track.firstElementChild;
        if (!card) return;
        var step = card.getBoundingClientRect().width + 24;
        var dir = btn.getAttribute('data-cases') === 'next' ? 1 : -1;
        track.scrollBy({ left: step * dir, behavior: calm ? 'auto' : 'smooth' });
      });
    });
  }

  /* ---------- Модалка записи ---------- */
  var modal = document.getElementById('modal');
  var lastFocus = null;

  function openModal() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('is-locked');
    var first = modal.querySelector('input, select') || modal.querySelector('button');
    if (first) first.focus({ preventScroll: true });
  }
  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('is-locked');
    resetForm(modal.querySelector('[data-form]'));
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-open-modal]')) { openModal(); return; }
    if (e.target.closest('[data-close-modal]')) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (modal.hidden) return;
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key !== 'Tab') return;
    var focusable = modal.querySelectorAll('a[href], button, input, select, textarea');
    var list = Array.prototype.filter.call(focusable, function (el) { return !el.disabled && el.offsetParent !== null; });
    if (!list.length) return;
    var first = list[0];
    var last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ---------- Маска телефона ---------- */
  function maskPhone(input) {
    var digits = input.value.replace(/\D/g, '');
    if (digits.charAt(0) === '8') digits = '7' + digits.slice(1);
    if (digits.charAt(0) !== '7') digits = '7' + digits;
    digits = digits.slice(0, 11);

    var out = '+7';
    if (digits.length > 1) out += ' (' + digits.slice(1, 4);
    if (digits.length >= 5) out += ') ' + digits.slice(4, 7);
    if (digits.length >= 8) out += '-' + digits.slice(7, 9);
    if (digits.length >= 10) out += '-' + digits.slice(9, 11);
    input.value = out;
  }

  document.querySelectorAll('input[type="tel"]').forEach(function (input) {
    input.addEventListener('input', function () { maskPhone(input); });
    input.addEventListener('focus', function () { if (!input.value) input.value = '+7 ('; });
    input.addEventListener('blur', function () { if (input.value.replace(/\D/g, '').length < 2) input.value = ''; });
  });

  /* ---------- Формы ---------- */
  function setError(field, message) {
    if (!field) return;
    field.classList.toggle('is-bad', Boolean(message));
    var slot = field.querySelector('[data-err]');
    if (slot) slot.textContent = message || '';
  }

  function validate(form) {
    var ok = true;
    var name = form.querySelector('input[name="name"]');
    var phone = form.querySelector('input[name="phone"]');
    var agree = form.querySelector('input[name="agree"]');

    if (!name.value.trim()) { setError(name.closest('.field'), 'Укажите, как к вам обращаться'); ok = false; }
    else setError(name.closest('.field'), '');

    if (phone.value.replace(/\D/g, '').length < 11) { setError(phone.closest('.field'), 'Нужен номер из 11 цифр'); ok = false; }
    else setError(phone.closest('.field'), '');

    var check = agree.closest('.check');
    if (!agree.checked) {
      check.classList.add('is-bad');
      check.querySelector('[data-err]').textContent = 'Отметьте согласие';
      ok = false;
    } else {
      check.classList.remove('is-bad');
      check.querySelector('[data-err]').textContent = '';
    }
    return ok;
  }

  function resetForm(form) {
    if (!form) return;
    var done = form.parentNode.querySelector('.formdone');
    if (done) done.remove();
    form.hidden = false;
    form.reset();
    form.querySelectorAll('.is-bad').forEach(function (el) { el.classList.remove('is-bad'); });
    form.querySelectorAll('[data-err]').forEach(function (el) { el.textContent = ''; });
  }

  document.querySelectorAll('[data-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(form)) return;

      var inModal = Boolean(form.closest('.modal'));
      var done = document.createElement('div');
      done.className = 'formdone';
      done.innerHTML =
        '<b>Заявка принята</b>' +
        '<span>Администратор перезвонит в течение 15 минут и подтвердит время приёма.</span>';

      form.hidden = true;
      form.parentNode.insertBefore(done, form.nextSibling);
      toast('Заявка отправлена — перезвоним в течение 15 минут');

      if (inModal) setTimeout(function () { if (!modal.hidden) closeModal(); }, 2800);
      else setTimeout(function () { resetForm(form); }, 7000);
    });

    form.addEventListener('input', function (e) {
      var field = e.target.closest('.field, .check');
      if (!field || !field.classList.contains('is-bad')) return;
      field.classList.remove('is-bad');
      var slot = field.querySelector('[data-err]');
      if (slot) slot.textContent = '';
    });
  });
})();
