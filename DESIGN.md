# Top Seed — Editorial Journal

Approved direction: editorial, branded and comfortable to read. Updated 2026-10-05.

## Page system

- Ranking: asymmetric featured companies, a complete searchable index, and a recent-evidence rail. The original rank numbers remain visible after exclusions.
- Company: a reading column with product, funding, adoption and team evidence; a narrow fact rail; dated timeline; expandable original sources.
- Signals: dated article rows with company, source relationship and evidence state.
- Search: a simple company index with descriptive results.
- Policies: a single reading column. Corrections retain the before/after record.

The layout remains in the existing page modules. Shared navigation and footer belong to `shell.js`; sources belong to `pages/evidence.js`. Data cannot be replaced with visual fixtures.

## Visual system

Ivory paper with a subtle fixed SVG grain, charcoal text and burgundy links. Newsreader carries headings and the wordmark; Manrope carries body text and controls. Fonts are self-hosted with their OFL licenses.

- Paper: `#f7f3e8`
- Secondary surface: `#f0eeea`
- Ink: `#24251f`
- Secondary ink: `#41413d`
- Muted text: `#6c6c65`
- Rules: `#dedbd5`
- Accent/focus: `#7b243b`
- Notice: `#f5eaed`

All values live in `tokens.css`. `editorial.css` implements this system after the existing compatibility styles. Do not introduce page-specific colors or font families.

## Typography and spacing

Display headings are upright Newsreader, normally 40–60px. Section headings are 28–30px. Body text is 14–16px with 1.65–1.8 line height. Metadata is at least 12px. Prose stays within 65–68 characters per line.

Use the named spacing tokens. The content width is capped at 1380px. Major sections use 24–40px vertical space. Interactive targets have a 44px minimum where practical; dense source citations remain separate from neighboring controls.

## Copy

Keep facts, dates, source relationships and material uncertainty. Remove publishing-process boilerplate, repeated headlines, invented certainty, vague benefits and empty fields. Historical ranking rationale belongs in its review drawer, not in the main profile introduction.

A primary source is not independent validation. Company-reported metrics stay attributed. These distinctions belong next to the affected claim or in the evidence policy, not as repeated slogans across every component.

## Interaction

Visible source links, native search/filter forms, keyboard-operable tabs and disclosures, focus-trapped drawers, Escape recovery, stable company URLs and downloadable evidence records. No decorative motion. Reduced-motion mode removes transitions.

## Responsive

At desktop widths the index has an evidence rail and companies use a facts rail. Smaller layouts stack reading surfaces. Validate at 320, 375, 414, 768 and desktop widths. Preserve access to facts and downloads on small screens; avoid horizontal overflow and clipped controls.

## Design references

The approved editorial direction is represented by these internally generated concepts:

- Ranking: `.hallmark/concepts/ranking.png`
- Company: `.hallmark/concepts/company.png`

The user subsequently changed the accent from vermilion to burgundy; then requested ivory paper with subtle grain; the ink remains unchanged. The live dataset controls facts, counts and ordering. The complete index includes the featured companies; actual recent events are sorted by date. These are intentional differences from illustrative concept rows.

## Exports

`tokens.css` is the canonical export. Equivalent integration mappings:

```css
/* Tailwind v4 */
@theme {
  --color-paper: #f7f3e8;
  --color-ink: #24251f;
  --color-accent: #7b243b;
  --font-display: "Newsreader", serif;
  --font-body: "Manrope", sans-serif;
}
/* shadcn mapping */
:root {
  --background: var(--color-paper);
  --foreground: var(--color-ink);
  --primary: var(--color-accent-strong);
  --border: var(--color-rule);
  --ring: var(--color-focus);
}
```

```json
{
  "color": {
    "paper": { "$value": "#f7f3e8", "$type": "color" },
    "ink": { "$value": "#24251f", "$type": "color" },
    "accent": { "$value": "#7b243b", "$type": "color" }
  },
  "font": {
    "display": { "$value": "Newsreader", "$type": "fontFamily" },
    "body": { "$value": "Manrope", "$type": "fontFamily" }
  }
}
```

## Verification notes

Compared the two design concepts with rendered IAB screenshots at 1487×1058 and 1374×1145. Inspected page structure, type pairing, content hierarchy, spacing, source treatment and controls. Verified ranking and company layouts at 320, 375, 414 and 768px without clipped primary controls or horizontal overflow.

Intentional differences: actual data replaces illustrative rows; the index shows ten records per page, including featured companies; a native Apply button submits filters; company pages retain additional sourced research below the concept's shortened view. The user's later instructions replace the original accent with burgundy and add ivory paper grain. Initials are record identifiers, not representations of official company logos.
