/* Water Filtration Sydney install lander v2: menu, carousels, scroll-to-form, form states. */
(function () {
  'use strict';

  /* Mobile menu */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('main-nav');
  if (toggle && nav) {
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', function () { setOpen(!nav.classList.contains('is-open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
  }

  /* Carousels: prev/next scroll the track by one card */
  Array.prototype.forEach.call(document.querySelectorAll('[data-carousel]'), function (box) {
    var track = box.querySelector('.track');
    if (!track) return;
    var step = function () {
      var card = track.querySelector('li');
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return card ? card.getBoundingClientRect().width + gap : track.clientWidth;
    };
    var prev = box.querySelector('.arrow--prev');
    var next = box.querySelector('.arrow--next');
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
  });

  /* Autoplay: [data-autoplay] carousels advance every few seconds, loop at the end,
     pause while hovered, focused or touched, and stay still for reduced-motion users. */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-carousel][data-autoplay]'), function (box) {
      var track = box.querySelector('.track');
      if (!track) return;
      var paused = false, visible = false, resumeAt = 0;
      var hold = function () { paused = true; };
      var release = function () { paused = false; resumeAt = Date.now() + 4000; };
      ['mouseenter', 'focusin', 'touchstart', 'pointerdown'].forEach(function (t) { box.addEventListener(t, hold, { passive: true }); });
      ['mouseleave', 'focusout', 'touchend', 'pointerup'].forEach(function (t) { box.addEventListener(t, release, { passive: true }); });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(box);
      } else { visible = true; }
      setInterval(function () {
        if (paused || !visible || document.hidden || Date.now() < resumeAt) return;
        var card = track.querySelector('li');
        var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        var step = card ? card.getBoundingClientRect().width + gap : track.clientWidth;
        if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) track.scrollTo({ left: 0, behavior: 'smooth' });
        else track.scrollBy({ left: step, behavior: 'smooth' });
      }, 3200);
    });
  }

  /* Quote buttons scroll to the hero form and focus the first field */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('[data-hero-quote]');
    if (!link) return;
    var card = document.getElementById('quote');
    if (!card) return;
    e.preventDefault();
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (link.dataset.product) {
      Array.prototype.forEach.call(document.querySelectorAll('select[name="product"]'), function (sel) { sel.value = link.dataset.product; });
    }
    var first = card.querySelector('input:not([type=hidden]):not(.hp)');
    if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 450);
  });

  /* Forms: native validation, mirrored to aria-invalid for styling and screen readers */
  Array.prototype.forEach.call(document.querySelectorAll('form.lead-form'), function (form) {
    Array.prototype.forEach.call(form.querySelectorAll('input, select'), function (el) {
      el.addEventListener('invalid', function () {
        el.setAttribute('aria-invalid', 'true');
        if (el.name === 'phone' && el.validity.patternMismatch) el.setCustomValidity('Please enter a valid mobile number.');
      });
      var clear = function () {
        el.setCustomValidity('');
        if (el.checkValidity()) el.removeAttribute('aria-invalid');
      };
      el.addEventListener('input', clear);
      el.addEventListener('change', clear);
    });
  });

  /* Ad-group message match: ?product=under-sink (or ?service=) swaps the H1 service phrase.
     The form's service select is preselected from the same parameter by lead-fields.js. */
  var svc = document.querySelector('[data-hero-service]');
  var q = new URLSearchParams(location.search);
  var key = (q.get('product') || q.get('service') || '').toLowerCase();
  var phrases = [
    [/under|sink|tap/, 'Under-Sink Water Filter Installation', 'Under-sink drinking water'],
    [/reverse|^ro/, 'Reverse Osmosis Installation', 'Reverse osmosis'],
    [/whole|house|home/, 'Whole House Water Filter Installation', 'Whole-house filtration'],
    [/commercial|business/, 'Commercial Water Filtration', 'Filtration for a business'],
    [/servic|replac|cartridge/, 'Water Filter Servicing', 'Service an existing system']
  ];
  if (key) {
    for (var i = 0; i < phrases.length; i++) {
      if (!phrases[i][0].test(key)) continue;
      if (svc) svc.textContent = phrases[i][1];
      Array.prototype.forEach.call(document.querySelectorAll('select[name="product"]'), function (sel) {
        if (!sel.value) sel.value = phrases[i][2];
      });
      break;
    }
  }

  /* Phone clicks count as leads in Google Ads */
  document.addEventListener('click', function (e) {
    var tel = e.target.closest('a[href^="tel:"]');
    if (tel && typeof window.gtag === 'function') {
      window.gtag('event', 'phone_click', { transport_type: 'beacon' });
    }
  });
})();

/* "We're Open Now" pill: live Sydney time, open/closed from data-open / data-close
   (24h decimal hours, every day: 6 = 6:00am, 23.5 = 11:30pm). */
(function () {
  'use strict';
  var pill = document.querySelector('[data-open-pill]');
  if (!pill || !window.Intl) return;
  var label = pill.querySelector('.open-pill__label');
  var time = pill.querySelector('.open-pill__time');
  var open = Number(pill.getAttribute('data-open'));
  var close = Number(pill.getAttribute('data-close'));
  var clock = new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Sydney', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  var hm = new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Sydney', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  function tick() {
    var now = new Date();
    var parts = hm.format(now).split(':');
    var h = Number(parts[0]) + Number(parts[1]) / 60;
    var isOpen = h >= open && h < close;
    pill.classList.toggle('is-closed', !isOpen);
    label.textContent = isOpen ? "We're Open Now" : 'Closed - Request a quote';
    time.textContent = clock.format(now).toUpperCase();
  }
  tick();
  pill.hidden = false;
  setInterval(tick, 1000);
})();

/* Accreditation marquee (2026-11-20) ----------------------------------------
   The badge row above Recent Installations is authored once, statically. This
   clones it so the loop is seamless, then shifts the track by exactly one set
   width plus one gap. Doing the maths in pixels rather than translateX(-50%)
   avoids the half-gap drift a duplicated flex row gets from a percentage.

   It only engages when the badges actually overflow, so on a wide desktop the
   row stays centred and still, and it bails out entirely under reduced motion. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SPEED = 45; /* pixels per second */

  function setup(box) {
    var list = box.querySelector('.proof-logos');
    if (!list) return;

    /* Reset so a resize re-measures against the original set, not a clone. */
    if (box.getAttribute('data-cloned') === 'yes') {
      var clones = list.querySelectorAll('[data-clone]');
      for (var i = 0; i < clones.length; i++) clones[i].remove();
      box.setAttribute('data-cloned', 'no');
      box.classList.remove('is-scrolling');
    }

    if (reduce) return;

    /* .proof-logos wraps by default, so it never overflows and scrollWidth is
       useless as an overflow test. Measure the row unwrapped, then put it back. */
    var prevWrap = list.style.flexWrap;
    var prevWidth = list.style.width;
    list.style.flexWrap = 'nowrap';
    list.style.width = 'max-content';
    var natural = list.scrollWidth;
    list.style.flexWrap = prevWrap;
    list.style.width = prevWidth;

    var gap = parseFloat(getComputedStyle(list).columnGap) || 0;
    var shift = natural + gap;

    /* The row always scrolls, including on a wide desktop where one set fits.
       Repeat the set until the track is at least twice the visible width, so
       the loop never shows a gap, then shift by exactly one set. */
    var sets = Math.max(1, Math.ceil((box.clientWidth * 2) / shift));
    var items = list.children;
    var count = items.length;
    for (var copyNo = 0; copyNo < sets; copyNo++) {
      for (var j = 0; j < count; j++) {
        var copy = items[j].cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        copy.setAttribute('data-clone', '');
        list.appendChild(copy);
      }
    }

    box.style.setProperty('--marquee-shift', shift + 'px');
    box.style.setProperty('--marquee-duration', (shift / SPEED).toFixed(2) + 's');
    box.setAttribute('data-cloned', 'yes');
    box.classList.add('is-scrolling');
  }

  function init() {
    var boxes = document.querySelectorAll('[data-marquee]');
    for (var i = 0; i < boxes.length; i++) setup(boxes[i]);
  }

  init();

  var timer;
  window.addEventListener('resize', function () {
    clearTimeout(timer);
    timer = setTimeout(init, 250);
  });
})();
