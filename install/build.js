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
const KEEP = ['transparency', 'privacy-policy', 'terms-and-conditions', 'terms-of-sale',
  'returns-and-refunds-policy', 'shipping-policy', 'website-disclaimer'];

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
      (line, slug) => (KEEP.includes(slug) ? line : ''))
    // Whatever main-site links remain open the main site in a new tab
    .replace(/href="\/([a-z][^"]*)"/g,
      (m, slug) => `href="${MAIN}/${slug}" target="_blank" rel="noopener"`)
    .replace(/(name="redirect" value=")[^"]*"/, `$1${SELF}/thank-you"`);
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

fs.writeFileSync(path.join(OUT, 'index.html'), transform(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')));
fs.writeFileSync(path.join(OUT, 'thank-you.html'), transform(fs.readFileSync(path.join(ROOT, 'thank-you.html'), 'utf8')));

for (const dir of ['css', 'js', 'images']) {
  fs.cpSync(path.join(ROOT, dir), path.join(OUT, dir), { recursive: true });
}
fs.mkdirSync(path.join(OUT, 'img'));
for (const f of fs.readdirSync(path.join(ROOT, 'img'))) {
  if (/^recent-installation-.*\.jpg$/.test(f)) fs.copyFileSync(path.join(ROOT, 'img', f), path.join(OUT, 'img', f));
}
for (const f of ['_headers', '_redirects', 'robots.txt']) {
  fs.copyFileSync(path.join(__dirname, f), path.join(OUT, f));
}

console.log('Built install/public');
