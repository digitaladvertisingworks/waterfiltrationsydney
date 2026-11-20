/* Water Filtration Sydney v2: behaviour for the sub pages.
   1. contact-us.html: the optional email / job-details fields open from one link.
   2. thank-you.html: greet the lead by first name and name what they asked about,
      using the values lead-fields.js stored at submit time (never from the URL).
   Both parts are optional: if the markup is not on the page, nothing happens. */
(function () {
  'use strict';

  /* ---- 1. "+ Add email and job details" toggle ---------------------------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-more-toggle]'), function (btn) {
    var box = document.getElementById(btn.getAttribute('aria-controls'));
    if (!box) return;
    var open = function (focus) {
      box.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      btn.hidden = true;
      if (focus) {
        var first = box.querySelector('input, textarea, select');
        if (first) first.focus({ preventScroll: true });
      }
    };
    btn.addEventListener('click', function () { open(true); });
    // If anything inside ever fails validation while hidden, open the box so the
    // visitor can see the field the browser is complaining about.
    Array.prototype.forEach.call(box.querySelectorAll('input, select, textarea'), function (el) {
      el.addEventListener('invalid', function () { if (box.hidden) open(false); });
    });
    // Browsers restore typed values on Back: keep the box open if anything is filled.
    window.addEventListener('pageshow', function () {
      var filled = Array.prototype.some.call(box.querySelectorAll('input, textarea'), function (el) { return el.value; });
      if (filled && box.hidden) open(false);
    });
  });

  /* ---- 2. Thank-you page personalisation --------------------------------- */
  var hello = document.querySelector('[data-thanks-name]');
  var asked = document.querySelector('[data-thanks-product]');
  if (!hello && !asked) return;

  var read = function (k) { try { return sessionStorage.getItem('lf_' + k) || ''; } catch (e) { return ''; } };
  var clean = function (s) { return String(s).replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40); };

  var name = clean(read('name')).split(' ')[0];
  if (name && hello && /^[A-Za-z][A-Za-z'\-]{1,24}$/.test(name)) {
    hello.textContent = ', ' + name.charAt(0).toUpperCase() + name.slice(1);
  }

  var product = clean(read('product'));
  var suburb = clean(read('suburb'));
  if (asked && product) {
    asked.textContent = suburb
      ? 'Your enquiry about ' + product.toLowerCase() + ' in ' + suburb + ' is with us.'
      : 'Your enquiry about ' + product.toLowerCase() + ' is with us.';
    asked.hidden = false;
  }
})();
