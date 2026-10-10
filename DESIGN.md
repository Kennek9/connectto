# Top Seed — Funding Atlas

Updated 2026-10-10. Replaces the Editorial Journal system (ivory, burgundy, Newsreader, Manrope) at the user's request for a distinctive, premium VC-grade site.

## Product and direction

A source-backed index of private AI companies from Seed to Series C, for investors and operators. The primary path: pick a funding stage, read who leads it and why, narrow the index, open a company brief, then read the full research. Rankings are editorial judgments, not prices, returns or investment advice.

The page reads as a funding atlas: an espresso band carries the stage ladder and edition brief; bone paper carries the research. The memorable figure is the capital spectrum, a to-scale bar of every company's latest disclosed round.

## Information order

1. Stage ladder: Seed → Series A → B → C. Each rung shows disclosed latest-round capital, company count, median round and new entries. The active stage is filled oxblood.
2. Edition brief: selected/eligible counts, entries and exits since the previous edition, largest round with its share, biggest riser, disclosed-round coverage. Methodology and previous edition links.
3. Capital spectrum: one bar per disclosed round, the largest in oxblood, with the top three shares and the remainder labelled.
4. Top of the index: three leaders with rank, movement, sector, latest round, founders and the editorial judgment. Hidden while filters or a non-rank sort are active.
5. Full index: rank and movement, company (sector, HQ, summary), founders, latest round with source, latest evidence with source count, quick view. Filters: search (company, founder, product), sector, product form, region; sort by rank, round size, latest round, name.
6. Rail: recent evidence, sector mix (count and capital), edition changes (entered and left with reasons), research coverage.
7. Company page: band header with rank and previous rank, five-figure strip (latest round, round, announced, founders, evidence), then judgment, research lenses, timeline, sources and limits. Rail: at a glance, research record, people & capital (each founder with source and evidence state; named investors).

All figures are computed in `pages/stage-insights.js` from reviewed records. Missing facts read "Not publicly observed"; nothing is invented.

## Tokens

`tokens.css` owns every colour, type, space, motion and layout value; `editorial.css` reads them by name. `styles.css` is no longer loaded.

- Paper oklch(96.6% .012 75) bone; ink oklch(24% .018 40); muted oklch(50% .014 45); rule oklch(87.5% .014 75).
- Band oklch(25% .02 35) espresso; text on band oklch(95.5% .014 75); muted on band oklch(75% .02 50).
- Accent oxblood oklch(45% .115 22) for the active stage, the lead spectrum bar, the #1 rank and judgment rules; oklch(73% .095 32) for accent text on the band. No second accent hue.
- Instrument Serif (headlines, company names in features, judgments) and Instrument Sans (UI, tables). Money and ranks use Instrument Sans at 78% width. Both OFL, self-hosted in `assets/fonts`.
- Headings are always roman. Body 13–15px; metadata 12px minimum; controls keep 44px targets.

## Interaction and states

- Stage rungs are a tablist (arrow keys, Home/End). Filters update immediately and persist in the URL; native submission remains a fallback.
- Display sorting never renumbers the editorial rank.
- Quick view opens from explicit buttons or a spectrum bar, traps focus, closes on Escape and returns focus.
- Spectrum bars are pointer shortcuts; the same companies are keyboard-reachable in the index. The bar's `aria-label` states the totals and top shares.
- Motion: short colour transitions and a 220ms drawer slide; reduced motion renders the static result.

## Responsive behavior

Validate 320, 390, 768 and 1440 widths. The ladder becomes 2×2 under 900px; the index drops the evidence column under 900px and stacks founders and round under each company under 640px. The company figure strip folds to three, then two columns. No horizontal scroll.

## Evidence and copy

Keep facts, dates, source relationships and uncertainty. No invented metrics, logos, testimonials or investor names. Initial-letter logo marks are not used.

## Reference registry and provenance

- Concepts A and A2 in `.hallmark/concepts/` (2026-10-10): owned explorations; A2 with the Bone & Oxblood palette was selected.
- Previous Top Seed site (2026-10-05): owned baseline for content, routes and behaviour.
- Fonts: Instrument Sans and Instrument Serif, SIL OFL 1.1, licences in `assets/fonts/`.
