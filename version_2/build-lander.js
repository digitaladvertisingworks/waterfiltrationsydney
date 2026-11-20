#!/usr/bin/env node
/* Build the Google Ads landing page at install.waterfiltration.sydney from the
 * version_2 source.
 *
 *   node version_2/build-lander.js
 *
 * Source of truth stays in version_2/ (index.html, contact-us.html,
 * thank-you.html, assets/). This script writes the Ads copy into
 * install/public/, which is what the waterfiltrationsydney-install Worker
 * serves, and applies the lander-only changes:
 *
 *   - every "Get My Free Quote" / "Contact us" / "Quote this system" button
 *     goes to /contact-us instead of scrolling to the form on the page.
 *     Buttons that preselected a system carry it over as ?product=..., which
 *     assets/js/lead-fields.js reads on the contact page.
 *   - noindex, nofollow on every page (paid traffic only; the main site owns
 *     rankings, and install/_headers already sends X-Robots-Tag for the whole
 *     subdomain)
 *   - no canonical and no JSON-LD, same policy as install/build.js
 *   - clean URLs: index.html -> /, contact-us.html -> /contact-us,
 *     thank-you.html -> /thank-you (see install/_redirects)
 *   - root-absolute asset paths, so /contact-us loads them correctly
 *
 * The forms on the lander itself are left alone: the hero form and the contact
 * section still submit in place. Only the buttons were repointed.
 *
 * WARNING: `node install/build.js` deletes install/public and rebuilds it from
 * the OLD root-site lander. Run this script after it, or stop running it.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const SRC = __dirname;
const OUT = path.join(__dirname, '..', 'install', 'public');
const PAGES = ['index.html', 'contact-us.html', 'thank-you.html', 'verify.html'];
// pages that have their own form but are not the contact page: their buttons go to /contact-us
const REPOINT = ['index.html', 'verify.html'];
const ICONS = ['apple-touch-icon.png', 'favicon-32.png', 'icon-512.png'];

/* ---- shared transforms ------------------------------------------------- */

function lander(html) {
  // noindex (the subdomain is paid traffic only)
  if (!/<meta name="robots"/.test(html)) {
    html = html.replace(/(<meta name="viewport"[^>]*>\n)/, '$1<meta name="robots" content="noindex, nofollow">\n');
  }
  // no canonical, no structured data on the paid lander
  html = html
    .replace(/[ \t]*<link rel="canonical"[^>]*>\n?/g, '')
    .replace(/[ \t]*<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/g, '');

  // root-absolute asset paths so they resolve from /contact-us too
  html = html.replace(/(["'\s,(])assets\//g, '$1/assets/');

  // clean URLs
  html = html
    .replace(/href="index\.html#/g, 'href="/#')
    .replace(/href="index\.html"/g, 'href="/"')
    .replace(/href="contact-us\.html"/g, 'href="/contact-us"')
    .replace(/href="thank-you\.html"/g, 'href="/thank-you"')
    .replace(/href="verify\.html"/g, 'href="/verify"');

  return html;
}

/* ---- footer: trim the ecommerce legal links on the paid lander ---------- */

// The lander sells nothing, it books a quote, so the shop policies are noise and
// three more ways off the page. Privacy Policy stays (Google Ads requires one on
// any page collecting personal data), as do Licensing & Transparency and T&Cs.
const DROP_FOOTER_LINKS = [
  'terms-of-sale',
  'returns-and-refunds-policy',
  'website-disclaimer'
];

function trimFooterLinks(html) {
  let n = 0;
  const kept = html.split('\n').filter((line) => {
    const isFooterLink = line.includes('<li><a href=') && DROP_FOOTER_LINKS.some((slug) => line.includes(slug));
    if (isFooterLink) n++;
    return !isFooterLink;
  });
  return { html: kept.join('\n'), n };
}

/* ---- pages with a form of their own: buttons go to /contact-us ---------- */

// Short, readable slugs for ?product=. The full option text would url-encode
// into "?product=Home%20Filtration%20%2B%20Undersink%20Pure%20Drinking%20Water%20System",
// which looks broken in the address bar and in any shared link.
// assets/js/lead-fields.js resolves these back to the matching select option.
const PRODUCT_SLUGS = {
  'Under-sink drinking water': 'under-sink',
  'Whole-house filtration': 'whole-house',
  'Reverse osmosis': 'reverse-osmosis',
  'Home Filtration + Undersink Pure Drinking Water System': 'home-bundle',
  'Filtration for a business': 'business',
  'Service an existing system': 'service',
  'Not sure yet': 'not-sure'
};

function ctasToContactPage(html) {
  let n = 0;
  html = html.replace(
    /href="#quote" data-hero-quote(?: data-product="([^"]*)")?/g,
    (m, product) => {
      n++;
      if (!product) return 'href="/contact-us"';
      const slug = PRODUCT_SLUGS[product];
      if (!slug) throw new Error('No ?product= slug for "' + product + '": add it to PRODUCT_SLUGS');
      return `href="/contact-us?product=${slug}"`;
    }
  );
  if (!n) throw new Error('No quote buttons found: has the markup changed?');
  return { html, n };
}

/* ---- build -------------------------------------------------------------- */

if (!fs.existsSync(OUT)) throw new Error('install/public is missing: run node install/build.js first');

let rewritten = 0;
for (const page of PAGES) {
  const src = path.join(SRC, page);
  if (!fs.existsSync(src)) throw new Error('missing source page: ' + page);
  let html = lander(fs.readFileSync(src, 'utf8'));
  const trimmed = trimFooterLinks(html);
  if (trimmed.n !== DROP_FOOTER_LINKS.length) {
    throw new Error(page + ': expected to drop ' + DROP_FOOTER_LINKS.length + ' footer links, dropped ' + trimmed.n);
  }
  html = trimmed.html;
  if (REPOINT.includes(page)) {
    const out = ctasToContactPage(html);
    html = out.html;
    rewritten += out.n;
  }
  const leftovers = html.match(/href="(?!https?:|tel:|mailto:|\/|#)[^"]+"/g);
  if (leftovers) throw new Error('relative link left in ' + page + ': ' + leftovers.join(', '));
  fs.writeFileSync(path.join(OUT, page), html);
}

/* assets: stylesheets, scripts, and the served images only (the .jfif/.png
   originals in assets/images are sources, not used by any page) */
const outAssets = path.join(OUT, 'assets');
fs.rmSync(outAssets, { recursive: true, force: true });
for (const dir of ['css', 'js']) {
  fs.cpSync(path.join(SRC, 'assets', dir), path.join(outAssets, dir), { recursive: true });
}
fs.mkdirSync(path.join(outAssets, 'images'), { recursive: true });
let images = 0;
for (const f of fs.readdirSync(path.join(SRC, 'assets', 'images'))) {
  if (!/\.webp$/i.test(f) && !ICONS.includes(f)) continue;
  fs.copyFileSync(path.join(SRC, 'assets', 'images', f), path.join(outAssets, 'images', f));
  images++;
}

console.log('Built the Ads lander into install/public');
console.log('  pages          : ' + PAGES.join(', '));
console.log('  buttons repointed to /contact-us: ' + rewritten);
console.log('  assets         : css, js, ' + images + ' images');
console.log('  NOTE: node install/build.js wipes install/public. Re-run this after it.');
