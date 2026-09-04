# Safe Water Filtration — Sydney

Single-page static site for Safe Water Filtration, built as a visual clone of
safewaterfiltration.com.au and structured as a conversion landing page for Google Ads
(intent-driven) and Facebook Ads (interruption-driven) traffic.

No frameworks, no dependencies. Semantic HTML5, plain CSS with shared custom properties,
one small vanilla JS file. Pages are assembled from a shared layout by a ~130-line Node
script (see **Templates**), and the built HTML is committed at the site root, so Cloudflare
Pages still deploys the repo as-is with no build command.

## Page structure

`index.html` — one page, anchor-navigated. Structure follows the `marketingskills`
copywriting + CRO frameworks (Human Action Model spine, six core landing-page sections,
offer anatomy):

1. **Hero** — discomfort → vision → path, with the quote form above the fold
2. **Proof bar** — licence number, warranties, WaterMark, service area
3. **Problem** (`#problem`) — names the three ways filtration jobs go wrong
4. **Offer** (`#offer`) — named bundle, price anchor, explicit in/out scope, risk reversal
5. **Solution** (`#systems`) — self-select by goal, five paths
6. **Residential & Commercial** (`#homes-business`)
7. **Proof** (`#proof`) — real installs, accreditations, brands, testimonial slot
8. **Why Us** (`#why`) → **Comparison** (`#choosing`) → **Process** (`#process`)
9. **Installation quality** → **Service area** → **Objections/FAQ** (`#faqs`)
10. **Final CTA** — recap, repeat CTA, risk reversal

Primary CTA is "Get My Free Quote" throughout ([action] + [what they get]). Quote form is
4 required fields + 1 optional, with effort framing ("takes about 30 seconds") and a
no-obligation line beside the button.

### Social proof

Supplied by the business and displayed as-is: Google 5.0 (Top Rated Services 2026, verified
by Trustindex), Trustpilot 4.5, ProvenExpert 4.8, plus three named Google reviews (Carmel
Bhatty, Daniel Colantoni, Lucy Sun). The rating badges and one featured review sit in the
hero proof card above the fold; all three reviews appear in full under `#reviews`.

Review text is reproduced verbatim. No `Review`/`aggregateRating` schema is emitted —
reviews hosted on your own site about your own business are self-serving under Google's
rules and are not eligible for review rich results, so marking them up adds risk without
benefit. Linking the badges to the live Google/Trustpilot profiles would strengthen them.

### Hero backdrop

The photo carries a `saturate/contrast` lift and a layered scrim: a radial reading panel
over the copy column that clears by ~82%, a focal vignette centred on the subject, and a
light brand veil. Hero text contrast was measured against the rendered backdrop (darkest
0.5% of pixels) — H1 10.6:1, body 7.0:1 desktop; 8.7:1 and 5.9:1 mobile. If you swap the
hero image, re-check those numbers before shipping.

## Files

```
index.html              The built site (generated — edit pages/index.html, then build)
pages/                  Page sources: front matter + the content for <main>
templates/              base.html + partials/ (header, footer, mobile bar, icon sprite)
site.json               Site-wide template variables
build.js                node build.js — assembles pages/ + templates/ into root HTML
css/styles.css          Tokens → base → utilities → components → landing blocks
js/main.js              Mobile nav, sticky header state, quote form handling
images/                 Optimised WebP assets + favicons + share image
img/                    Original supplied source images (not served)
_headers                Security + cache headers
_redirects              Blocks public access to the template sources
.assetsignore           What Wrangler must NOT upload (node_modules, sources, source material)
wrangler.jsonc          Worker name + assets directory for `wrangler deploy`
robots.txt, sitemap.xml
```

## Deploying to Cloudflare

Deployed as a **Cloudflare Worker with static assets** (`npx wrangler deploy`), not as a
Pages project. Configuration is committed in `wrangler.jsonc`:

- **Worker name:** `waterfiltrationsydney`
- **Assets directory:** `.` (repository root — the built HTML lives there)

### .assetsignore is load-bearing

Wrangler uploads *everything* in the assets directory, and a single asset over 25 MiB
fails the whole deploy. `.assetsignore` (gitignore syntax, read from the assets directory
root) keeps out:

- `node_modules/` — the deploy installs Wrangler here, and `node_modules/workerd/bin/workerd`
  is ~146 MiB. This is what caused the "Asset too large" deploy failure.
- `pages/`, `templates/`, `site.json`, `build.js` — template sources; they are not routes.
- `img/` (except the five committed `recent-installation-*.jpg` the site actually uses),
  `private do not use/`, `marketingskills/`, the cloner template, and the brief XML.

If you add a large folder to the repo, add it to `.assetsignore` too, or the next deploy
fails.

`_headers` (security + cache headers) and `_redirects` are both honoured by Workers static
assets. Redirects run before headers, and only 301/302/303/307/308 are supported — there
is no 404 status, so the source-path rules redirect to `/`.

### Clean URLs

Pages are served without the `.html` extension: `services.html` answers at `/services`.
That is Workers' default `html_handling: "auto-trailing-slash"` — a request for `/services`
returns 200, and `/services.html` redirects. Wrangler's own redirect is a 307, so
`_redirects` overrides it with a 301 per page for link-equity consolidation.

Consequences for authoring: the `path` in a page's front matter is the clean URL
(`path: /services`), which is what canonical, `og:url` and the JSON-LD `@id` values use,
and internal links are written `/services`, never `/services.html`. The built file at the
root keeps its `.html` name — only the URL drops it.

## Templates

Pages share one layout so the header, footer, `<head>` and icon sprite are written once.

```
templates/base.html         the document shell: <head>, header, <main>, footer, scripts
templates/partials/         header.html, footer.html, mobile-bar.html, icon-sprite.html
pages/<name>.html           one file per page: front matter + the content for <main>
site.json                   site-wide values (site_url, css_version, theme_color, …)
build.js                    assembles pages/ + templates/ -> <name>.html at the root
```

Build after editing anything in `pages/`, `templates/` or `site.json`:

```sh
node build.js          # writes index.html (and any other page) at the repo root
node build.js --check  # exits 1 if the committed HTML is stale — use in CI
```

Output is plain static HTML: no client-side injection, so there is nothing for crawlers
or JS-disabled visitors to miss. Built pages must live at the root so relative `images/`,
`css/` and `js/` paths resolve.

`pages/`, `templates/`, `site.json`, `build.js` and `package.json` are source, not routes.
They are excluded from the deploy entirely by `.assetsignore`, so they are never uploaded;
`robots.txt` and `_redirects` cover them as well, in case the deploy config changes.

`robots.txt` deliberately carries no comments. It is a public file read by every
crawler and scanner, so it should not describe the hosting platform, the build
layout or which config files exist. Keep the reasoning here, not in the file.

### Adding a page

Create `pages/about.html`:

```html
---
title: About Us | Safe Water Filtration
description: Meta description for this page.
path: /about
---
  <section class="section">
    <div class="container">
      <h1>About us</h1>
    </div>
  </section>
```

Then `node build.js` writes `about.html`. Front-matter keys fill `{{ placeholders }}` in
the layout and override `site.json`; `og_title` and `og_description` fall back to `title`
and `description`. Two optional named blocks add page-specific `<head>` tags and JSON-LD:

```html
<!-- @block head -->
<link rel="preload" as="image" href="images/hero.webp" fetchpriority="high">
<!-- @endblock -->

<!-- @block schema -->
<script type="application/ld+json"> … </script>
<!-- @endblock -->
```

Everything outside the blocks is the page content and lands inside `<main id="main">`.
Header and footer links to homepage sections are written `{{ home }}#anchor` — `home` is
empty on `pages/index.html` (so links stay `#anchor`) and `/` everywhere else, from
`site.json`. Adding a partial is a file in `templates/partials/` plus a
`{{> name.html }}` line in `base.html`.

## Connecting the quote form

The form posts to Web3Forms, which emails submissions to `quote@waterfiltration.sydney`.
The endpoint is set at the top of `js/main.js` and the account key is a hidden
`access_key` field in the form markup:

```js
const FORM_ENDPOINT = 'https://api.web3forms.com/submit';
```

Clear `FORM_ENDPOINT` to fall back to opening the visitor's email client pre-filled to
`quote@waterfiltration.sydney` — useful for local testing.

### Form and secrets

The Web3Forms access key is a *public* key: the browser has to send it, so it is visible
in the page source no matter where it is stored, and no amount of obfuscation changes
that. Restrict it to the live domain in the Web3Forms dashboard — that, not hiding it, is
the control.

Nothing else belongs in this repo's frontend. `build.js` reads no `.env` and refuses to
write a page containing anything that matches a private-credential pattern (`sk_…`,
`AKIA…`, `AIza…`, `client_secret: "…"`, PEM blocks). If a future feature needs a real
secret, it goes in a Cloudflare Pages Function or another server-side handler, with only
its endpoint URL in the client.

With an endpoint set, the form submits by `fetch` and shows an inline success or error
message without leaving the page. Validation and error states work either way.

## Claims policy

Every trust claim traces to a supplied asset or the reference site:

- NSW Licensed Contractor & Qualified Supervisor **No. 358626C** — supplied accreditation badge
- 3-year product warranty, lifetime installation-labour warranty — reference site
- WaterMark-certified components — WaterMark marks on the supplied product artwork
- `$5,500` installed bundle (from `$7,000`) — reference site offer
- ABN 98 700 073 016, phone 0421 601 540 — reference site footer

Nothing else is asserted. No fabricated reviews, ratings, years in business, response
times or product certifications. Reduction claims are tied to the filtration technology
(sediment, activated carbon, membrane) rather than blanket "removes everything" wording,
and the copy avoids fear-based messaging about Sydney tap water.

## Editing notes

- The service name **"Water Filtration Installation Service"** is fixed — do not reword it.
- Edit `pages/` and `templates/`, never the generated HTML at the root — run `node build.js` after.
- The icon sprite lives in `templates/partials/icon-sprite.html` and is inlined at the top of
  `<body>`; keep `<symbol>` ids in sync if you add icons.
- The hero backdrop must stay un-lazy (`fetchpriority="high"`) to protect LCP.
- Nav switches to the mobile drawer below 980px.
