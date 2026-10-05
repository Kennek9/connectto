import { AS_OF, REFRESH_DATE, COMPANIES, arrowIcon, chevronIcon, escapeHtml, formatDate, latestSignal, logo, rankedCompanies, searchIcon, sourceLink, stageCompanies } from "../shared.js";
import { companySources } from "../evidence.js";
import { CATEGORY_OPTIONS, PUBLIC_STAGE_IDS, SORT_OPTIONS, stageById, state, companyUrl } from "../state.js";

const CATEGORY_LABELS = {
  "Foundation Models & Research": "Models & research",
  "Data, Infrastructure & Developer Tools": "Data & developer tools",
  "Compute, Chips & Data Centers": "Compute & semiconductors",
  "Robotics, Autonomy & Defense": "Robotics & autonomy",
  "Horizontal Applications": "Enterprise applications",
  "Vertical Applications": "Industry applications",
  "AI Science, Biotech & Healthcare": "Science & healthcare",
};
const categoryLabel = company => CATEGORY_LABELS[company.category] || company.category;
const hasFilters = () => state.query.trim() || [state.category, state.productForm, state.region].some(value => value !== "all");

export function filteredCompanies() {
  const query = state.query.trim().toLowerCase();
  const records = rankedCompanies(state.stage).filter(company => {
    const text = [company.name, company.summary, company.audience, company.category, company.productForm, company.region, company.domain, ...(company.products || []), ...company.events.flatMap(event => [event.title, event.detail])].join(" ").toLowerCase();
    return (!query || text.includes(query))
      && (state.category === "all" || company.category === state.category)
      && (state.productForm === "all" || company.productForm === state.productForm)
      && (state.region === "all" || company.region === state.region);
  });
  if (state.sort === "name") records.sort((a, b) => a.name.localeCompare(b.name));
  if (state.sort === "recent") records.sort((a, b) => String(b.funding.date || "").localeCompare(String(a.funding.date || "")) || a.editorialRank - b.editorialRank);
  return records;
}

function rankChange(company) {
  const previous = company.historicalRanking;
  if (!previous) return `<small class="rank-change" title="First appearance in this index">New</small>`;
  if (previous.stageId !== company.stageId) return `<small class="rank-change" title="Previously ${escapeHtml(previous.stage)} #${previous.rank}">From ${escapeHtml(previous.stage)}</small>`;
  const difference = previous.rank - company.editorialRank;
  const text = difference > 0 ? `↑ ${difference}` : difference < 0 ? `↓ ${Math.abs(difference)}` : "—";
  const label = difference ? `${difference > 0 ? "Up" : "Down"} ${Math.abs(difference)} places since 22 August` : "Unchanged since 22 August";
  return `<small class="rank-change" aria-label="${label}" title="${label}">${text}</small>`;
}

function renderStageTabs() {
  return `<div class="cohort-navigation"><nav class="stage-tabs" role="tablist" aria-label="Funding stage">${PUBLIC_STAGE_IDS.map(id => `<button id="stage-tab-${id}" type="button" class="stage-tab ${state.stage === id ? "is-active" : ""}" role="tab" aria-label="${stageById(id).label}" aria-selected="${state.stage === id}" aria-controls="stage-content" data-action="set-stage" data-stage="${id}">${escapeHtml(stageById(id).label)}<span aria-hidden="true">${stageById(id).selectedCount}</span></button>`).join("")}</nav><a href="?view=archive&stage=${state.stage}" class="edition-switch">Previous edition ${arrowIcon()}</a></div>`;
}

function renderFeatured(company, index) {
  return `<article class="featured-company ${index === 0 ? "featured-company--lead" : ""}">
    <div class="feature-position"><span class="feature-rank">${String(company.editorialRank).padStart(2, "0")}</span>${rankChange(company)}</div>
    <div class="feature-content"><span class="feature-category">${escapeHtml(categoryLabel(company))}</span><a class="feature-identity" href="${companyUrl(company)}"><h2>${escapeHtml(company.name)}</h2></a><p>${escapeHtml(company.profile.shortDescription || company.summary)}</p><div class="feature-bottom"><span>${escapeHtml(company.funding.amount)}<small> ${escapeHtml(company.funding.stage)}</small></span><button type="button" id="feature-preview-${company.id}" class="icon-button" aria-label="Quick view of ${escapeHtml(company.name)}" data-action="open-company-preview" data-company="${company.id}">${arrowIcon()}</button></div></div>
  </article>`;
}

function renderStageCover() {
  const top = rankedCompanies(state.stage).slice(0, 3);
  return `<section class="leaders-section" aria-label="Leading companies in this edition"><div class="section-label"><h2>Cohort leaders</h2><a href="#full-ranking">View all 50 ${arrowIcon()}</a></div><div class="featured-edition">${top.map(renderFeatured).join("")}</div></section>`;
}

function renderLatestUpdates() {
  const updates = COMPANIES.filter(company => company.stageId === state.stage)
    .flatMap(company => company.events.map(event => ({ company, event })))
    .sort((a, b) => b.event.date.localeCompare(a.event.date)).slice(0, 4);
  return `<section class="recent-evidence" aria-labelledby="updates-title"><div class="rail-heading"><h2 id="updates-title">Recent evidence</h2><span class="status-dot" aria-hidden="true"></span></div>${updates.map(({ company, event }) => `<article class="recent-item"><div class="recent-meta"><a href="${companyUrl(company)}">${escapeHtml(company.name)}</a><time datetime="${event.date}">${formatDate(event.date)}</time></div><button type="button" class="recent-event" data-action="open-evidence" data-company="${company.id}" data-event="${event.id}" id="update-evidence-${company.id}-${event.id}"><span>${escapeHtml(event.title)}</span></button><small>${escapeHtml(event.source?.relationship || "Public source")}</small>${sourceLink(event.source, "Original source")}</article>`).join("")}<a class="text-link rail-all" href="?view=signals&stage=${state.stage}">All signals ${arrowIcon()}</a></section>`;
}

function renderChanges() {
  const changed = COMPANIES.filter(company =>
    (company.stageId === state.stage && company.selected && (!company.historicalRanking || company.historicalRanking.stageId !== state.stage)) ||
    (company.historicalRanking?.stageId === state.stage && (!company.selected || company.stageId !== state.stage)));
  const label = company => company.selected ? `${company.historicalRanking ? "Moved to" : "New"} ${company.stage} #${company.editorialRank}` : company.exclusionReason === "public" ? "Public company" : company.selectionStatus === "alternate" ? "Not selected" : company.recordStatus === "archived" ? "Acquired" : company.recordStatus === "stage-changed" ? `Now ${company.currentStage}` : "Under review";
  return `<details class="edition-changes"><summary>Edition changes <span>${changed.length}</span>${chevronIcon()}</summary><div>${changed.map(company => `<a href="${companyUrl(company)}"><span>${escapeHtml(company.name)}</span><small>${escapeHtml(label(company))}</small></a>`).join("")}</div></details>`;
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
    <div class="filter-primary"><label class="search-field">${searchIcon()}<input id="ranking-search" type="search" name="q" placeholder="Search companies" aria-label="Find a company" data-action="ranking-search" value="${escapeHtml(state.query)}"></label>
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
    <div class="row-rank"><span aria-label="Rank ${company.editorialRank}">${String(company.editorialRank).padStart(2, "0")}</span>${rankChange(company)}</div>
    <a class="row-company" href="${companyUrl(company)}">${logo(company, "row-mark")}<span><strong>${escapeHtml(company.name)}</strong><small class="row-sector">${escapeHtml(categoryLabel(company))}</small><small class="row-description">${escapeHtml(company.summary)}</small></span></a>
    <div class="row-funding"><strong>${escapeHtml(company.funding.amount)}</strong><small>${escapeHtml(company.funding.stage)} · ${formatDate(company.funding.date)}</small>${sourceLink(company.funding.source, "Source")}</div>
    <div class="row-evidence">${signal ? `<button class="row-signal" type="button" data-action="open-evidence" data-company="${company.id}" data-event="${signal.id}" id="row-evidence-${company.id}-${signal.id}">${escapeHtml(signal.title)}</button>` : `<span class="evidence-profile-label">Company & financing</span>`}<div class="row-evidence-meta">${signal ? `<small>${formatDate(signal.date)}</small>` : ""}<a class="text-link" href="${companyUrl(company)}#sources">${count} sources ${arrowIcon()}</a></div></div>
    <button id="company-preview-${company.id}" type="button" class="row-preview icon-button" aria-label="Quick view of ${escapeHtml(company.name)}" data-action="open-company-preview" data-company="${company.id}">${chevronIcon()}</button>
  </article>`;
}

function renderRankingList() {
  const records = stageCompanies(state.stage);
  const filtered = filteredCompanies();
  const displayed = filtered.slice(0, state.visibleCount);
  const remaining = filtered.length - displayed.length;
  return `<section class="full-ranking" id="full-ranking" aria-labelledby="ranking-list-title"><div class="index-heading"><h2 id="ranking-list-title">The ${escapeHtml(stageById(state.stage).label)} index</h2><span>Editorial ranking · ${formatDate(AS_OF)}</span></div>${renderFilterForm(records)}<div class="list-columns" aria-hidden="true"><span>Rank / Δ</span><span>Company</span><span>Named round</span><span>Latest evidence</span><span></span></div><div class="ranking-rows">${displayed.length ? displayed.map(renderListRow).join("") : `<div class="list-empty"><strong>No companies match.</strong><p>Try a different company, sector or region.</p><a href="?view=ranking&stage=${state.stage}" data-action="reset-ranking-filter" class="text-link">Clear filters ${arrowIcon()}</a></div>`}</div><div class="list-end"><span>Showing ${displayed.length} of ${filtered.length}</span>${remaining ? `<div class="load-more-group"><button id="load-ranking" class="load-more" type="button" data-action="load-more">Load ${Math.min(10, remaining)} more ${chevronIcon()}</button><button id="show-ranking" class="text-link" type="button" data-action="show-all">Show all ${filtered.length}</button></div>` : `<a class="text-link" href="#full-ranking">Back to index ↑</a>`}</div></section>`;
}

export function renderRanking() {
  const stage = stageById(state.stage);
  const records = stageCompanies(state.stage);
  const additions = records.filter(company => !company.historicalRanking).length;
  return `<main class="page-shell ranking-page" id="main"><section class="ranking-masthead"><div><span class="eyebrow">The private AI landscape</span><h1>The ${escapeHtml(stage.label)} edition<span class="title-dot">.</span></h1><p>Companies, capital and the evidence behind them.</p></div><div class="edition-dateline"><span>Edition as of</span><strong>${formatDate(AS_OF)}</strong><a class="text-link" href="?view=methodology">Selection methodology ${arrowIcon()}</a></div></section><div class="edition-summary"><span><strong>${records.length}</strong> companies selected</span><span><strong>${stage.eligibleCount}</strong> eligible reviewed</span><span><strong>${additions}</strong> new to the index</span><span class="edition-type">Editorial beta</span></div>${renderStageTabs()}<div id="stage-content">${hasFilters() || state.sort !== "rank" ? "" : renderStageCover()}<div class="journal-index-layout">${renderRankingList()}<aside class="journal-rail">${renderLatestUpdates()}${renderChanges()}<div class="research-note"><span class="eyebrow">Research coverage</span><p>${stage.eligibleCount} eligible companies reviewed. ${stage.alternateCount} not selected.</p><a class="text-link" href="?view=methodology">Scope & criteria ${arrowIcon()}</a><small>Evidence checked ${formatDate(REFRESH_DATE)}</small></div></aside></div></div></main>`;
}
