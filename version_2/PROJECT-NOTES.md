# Version 2 - install.waterfiltration.sydney rebuild (Vanguard clone)

Built 2026-10-29. Static one-pager in this folder: `index.html`, `assets/css/styles.css`, `assets/js/main.js`, `assets/js/lead-fields.js`, `assets/images/`.
Not deployed. The live lander is still `install/public/` (built by `install/build.js`).

## Decisions
- Reference: vanguardplumbingandgas.com.au, look only (Lloyds Building dropped).
- Colours: Vanguard palette (navy #091c61, orange #ff9100, blue #1192d6, light blue #cde8f6). Fonts: Poetsen One + TikTok Sans (Google Fonts).
- Sections without client content: filled from the current install page. Section map: `_work/2026-10-29/section-map.md`.
- Logo: `safewater-filtration-sydney-logo.png` (trimmed to `assets/images/logo.webp`; `logo-white.webp` for the navy footer).
- All copy, prices ($5,500 bundle, usually $7,000), 5.0 Google rating, $0 callout, free water quality test, warranties, FAQs and reviews come from the current install page. Nothing from Vanguard.

## Forms (web3forms-lead-forms skill)
- Two forms: hero (`#quote`, Form = "Hero form") and contact section (Form = "Contact section").
- Same Web3Forms access key as the live lander. Native POST, redirect to `https://install.waterfiltration.sydney/thank-you` (where the Ads conversion fires).
- Fields: name, phone, suburb, product (+ optional email on the contact form). The live form used Postcode + radio tiles; changed to the skill's Name / Mobile / Suburb / Interested in.
- Unique subject per lead: "New water filtration quote request - <product> - <suburb> - <date time>", then Lead source, Campaign, Search keyword, Landing page, gclid, Source page URL, Time submitted (AEDT).
- Fold test PASS at 375x667, 390x844, 412x915, 820x1180, 1366x768, 1440x900. No real lead was sent.

## Hero CRO pass (2026-10-29)
- H1 now leads with the searched phrase: "Water Filter Installation Across Sydney, By A Licensed Plumber"; the old chlorine/bottled-water line is the eyebrow above it.
- Rating + licence sit directly under the H1; the sub paragraph became 3 benefit ticks (all wording from the live page).
- Form card: "Get Your Free Quote" / "Takes about 30 seconds"; duplicate hero quote button removed (phone button kept).
- Ad-group message match: final URL `?product=` (or `?service=`) swaps the H1 phrase and preselects the form:
  `under-sink` -> Under-Sink Water Filter Installation, `reverse-osmosis` -> Reverse Osmosis Installation,
  `whole-house` -> Whole House Water Filter Installation, `commercial` -> Commercial Water Filtration, `servicing` -> Water Filter Servicing.
- Backup of the pre-CRO version: `_work/2026-10-29/backup-v1/`.

## Checks
- `check_site.py` RESULT: PASS (no overflow 360-1920, anchors, fonts, menu, form validation, no leaked Vanguard text, ASCII only).
- Desktop page height 16,856px vs reference 17,037px; mobile 20,459 vs 21,114.

## Before going live (owner / next job)
1. Real test lead from a browser on the deployed URL (automation cannot prove the Web3Forms key).
2. Deploy route: either point `install/build.js` at version_2 or copy version_2 into `install/public/`. build.js currently strips JSON-LD and adds noindex for the paid lander; version_2 has LocalBusiness JSON-LD in the page.
3. CSP in `install/_headers` must allow fonts.googleapis.com / fonts.gstatic.com (version_2 loads Google Fonts; the live lander may not).
4. Confirm the badges "NSW Government Accredited", "Master Plumbers" and "AGA gas fitter" are current before re-adding them (left out of v2's badge row; only WaterMark, AS 3498, JAS-ANZ, Australian Made and the NSW licence are shown).
5. The Lucy S. review was lightly re-cased ("the technician... i'm" -> "The technician... I'm"); revert if verbatim is required.
6. Regional copies (Newcastle, Canberra, Central Coast, etc.) in build.js are not built for v2.

## Header + hero v4: visual-semantics pass (2026-11-03)
- Audited 20 reference sites (17 readable) and the v3 hero against `C:\Users\digit\GitHub\Visual Semantics\visual-semantics-audit-framework.md`. Report and scores: `_work/2026-11-03/hero-visual-semantics-report.md`, `vss-hero-scorecard.csv` (hero VSS 57.5 -> 96).
- Header: one bar (`.hdr`), logo, 5 links (Systems, Pricing, Reviews, Service Area, FAQ), Get My Free Quote + phone. Topbar and its offer pills removed.
- Hero (`.hero-vs`, CSS in `assets/css/hero-vs.css`): eyebrow (entity + licence), H1 "Water Filter Installation Across Sydney, By A Licensed Plumber" (the `?product=` swap still works on the first span), standfirst, rating + licence verify, CTAs, quote form unchanged (same Web3Forms key, fields, redirect), 3 facts, captioned placeholder photo. No CSS `order`, no background photo, offer stated once (form card).
- Placeholder images: `assets/images/placeholders/*.svg` (labelled). Swap the hero one for the real twin-housing photo before go-live.
- Pre-edit backup: `_work/2026-11-03/backup-v3/` (index.html, styles.css). Old hero/topbar CSS in styles.css is now unused; prune after acceptance.
- check_site.py RESULT: PASS (ASCII, anchors, no overflow 360-1920, fonts, menu, form validation, no JS errors). No lead was sent.

## Below-hero sections: visual-semantics pass (2026-11-03, same day)
- Whole page re-scored: `_work/2026-11-03/vss-page-scorecard.csv` (56.5 -> 96). Section table in `hero-visual-semantics-report.md` Part 2. Block maps: `blocks-before/`, `blocks-after/` (`block_map.py`).
- Changes in `index.html` (spliced by `_work/2026-11-03/sections_v4.py`) and CSS appended to `assets/css/hero-vs.css`: real `<table>` for "Choosing the right filter"; four identical pricing cards (`.pcard2`); CTA-only band (duplicate reviews and promo cards removed); systems as a 3-col grid on desktop; 16 captioned figures; seal, ribbon, ghost wordmark, rotation and floating badges removed; autoplay off everywhere; H2 46px under the 56px H1; badges labelled; contact H2 without the phone link.
- Placeholders in use: hero and under-sink (pricing + systems). Swap for real photos.
- check_site.py RESULT: PASS after the pass. No lead sent.

## Stock photos in place of the placeholders (2026-11-03)
- Hero figure: `assets/images/stock-plumber-fitting-pipework.webp` (+ `-800` for phones). Source: Pexels photo 6419128, https://www.pexels.com/photo/6419128/ (Pexels licence: free for commercial use, no attribution required). Caption describes it honestly as licensed plumbing work, not a filter install, because no free stock library has a domestic filter-housing photo.
- Under-sink card (pricing) and systems card: `assets/images/stock-filtered-water-tap.webp`. Source: Pexels photo 11066339, https://www.pexels.com/photo/11066339/, cropped 4:3 around the tap and glass.
- Better option when wanted: the real `assets/images/installer-twin-housings.webp` or `recent-northern-beaches.webp` (2400px) show the actual systems and would lift the image check from 1 to 2 on the rubric. One-line swap in the hero figure.
- `assets/images/placeholders/*.svg` are no longer referenced; keep for future mockups or delete.
- check_site.py RESULT: PASS after the swap.

## Part 3 polish: Systems, FAQ, Contact, Footer (2026-11-03)
- Systems: two named groups (H3 "For your home" / "For businesses and existing systems"), five cards with goal line, H4 title, text and a "Quote this system" link. The link scrolls to the hero form and preselects the matching service (`data-product`, handled in `assets/js/main.js`); verified in Playwright (Reverse osmosis preselects both forms). No carousel; stacked on phones, 3-col grid on desktop.
- FAQ: ask-us card is sticky beside the accordion on desktop, smaller portrait, phone + quote buttons.
- Contact: steps as a numbered timeline (counter + connector line); form card carries the "Takes about 30 seconds" pill; H2 "Ready For Better Water?" with the phone in the paragraph.
- Footer: Explore / Contact / Licence columns, licence + verify line under the brand, plain call card (no photo inside a link), "Back to top" in the legal row.
- Script: `_work/2026-11-03/sections_v5.py` (+ `sections_v5.css` appended to hero-vs.css). Backup before this pass: `_work/2026-11-03/backup-v4-sections/` (index.html, hero-vs.css, main.js).
- check_site.py RESULT: PASS. Heading scale holds: H1 56 > H2 46 > group H3 30 > card H4 24 (desktop).

## Hero H1 (2026-11-12)
- H1 leads with the benefit "Shower, Drink And Bathe In Filtered Water"; "Water Filter Installation Across Sydney, By A Licensed Plumber" stays inside the H1 as the smaller second line, so ?product= swaps still work. Styles at the end of assets/css/hero-vs.css. Backup: _work/2026-11-12/backup/.
- Mobile (<640px) hero trim: eyebrow hidden, standfirst shortened to "Get a fixed installed price, with cartridge costs shown, before you commit." via .sf-more/.sf-short spans; desktop text unchanged. Backups: _work/2026-11-12/backup/*-before-mobile-trim.*
- "We're Open Now" pill at the top of the hero copy: live Sydney time (Australia/Sydney, ticks every second), green pulsing dot. Hours set on the element: data-open="7" data-close="19" (every day) - VERIFY with the owner. Outside hours it shows an orange dot and "Closed - Request a quote". JS at the end of assets/js/main.js, CSS at the end of hero-vs.css.
- Hero photo: stock pipework image replaced by two real branded installs (assets/images/whole-house-install-{1,2}-{480,900}.webp, from Whole-House-Filtration-hero-{1,2}.jfif). Phones: 4:5 pair under the facts. 900px+: square pair under the quote form, facts as a list under the copy.
- Recent installations carousel now autoplays (data-autoplay): every 3.2 s, loops, pauses on hover/touch, off for reduced motion.
- CSS/JS links bumped to ?v=20261112b so browsers drop the cached files.
- Pricing cards: each ends in a CTA pinned to the bottom that scrolls to the hero form and preselects the product (Whole House / Under-Sink: "Contact Us For Installed Pricing"; Bundle: orange "Lock In $5,500 Installed"; Testing: "Book My Free Water Test" -> Not sure yet), plus "Or call 0421 601 540".
- Option cards: all prices removed (no $5,500 / usually $7,000 / Fixed price / Free lines); only the Most Popular CTA yellow (others blue); "Contact Us For Installation" x3 + "Book My Free Water Test". H2 now "Water Filter Installation Options For Sydney Homes"; nav "Pricing" -> "Options". $5,500 still appears in the FAQ cost answer.
- Under-Sink card now the P500 Tankless Reverse Osmosis System (assets/images/p500-tankless-ro.webp from RO_Water_Filter_823x823_Installation.png, shown with object-fit: contain on white); its CTA preselects "Reverse osmosis". Image carries a "30 Day Money Guarantee" badge - VERIFY the offer is real.
- The 3 install CTAs read "Contact Us For Installation + Pricing".
- Whole House card retitled "Soft Water System" (UltraPure Soft Water System, mywaterfilter.com.au - page could not be read, 429). Photo unchanged; need the product image and specs from the owner.
- Bundle card photo: assets/images/shield-hpf3-ro-bundle-{600,1000}.webp from "Shield Water Filtration Display.png" (navy bottom band cropped). The old hpf3-ro-bundle.webp is still used in the systems section.
- Water test card photo: assets/images/water-quality-test-{600,1000}.webp (4:3 crop of "Water Quality Testing Audit.jfif": technician at the tap, logo visible).
- Wide screens (>1440px): Systems heading, Why Choose Us and Contact now sit on the same 1440px column as header/hero (padding-inline max() rule at the end of hero-vs.css).
- Areas We Cover photo: assets/images/safewater-ute-{500,900}.webp (square crop of Whole-House-Filtration-van.jfif). The ute signage shows Ph. 0425 008 874, not the site number 0421 601 540 - VERIFY with the owner.
- Systems section: photos removed (they repeated the option cards above). Each card now has a round icon (tap, home, drop, shop, wrench - new i-tap/i-home/i-shop symbols in the sprite) and a blue top border.
- Bundle renamed everywhere (card title, both form dropdowns, CTA data-product, FAQ): "Home Filtration + Undersink Pure Drinking Water System" (was Whole Home + Kitchen RO Bundle). Lead emails now carry the new name.
- H1 lead now "Shower, Drink And Bathe In Pure Filtered Water" ("Pure Filtered Water" highlighted).
- Footer rebuilt: full-width blue call band on top (Free quote + water test. $0 callout. / Get My Free Quote / 0421 601 540), then brand + Explore + Contact + Licence columns at one text size; 1025-1279px puts the brand on its own row. Contact section bottom padding cut to 90px.
- Why Choose Us photo: why-handshake-{560,1100}.webp (4:5 crop of Whole-House-Filtration-hero.jfif) replaces garage-install.webp, which duplicated the hero. Caption: Face to face, before any work starts.
- Home_Filtration_System_with_Super_Seal_Cartridges.png (UltraPure) carries a MyWaterFilter watermark - not used.

## Preview (2026-11-12)
- https://waterfiltrationsydney-v2.digitaladvertisingworks.workers.dev - Worker `waterfiltrationsydney-v2` in the digitaladvertisingworks account, noindex via _headers. Redeploy: `sh _work/2026-11-12/deploy-preview.sh` from version_2/.
- The hero and contact forms on the preview are live Web3Forms forms: a test submission sends a real lead email and redirects to the live thank-you page.

## Verify page (2026-11-20)
- New CRO page `verify.html` ("Check Our Licence Before You Book Anyone"), built on the contact-us.html pattern:
  v2 header, hero with the quote form, sticky bar, footer. Canonical `https://install.waterfiltration.sydney/verify`.
- Job of the page: a visitor (or an Ads click) checking us out gets every credential with the public source next to it,
  then converts. Sections: hero + form, "Three Things Worth Checking On Any Quote" (3 wcards: NSW register, ABN Lookup,
  WaterMark), the full credential table (`.ctable`, 9 rows, each with where to check it), "What Being Licensed Actually
  Changes" (steps + certifications card with the badge row), "Four Things We Will Tell You Anyway" (the
  transparency-that-costs-us-money list, from the live /transparency page), final CTA band.
- Every fact comes from site.json / the live site / the live https://waterfiltration.sydney/transparency page. Nothing new
  was invented. Prices are deliberately NOT on this page (the live transparency page's price tables are from the main
  site, not the v2 lander, where the option cards carry no prices).
- Outbound verification links, all HTTP 200 in the check: the NSW licence record (1-3L0RA4L) and
  `https://abr.business.gov.au/ABN/View?abn=98700073016`. The ASIC register link was dropped: connectonline.asic.gov.au
  answers automated requests with 403 and ABN Lookup already shows the ACN.
- Form: same Web3Forms key, fields, redirect and optional-fields toggle as the other pages. Hidden `Form` value is
  "Verify page form" so leads from this page are identifiable in the inbox. No real lead was sent.
- Fold: the v2 hero puts the copy above the form on phones, so the submit sits below the fold on every v2 page. This page
  is measured against index.html instead: 923px vs index's 946px at 375-412px, above the fold from 820px up.
- CSS: `.verify*` and `.vhonest` blocks appended to `assets/css/pages.css`, bumped to `?v=20261120b` on both pages that
  load it. No change to styles.css or hero-vs.css.
- Footer "Verify Our Credentials" link added to index.html, contact-us.html and thank-you.html (`wire_verify.py`).
- check_verify.js RESULT: PASS (see `_work/2026-11-20/`). Screenshots: `_work/2026-11-20/shots/verify-*.png`.
- VERIFY with the owner before this page goes live:
  1. "Current National Police Check, identity verified" and "$20M public liability, certificate of currency on request" -
     the page offers to show both on request, so they must actually be producible.
  2. Google rating 5.0 with no review count, as on the rest of v2. The live /transparency page also lists ProvenExpert 4.8
     and Trustpilot 4.5; they are left off here because there is no profile URL on file to link them to.
  3. The four "things that cost us money" claims are taken verbatim in substance from the live transparency page.
  4. Deploy: the page is not live. It needs the same route treatment as the rest of version_2 (preview Worker or
     install/public), with a clean `/verify` URL to match the canonical.

## Contact page + thank-you page (2026-11-20)
Two new pages in version_2, built from the live https://waterfiltration.sydney/contact-us content and
the home page's design system (no new colours, fonts or components invented).

- `contact-us.html`: hero with the quote form, three ways to reach us (call / form / email, ranked),
  canonical business details card beside the "what happens next" steps, the three verified Google
  reviews, service area, final CTA with the lifetime labour warranty. ContactPage + LocalBusiness +
  BreadcrumbList JSON-LD. Canonical https://install.waterfiltration.sydney/contact-us - change it if
  v2 is deployed anywhere else.
- `thank-you.html`: confirmation, "have these ready" card, 3 next steps, reviews, three "while you
  wait" links back into the lander, trust close. noindex, nofollow. Serves the same URL the forms
  already redirect to (https://install.waterfiltration.sydney/thank-you), so no redirect changed.
- New shared files: `assets/css/pages.css`, `assets/js/pages.js` (optional-fields toggle + thank-you
  personalisation). `assets/js/lead-fields.js` now also stores name/suburb/product in sessionStorage,
  so the thank-you page can greet the lead by first name; ?v= bumped to 20261120a on every page.
- Form: same Web3Forms key, native POST, same redirect. Hidden `Form` = "Contact page form", so leads
  are identifiable in the inbox. Email and job details are optional and fold behind one link, which is
  what lets the submit button clear the fold on a 375x667 phone.
- Contact hero phone order is headline -> form -> rating/licence -> call button -> facts/photos
  (`.hero-vs--contact`, explicit grid placement from 900px up, so desktop is unchanged in appearance).
  Fold at 375x667: submit bottom 562 vs sticky bar at 603.
- index.html: "Contact" added to the nav and "Contact Us" to the footer Explore column.
- `_work/2026-11-12/deploy-preview.sh` now copies contact-us.html and thank-you.html to the preview.
- Checks: `_work/2026-11-20/check_pages.js` RESULT PASS (fold at 6 sizes, no overflow, no console
  errors, no duplicate ids, JSON-LD parses, every link target exists, correct Web3Forms payload and
  field order, conversion fires once after a real submit and not on a direct visit). No real lead sent.

### Before going live
1. Send one real test lead from a browser on the deployed URL (automation cannot prove the key).
2. The "We're Open Now" pill uses data-open="7" data-close="19" every day - still unverified with the owner.
3. "Usually the same business day" on the thank-you page is carried over from the current live
   thank-you page; confirm the owner still stands behind it.
4. The thank-you conversion now fires only after a real submit in the same browser session (the live
   install page fires it on every load). Revert to unconditional by calling gtag_report_conversion()
   outside the guard if the owner prefers the old behaviour.

## Verify page copied into install/public (2026-11-20)
- `install/public/verify.html` is the version_2 page plus `<meta name="robots" content="noindex, nofollow">` (every page on
  the paid lander carries it). Its 21 assets were copied to `install/public/assets/` (the three CSS files, the three JS
  files, the logos, the two hero installs, the five badges, favicon/app icons and garage-install.webp, which styles.css
  references). Nothing in the existing v1 lander was touched, so the lander still looks v1 and this one page looks v2.
- Script: `_work/2026-11-20/deploy_verify_to_install.py` (re-runnable; it re-reads the page and re-copies the assets).
- **`node install/build.js` deletes install/public (`fs.rmSync`) and rebuilds it from the main site, so it wipes this page
  and its assets.** Re-run the deploy script after any lander rebuild, or add the page to build.js.
- `install/_headers` (and the copy in install/public): CSP extended for the v2 design's Google Fonts -
  `style-src ... https://fonts.googleapis.com` and `font-src ... https://fonts.gstatic.com`, plus a
  `/assets/*` cache rule. Without this the page would have rendered in fallback fonts on the live subdomain.
- `install/_redirects` (and the copy): `/verify.html` and `/verify/` -> `/verify` 301, matching the canonical.
- Backups of both files before the change: `_work/2026-11-20/backup/_headers`, `_redirects`.
- Check: `_work/2026-11-20/check_install_verify.js` serves install/public through a server that applies the real
  `_headers` (CSP + X-Robots-Tag). RESULT: PASS, 17 checks - fonts load under the CSP and the headline really renders in
  Poetsen One, every image loads, no overflow, local links resolve, canonical correct, form posts "Verify page form" to
  the subdomain thank-you. No real lead was sent.
- FOUND, pre-existing, not caused by this page: the Google Ads tag calls `https://ad.doubleclick.net/ccm/s/collect` and
  the lander CSP blocks it on **every** page (home and contact-us included), so that part of Ads conversion measurement
  is being dropped. Fix, if wanted, is `https://ad.doubleclick.net` in `connect-src` and `img-src` in `install/_headers`.
  Left alone here because it is a site-wide change, not part of saving this page.
- Still not linked from the lander's own pages: install/public/index.html etc. are build output, so a footer link has to
  go into `install/build.js` rather than the generated HTML.

## Ads lander build: buttons route to the contact page (2026-11-20)
`node version_2/build-lander.js` writes the Google Ads copy of this site into `install/public/`
(what the waterfiltrationsydney-install Worker serves at install.waterfiltration.sydney).

- Every "Get My Free Quote", "Contact Us For Installation + Pricing", "Quote this system",
  "Book My Free Water Test" and sticky-bar quote button on `/` and `/verify` now links to
  `/contact-us` instead of scrolling to the form on the page: 24 buttons. Buttons that preselected a
  system carry it over, e.g. `/contact-us?product=Reverse%20osmosis`, and lead-fields.js preselects
  it in the contact form.
- The pages keep their own forms: the lander hero form, the lander contact section and the verify
  page form all still submit in place. Only the buttons moved. Say so if the forms should go too.
- `/contact-us`'s own buttons still scroll to its own form, as they should.
- Lander-only changes applied by the script, matching install/build.js policy: noindex + nofollow,
  no canonical, no JSON-LD, clean URLs (`/`, `/contact-us`, `/thank-you`, `/verify`) and
  root-absolute `/assets/...` paths. Source files in version_2/ are untouched by the build.
- Assets copied: assets/css, assets/js and the 63 served images. The .jfif/.png originals in
  assets/images are sources and are left out.
- install/_headers already allows fonts.googleapis.com and fonts.gstatic.com and caches /assets/*,
  so the Google Fonts the v2 pages load are fine under the lander CSP.
- Thank-you conversion guard was relaxed so the OLD regional landers (/newcastle, /wollongong,
  /central-coast, /canberra, still built from the v1 root site) keep counting: the conversion fires
  once per browser session, plus again whenever a lead-fields.js form flags a new submit. A refresh,
  Back or shared link never counts twice.
- Checks: `_work/2026-11-20/check_lander.js` RESULT PASS, run against install/public served by
  `_work/2026-11-20/serve_lander.js` (a stand-in for the Worker: _redirects, clean URLs,
  drop-trailing-slash). Covers /, /contact-us, /thank-you, /verify and /newcastle: 200s, no missing
  files, no page errors, noindex, no canonical or JSON-LD, no overflow, every CTA destination, the
  ?product= handover and a mocked contact-form submit.

### Watch out
1. `node install/build.js` DELETES install/public and rebuilds the old v1 lander. A warning now sits
   at the top of that file. Re-run `node version_2/build-lander.js` after it, or retire build.js.
2. The regional pages (/newcastle, /wollongong, /central-coast, /canberra) are still the v1 design
   and now link to the v2 /contact-us, so their look does not match. Rebuild them from version_2 or
   leave them pointing at their own forms.
3. Nothing was deployed. `cd install && npx wrangler deploy` publishes install/public.
4. Backups of the v1 lander pages that were replaced: `_work/2026-11-20/backup/install-public-before/`.

## Footer: transparency link -> verify pill button (2026-11-20)
- Footer legal row on index.html, contact-us.html, thank-you.html and verify.html: the main-site
  `https://waterfiltration.sydney/transparency` link is gone, replaced by a small outlined pill button to this site's own
  `verify.html` ("Verify Our Licence", 32px tall, 13px, first item in the legal row; `aria-current="page"` on verify.html).
  Script: `_work/2026-11-20/swap_transparency_link.py`. Backup: `_work/2026-11-20/backup/pre-verify-pill/`.
- The `.footer__legal .btn--pill` rule went into `assets/css/styles.css`, not pages.css: index.html does not load pages.css.
  styles.css bumped to `?v=20261120a` on all four pages; pages.css stays `?v=20261120b`.
- The other legal links (privacy, terms, terms of sale, returns, disclaimer) still point at the main site and all return 200.
- For the record: `https://waterfiltration.sydney/transparency` itself answers 200 with the right page. What does not exist
  is `https://install.waterfiltration.sydney/transparency` - that subdomain serves the lander home for any unknown path
  (soft 404), so a relative transparency link on the lander would have looked broken.
- `https://install.waterfiltration.sydney/verify` is already live and serving this page.

## Lander CSP: Google Analytics unblocked (2026-11-20)
- `install/_headers` had already been extended (outside this session) with `ad.doubleclick.net`, `cloudflareinsights.com`
  and `www.google.com.au`. Two GA4 endpoints were still blocked on **every** lander page (home, contact-us, verify):
  `https://analytics.google.com/g/collect` (the `*.analytics.google.com` wildcard does not match the bare host) and
  `https://stats.g.doubleclick.net/g/collect`. Both added to `connect-src` in `install/_headers` and `install/public/_headers`.
- After the change all three pages report zero CSP blocks. Backup: `_work/2026-11-20/backup/_headers-before-ga4`.

## Deployed live (2026-11-20)
- `npx wrangler deploy -c install/wrangler.jsonc` from the repo root. Worker `waterfiltrationsydney-install`,
  custom domain install.waterfiltration.sydney. Version ID 8431914b-6e4d-498d-ae0e-9a1ee6b8c6d4; 7 files uploaded
  (verify.html, index/contact-us/thank-you.html, assets/css/styles.css, assets/css/pages.css, assets/js/lead-fields.js).
- **Deployed with wrangler directly, NOT `npm run deploy:install`**: that script runs `install/build.js` first, which
  rmSync's install/public and would delete verify.html and its assets before uploading.
- Live checks (Edge, phone 390 and desktop 1440): https://install.waterfiltration.sydney/verify serves the page,
  headline renders in Poetsen One, footer pill button present (147x30 / 151x32), every image loads, no horizontal
  overflow, no console errors, no CSP blocks, no 4xx. `/verify.html` and `/verify/` 301 to `/verify`.
  Headers live: `x-robots-tag: noindex, nofollow`, CSP with fonts.googleapis.com / fonts.gstatic.com and the GA4 hosts.
- Not done: no real lead was submitted from the live form. Send one test lead from a browser and confirm the email
  subject reads "... - <service> - <suburb> - <date time>" with Form = "Verify page form", and that it lands on
  /thank-you where the Ads conversion fires.

## Hero licence badge -> transparency page (2026-11-20)
- The hero proof strip link "Licence 358626C, verify it" now points to
  `https://waterfiltration.sydney/transparency` (main site, returns 200) instead of the external NSW
  register deep link. Changed on index.html, contact-us.html and verify.html in both `version_2/` and
  `install/public/`. thank-you.html has no hero proof strip, so nothing to change there.
- The NSW register URL (`verify.licence.nsw.gov.au/details/Contractor%20Licence/1-3L0RA4L`) is still used
  in the credentials list further down contact-us.html and verify.html - that one is the actual licence
  lookup and was left alone.
- Backup: `_work/2026-11-20/backup/pre-transparency-hero/`.
- Not deployed. Publish with `npx wrangler deploy -c install/wrangler.jsonc` from the repo root
  (NOT `npm run deploy:install`, which wipes install/public first).
- Noticed while doing this: `install/public/index.html` is an older build than `version_2/index.html` -
  its footer legal row still has the "Licensing & Transparency" link rather than the new verify pill
  button, and the live home page serves that older footer. The contact-us/verify pages are current.
- Deployed 2026-11-20: `npx wrangler deploy -c install/wrangler.jsonc`, Worker `waterfiltrationsydney-install`,
  Version ID 1b397725-14ce-4b81-8113-1113b12f9871, 3 files uploaded (index.html, contact-us.html, verify.html).
  Live check: all three pages serve the transparency link in the hero badge. The stale index.html footer
  (old "Licensing & Transparency" link instead of the verify pill) was deployed as-is and is still outstanding.

## Lander rebuilt from version_2 and redeployed (2026-11-20)
- Ran `node version_2/build-lander.js` - install/public was carrying an older index.html (old footer legal
  row, no verify pill). The builder regenerated all four pages (index, contact-us, thank-you, verify),
  repointed 24 quote buttons to /contact-us and refreshed css/js plus 63 images.
- Redeployed: `npx wrangler deploy -c install/wrangler.jsonc`, Version ID ab025268-5e72-474d-a1dc-a4d429ec7f1d,
  4 HTML files uploaded.
- Live check: /, /contact-us, /verify, /thank-you all 200; every page has the "Verify Our Licence" pill in
  the footer, noindex, no JSON-LD (lander policy), and the hero badge points at
  https://waterfiltration.sydney/transparency.
- Backup of the pre-rebuild install/public HTML: `_work/2026-11-20/backup/install-public-before-rebuild/`.

## Hero: opening hours, proof strip and verify pill (2026-11-20)
- **Hours 6am - 11:30pm.** The open pill was `data-open="7" data-close="19"` and the script compared whole
  hours only, so 11:30pm was not expressible. `assets/js/main.js` now reads the Sydney time as hour + minute
  and treats data-open/data-close as decimal hours, so `data-close="23.5"` means 11:30pm. Set on index.html,
  contact-us.html and verify.html. Boundary test: 05:59 closed, 06:00 open, 23:29 open, 23:30 closed.
  main.js bumped to `?v=20261120c` on all four pages.
- **Proof strip above the fold.** `.hero-proof` (Master Plumbers NSW, AGA listed gas fitter, NSW Government
  accredited, National Police Check, Trustpilot 4.5, ProvenExpert 4.8 as white tiles) plus `.hero-chips`
  (3-year product warranty, lifetime labour warranty, WaterMark-certified, Sydney Metro & Greater Sydney)
  sit inside `.hero-vs__copy`, between the rating/licence row and the CTA buttons, on index, contact-us and
  verify. The six badge images were copied from the main site's `images/` into `version_2/assets/images/`.
- **Verify Our Licence pill in the hero.** Same outlined pill as the footer, now sharing a `.hero-vs__pills`
  flex row with the live "We're Open Now" pill at the top of the hero. index.html and contact-us.html only;
  verify.html does not link to itself.
- On phones (<=639px) the badge row and the chip row are each one swipeable line. Without that the chips
  wrapped to four lines and pushed the hero CTA buttons below the fold at 375x667.
- Measured with `_work/2026-11-20/shots/hero-proof/` + the scratch measure script at 375x667, 390x844,
  768x1024, 1440x900 and 1920x1080: no horizontal overflow, no console errors, no broken badge images,
  and on index.html the badges, chips and both CTA buttons are above the fold at every size.
  On contact-us.html at 375x667 the strip falls below the fold by design - that hero puts the form first.
- CSS went into `assets/css/hero-vs.css`, bumped to `?v=20261120c` on all four pages.
- Backups: `_work/2026-11-20/backup/pre-hours/`, `backup/pre-hero-proofbar/`, `backup/pre-hero-pill/`.
- Deployed: `npx wrangler deploy -c install/wrangler.jsonc`, Version ID d6c11144-3c09-4e40-8e69-0ab63f51319d.
  Live check: the home page serves the proof strip, the hero pill, data-close="23.5" and the new css/js,
  and all six badge images return 200.

## Pulsing status dots, logo marquee, duplicate licence removed (2026-11-20)
- **Both status dots pulse.** The closed state was a static orange dot; it is now red (#e5332a) with its own
  `closed-pulse` keyframe, so open (green #36c45a) and closed (red) both pulse like an online indicator.
  The quote card's "Takes about 30 seconds" dot (`.dot` in styles.css) was a static green dot with a flat
  ring; it now runs `live-pulse`. Both respect `prefers-reduced-motion: reduce`.
  Verified by forcing each state in Playwright: open -> open-pulse/green, closed -> closed-pulse/red,
  live dot -> live-pulse/green. (The pill re-ticks every second, so the test stubs setInterval first.)
- **Accreditation logo row moved out of the hero.** It now sits in `.proof-marquee` directly above
  `.recent-installs__in` on index.html and scrolls in a seamless loop. The `.hero-chips` trust line stays in
  the hero. contact-us.html and verify.html keep the static `.hero-proof` row in their hero - neither page
  has a Recent Installations section.
- The marquee script was ported from the main site's js/main.js into `version_2/assets/js/main.js`, with one
  change: the main site only animates when the row overflows, so on desktop it sat still. This version repeats
  the badge set until the track is at least twice the viewport width and always scrolls. Pauses on hover and
  on focus; disabled under reduced motion (the row scrolls by hand instead).
  Measured: scrolling at all five sizes, 12.8s-16s per loop, no horizontal overflow, no console errors.
- **Duplicate licence number removed.** "NSW Licensed Plumber No. 358626C" in `.hero-vs__eyebrow` and
  "Licence 358626C, verify it" in `.hero-vs__proof` both sat above the fold. The number came out of the eyebrow
  (now "Water Filtration Sydney - NSW Licensed Plumber") and the clickable proof link was kept, because the
  eyebrow is hidden under 640px and the proof row shows on every size. Index, contact-us and verify.
- CSS/JS bumped: hero-vs.css `?v=20261120e`, styles.css `?v=20261120d`, main.js `?v=20261120e`.
- Backups: `_work/2026-11-20/backup/pre-pulse/`, `backup/pre-marquee/`. Shots: `shots/pulse/`, `shots/marquee/`.
- Deployed: Version ID 02c4b23c-9ea3-4bee-bc8d-a8a346d0c2cf. Live check: the home page serves the marquee,
  no `.hero-proof` in its hero, the eyebrow without the number, and both pulse keyframes are in the live CSS.

## Logo band restyled to match the main site proof bar (2026-11-20)
- Matched waterfiltration.sydney's `.proof-bar`: logos 78px tall (square badges 87px), tiles with a 1px
  #e0ecf5 border and 11px x 18px padding, 16px x 24px gaps, band padding 26px with a hairline rule.
  Phones (<720px): 60px logos, 9px x 13px padding, 12px gap, 20px band padding.
- Fix: the band sat inside `.recent-installs`, under its 40px / 64px top padding, so the top hairline floated
  in empty white space below the hero. It now pulls up through that padding (negative margin at the same
  980px breakpoint) and sits flush under the hero; the top rule is dropped because the hero's dark edge
  already separates it, and the bottom rule stays.
- hero-vs.css `?v=20261120g`. Backup of the pre-restyle CSS: `_work/2026-11-20/backup/pre-marquee/hero-vs-before-band.css`.
  Shots: `shots/marquee/band-desktop.png`, `band-phone.png`.
- Deployed: Version ID fa3163b3-4b47-4183-a0fd-c9506e68ad49. Checks: scrolling at all five sizes, no overflow,
  no broken images.

## Hero licence chip + verify-it links removed (2026-11-20)
- Hero: "Licence 358626C, verify it" link removed from the proof line; "Licence 358626C" is now the first hero chip
  (index, contact-us, verify). Footer "&#xb7; verify it" link to the NSW register removed (contact-us, verify).
- Backups: `_work/2026-11-20/backup-before-licence-chip/`. Rebuilt with `node build-lander.js`, deployed with
  `npx wrangler deploy -c install/wrangler.jsonc`, Version ID 054cc7f5-ea59-47d2-be92-9ea48fca0ec7. Live check passed.

## Hero facts de-duped + footer Compliance grid (2026-11-20, built, NOT yet deployed)
- Hero facts list under the Call button: removed "WaterMark certified components on every install" and
  "Lifetime labour warranty plus 3-year product warranty" (already in the hero chips). Backup: `_work/2026-11-20/backup-before-facts-dedupe/`.
- Footer (index, contact-us, verify, thank-you): "Licence & Compliance" column and the "NSW Licence No. ... Verify" line
  replaced by a full-width Compliance `dl` grid copied from the main site footer (8 items, 4 cols desktop, 2 cols >=560px,
  1 col phone), navy colours. CSS at the end of hero-vs.css (cache bust v=20261120h); `.sr-only` added there too.
  Backup: `_work/2026-11-20/backup-before-footer-compliance/`. Screenshots: `_work/2026-11-20/shots/`.
- Logo strips titled "Licensed, Insured & Accredited Water Filter Plumber": `.proof-title` above the home page badge
  marquee (takes over the marquee's pull-up under the hero) and `.hero-proof__title` above the hero logo row on
  contact-us and verify. CSS end of hero-vs.css, cache bust v=20261120i. Backup: `_work/2026-11-20/backup-before-logo-title/`.
- Deployed the three changes above 2026-11-20, Version ID 7a8bc551-aeca-49ad-8030-eac03d22df23 (/verify took ~1 min to clear the edge cache).
- Hero merge (deployed 2026-11-20, Version ID bc1d0d60-e5c9-457e-bc12-9c765d48534e): `.hero-chips` above the button removed on index, contact-us, verify; the facts
  list under the button now holds one de-duplicated list: Licence + police/ID, $20M PL, lifetime labour + 3-yr product
  warranty, WaterMark components, Sydney Metro & Greater Sydney. Backup: `_work/2026-11-20/backup-before-hero-merge/`.
- Known, pre-existing: on contact-us at 390px the "We're Open Now" pill pushes the page 3px wide.
