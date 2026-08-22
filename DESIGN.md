# Top Seed · Field Ledger design system

Status: selected production direction, 2026-08-22

This document is the implementation contract for the public Top Seed site. Direction A,
Field Ledger, was selected at 91/100 by the Sol visual gate. It replaces the historical
warm-card, comparison, subscription, and evidence-stamp contract. The product is a public
research index: Ranking, Signals, Search, contextual Company records, and direct trust pages.

## Product job

Top Seed helps a research reader answer four questions in one path:

1. Which companies matter in this stage?
2. What does a selected company do and who uses it?
3. What public signal changed the picture?
4. Which original source supports the claim?

The header contains the Top Seed mark plus `Ranking`, `Signals`, and `Search`. Company is
opened from a record, signal, or search result. Methodology, Evidence Policy, Corrections, and
About stay in secondary navigation. There is no Compare, Subscribe, paid-entry, or Series D+
surface in this system.

## Art direction

Field Ledger is a public research desk made from paper, carbon type, and one correction line.
The signature is structural rather than decorative:

- A stacked `TOP / SEED` masthead establishes the product before the current board.
- Oversized vermilion ordinals form a left reading gutter; an ordinal is navigation, never a
  score or investment recommendation.
- A current-board proof object puts the stage, reviewed date, candidate-pool statement, and a
  real company or signal in the first viewport.
- A dated source rail stays beside the company or event. Source relationship and evidence state
  remain text-visible.
- Paper and carbon surfaces split utility navigation from evidence reading. One vermilion edge
  marks active or corrective state; it never means positive or negative performance.

The production surface uses flat paper, type, and rules. No rounded card stack, shadow stack,
gradient, decorative chart, ornamental stamp, fake real-time animation, or screenshot-as-UI is
allowed. Real content must occupy the primary viewport at 390px, 768px, and 1440px.

## Reference contract and originality boundary

The live-reference gate passed §6.12 at 100/100 in
`artifacts/visual-reference-research/report.md`. Direction A adapts four observed principles:

- source and control adjacency from Our World in Data;
- ordinal/date archive wayfinding from The Pudding;
- dated source rails from Physical Intelligence;
- visible metric, unit, and comparison context from Artificial Analysis.

We take evidence context, date-led wayfinding, compact metadata, and calm state transitions.
We leave all reference logos, names, copy, photographs, illustrations, exact palettes, chart
geometry, and proprietary UI. The Top Seed masthead, ordinal gutter, paper/carbon split, and
vermilion correction edge are original system decisions.

## Tokens

| Role | Token | Value |
| --- | --- | --- |
| Reading paper | `--paper` | `#F4F0E6` |
| Focused paper | `--paper-bright` | `#FFFDF7` |
| Utility carbon | `--carbon` | `#0D2338` |
| Body ink | `--ink` | `#243243` |
| Quiet metadata | `--ash` | `#5D6570` |
| Hairline | `--rule` | `#C8C6BD` |
| Strong rule | `--rule-strong` | `#0D2338` |
| Correction / active | `--correction` | `#E64A2E` |
| Source context | `--signal-blue` | `#2F66B3` |
| Utility marker | `--marker` | `#F1C84B` |
| Keyboard focus | `--focus` | `#1B5E9E` |
| Direct evidence | `--verified` | `#176B45` |

Statuses always include a written label such as `Direct`, `Corroborated`, `Reported`,
`Unverified`, `Source unavailable`, or `Not publicly observed`; color is supplemental only.

## Typography

- Display: `Baskerville, "Iowan Old Style", Georgia, serif`; oversized masthead and ordinals.
- Editorial: `Georgia, "Times New Roman", serif`; company names, signal titles, and long-form
  explanation.
- UI: `"Arial Narrow", "Helvetica Neue", Arial, sans-serif`; navigation, controls, summaries.
- Metadata: `SFMono-Regular, Menlo, Monaco, Consolas, monospace`; dates, stage, source, and
  evidence labels.

Normal body text remains at least 16px. Metadata remains at least 12px on mobile; it may wrap.
Long-form measure stays around 60–72 characters on desktop and 38–55 on mobile. Display type
may be large, but never forces horizontal scrolling or hides the next real content block.

## Layout and responsive rules

- Content max width is 1320px. Desktop uses a 12-column grid with 24px gutters.
- Tablet at 768px uses an 8-column grid and 20px outer gutters.
- Mobile at 390px uses a four-column reading flow and 16px outer gutters.
- The masthead stacks brand, stage, reviewed date, and proof context in that order on mobile.
- Ranking rows read `rank → company → funding → latest move → source` when stacked.
- Signal entries read `date → company/type → title → Why it matters → source`.
- Filters wrap below the active reading surface; they never clip a company, date, status, or
  source link.
- The layout remains operable at 200% zoom. Native controls may grow vertically and text may
  wrap; no fixed-height text container may conceal content.

## Component contract

### Rail Header

Semantic `header` and `nav` with the brand, Ranking, Signals, and Search. Active route is
visible in text and with a vermilion rule. Desktop and mobile use the same information
architecture. All links and the mobile menu have a 44px hit area, `aria-current` where relevant,
and visible focus.

### Stage Control

Four real controls for Seed, Series A, Series B, and Series C. Active stage uses text plus rule;
an under-review stage explains that the candidate pool is not published yet. Stage changes keep
the board context and update the URL. No locked or disabled stage may pretend to contain data.

### Ledger Row

A semantic row containing ordinal, company identity, one-line description, form/category or
region metadata, financing evidence, latest public move, and a source or Company action. Hover
and focus may reveal a proof rail by transform only. The row remains useful with missing data;
missing values say `Not publicly observed` or `Source unavailable`.

### Signal Entry

A dated event entry containing company, signal type, title, event date, source date where known,
evidence state, provenance, `Why it matters`, and an original source action. Direct, Corroborated,
Reported, and Unverified states are text-labelled. Event date is not silently replaced by source
date.

### Company Sheet

Company identity and what-it-does explanation precede rank, financing, research lenses, timeline,
and source ledger. `Why selected`, evidence gaps, current rank state, archive state, and stage
conflict are explicit. The sheet has one meaningful `h1`, a logical reading order, and source
links beside the facts they support.

### Filter Strip and Search

Every input and select has a visible label, native keyboard behavior, and an explicit clear or
empty result. Search covers reviewed Top 200 records only. Ranking filters preserve the original
ordinal and report the visible count. Search is a primary header action and a complete page, not
an icon-only affordance.

### Source Link

Source links name the destination or source type and expose `Source unavailable · suggest a
correction` when a stored source fails. A source link is never hover-only and never represented by
an unlabeled icon. External sources open in a new tab with `rel="noreferrer"`.

### Trust Content

Methodology, Evidence Policy, Corrections, and About use the same paper/ink hierarchy with formal
headings, readable paragraphs, source semantics, and executable recovery links. The trust pages
explain candidate-pool counts, stage rules, qualitative judgment, evidence states, correction
handling, and commercial independence without exposing pseudo-precise ranking weights.

## State contract

The showcase and production routes must make these states visible and testable:

- default, hover, focus-visible, pressed/selected, and keyboard restoration;
- disabled or under-review stage;
- empty/no-match filter and Search result;
- invalid Company route with a recovery link;
- archived Company and stage-conflict Company;
- source unavailable with correction path;
- reduced-motion equivalent with the same complete content.

State must never depend on color alone. Empty, unavailable, and under-review states preserve the
same landmarks and navigation path as a populated state.

## Motion and accessibility

Motion explains route continuity, stage changes, row proof context, or source-drawer state only:

- 120ms registration rule and focus marker;
- 220ms stage, drawer, or proof-rail continuity;
- 360ms first-view entry when it does not delay content.

Only `transform` and `opacity` animate. There is no scroll hijacking, WebGL, autoplay media,
smooth-scroll engine, or animation dependency. `prefers-reduced-motion: reduce` removes reveals,
tilt, and transitions while preserving all content, focus, and action results.

The implementation uses semantic landmarks, real links and buttons, labelled native controls,
visible `:focus-visible`, 44px touch targets, AA contrast, no color-only status, and no remote
visual dependency. Focus order follows the reading order. Overlay focus is trapped and restored
by the router owner; this file only defines the visual contract.

## Debt disposition

TS-002 is retired: Signals is a first-class primary route with dated entries, evidence state,
source relationship, and recovery copy. TS-003 is retired: the app-structure revision closed the
focus-trap and Escape restoration conflict. TS-001 is closed by the component showcase and the
integrated 390/768/1440 evidence recorded in the artifact report.

## Verification evidence

The standalone component showcase gate is captured at
`/Users/kennn/Documents/GitHub/connectto/.omo/teams/team-9166b17d/artifacts/field-ledger-showcase/`.
The integrated shell is checked at 390×844, 768×1024, and 1440×900 with syntax/build checks,
focus states, reduced motion, 200% zoom, and horizontal-overflow checks. The production design
score target is §6.8 / 95 or higher; this document records the contract, not a self-approval.

## Deliberate limits

No new framework, dependency, icon package, image treatment, data model, ranking weight, or
commercial surface is introduced by the design system. Missing source data stays missing until
the research/data owners provide an auditable record.
