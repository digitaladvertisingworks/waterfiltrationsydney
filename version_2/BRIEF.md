# Version 2 Brief - install.waterfiltration.sydney rebuild

Status: BRIEF ONLY. No code written yet. Waiting for instructions.
Created: 2026-10-29
Adapted from the "Council Approvals, Home Design & Construction" brief (see `source-brief-original.md`).

---

## Open decisions (answer before build)

1. **Reference site. DECIDED 2026-10-29:** https://vanguardplumbingandgas.com.au/ only. Lloyds Building is dropped.
2. **"Exact clone" vs "not pixel-for-pixel".** The source brief says both. Proposed: the global CLAUDE.md clone rule - match the reference's look (fonts, colours, sizes, gutters, shapes) but never copy its text, images or business details.
3. **Source brief was cut off** partway through "Entity Structure". Paste the remainder (schema, forms, performance, deliverables) if there was more.
4. **Logo.** `version_2/safewater-filtration-sydney-logo.png` is in this folder. Confirm it is the logo to use (the live page uses `images/water-filtration-sydney-logo.webp`).

---

### Decided 2026-10-29 (go-ahead given)

- Colours: Vanguard's measured palette, fonts and sizes.
- Sections with no genuine content: fill from the current install page; drop if nothing fits.
- Logo: `version_2/safewater-filtration-sydney-logo.png`.
- Clone rule: visual sameness, never Vanguard's text, images or business details.

## Role

Senior Australian Google Ads landing page developer, CRO strategist, UI/UX designer, static HTML expert, local SEO, entity SEO and performance specialist.

## Strict adherence

- Do not invent services, brands, prices, licences, certifications, warranties, ratings, review counts, water-test results, health claims or service areas.
- If a fact is not on the current site (`index.html` / `pages/`) or in `site.json`, flag it rather than add it.

## Project

Rebuild https://install.waterfiltration.sydney/ as a clean, high-converting static landing page for Google Ads.

- Business name: **Water Filtration Sydney**
- Phone: **0421 601 540** (`tel:+61421601540`)
- Service area: Sydney Metro and Greater Sydney, exactly as the current site states. No new suburbs.
- Positioning: water filter installation by NSW licensed plumbers.

## Confirmed business facts

| Item | Value | Source |
|---|---|---|
| Business name | Water Filtration Sydney | `site.json` |
| Phone | 0421 601 540 | `index.html` |
| Address | Sussex St, Sydney NSW 2000 (no street number) | `site.json` |
| ABN | 98 700 073 016 | `site.json` |
| ACN | 700 073 016 | `site.json` |
| Licence | NSW Contractor Licence and Qualified Supervisor No. 358626C | `site.json` |
| Licensee | Alexander Cossetto | `site.json` |
| Licence verify link | https://verify.licence.nsw.gov.au/details/Contractor%20Licence/1-3L0RA4L | `site.json` |
| Insurance | $20M public liability | `site.json`, `index.html:116` |
| Service area | Sydney Metro and Greater Sydney | `index.html` schema |
| Brands | Puretec, Billi, Waterworks, Aqua Cooler, Blue Mountain Co | `images/brand-*.webp` used on page |
| Reviews | Named Google reviews: Carmel Bhatty, Daniel Colantoni, Lucy Sun | `index.html` |
| Install photos | 10 real jobs: Baulkham Hills, Castle Hill, Cronulla, Eastern Suburbs, Northern Beaches, Parramatta, Rose Bay, Sutherland Shire (x2), Sydney CBD | `img/recent-installation-*.jpg` |
| Other photos | Twin whole-house housings in garage, copper plumbing, filtered water kitchen, vehicle at commercial premises, HPF-3 bundle | `images/*.webp` |
| Trust badges on page | NSW licensed plumber, WaterMark, AS 3498, JAS-ANZ, Master Plumbers, National Police Check, AGA gas fitter, NSW Government Accredited, Australian Made, ProvenExpert, Trustpilot | `images/badge-*.webp` |
| Brand colour | #1571c4 | `site.json` |

### Still open / handle with care

- **Hours:** the install page states none. Only the emergency page schema says 24/7. Do not add hours unless supplied.
- **Star rating / review count:** CORRECTED 2026-10-29: the live hero states "5.0 out of 5 stars, Google rating" (no review count). v2 uses 5.0, no count. The live page also confirms "Get My Free Quote", "Free Water Quality Testing Audit + $0 Callout" and the $5,500 bundle (usually $7,000).
- **Badges:** "NSW Government Accredited", "Master Plumbers" and "AGA gas fitter" are membership/accreditation claims. Keep only because they are on the current page; drop any that cannot be backed up.

## Design reference (look only)

- Reference: https://vanguardplumbingandgas.com.au/ (confirmed)
- Copy its design: header, navigation, hero, type scale, spacing, content width, cards, image treatment, CTA and button styles, trust-content placement, process and FAQ presentation, footer, tablet and mobile behaviour, mobile menu.
- Never copy: Vanguard's name, logo, text, images, projects, reviews, awards, licences, team, contact details, areas, prices, offers or stats.
- Workflow: `site-clone-reference` skill - ask palette and missing-sections decisions first, measure the reference, section map, build, side-by-side compare, `check_site.py` until PASS.
- Also draw on: `marketingskills/`, `ui-ux-pro-max-skill-main/`, `ai-website-cloner-template-master/`.
- Where the reference has a section with no genuine Water Filtration Sydney content, omit it or add a clearly labelled placeholder.

## Services (only those confirmed on the current site)

- Whole-house water filtration installation
- Under-sink water filter installation
- Reverse osmosis system installation
- Commercial water filtration installation
- Water filter replacement and servicing

## Claims to keep accurate

- No health or medical claims, and no "removes X%" figures unless already sourced on the site.
- No guaranteed results.
- No council, Sydney Water or government endorsement beyond what is already stated and verifiable.
- Keep existing wording on water pressure, cartridge life and "RO is not right for every home" (from the current FAQs).

## Customer journey

1. I do not like my water (taste, chlorine, buying bottled water)
2. Which filter does my property need?
3. Whole house, under-sink or RO?
4. Licensed installation
5. Servicing and cartridges
6. Call or get a quote

## Page structure

Follow the reference's rhythm, filled with current content:

1. Sticky header with phone number
2. Hero: current H1 "Stop the Chlorine Taste and Stop Buying Bottled Water. Expert Filtration at Every Tap." plus above-the-fold quote form
3. Recent installs
4. Problem: "Most Filtration Regrets Start Before Anyone Turns a Tap"
5. "Tell Us The Goal. We'll Match The System." (system cards)
6. Residential and commercial water filtration
7. Proof: "Installs You Can Inspect. Reviews You Can Check." (verified reviews only)
8. Why choose us: "Installed Right, Backed Properly"
9. Choosing the right water filter
10. "Four Steps From Enquiry To Filtered Water"
11. Why professional installation matters
12. Across Sydney and Greater Sydney
13. FAQs (the 8 existing questions)
14. Final CTA: "Ready For Better Water?"
15. Footer with quick links, contact, compliance

## Hero

- Must state: Water Filtration Sydney, licensed installation, filter types, Sydney / Greater Sydney.
- Primary CTA: "Find Out Which Filter You Need" (or the current form CTA).
- Secondary CTA: "Call 0421 601 540".
- No "free", "same-day", "guaranteed", "cheapest" or star rating unless the source confirms it.

## Forms

- Use the `web3forms-lead-forms` skill (CRO rules, templates, test harness).
- Thank-you page: `thank-you.html`.

## Local SEO and entity

- Topics to connect: Water Filtration Sydney, Sydney NSW, water filter installation Sydney, whole house water filter Sydney, under-sink water filter, reverse osmosis, commercial water filtration, filter servicing.
- Natural geographic mentions. No suburb doorway pages. No keyword stuffing.
- Entity chain: Water Filtration Sydney -> water filtration installation business (NSW licensed plumbing contractor 358626C) -> serves Sydney Metro and Greater Sydney -> installs the five services above.
- Schema: LocalBusiness / Service / FAQPage, built from visible text only.

## File rules

- Deliverables in `version_2/`.
- Plain ASCII or HTML entities only (no mojibake). `<meta charset="utf-8">` on every page.
