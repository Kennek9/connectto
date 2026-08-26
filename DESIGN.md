# Top Seed · Hallmark Research Index

Status: locked production system, 2026-08-26

Top Seed is a public research index for AI companies. The visual system is shared by
Ranking, Signals, Search, Company records, and trust pages. The redesign changes only the
visual and interaction layer; existing routes, data, DOM structure, labels, and source
relationships remain authoritative.

## Genre

Editorial: light research desk, precise type, generous negative space, hairline rules, and
one restrained green/lime signal. The page should feel made from a printed research brief,
not from a dashboard kit.

## Macrostructure family

- App/index pages: **Index-First**. Ranking and Search lead with an ordered, source-linked
  index; stage controls and filters stay adjacent to the records they change.
- Company pages: **Index-First with Workbench variation**. The public identity and rank lead,
  then the tabular research workspace organizes evidence lenses without changing the source
  order.
- Trust pages: **Long Document variation**. Policy copy uses a readable single measure with
  dated metadata and direct recovery links.

The existing markup is the implementation boundary. No new content block, route, or DOM
node is introduced by this system.

## Theme · custom light research

The theme is custom because the requested combination is specific: light editorial research,
generous whitespace, precise typography, and restrained green/lime accents.

- Paper: `oklch(97% 0.012 145)`
- Paper 2: `oklch(94% 0.014 145)`
- Paper 3: `oklch(91% 0.016 145)`
- Ink: `oklch(20% 0.018 150)`
- Ink 2: `oklch(31% 0.015 150)`
- Rule: `oklch(84% 0.014 145)`
- Rule 2: `oklch(73% 0.014 145)`
- Muted: `oklch(49% 0.014 150)`
- Neutral: `oklch(39% 0.014 150)`
- Lime accent: `oklch(87% 0.18 116)`
- Green accent: `oklch(47% 0.14 150)`
- Focus: `oklch(54% 0.18 150)`

Axes: `light / roman-serif / chromatic-green ~150°`.

The lime accent marks active state, a small proof marker, and selected controls. It does not
fill a full section or act as a status substitute. Evidence states remain written labels.
No dark section, gradient, glass surface, shadow stack, or pure black/white base is used.

## Typography

- Display: `Baskerville`, `Iowan Old Style`, `Times New Roman`, serif; roman, weight 400.
- Body/UI: `Avenir Next`, `Helvetica Neue`, sans-serif; body 400, controls 600/700.
- Metadata reuses the body family with tracking and tabular figures; the system stays at two
  font families instead of turning monospace into a third body face.
- Display tracking: `-0.035em`; labels: `0.08em`–`0.12em`.
- Body measure: 45–75 characters on desktop; 38–55 on mobile.
- Headings are always roman. Existing `<em>` in display copy is styled as roman accent text,
  never italic.

## Spacing and layout

`tokens.css` owns a 4-point scale from `--space-3xs` through `--space-4xl`. Stylesheets use
named tokens for spacing, type, colour, rules, radii, and motion. The page frame is capped at
`--layout-max`; mobile gutters are at least `--space-md`.

- Index pages use a 12-column desktop frame and collapse to a readable stack below 60rem.
- Company research tabs become a two-column wrapping grid below 40rem; they never require
  horizontal scrolling.
- Root overflow uses `clip`, never `hidden`, so intentionally clipped marks cannot create a
  horizontal scroll container.
- Clickable labels stay on one line; parent layouts reflow instead.
- Data rows use `minmax(0, 1fr)` tracks and `font-variant-numeric: tabular-nums`.

## Component voice

- Navigation: N6 newspaper masthead syntax translated to the existing Top Seed header.
- Hero: H2 split diptych logic — editorial stage statement beside a compact evidence rail.
- Records: S1 left-margin ordinal gutter and F3 tabular spec-sheet rules.
- Company workspace: F3 tabular lens list with a two-column mobile collapse.
- Footer: Ft4 dense typographic colophon, kept light rather than dark.
- Links and buttons: rectangular, underlined or hairline outlined; no pills.

## Motion and interaction

Motion is quiet and functional:

- one local first-load signature on the primary `h1`, starting visibly at reduced opacity and
  never hiding the page skeleton;
- 120ms press/focus registration for buttons, links, stage controls, and rows;
- 220–420ms drawer, stage, and details continuity using only transform and opacity.

Easings are `--ease-out`, `--ease-in`, and `--ease-in-out`. Reduced motion collapses spatial
  movement to an opacity-only transition of at most 150ms. Focus rings appear instantly. No
  scroll hijack, parallax, loop, autoplay, or decorative floating motion.

## Accessibility and state contract

Every interactive surface keeps default, hover, focus-visible, active, disabled/empty,
selected, and unavailable states. Text accompanies colour for evidence, lifecycle, and stage
states. Hit targets are at least 44px. Source links remain visible without hover. Native
controls keep keyboard behaviour, and overlay focus remains owned by the existing router.

## Route contract

The system covers these existing surfaces without changing their markup or copy:

- Ranking: stage board, lead evidence, Top 3, updates, filters, full ranking, methodology
  summary, and independence boundary.
- Signals: dated stream, type filters, source relationship, and evidence drawer.
- Search: reviewed-company index and query state.
- Company: identity, rank, facts, evidence gaps, research workspace, timeline, and drawers.
- Trust: Methodology, Evidence policy, Corrections, and About.

## Preflight and provenance

The Hallmark preflight snapshot lives at `.hallmark/preflight.json`. The run memory lives at
`.hallmark/log.json`; this whole-site redesign is one `scope: app` entry so later runs keep
the system consistent rather than rotating each route independently.

## Exports

### `tokens.css`

`tokens.css` is the source of truth. The page stylesheet imports it before any rule.

```css
:root {
  --color-paper: oklch(97% 0.012 145);
  --color-paper-2: oklch(94% 0.014 145);
  --color-paper-3: oklch(91% 0.016 145);
  --color-ink: oklch(20% 0.018 150);
  --color-ink-2: oklch(31% 0.015 150);
  --color-rule: oklch(84% 0.014 145);
  --color-rule-2: oklch(73% 0.014 145);
  --color-muted: oklch(49% 0.014 150);
  --color-neutral: oklch(39% 0.014 150);
  --color-accent: oklch(87% 0.18 116);
  --color-accent-strong: oklch(47% 0.14 150);
  --color-accent-ink: oklch(20% 0.018 150);
  --color-focus: oklch(54% 0.18 150);
}
```

### Tailwind v4 `@theme`

```css
@theme {
  --color-paper: oklch(97% 0.012 145);
  --color-paper-2: oklch(94% 0.014 145);
  --color-paper-3: oklch(91% 0.016 145);
  --color-ink: oklch(20% 0.018 150);
  --color-ink-2: oklch(31% 0.015 150);
  --color-rule: oklch(84% 0.014 145);
  --color-rule-2: oklch(73% 0.014 145);
  --color-muted: oklch(49% 0.014 150);
  --color-accent: oklch(87% 0.18 116);
  --color-accent-strong: oklch(47% 0.14 150);
  --color-focus: oklch(54% 0.18 150);
  --font-display: "Baskerville", "Iowan Old Style", "Times New Roman", serif;
  --font-body: "Avenir Next", "Helvetica Neue", sans-serif;
  --font-outlier: var(--font-body);
}
```

### DTCG mapping

```json
{
  "color": {
    "paper": { "$value": "oklch(97% 0.012 145)", "$type": "color" },
    "ink": { "$value": "oklch(20% 0.018 150)", "$type": "color" },
    "rule": { "$value": "oklch(84% 0.014 145)", "$type": "color" },
    "accent": { "$value": "oklch(87% 0.18 116)", "$type": "color" },
    "accent-strong": { "$value": "oklch(47% 0.14 150)", "$type": "color" }
  },
  "font": {
    "display": { "$value": "Baskerville, Iowan Old Style, Times New Roman, serif", "$type": "fontFamily" },
    "body": { "$value": "Avenir Next, Helvetica Neue, sans-serif", "$type": "fontFamily" },
    "outlier": { "$value": "Avenir Next, Helvetica Neue, sans-serif", "$type": "fontFamily" }
  }
}
```

### shadcn/ui mapping

```css
:root {
  --background: 97% 0.012 145;
  --foreground: 20% 0.018 150;
  --card: 94% 0.014 145;
  --card-foreground: 20% 0.018 150;
  --primary: 47% 0.14 150;
  --primary-foreground: 97% 0.012 145;
  --muted: 84% 0.014 145;
  --muted-foreground: 49% 0.014 150;
  --border: 84% 0.014 145;
  --input: 73% 0.014 145;
  --ring: 54% 0.18 150;
  --radius: 0;
}
```
