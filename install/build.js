#!/usr/bin/env node
/* Google Ads landing page for install.waterfiltration.sydney.
 *
 *   node install/build.js     rebuild install/public/ from the built main site
 *
 * Run `npm run build` first: this reads the committed index.html and
 * thank-you.html at the repo root, so the lander always matches the homepage.
 *
 * What changes versus the main site
 *   - noindex on every page (paid traffic only; the main site owns rankings)
 *   - no canonical, no JSON-LD, no /business-info preload
 *   - pages in LOCAL are served here too and keep their links;
 *   - links to other main-site pages are removed so visitors stay on the form;
 *     legal pages and the licence "Verify" link stay, opening the main site
 *     in a new tab
 *   - the form's no-JS redirect lands on this subdomain's /thank-you, where
 *     the Google Ads conversion fires
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(__dirname, 'public');
const MAIN = 'https://waterfiltration.sydney';
const SELF = 'https://install.waterfiltration.sydney';
const LOCAL = ['contact-us', 'thank-you'];
const KEEP = ['transparency', 'privacy-policy', 'terms-and-conditions', 'terms-of-sale',
  'returns-and-refunds-policy', 'shipping-policy', 'website-disclaimer'];

/* Regional copies of the lander, served at /<slug>. Each is the Sydney page
 * with areaSwaps() applied; a swap that no longer matches the homepage fails
 * the build rather than silently leaving "Sydney" copy on a regional page.
 * The recent-install photos are Sydney jobs, so their suburbs are dropped,
 * never relabelled as local work. */
const AREAS = {
  newcastle: {
    name: 'Newcastle',
    suburbs: ['Newcastle CBD &amp; East', 'Merewether', 'The Junction', 'Hamilton', 'Adamstown', 'Lambton',
      'New Lambton', 'Kotara', 'Waratah', 'Mayfield', 'Jesmond', 'Wallsend'],
  },
  wollongong: {
    name: 'Wollongong',
    suburbs: ['Wollongong CBD', 'North Wollongong', 'Fairy Meadow', 'Towradgi', 'Corrimal', 'Woonona',
      'Bulli', 'Thirroul', 'Figtree', 'Mangerton', 'Unanderra', 'Dapto'],
  },
  'central-coast': {
    name: 'Central Coast',
    place: 'the Central Coast', // "across the Central Coast"
    inPlace: 'on the Central Coast',
    suburbs: ['Gosford', 'Erina', 'Terrigal', 'Kincumber', 'Woy Woy', 'Umina Beach', 'Tuggerah', 'Wyong',
      'The Entrance', 'Toukley', 'Lake Haven', 'Budgewoi'],
  },
  canberra: {
    name: 'Canberra',
    state: '', // ACT, so no "NSW plumber" in the meta description
    suburbs: ['Canberra City', 'Belconnen', 'Gungahlin', 'Inner North', 'Inner South', 'Woden', 'Weston Creek',
      'Molonglo Valley', 'Tuggeranong', 'Kingston', 'Queanbeyan', 'Jerrabomberra'],
  },
};

function areaSwaps(slug, { name, place = name, inPlace = `in ${place}`, state = 'NSW', suburbs }) {
  return [
    ['<title>Water Filtration Sydney | Water Filter Installation by Licensed Plumbers</title>',
     `<title>Water Filter Installation ${name} | Licensed Plumbers</title>`],
    ['Water filter installation across Sydney by a licensed plumber',
     `Water filter installation across ${place} by a licensed plumber`],
    ['<meta property="og:title" content="Water Filtration Sydney | Water Filter Installation by Licensed Plumbers">',
     `<meta property="og:title" content="Water Filter Installation ${name} | Licensed Plumbers">`],
    ['installed by a licensed Sydney plumber.', `installed by a licensed ${state ? state + ' ' : ''}plumber ${inPlace}.`],
    ['<meta property="og:url" content="https://waterfiltration.sydney/">',
     `<meta property="og:url" content="${SELF}/${slug}">`],
    ['in a bright Sydney kitchen', 'in a bright kitchen'],
    ['Water Filtration Installation Service &middot; Sydney', `Water Filtration Installation Service &middot; ${name}`],
    ['Water filter installation across Sydney: we size', `Water filter installation across ${place}: we size`],
    ['New water filtration quote request: waterfiltration.sydney"',
     `New water filtration quote request: ${name.toUpperCase()} (install lander)">\n            <input type="hidden" name="Landing page" value="${name}"`],
    ['<span class="eyebrow">Installed Across Sydney</span>', '<span class="eyebrow">Recent Work By Our Team</span>'],
    ['Real homes, real installations and filtration systems fitted by our licensed Sydney team.',
     'Real homes, real installations and filtration systems fitted by our licensed team.'],
    [/<figcaption class="recent-install__chip"><strong>[^<]*<\/strong><span>([^<]*)<\/span><\/figcaption>/g,
     '<figcaption class="recent-install__chip"><strong>$1</strong></figcaption>'],
    [/(alt="Customers? (?:beside|inspecting) [^"]*?) in (?:Castle Hill|Baulkham Hills|Rose Bay|Cronulla|Parramatta)"/g, '$1"'],
    ['class="fit__title">Water filters for <span>Sydney homes.</span>',
     `class="fit__title">Water filters for <span>${name} homes.</span>`],
    ['class="fit__kicker">Water filter installation across Sydney<', `class="fit__kicker">Water filter installation across ${place}<`],
    ['at a kitchen sink in a Sydney home"', 'at a kitchen sink in a home"'],
    ['Houses, townhouses and apartments across Sydney.', `Houses, townhouses and apartments across ${place}.`],
    ['<h2 id="area-title">Across Sydney &amp; Greater Sydney</h2>', `<h2 id="area-title">Across ${place} &amp; Surrounds</h2>`],
    [/<ul class="chips">[\s\S]*?<\/ul>/, `<ul class="chips">
${suburbs.map((s) => `        <li><span>${s}</span></li>`).join('\n')}
      </ul>`],
    ['How much does water filter installation cost in Sydney?', `How much does water filter installation cost ${inPlace}?`],
    ['Many Sydney homes run both.', 'Many homes run both.'],
    ['serviced across Sydney Metro and Greater Sydney by licensed plumbers.',
     'serviced across NSW and the ACT by licensed plumbers.'],
    [/Sydney Metro &amp; Greater Sydney/g, `${name} &amp; Surrounds`],
    [/^[ \t]*<li>.*Sussex St, Sydney NSW 2000.*<\/li>\n/m, ''],
    // No "Sydney" on regional pages: they carry the business name, Safe Water
    // Filtration, and its logo instead of the Water Filtration Sydney artwork.
    ['aria-label="Water Filtration Sydney, home"', 'aria-label="Safe Water Filtration, home"'],
    [/<img src="images\/water-filtration-sydney-logo\.webp"[^>]*>/,
     '<img src="images/safe-water-filtration-logo.webp" width="560" height="135" alt="Safe Water Filtration">'],
    [/<img class="footer-logo" src="images\/water-filtration-sydney-logo\.webp"[^>]*>/,
     '<img class="footer-logo" src="images/safe-water-filtration-logo.webp" width="560" height="135" loading="lazy" decoding="async" alt="Safe Water Filtration">'],
    ['value="Water Filtration Sydney website"', 'value="Safe Water Filtration website"'],
    ['alt="Water Filtration Sydney plumber installing a twin whole-house filtration system beside a Sydney home"',
     'alt="Safe Water Filtration plumber installing a twin whole-house filtration system beside a home"'],
    ['in a Sydney garage', 'in a garage'],
    ['alt="Water Filtration Sydney service vehicle', 'alt="Safe Water Filtration service vehicle'],
    ['What you get from Water Filtration Sydney is', 'What you get from Safe Water Filtration is'],
    ['© 2026 Water Filtration Sydney. All rights reserved.', '© 2026 Safe Water Filtration. All rights reserved.'],
  ];
}

/* Anything a visitor can read or hear, minus the domain (not ours to change)
 * and image file names. */
function readableSydney(html) {
  const text = html
    .replace(/[\w.-]*waterfiltration\.sydney/g, '')
    .replace(/[\w-]*-sydney-[\w-]*\.(webp|jpg|png)/g, '');
  return (text.match(/.{0,50}sydney.{0,30}/gi) || []);
}

function localise(html, slug, area) {
  for (const [from, to] of areaSwaps(slug, area)) {
    const hit = typeof from === 'string' ? html.includes(from) : from.test(html);
    if (!hit) throw new Error(`${area.name}: swap no longer matches the homepage: ${from}`);
    if (from instanceof RegExp) from.lastIndex = 0;
    html = typeof from === 'string' ? html.split(from).join(to) : html.replace(from, to);
  }
  const left = readableSydney(html);
  if (left.length) throw new Error(`${area.name}: page still says Sydney:\n  ${left.join('\n  ')}`);
  return html;
}

function transform(html) {
  return html
    .replace(/<link rel="preload" href="\/business-info"[^>]*>\n?/, '')
    .replace(/<link rel="canonical"[^>]*>\n?/, '')
    .replace(/<meta name="robots"[^>]*>\n?/, '')
    .replace(/(<meta name="viewport"[^>]*>\n)/, '$1<meta name="robots" content="noindex, nofollow">\n')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/g, '')
    .replace(/[ \t]*<nav aria-label="More">[\s\S]*?<\/nav>\n?/, '')
    // List items linking to other main-site pages (not /, not /#anchor, not legal)
    .replace(/^[ \t]*<li><a href="\/([a-z][^"#]*)">.*<\/a><\/li>\n/gm,
      (line, slug) => (KEEP.includes(slug) || LOCAL.includes(slug) ? line : ''))
    // Whatever main-site links remain open the main site in a new tab
    .replace(/href="\/([a-z][^"]*)"/g,
      (m, slug) => (LOCAL.includes(slug) ? m : `href="${MAIN}/${slug}" target="_blank" rel="noopener"`))
    .replace(/(name="redirect" value=")[^"]*"/, `$1${SELF}/thank-you"`);
}

/* Lander-only section answering the gaps found in the Sep 2026 competitor
 * audit (pressure promises, hidden cartridge costs, deposit-driven sales).
 * Every line restates something the homepage already commits to, so it adds
 * no new claim; it sits right after the recent installs. */
const IN_WRITING = `  <!-- 1B. BEFORE YOU SAY YES: lander only, see install/build.js -->
  <section class="section section--tight section--soft" id="in-writing" aria-labelledby="in-writing-title">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">Before You Say Yes</span>
        <h2 id="in-writing-title">Measured, Priced and Explained Upfront</h2>
        <p>The things people most often wish they had asked about a water filter, answered before we quote.</p>
      </div>
      <div class="grid grid--3">
        <article class="card card--center card--flat">
          <span class="card__icon"><svg class="icon" aria-hidden="true"><use href="#i-drop"></use></svg></span>
          <h3>Measured at your house</h3>
          <p>We check incoming pressure and estimate peak demand before we specify a system, then check pressure and flow again before we leave.</p>
        </article>
        <article class="card card--center card--flat">
          <span class="card__icon"><svg class="icon" aria-hidden="true"><use href="#i-chat"></use></svg></span>
          <h3>Every cartridge priced</h3>
          <p>Your quote shows the fixed installed price plus each replacement cartridge your system takes, what it costs and when it is due.</p>
        </article>
        <article class="card card--center card--flat">
          <span class="card__icon"><svg class="icon" aria-hidden="true"><use href="#i-shield"></use></svg></span>
          <h3>No pitch, no rush</h3>
          <p>No obligation and no pressure. Nothing is booked until you have the price, and if a smaller system will do the job, we will say so.</p>
        </article>
      </div>
    </div>
  </section>

`;

function landerHome(html) {
  const anchor = '  <!-- 2. PROOF BAR';
  if (!html.includes(anchor)) throw new Error('Homepage proof bar moved: cannot place the "Before You Say Yes" section');
  return html.replace(anchor, IN_WRITING + anchor);
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const home = landerHome(transform(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')));
fs.writeFileSync(path.join(OUT, 'index.html'), home);
for (const page of LOCAL) {
  const file = page + '.html';
  fs.writeFileSync(path.join(OUT, file), transform(fs.readFileSync(path.join(ROOT, file), 'utf8')));
}

for (const [slug, area] of Object.entries(AREAS)) {
  fs.writeFileSync(path.join(OUT, slug + '.html'), localise(home, slug, area));
}

// Same image the main site leaves out in .assetsignore: no page uses it.
const UNUSED_IMAGES = ['badge-google-rating.webp'];
for (const dir of ['css', 'js', 'images']) {
  fs.cpSync(path.join(ROOT, dir), path.join(OUT, dir), {
    recursive: true,
    filter: (src) => !UNUSED_IMAGES.includes(path.basename(src)),
  });
}
fs.mkdirSync(path.join(OUT, 'img'));
for (const f of fs.readdirSync(path.join(ROOT, 'img'))) {
  if (/^recent-installation-.*\.jpg$/.test(f)) fs.copyFileSync(path.join(ROOT, 'img', f), path.join(OUT, 'img', f));
}
for (const f of ['_headers', '_redirects', 'robots.txt']) {
  fs.copyFileSync(path.join(__dirname, f), path.join(OUT, f));
}

console.log('Built install/public');
