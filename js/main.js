/* Safe Water Filtration — minimal vanilla JS
   1. Mobile navigation toggle
   2. Sticky-header background state
   3. Quote form: validation + submission
   -------------------------------------------------------------------------
   FORM SETUP: paste your form handler URL below (Formspree, Web3Forms, a
   Cloudflare Worker, etc). While it is left empty the form falls back to
   opening the visitor's email client with the enquiry pre-filled, so the
   site still works on a plain static host.                                */
const FORM_ENDPOINT = '';
const FALLBACK_EMAIL = 'accounts@safewaterfiltration.com.au';

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

    /* No endpoint configured — hand the enquiry to the visitor's mail app. */
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
        showStatus('Thanks — your quote request has been sent. We will be in touch shortly. For anything urgent, call 0421 601 540.', true);
      })
      .catch(function () {
        showStatus('Sorry, that did not send. Please call 0421 601 540 or email ' + FALLBACK_EMAIL + '.', false);
      })
      .finally(function () {
        if (submit) { submit.disabled = false; submit.textContent = submitLabel; }
      });
  });
})();
