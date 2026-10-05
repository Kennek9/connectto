# Top Seed — Private Markets Research

Updated 2026-10-05. Refinement authorized by the request for a premium financial website.

## Product and direction

A source-backed AI company index for investors and operators. The primary path is to narrow a funding cohort, inspect a company and read its evidence. The visual language combines an editorial masthead with the density and alignment of a research table. Rankings are editorial judgments, not prices, returns or investment advice.

Preserve ivory paper, subtle grain, burgundy emphasis, Newsreader and Manrope. Bring the index into the first desktop viewport. Use rules, hierarchy and aligned numbers rather than large empty cards or decorative financial charts.

## Composition

- Shared shell: quiet publication line, clear wordmark, compact navigation and a visible search shortcut.
- Ranking: title and edition facts, funding-stage tabs, compact leaders, searchable table and evidence rail. Current and historical editions stay distinct.
- Table: stable editorial rank, company/category, named funding round, dated evidence and explicit quick view. Changing display sort never changes the editorial rank.
- Company: research header, current/previous rank, complete evidence tabs, timeline, sources and factual sidebar.
- Signals and search: the same type scale, rules and row rhythm. Policies remain a narrow reading column.

## Tokens

`tokens.css` owns semantic colors, type, spacing, grid and motion. `editorial.css` implements them. Paper #f7f3e8; ink #24251f; muted #6c6c65; rule #dedbd5; burgundy #7b243b. New emphasis uses existing burgundy or pale burgundy surfaces. No extra brand color or font dependency.

Newsreader: wordmark and editorial headings. Manrope: company names in tables, controls, body and metadata. Use tabular figures for ranks, dates and amounts. Desktop headline 44–60px, section title 24–30px, body 14–16px, metadata 12px minimum. Content max 1380px; prose max 68ch. Controls retain 44px targets.

## Interaction and states

- Search and select filters update results immediately and persist in the URL. Native form submission remains a fallback. Active filters have a clear reset and useful empty state.
- Sort by editorial rank, company name or named-round date. Rank numbers remain immutable.
- Quick view opens only on an explicit button, supports Escape, traps keyboard focus and returns focus to its trigger. Full company pages and source links remain available.
- Funding-stage tabs stay available while scrolling and support arrow keys. Company research tabs have stable hash links.
- No automatic hover popovers, decorative tickers, fake trading metrics, account gates or inert buttons.
- Short color/opacity transitions only; reduced motion renders the complete static result.

## Responsive behavior

Desktop has an aligned table and evidence rail. Tablet retains a compact leader strip and simplifies table details. Mobile stacks funding and evidence under each company, with the research index immediately reachable. Advanced filters collapse, research tabs scroll within their own rail, and dialogs fit the viewport. Validate 390×844, 768×1024, 1440×900 and narrow 320px. No essential fact is removed solely to fit.

## Evidence and copy

Keep facts, dates, source relationships and material uncertainty. Do not invent prices, logos, performance, testimonials or metrics. Initials identify records; they are not official company logos. Dates of evidence are distinct from ranking cutoff. No repeated publishing slogans.

## Reference registry and provenance

- Existing Top Seed live page, inspected 2026-10-05: owned visual baseline; ivory grain, serif masthead and burgundy retained. Oversized empty first viewport and automatic overlays are replaced.
- https://www.ft.com/markets, read 2026-10-05: public content-architecture reference for separating lead coverage, dated updates and an indexed archive. Not a visual clone; no text, brand or assets reused.
- https://pitchbook.com/, read 2026-10-05: public product-positioning reference for private-market research. No proprietary UI, data or assets copied.
- Fonts remain the existing self-hosted OFL-licensed files. Grain remains the existing local SVG. No new generated or third-party imagery is required.
