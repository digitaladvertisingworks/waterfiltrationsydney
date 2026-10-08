/* Water Filtration Sydney: minimal vanilla JS
   1. Mobile navigation toggle
   2. Sticky-header background state
   3. Quote form: validation + submission
   -------------------------------------------------------------------------
   FORM SETUP: paste your form handler URL below (Formspree, Web3Forms, a
   Cloudflare Worker, etc). While it is left empty the form falls back to
   opening the visitor's email client with the enquiry pre-filled, so the
   site still works on a plain static host.                                */
const FORM_ENDPOINT = 'https://api.web3forms.com/submit';

/* Where a successful submission lands. Keep this in step with the hidden
   "redirect" input in the form markup. */
const THANK_YOU_URL = '/thank-you';
const FALLBACK_EMAIL = 'quote@waterfiltration.sydney';

(function () {
  'use strict';

  /* 1. Mobile navigation ------------------------------------------------ */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* 2. Sticky header ---------------------------------------------------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var setStuck = function () {
      header.classList.toggle('is-stuck', window.scrollY > 24);
    };
    setStuck();
    window.addEventListener('scroll', setStuck, { passive: true });
  }

  /* 3. Quote form ------------------------------------------------------- */
  var form = document.querySelector('form[data-quote-form]');
  if (!form) return;

  var status = form.querySelector('.form-status');
  var submit = form.querySelector('button[type="submit"]');
  var submitLabel = submit ? submit.textContent : '';

  var showStatus = function (message, ok) {
    if (!status) return;
    status.textContent = message;
    status.className = 'form-status ' + (ok ? 'form-status--ok' : 'form-status--error');
    status.hidden = false;
  };

  var markFields = function () {
    var firstInvalid = null;
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.type === 'submit') return;
      var field = el.closest('.field');
      if (!field) return;
      var bad = !el.checkValidity();
      field.classList.toggle('has-error', bad);
      var msg = field.querySelector('.error');
      if (msg && bad) msg.textContent = el.validationMessage;
      if (bad && !firstInvalid) firstInvalid = el;
    });
    return firstInvalid;
  };

  form.addEventListener('input', function (e) {
    var field = e.target.closest('.field');
    if (field && field.classList.contains('has-error') && e.target.checkValidity()) {
      field.classList.remove('has-error');
    }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var firstInvalid = markFields();
    if (firstInvalid) {
      showStatus('Please check the highlighted fields and try again.', false);
      firstInvalid.focus();
      return;
    }

    var data = new FormData(form);

    /* No endpoint configured: hand the enquiry to the visitor's mail app. */
    if (!FORM_ENDPOINT) {
      var lines = [];
      data.forEach(function (value, key) {
        if (key.charAt(0) !== '_') lines.push(key + ': ' + value);
      });
      window.location.href =
        'mailto:' + FALLBACK_EMAIL +
        '?subject=' + encodeURIComponent('Water filtration quote request') +
        '&body=' + encodeURIComponent(lines.join('\n'));
      showStatus('Your email app is opening with the enquiry ready to send. Prefer to talk? Call 0421 601 540.', true);
      return;
    }

    if (submit) { submit.disabled = true; submit.textContent = 'Sending…'; }

    fetch(FORM_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('Request failed');
        form.reset();
        /* Send the visitor to the thank-you page. It is the same destination
           Web3Forms uses for the no-JS fallback (the hidden "redirect" field),
           so both paths end on one URL: which is what a conversion goal in
           GA4 or Google Ads can be pointed at. */
        window.location.assign(THANK_YOU_URL);
      })
      .catch(function () {
        showStatus('Sorry, that did not send. Please call 0421 601 540 or email ' + FALLBACK_EMAIL + '.', false);
      })
      .finally(function () {
        if (submit) { submit.disabled = false; submit.textContent = submitLabel; }
      });
  });
})();

/* ---------------------------------------------------------------------------
   Logo marquee.

   The badge row is authored once, statically. This clones it so the loop is
   seamless, then shifts the track by exactly one set width plus one gap. Doing
   the maths in pixels rather than translateX(-50%) avoids the half-gap drift
   you get when a duplicated flex row is shifted by a percentage.

   It only engages when the badges actually overflow, so on a wide desktop the
   row stays centred and still, and it bails out entirely if the visitor has
   asked for reduced motion.
   ------------------------------------------------------------------------- */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SPEED = 45; /* pixels per second */

  function setup(box) {
    var list = box.querySelector('.proof-logos');
    if (!list) return;

    /* Reset so a resize re-measures against the original set, not a clone. */
    if (box.dataset.cloned === 'yes') {
      var originals = list.querySelectorAll('[data-clone]');
      for (var i = 0; i < originals.length; i++) originals[i].remove();
      box.dataset.cloned = 'no';
      box.classList.remove('is-scrolling');
    }

    if (reduce) return;

    /* .proof-logos wraps by default, so it never overflows and scrollWidth is
       useless as an overflow test. Measure the row unwrapped instead, then put
       it back before deciding anything. */
    var prevWrap = list.style.flexWrap;
    var prevWidth = list.style.width;
    list.style.flexWrap = 'nowrap';
    list.style.width = 'max-content';
    var natural = list.scrollWidth;
    list.style.flexWrap = prevWrap;
    list.style.width = prevWidth;

    if (natural <= box.clientWidth) return;

    var gap = parseFloat(getComputedStyle(list).columnGap) || 0;
    var shift = natural + gap;

    var items = list.children;
    var count = items.length;
    for (var j = 0; j < count; j++) {
      var copy = items[j].cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      copy.setAttribute('data-clone', '');
      list.appendChild(copy);
    }

    box.style.setProperty('--marquee-shift', shift + 'px');
    box.style.setProperty('--marquee-duration', (shift / SPEED).toFixed(2) + 's');
    box.dataset.cloned = 'yes';
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

/* Google review carousel ---------------------------------------------------
   The track is a native scroll-snap row, so it already swipes and scrolls.
   This adds: arrow buttons that page by one card, arrow disabled states at
   each end, and a More/Less toggle on reviews too long for the card.       */
(function () {
  'use strict';

  var stages = document.querySelectorAll('[data-review-carousel]');

  function setup(stage) {
    var track = stage.querySelector('.reviews__track');
    var prev = stage.querySelector('.reviews__nav--prev');
    var next = stage.querySelector('.reviews__nav--next');
    var cards = track.querySelectorAll('.review-card');

    function step() {
      var card = cards[0];
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return card ? card.getBoundingClientRect().width + gap : track.clientWidth;
    }

    function sync() {
      var max = track.scrollWidth - track.clientWidth;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max - 2;
      stage.classList.toggle('is-static', max <= 2);
    }

    /* Show More only where the clamp actually cut text off. */
    function checkClamps() {
      for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        var text = card.querySelector('.review-card__text');
        var more = card.querySelector('.review-card__more');
        if (!text || !more || card.classList.contains('is-open')) continue;
        more.hidden = text.scrollHeight <= text.clientHeight + 1;
      }
    }

    prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });

    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
    });

    track.addEventListener('click', function (e) {
      var more = e.target.closest('.review-card__more');
      if (!more) return;
      var open = more.closest('.review-card').classList.toggle('is-open');
      more.textContent = open ? 'Less' : 'More';
      more.setAttribute('aria-expanded', String(open));
    });

    var ticking = false;
    track.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { sync(); ticking = false; });
    }, { passive: true });

    var timer;
    window.addEventListener('resize', function () {
      clearTimeout(timer);
      timer = setTimeout(function () { checkClamps(); sync(); }, 150);
    });

    checkClamps();
    sync();
  }

  for (var i = 0; i < stages.length; i++) setup(stages[i]);
})();

/* Find your fit -------------------------------------------------------------
   The three picks swap the description, the product card and which spots
   light up on the house. A card's button also pre-selects the matching
   option in the quote form, so the visitor does not answer twice.         */
(function () {
  'use strict';

  var fit = document.querySelector('[data-fit]');
  if (!fit) return;

  var picks = fit.querySelectorAll('[data-fit-pick]');
  var panes = fit.querySelectorAll('[data-fit-show]');
  var spots = fit.querySelectorAll('.fit-hs');

  function show(mode) {
    fit.setAttribute('data-fit', mode);
    for (var i = 0; i < picks.length; i++) {
      picks[i].setAttribute('aria-pressed', String(picks[i].getAttribute('data-fit-pick') === mode));
    }
    for (var j = 0; j < panes.length; j++) {
      panes[j].hidden = panes[j].getAttribute('data-fit-show') !== mode;
    }
    for (var k = 0; k < spots.length; k++) {
      var on = (' ' + spots[k].getAttribute('data-on') + ' ').indexOf(' ' + mode + ' ') !== -1;
      spots[k].classList.toggle('is-on', on);
    }
  }

  for (var i = 0; i < picks.length; i++) {
    picks[i].addEventListener('click', function () { show(this.getAttribute('data-fit-pick')); });
  }

  fit.addEventListener('click', function (e) {
    var link = e.target.closest('[data-need]');
    if (!link) return;
    var radios = document.querySelectorAll('input[name="Filtration required"]');
    for (var r = 0; r < radios.length; r++) {
      if (radios[r].value === link.getAttribute('data-need')) radios[r].checked = true;
    }
  });

  show(fit.getAttribute('data-fit') || 'both');
})();
