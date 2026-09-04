#!/usr/bin/env node
/* Static page builder — no dependencies, no build tooling to install.
 *
 *   node build.js            build every page in pages/ to the site root
 *   node build.js --check    build in memory and fail if the HTML committed
 *                            at the site root is stale (CI / pre-deploy hook)
 *
 * How it works
 * ------------
 *   templates/base.html      the one document shell: <head>, header, footer
 *   templates/partials/*     shared components, included with {{> name.html }}
 *   pages/<name>.html        one file per page: front matter + page content
 *   site.json                site-wide defaults for template variables
 *
 * A page file looks like:
 *
 *   ---
 *   title: Page title
 *   description: Meta description
 *   path: /some-page.html
 *   ---
 *   <!-- @block head -->   optional extra <head> tags   <!-- @endblock -->
 *   <!-- @block schema --> optional JSON-LD             <!-- @endblock -->
 *   ...everything else is the page content, injected into <main>...
 *
 * Front-matter keys and site.json keys both fill {{ placeholders }} in the base
 * template and in partials; the page wins where the two collide.
 *
 * Secrets: this script reads no environment variables and no .env file, by
 * design. Everything it emits is downloadable by anyone — see the "Form and
 * secrets" note in README.md.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PAGES_DIR = path.join(ROOT, 'pages');
const TEMPLATES_DIR = path.join(ROOT, 'templates');
const PARTIALS_DIR = path.join(TEMPLATES_DIR, 'partials');
const OUT_DIR = ROOT;

const read = (p) => fs.readFileSync(p, 'utf8');

/* Front matter: --- key: value --- at the very top of a page file. */
function splitFrontMatter(src) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(src);
  if (!m) return { data: {}, body: src };
  const data = {};
  m[1].split(/\r?\n/).forEach((line) => {
    if (!line.trim() || line.trim().startsWith('#')) return;
    const at = line.indexOf(':');
    if (at === -1) throw new Error('Bad front-matter line: ' + line);
    data[line.slice(0, at).trim()] = line.slice(at + 1).trim();
  });
  return { data: data, body: src.slice(m[0].length) };
}

/* Named blocks: <!-- @block name --> ... <!-- @endblock --> */
function extractBlocks(body) {
  const blocks = {};
  const rest = body.replace(
    /[ \t]*<!--\s*@block\s+([\w-]+)\s*-->\r?\n?([\s\S]*?)\r?\n?[ \t]*<!--\s*@endblock\s*-->\r?\n?/g,
    function (_, name, inner) {
      blocks[name] = inner;
      return '';
    }
  );
  return { blocks: blocks, content: rest };
}

/* {{> partial.html }} — resolved first, so partials can use {{ vars }} too. */
function includePartials(tpl, seen) {
  return tpl.replace(/\{\{>\s*([\w./-]+)\s*\}\}/g, function (_, name) {
    const file = path.join(PARTIALS_DIR, name);
    if (!fs.existsSync(file)) throw new Error('Missing partial: ' + name);
    if (seen.indexOf(name) !== -1) throw new Error('Partial include loop: ' + name);
    return includePartials(read(file).replace(/\n$/, ''), seen.concat(name));
  });
}

/* {{ var }} — unknown or empty values render as ''. A line holding nothing but
   an empty placeholder is dropped, so optional blocks leave no blank gap. */
function render(tpl, vars) {
  const out = tpl.replace(/^[ \t]*\{\{\s*([\w.-]+)\s*\}\}[ \t]*\r?\n/gm, function (_, key) {
    const v = vars[key];
    return v === undefined || v === '' ? '' : v + '\n';
  });
  return out.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, function (_, key) {
    const v = vars[key];
    return v === undefined ? '' : String(v);
  });
}

/* Requirement: no secrets in the frontend. Everything this script writes is
   served to browsers, so the build refuses to ship anything that looks like a
   private credential. Keys that are public by design (the Web3Forms access
   key, which is domain-restricted in the Web3Forms dashboard) are listed in
   ALLOWED_PUBLIC_KEYS so they do not trip the check. */
const SECRET_PATTERNS = [
  { name: 'private API key', re: /\b(?:sk|rk|pk_live|api|secret)[-_](?:live[-_])?[A-Za-z0-9]{16,}\b/ },
  { name: 'AWS access key id', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'Google API key', re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { name: 'private key block', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: 'assigned secret', re: /\b(?:api[_-]?secret|client[_-]?secret|password|auth[_-]?token)\s*[:=]\s*["'][^"']{8,}["']/i }
];
const ALLOWED_PUBLIC_KEYS = [
  '2c39a7ca-14ce-46fc-9432-b360c3c07b01' /* Web3Forms public access key */
];

function scanForSecrets(file, html) {
  let scrubbed = html;
  ALLOWED_PUBLIC_KEYS.forEach(function (k) { scrubbed = scrubbed.split(k).join(''); });
  SECRET_PATTERNS.forEach(function (p) {
    const hit = p.re.exec(scrubbed);
    if (hit) {
      throw new Error(
        file + ': looks like a ' + p.name + ' in the page output (' + hit[0].slice(0, 12) +
        '…). Keep it server-side — anything in the HTML is public.'
      );
    }
  });
}

function buildPage(file, site, base) {
  const parsed = splitFrontMatter(read(path.join(PAGES_DIR, file)));
  const split = extractBlocks(parsed.body);
  const vars = Object.assign({}, site, parsed.data, split.blocks, {
    content: split.content.replace(/^\r?\n+/, '').replace(/\s+$/, '')
  });
  if (!vars.title) throw new Error(file + ': front matter needs a title');
  if (vars.og_title === undefined) vars.og_title = vars.title;
  if (vars.og_description === undefined) vars.og_description = vars.description;
  return render(includePartials(base, []), vars);
}

function main() {
  const check = process.argv.indexOf('--check') !== -1;
  const site = JSON.parse(read(path.join(ROOT, 'site.json')));
  const base = read(path.join(TEMPLATES_DIR, 'base.html'));
  const pages = fs.readdirSync(PAGES_DIR).filter((f) => /\.html$/.test(f));
  let stale = 0;

  pages.forEach(function (file) {
    const html = buildPage(file, site, base);
    scanForSecrets(file, html);
    const out = path.join(OUT_DIR, file);
    const current = fs.existsSync(out) ? read(out) : null;
    if (current === html) {
      console.log('  unchanged  ' + file);
      return;
    }
    if (check) {
      stale++;
      console.error('  STALE      ' + file + '  (run: node build.js)');
      return;
    }
    fs.writeFileSync(out, html);
    console.log('  built      ' + file);
  });

  if (stale) process.exit(1);
}

main();
