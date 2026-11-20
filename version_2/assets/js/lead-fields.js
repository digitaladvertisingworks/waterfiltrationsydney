// Lead form enrichment for Web3Forms (from the web3forms-lead-forms skill).
// On submit it fills: unique subject (service + suburb + time), ad source (gclid/utm), landing page,
// "Source page URL" and, last of all, "Time submitted" so those two print at the bottom of the lead email.
// - Native-post forms (<form class="lead-form"> with a hidden "redirect"): handled automatically.
// - fetch/AJAX forms: add data-ajax to the <form>, then call LeadFields.fill(form) just before fetch().
// Load order: photo-upload.js, then this file, then any page script.
(function(){
  var SUBJECT = 'New water filtration quote request';
  var TZ = 'Australia/Sydney';
  var KEY = 'lf_';                                  // sessionStorage prefix

  // ---- ad source capture (persists for the browser session)
  var store = function(k, v){ try { if (v) sessionStorage.setItem(KEY + k, v); } catch (e) {} };
  var load = function(k){ try { return sessionStorage.getItem(KEY + k) || ''; } catch (e) { return ''; } };
  var params = new URLSearchParams(location.search);
  ['gclid', 'gbraid', 'wbraid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term'].forEach(function(k){ store(k, params.get(k)); });
  store('landing', load('landing') || location.pathname + location.search);

  // business-time parts in plain ASCII, e.g. { date: 'Sun 12 Oct 2026', short: '12 Oct', time: '3:42:17pm', tz: 'AEDT' }
  var now = function(){
    var d = new Date(), o = {};
    try {
      new Intl.DateTimeFormat('en-AU', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true, timeZoneName: 'short' })
        .formatToParts(d).forEach(function(x){ o[x.type] = x.value; });
      return { date: o.weekday + ' ' + o.day + ' ' + o.month + ' ' + o.year, short: o.day + ' ' + o.month, time: o.hour + ':' + o.minute + ':' + o.second + (o.dayPeriod || '').toLowerCase(), tz: o.timeZoneName || '' };
    } catch (e) { return { date: d.toDateString(), short: d.toDateString(), time: d.toTimeString().slice(0, 8), tz: '' }; }
  };

  var fill = function(form){
    var set = function(name, value){
      var el = form.querySelector('input[name="' + name + '"]');
      if (!el) { el = document.createElement('input'); el.type = 'hidden'; el.name = name; form.appendChild(el); }
      el.value = value || '';
    };
    var val = function(n){ var el = form.elements[n]; return el ? String(el.value).replace(/\s+/g, ' ').trim().slice(0, 40) : ''; };
    set('Lead source', load('gclid') ? 'Google Ads' : (load('utm_source') || (document.referrer ? 'Referral/organic' : 'Direct')));
    set('Campaign', load('utm_campaign'));
    set('Search keyword', load('utm_term'));
    set('Landing page', load('landing'));
    set('gclid', load('gclid') || load('gbraid') || load('wbraid'));
    set('Source page URL', location.origin + location.pathname + location.search);
    // unique subject per lead so Gmail never merges notifications into one thread
    var t = now();
    set('subject', [SUBJECT, val('product'), val('suburb'), t.short + ' ' + t.time].filter(Boolean).join(' - '));
    set('Time submitted', t.date + ', ' + t.time + ' ' + t.tz); // created last so it prints at the bottom
  };
  window.LeadFields = { fill: fill };

  /* ?product= slugs. Keys are what the links use; values match a select option. */
  function slug(v){ return String(v).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
  var ALIASES = {
    'ro': 'Reverse osmosis',
    'home-bundle': 'Home Filtration',
    'business': 'Filtration for a business',
    'commercial': 'Filtration for a business',
    'service': 'Service an existing system',
    'not-sure': 'Not sure yet'
  };

  Array.prototype.forEach.call(document.querySelectorAll('form.lead-form'), function(form){
    // preselect the service from ?product=under-sink etc. (ad landing pages).
    // Matching is on slugs, so both the short link (?product=whole-house) and an
    // older full-text link (?product=Whole-house%20filtration) still resolve.
    var p = params.get('product'), sel = form.querySelector('select[name="product"]');
    if (p && sel) {
      var want = slug(ALIASES[slug(p)] || p);
      if (want) Array.prototype.forEach.call(sel.options, function(o){
        var v = o.value || o.text;
        if (v && slug(v).indexOf(want) === 0) sel.value = o.value || o.text;
      });
    }
    if (form.hasAttribute('data-ajax')) return;
    form.addEventListener('submit', function(){
      fill(form);
      try {
        sessionStorage.setItem(KEY + 'submitted', String(Date.now())); // thank-you page checks this before firing the conversion
        // the thank-you page greets the lead by name and repeats what they asked about
        ['name', 'suburb', 'product'].forEach(function(n){
          var el = form.elements[n];
          if (el) sessionStorage.setItem(KEY + n, String(el.value).replace(/\s+/g, ' ').trim().slice(0, 40));
        });
      } catch (e) {}
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.dataset.label = btn.dataset.label || btn.textContent; btn.disabled = true; btn.textContent = 'Sending...'; }
    });
  });
  // re-enable buttons if the visitor comes back with the Back button
  window.addEventListener('pageshow', function(){
    Array.prototype.forEach.call(document.querySelectorAll('form.lead-form button[type="submit"]'), function(b){
      if (b.dataset.label) { b.disabled = false; b.textContent = b.dataset.label; }
    });
  });
})();
