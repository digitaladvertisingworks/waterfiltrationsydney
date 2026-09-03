# Safe Water Filtration — Sydney

Single-page static site for Safe Water Filtration, built as a visual clone of
safewaterfiltration.com.au and structured as a conversion landing page for Google Ads
(intent-driven) and Facebook Ads (interruption-driven) traffic.

No frameworks, no build step. Semantic HTML5, plain CSS with shared custom properties,
one small vanilla JS file. Deploys to Cloudflare Pages as-is.

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
index.html              The site
css/styles.css          Tokens → base → utilities → components → landing blocks
js/main.js              Mobile nav, sticky header state, quote form handling
images/                 Optimised WebP assets + favicons + share image
img/                    Original supplied source images (not served)
_headers                Cloudflare Pages security + cache headers
robots.txt, sitemap.xml
```

## Deploying to Cloudflare Pages

- **Build command:** *(none)*
- **Build output directory:** `/` (repository root)

`_headers` sets immutable caching on `/images/*` plus basic security headers.

**Before deploying:** `img/`, `private do not use/` and the cloner template sit in the
repo root and would otherwise be published. `.gitignore` covers them for a git-connected
deploy — if you drag-and-drop the folder into the dashboard instead, remove them first.

## Connecting the quote form

The form posts to Web3Forms, which emails submissions to `quote@waterfiltration.sydney`.
The endpoint is set at the top of `js/main.js` and the account key is a hidden
`access_key` field in the form markup:

```js
const FORM_ENDPOINT = 'https://api.web3forms.com/submit';
```

Clear `FORM_ENDPOINT` to fall back to opening the visitor's email client pre-filled to
`quote@waterfiltration.sydney` — useful for local testing.

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
- The icon sprite is inlined at the top of `<body>`; keep `<symbol>` ids in sync if you add icons.
- The hero backdrop must stay un-lazy (`fetchpriority="high"`) to protect LCP.
- Nav switches to the mobile drawer below 980px.
