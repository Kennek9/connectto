import { AS_OF, REFRESH_DATE, COMPANIES, arrowIcon, chevronIcon, escapeHtml, formatDate, latestSignal, rankedCompanies, searchIcon, sourceLink, stageCompanies } from "../shared.js";
import { companySources } from "../evidence.js";
import { CATEGORY_OPTIONS, SORT_OPTIONS, stageById, state, companyUrl } from "../state.js";
import { HISTORICAL_AS_OF } from "../data.js";
import { CATEGORY_LABELS, amountSizeClass, categoryLabel, editionChanges, formatMillions, founderNames, ladderSummaries, roundMillions, sectorMix, stageSummary } from "./stage-insights.js";

const hasFilters = () => state.query.trim() || [state.category, state.productForm, state.region].some(value => value !== "all");
const rank2 = (value) => String(value).padStart(2, "0");

export function filteredCompanies() {
  const query = state.query.trim().toLowerCase();
  const records = rankedCompanies(state.stage).filter(company => {
    const text = [company.name, company.summary, company.audience, company.category, company.productForm, company.region, company.domain, ...founderNames(company), ...(company.products || []), ...company.events.flatMap(event => [event.title, event.detail])].join(" ").toLowerCase();
    return (!query || text.includes(query))
      && (state.category === "all" || company.category === state.category)
      && (state.productForm === "all" || company.productForm === state.productForm)
      && (state.region === "all" || company.region === state.region);
  });
  if (state.sort === "name") records.sort((a, b) => a.name.localeCompare(b.name));
  if (state.sort === "recent") records.sort((a, b) => String(b.funding.date || "").localeCompare(String(a.funding.date || "")) || a.editorialRank - b.editorialRank);
  if (state.sort === "amount") records.sort((a, b) => (roundMillions(b) ?? -1) - (roundMillions(a) ?? -1) || a.editorialRank - b.editorialRank);
  return records;
}

function rankChange(company) {
  const previous = company.historicalRanking;
  if (!previous) return `<small class="rank-change" data-move="new" title="First appearance in this index">New</small>`;
  if (previous.stageId !== company.stageId) return `<small class="rank-change" data-move="moved" title="Previously ${escapeHtml(previous.stage)} #${previous.rank}">From ${escapeHtml(previous.stage)}</small>`;
  const difference = previous.rank - company.editorialRank;
  const since = formatDate(HISTORICAL_AS_OF);
  const text = difference > 0 ? `▲ ${difference}` : difference < 0 ? `▼ ${Math.abs(difference)}` : "—";
  const label = difference ? `${difference > 0 ? "Up" : "Down"} ${Math.abs(difference)} places since ${since}` : `Unchanged since ${since}`;
  return `<small class="rank-change" data-move="${difference > 0 ? "up" : difference < 0 ? "down" : "same"}" aria-label="${label}" title="${label}">${text}</small>`;
}

function founderLine(company, max = 2) {
  const names = founderNames(company);
  if (!names.length) return `<span class="is-missing">Not publicly observed</span>`;
  const shown = names.slice(0, max).map(escapeHtml).join(", ");
  return names.length > max ? `${shown} <span class="founder-more">+${names.length - max}</span>` : shown;
}

function renderStageLadder() {
  return `<nav class="stage-ladder" role="tablist" aria-label="Funding stage">${ladderSummaries().map((summary, index) => {
    const id = summary.stage.id;
    const active = state.stage === id;
    return `<button id="stage-tab-${id}" type="button" class="stage-rung" role="tab" aria-selected="${active}" aria-controls="stage-content" tabindex="${active ? 0 : -1}" data-action="set-stage" data-stage="${id}">
      <span class="rung-step">${rank2(index + 1)}</span><span class="rung-label">${escapeHtml(summary.stage.label)}</span>
      <span class="rung-total">${formatMillions(summary.total)}</span>
      <span class="rung-caption">disclosed in latest rounds</span>
      <span class="rung-facts"><span>${summary.companies.length} companies</span><span>Median ${formatMillions(summary.median)}</span><span>${summary.entered} new</span></span>
    </button>`;
  }).join("")}</nav>`;
}

function renderEditionBrief(summary) {
  const { stage, largest, biggestRiser } = summary;
  const share = largest && summary.total ? Math.round((largest.value / summary.total) * 100) : 0;
  return `<section class="edition-brief" aria-labelledby="edition-title">
    <div class="edition-brief-head">
      <h1 id="edition-title">The ${escapeHtml(stage.label)} edition</h1>
      <p>${summary.companies.length} companies selected from ${stage.eligibleCount} eligible companies reviewed. ${summary.entered} entered and ${summary.left} left since ${formatDate(HISTORICAL_AS_OF)}.</p>
      <div class="edition-links"><a class="text-link" href="?view=methodology">Selection methodology ${arrowIcon()}</a><a class="text-link" href="?view=archive&stage=${state.stage}">Previous edition ${arrowIcon()}</a></div>
    </div>
    <dl class="edition-figures">
      <div><dt>Largest round</dt><dd>${largest ? `<strong>${escapeHtml(largest.company.funding.amount)}</strong><a href="${companyUrl(largest.company)}">${escapeHtml(largest.company.name)}</a><small>${share}% of disclosed capital</small>` : `<strong>—</strong><small>No disclosed amount</small>`}</dd></div>
      <div><dt>Biggest riser</dt><dd>${biggestRiser ? `<strong>#${biggestRiser.historicalRanking.rank} → #${biggestRiser.editorialRank}</strong><a href="${companyUrl(biggestRiser)}">${escapeHtml(biggestRiser.name)}</a><small>${escapeHtml(categoryLabel(biggestRiser))}</small>` : `<strong>—</strong><small>No company moved up</small>`}</dd></div>
      <div><dt>Disclosed rounds</dt><dd><strong>${summary.disclosed.length} of ${summary.companies.length}</strong><small>Median round ${formatMillions(summary.median)}</small></dd></div>
    </dl>
  </section>`;
}

function renderSpectrum(summary) {
  if (!summary.disclosed.length) return "";
  const share = (value) => Math.round((value / summary.total) * 100);
  const labelled = summary.disclosed.slice(0, 3);
  const labelledTotal = labelled.reduce((sum, item) => sum + item.value, 0);
  const rest = summary.disclosed.length - labelled.length;
  const description = `${formatMillions(summary.total)} of disclosed latest-round capital across ${summary.disclosed.length} companies. ${labelled.map(({ company, value }) => `${company.name} ${formatMillions(value)}, ${share(value)}%`).join("; ")}.`;
  return `<figure class="capital-spectrum">
    <figcaption class="spectrum-head"><span class="spectrum-title">Capital spectrum</span><span>Each bar is one company's latest disclosed round, to scale. Select a bar for its brief.</span></figcaption>
    <div class="spectrum-bar" role="img" aria-label="${escapeHtml(description)}">${summary.disclosed.map(({ company, value }, index) => `<span id="spectrum-${company.id}" class="spectrum-seg${index === 0 ? " is-lead" : ""}" style="flex-grow:${value}" tabindex="-1" data-action="open-company-preview" data-company="${company.id}" title="#${company.editorialRank} ${escapeHtml(company.name)} · ${escapeHtml(company.funding.amount)}"></span>`).join("")}</div>
    <ol class="spectrum-key">${labelled.map(({ company, value }, index) => `<li${index === 0 ? ' class="is-lead"' : ""}><span class="key-share">${share(value)}%</span><a href="${companyUrl(company)}">${escapeHtml(company.name)}</a><span class="key-amount">${formatMillions(value)}</span></li>`).join("")}${rest ? `<li><span class="key-share">${100 - labelled.reduce((sum, item) => sum + share(item.value), 0)}%</span><span>${rest} other companies</span><span class="key-amount">${formatMillions(summary.total - labelledTotal)}</span></li>` : ""}</ol>
  </figure>`;
}

function renderFeatured(company, index) {
  return `<article class="featured-company ${index === 0 ? "featured-company--lead" : ""}">
    <div class="feature-position"><span class="feature-rank">${rank2(company.editorialRank)}</span>${rankChange(company)}</div>
    <span class="feature-category">${escapeHtml(categoryLabel(company))}</span>
    <a class="feature-identity" href="${companyUrl(company)}"><h3>${escapeHtml(company.name)}</h3></a>
    <p class="feature-summary">${escapeHtml(company.profile.shortDescription || company.summary)}</p>
    <dl class="feature-facts">
      <div><dt>Latest round</dt><dd><strong>${escapeHtml(company.funding.amount)}</strong> ${escapeHtml(company.funding.stage)} · ${formatDate(company.funding.date)}</dd></div>
      <div><dt>Founders</dt><dd>${founderLine(company, 3)}</dd></div>
    </dl>
    <blockquote class="feature-judgment"><p>${escapeHtml(company.rankingReview.rationale)}</p></blockquote>
    <button type="button" id="feature-preview-${company.id}" class="button" aria-label="Quick view of ${escapeHtml(company.name)}" data-action="open-company-preview" data-company="${company.id}">Quick view ${chevronIcon()}</button>
  </article>`;
}

function renderLeaders() {
  return `<section class="leaders-section" aria-labelledby="leaders-title"><div class="section-head"><h2 id="leaders-title">Top of the index</h2><p>The three strongest cases this edition, with the judgment behind each placement.</p></div><div class="featured-edition">${rankedCompanies(state.stage).slice(0, 3).map(renderFeatured).join("")}</div></section>`;
}

function renderLatestUpdates() {
  const updates = COMPANIES.filter(company => company.stageId === state.stage)
    .flatMap(company => company.events.map(event => ({ company, event })))
    .sort((a, b) => b.event.date.localeCompare(a.event.date)).slice(0, 4);
  return `<section class="rail-block recent-evidence" aria-labelledby="updates-title"><h2 id="updates-title" class="rail-title">Recent evidence</h2>${updates.map(({ company, event }) => `<article class="recent-item"><div class="recent-meta"><time datetime="${event.date}">${formatDate(event.date)}</time><a href="${companyUrl(company)}">${escapeHtml(company.name)}</a></div><button type="button" class="recent-event" data-action="open-evidence" data-company="${company.id}" data-event="${event.id}" id="update-evidence-${company.id}-${event.id}">${escapeHtml(event.title)}</button>${sourceLink(event.source, event.source?.relationship || "Original source")}</article>`).join("")}<a class="text-link" href="?view=signals&stage=${state.stage}">All signals ${arrowIcon()}</a></section>`;
}

function renderSectorMix() {
  const mix = sectorMix(state.stage);
  const max = Math.max(...mix.map(row => row.count));
  return `<section class="rail-block" aria-labelledby="sector-mix-title"><h2 id="sector-mix-title" class="rail-title">Sector mix</h2><ul class="sector-mix">${mix.map(row => `<li><span class="mix-label">${escapeHtml(row.label)}</span><span class="mix-count">${row.count}</span><span class="mix-capital">${formatMillions(row.total)}</span><span class="mix-bar" style="--share:${(row.count / max).toFixed(3)}" aria-hidden="true"></span></li>`).join("")}</ul><p class="rail-note">Companies and disclosed latest-round capital per sector.</p></section>`;
}

function renderChanges() {
  const { entered, left } = editionChanges(state.stage);
  const item = (company, detail) => `<li><a href="${companyUrl(company)}">${escapeHtml(company.name)}</a><span>${escapeHtml(detail)}</span></li>`;
  return `<section class="rail-block edition-changes" aria-labelledby="changes-title"><h2 id="changes-title" class="rail-title">Edition changes</h2>
    <h3 class="rail-sub">Entered · ${entered.length}</h3><ul class="change-list">${entered.map(company => item(company, `${company.historicalRanking ? `From ${company.historicalRanking.stage}` : "New"} · #${company.editorialRank}`)).join("") || `<li class="is-missing">None</li>`}</ul>
    <h3 class="rail-sub">Left · ${left.length}</h3><ul class="change-list">${left.map(({ company, reason, previousRank }) => item(company, `Was #${previousRank} · ${reason}`)).join("") || `<li class="is-missing">None</li>`}</ul>
  </section>`;
}

function filterOptions(values, selected, label, labels = {}) {
  return ["all", ...values].map(value => `<option value="${escapeHtml(value)}"${value === selected ? " selected" : ""}>${escapeHtml(value === "all" ? label : labels[value] || value)}</option>`).join("");
}

function renderFilterForm(records) {
  const forms = [...new Set(records.map(company => company.productForm))].sort();
  const regions = [...new Set(records.map(company => company.region))].sort();
  const extraCount = [state.productForm, state.region].filter(value => value !== "all").length;
  return `<form class="ranking-filter-form" method="get" role="search" aria-label="Filter companies">
    <input type="hidden" name="view" value="ranking"><input type="hidden" name="stage" value="${state.stage}">
    <div class="filter-primary"><label class="search-field">${searchIcon()}<input id="ranking-search" type="search" name="q" placeholder="Company, founder or product" aria-label="Find a company, founder or product" data-action="ranking-search" value="${escapeHtml(state.query)}"></label>
    <label class="filter-select"><span class="visually-hidden">Category</span><select id="ranking-category" name="category" aria-label="Category" data-ranking-filter="category">${filterOptions(CATEGORY_OPTIONS.filter(value => value !== "all"), state.category, "All sectors", CATEGORY_LABELS)}</select></label>
    <button id="more-filters" class="button filters-toggle" type="button" data-action="toggle-ranking-filters" aria-expanded="${state.filtersOpen}" aria-controls="advanced-filters">Filters${extraCount ? ` <span>${extraCount}</span>` : ""}<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M4 7h16M4 17h16M8 4v6M16 14v6"/></svg></button>
    <button class="button apply-filters" type="submit">Apply</button></div>
    <div class="advanced-filters" id="advanced-filters"${state.filtersOpen ? "" : " hidden"}><label>Product form<select id="ranking-form" name="form" aria-label="Product form" data-ranking-filter="productForm">${filterOptions(forms, state.productForm, "All products")}</select></label><label>Region<select id="ranking-region" name="region" aria-label="Region" data-ranking-filter="region">${filterOptions(regions, state.region, "All regions")}</select></label></div>
    <div class="filter-secondary"><p id="ranking-result-count" role="status" aria-live="polite">${filteredCompanies().length} of ${records.length} companies${hasFilters() ? ` <a class="filter-reset" href="?view=ranking&stage=${state.stage}" data-action="reset-ranking-filter">Clear filters</a>` : ""}</p><label class="sort-control" for="ranking-sort">Sort by <select id="ranking-sort" name="sort" data-ranking-filter="sort">${Object.entries(SORT_OPTIONS).map(([value, label]) => `<option value="${value}"${state.sort === value ? " selected" : ""}>${label}</option>`).join("")}</select></label></div>
  </form>`;
}

function renderListRow(company) {
  const signal = latestSignal(company);
  const count = companySources(company).length;
  return `<article class="ranking-row" data-company="${company.id}">
    <div class="row-rank"><span aria-label="Rank ${company.editorialRank}">${rank2(company.editorialRank)}</span>${rankChange(company)}</div>
    <a class="row-company" href="${companyUrl(company)}"><strong>${escapeHtml(company.name)}</strong><small class="row-sector">${escapeHtml(categoryLabel(company))} · ${escapeHtml(company.hq)}</small><small class="row-description">${escapeHtml(company.summary)}</small></a>
    <div class="row-founders"><span class="row-label">Founders</span>${founderLine(company)}</div>
    <div class="row-funding"><strong class="${amountSizeClass(company.funding.amount).trim()}">${escapeHtml(company.funding.amount)}</strong><small>${escapeHtml(company.funding.stage)} · ${formatDate(company.funding.date)}</small>${sourceLink(company.funding.source, "Source")}</div>
    <div class="row-evidence">${signal ? `<button class="row-signal" type="button" data-action="open-evidence" data-company="${company.id}" data-event="${signal.id}" id="row-evidence-${company.id}-${signal.id}">${escapeHtml(signal.title)}</button>` : `<span class="evidence-profile-label">Company and financing records</span>`}<div class="row-evidence-meta">${signal ? `<small>${formatDate(signal.date)}</small>` : ""}<a class="text-link" href="${companyUrl(company)}#sources">${count} sources ${arrowIcon()}</a></div></div>
    <button id="company-preview-${company.id}" type="button" class="row-preview icon-button" aria-label="Quick view of ${escapeHtml(company.name)}" data-action="open-company-preview" data-company="${company.id}">${chevronIcon()}</button>
  </article>`;
}

function renderRankingList() {
  const records = stageCompanies(state.stage);
  const filtered = filteredCompanies();
  const displayed = filtered.slice(0, state.visibleCount);
  const remaining = filtered.length - displayed.length;
  return `<section class="full-ranking" id="full-ranking" aria-labelledby="ranking-list-title"><div class="index-heading"><h2 id="ranking-list-title">The full ${escapeHtml(stageById(state.stage).label)} index</h2><span>Editorial ranking · ${formatDate(AS_OF)}</span></div>${renderFilterForm(records)}<div class="list-columns" aria-hidden="true"><span>Rank</span><span>Company</span><span>Founders</span><span>Latest round</span><span>Latest evidence</span><span></span></div><div class="ranking-rows">${displayed.length ? displayed.map(renderListRow).join("") : `<div class="list-empty"><strong>No companies match.</strong><p>Try a different company, founder, sector or region.</p><a href="?view=ranking&stage=${state.stage}" data-action="reset-ranking-filter" class="text-link">Clear filters ${arrowIcon()}</a></div>`}</div><div class="list-end"><span>Showing ${displayed.length} of ${filtered.length}</span>${remaining ? `<div class="load-more-group"><button id="load-ranking" class="load-more" type="button" data-action="load-more">Load ${Math.min(10, remaining)} more ${chevronIcon()}</button><button id="show-ranking" class="text-link" type="button" data-action="show-all">Show all ${filtered.length}</button></div>` : `<a class="text-link" href="#full-ranking">Back to index ↑</a>`}</div></section>`;
}

export function renderRanking() {
  const summary = stageSummary(state.stage);
  const stage = summary.stage;
  return `<main class="page-shell ranking-page" id="main">
    <div class="band">${renderStageLadder()}</div>
    <div id="stage-content" role="tabpanel" aria-labelledby="stage-tab-${state.stage}">
      <div class="band band--tail">${renderEditionBrief(summary)}${renderSpectrum(summary)}</div>
      ${hasFilters() || state.sort !== "rank" ? "" : renderLeaders()}
      <div class="journal-index-layout">${renderRankingList()}<aside class="journal-rail" aria-label="Edition context">${renderLatestUpdates()}${renderSectorMix()}${renderChanges()}<section class="rail-block research-note"><h2 class="rail-title">Research coverage</h2><p>${stage.eligibleCount} eligible companies reviewed. ${stage.alternateCount} not selected. Evidence checked ${formatDate(REFRESH_DATE)}.</p><a class="text-link" href="?view=methodology">Scope &amp; criteria ${arrowIcon()}</a></section></aside></div>
    </div>
  </main>`;
}
