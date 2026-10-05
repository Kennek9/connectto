import { AS_OF, REFRESH_DATE, COMPANIES, arrowIcon, chevronIcon, escapeHtml, formatDate, latestSignal, logo, rankedCompanies, searchIcon, sourceLink, stageCompanies } from "../shared.js";
import { companySources } from "../evidence.js";
import { CATEGORY_OPTIONS, PUBLIC_STAGE_IDS, stageById, state, companyUrl } from "../state.js";

function parameters() {
  try { return new URL(window.location.href).searchParams; } catch { return new URLSearchParams(); }
}

function rankingFilters() {
  const params = parameters();
  return { query: state.query.trim(), category: state.category || "all", form: params.get("form") || "all", region: params.get("region") || "all" };
}

function filteredCompanies() {
  const filters = rankingFilters();
  const query = filters.query.toLowerCase();
  return rankedCompanies(state.stage).filter(company => {
    const text = [company.name, company.summary, company.audience, company.category, company.productForm, company.region, company.domain, ...(company.products || []), ...company.events.flatMap(event => [event.title, event.detail])].join(" ").toLowerCase();
    return (!query || text.includes(query))
      && (filters.category === "all" || company.category === filters.category)
      && (filters.form === "all" || (filters.form === "not-observed" ? company.productForm === "Not publicly observed" : company.productForm === filters.form))
      && (filters.region === "all" || (filters.region === "not-observed" ? company.region === "Not publicly observed" : company.region === filters.region));
  });
}

function renderStageTabs() {
  return `<nav class="stage-tabs" role="tablist" aria-label="Funding stage">${PUBLIC_STAGE_IDS.map(id => `<button id="stage-tab-${id}" type="button" class="stage-tab ${state.stage === id ? "is-active" : ""}" role="tab" aria-selected="${state.stage === id}" aria-controls="stage-content" data-action="set-stage" data-stage="${id}">${escapeHtml(stageById(id).label)}</button>`).join("")}</nav>`;
}

function renderFeatured(company, index) {
  const signal = latestSignal(company);
  return `<article class="featured-company ${index === 0 ? "featured-company--lead" : ""}">
    <span class="feature-rank">${String(company.editorialRank).padStart(2, "0")}</span>
    <a class="feature-identity" href="${companyUrl(company)}">${logo(company, "feature-mark")}<span><h2>${escapeHtml(company.name)}</h2><p>${escapeHtml(company.profile.shortDescription || company.summary)}</p></span></a>
    <div class="feature-facts"><span>${escapeHtml(company.funding.amount)} ${escapeHtml(company.funding.stage)}${index === 0 ? ` · ${formatDate(company.funding.date)}` : ""}</span>${index === 0 && signal ? `<a href="${companyUrl(company)}#company-timeline">${escapeHtml(signal.title)} · ${formatDate(signal.date)}</a>` : ""}</div>
    ${index === 0 ? `<a class="text-link feature-read" href="${companyUrl(company)}">Read company ${arrowIcon()}</a>` : ""}
  </article>`;
}

function renderStageCover() {
  const top = rankedCompanies(state.stage).slice(0, 3);
  if (!top.length) return "";
  return `<section class="featured-edition" aria-label="Leading companies in this edition">${renderFeatured(top[0], 0)}<div class="featured-secondary">${top.slice(1).map((company, index) => renderFeatured(company, index + 1)).join("")}</div></section>`;
}

function renderLatestUpdates() {
  const updates = COMPANIES.filter(company => company.stageId === state.stage)
    .flatMap(company => company.events.map(event => ({ company, event })))
    .sort((a, b) => b.event.date.localeCompare(a.event.date)).slice(0, 4);
  return `<section class="recent-evidence" aria-labelledby="updates-title"><h2 id="updates-title">Recent evidence</h2>${updates.map(({ company, event }) => `<article class="recent-item"><button type="button" class="recent-event" data-action="open-evidence" data-company="${company.id}" data-event="${event.id}" id="update-evidence-${company.id}-${event.id}"><span>${escapeHtml(event.title)}</span></button><small>${formatDate(event.date)} · ${escapeHtml(event.source?.relationship || "Public source")}</small>${sourceLink(event.source, "Source")}</article>`).join("")}<a class="text-link" href="?view=signals&stage=${state.stage}">All signals ${arrowIcon()}</a></section>`;
}

function renderChanges() {
  const changed = COMPANIES.filter(company =>
    (company.stageId === state.stage && company.selected && (!company.historicalRanking || company.historicalRanking.stageId !== state.stage)) ||
    (company.historicalRanking?.stageId === state.stage && (!company.selected || company.stageId !== state.stage)));
  const label = company => company.selected ? `Now ${company.stage} #${company.editorialRank}` : company.exclusionReason === "public" ? "Public company" : company.selectionStatus === "alternate" ? "Not selected" : company.recordStatus === "archived" ? "Acquired" : company.recordStatus === "stage-changed" ? `Now ${company.currentStage}` : "Under review";
  return `<section class="edition-changes"><h3>Edition changes</h3>${changed.map(company => `<a href="${companyUrl(company)}"><span>${escapeHtml(company.name)}</span><small>${escapeHtml(label(company))}</small></a>`).join("")}<a class="text-link" href="?view=archive&stage=${state.stage}">22 Aug edition ${arrowIcon()}</a></section>`;
}

function filterOptions(values, selected, label) {
  return ["all", ...values].map(value => `<option value="${escapeHtml(value)}"${value === selected ? " selected" : ""}>${escapeHtml(value === "all" ? label : value)}</option>`).join("");
}

function renderFilterForm(records) {
  const filters = rankingFilters();
  const forms = [...new Set(records.map(company => company.productForm))].sort();
  const regions = [...new Set(records.map(company => company.region))].sort();
  const active = filters.query || [filters.category, filters.form, filters.region].some(value => value !== "all");
  return `<form class="list-tools ranking-filter-form" method="get" role="search" aria-label="Filter companies">
    <input type="hidden" name="view" value="ranking"><input type="hidden" name="stage" value="${state.stage}">
    <label class="search-field">${searchIcon()}<input id="ranking-search" type="search" name="q" placeholder="Find a company" aria-label="Find a company" value="${escapeHtml(filters.query)}"></label>
    <select name="category" aria-label="Category">${filterOptions(CATEGORY_OPTIONS.filter(value => value !== "all"), filters.category, "Category")}</select>
    <select name="form" aria-label="Product form">${filterOptions(forms, filters.form, "Product form")}</select>
    <select name="region" aria-label="Region">${filterOptions(regions, filters.region, "Region")}</select>
    <button class="button button-secondary" type="submit">Apply</button>${active ? `<a class="text-link" href="?view=ranking&stage=${state.stage}">Clear</a>` : ""}
  </form>`;
}

function renderListRow(company) {
  const signal = latestSignal(company);
  const count = companySources(company).length;
  return `<article class="ranking-row" data-company="${company.id}">
    <span class="row-rank" aria-label="Rank ${company.editorialRank}">${String(company.editorialRank).padStart(2, "0")}</span>
    <a class="row-company" href="${companyUrl(company)}">${logo(company, "row-mark")}<span><strong>${escapeHtml(company.name)}</strong><small>${escapeHtml(company.summary)}</small></span></a>
    <div class="row-funding"><strong>${escapeHtml(company.funding.amount)}</strong><small>${escapeHtml(company.funding.stage)} · ${formatDate(company.funding.date)}</small>${sourceLink(company.funding.source, "Source")}</div>
    <div class="row-evidence">${signal ? `<button class="row-signal" type="button" data-action="open-evidence" data-company="${company.id}" data-event="${signal.id}" id="row-evidence-${company.id}-${signal.id}">${escapeHtml(signal.title)}</button><small>${formatDate(signal.date)}</small>` : ""}<a class="text-link" href="${companyUrl(company)}#sources">${count} sources ${arrowIcon()}</a></div>
  </article>`;
}

function renderRankingList() {
  const records = stageCompanies(state.stage);
  const filtered = filteredCompanies();
  const displayed = filtered.slice(0, state.visibleCount);
  const remaining = filtered.length - displayed.length;
  return `<section class="full-ranking" id="full-ranking" aria-labelledby="ranking-list-title"><div class="index-heading"><h2 id="ranking-list-title">Company index</h2><span>${filtered.length} companies</span></div>${renderFilterForm(records)}<div class="list-columns" aria-hidden="true"><span>#</span><span>Company</span><span>Named round</span><span>Evidence</span></div><div id="ranking-preview" class="ranking-preview" hidden></div><div class="ranking-rows">${displayed.length ? displayed.map(renderListRow).join("") : `<div class="list-empty"><strong>No companies match.</strong><a href="?view=ranking&stage=${state.stage}" class="text-link">Clear filters</a></div>`}</div>${remaining ? `<div class="load-more-group"><button class="load-more" type="button" data-action="load-more">Load ${Math.min(10, remaining)} more ${chevronIcon()}</button><button class="text-link" type="button" data-action="show-all">Show all ${filtered.length}</button></div>` : ""}</section>`;
}

function rankingPreviewMarkup(company) {
  return `<div class="ranking-preview-inner"><strong>${escapeHtml(company.name)}</strong><p>${escapeHtml(company.companyDetails.research.business.facts[0].detail)}</p><a href="${companyUrl(company)}">Read company ${arrowIcon()}</a></div>`;
}

export function renderRanking() {
  const stage = stageById(state.stage);
  const records = stageCompanies(state.stage);
  const filters = rankingFilters();
  const filtered = filters.query || [filters.category, filters.form, filters.region].some(value => value !== "all");
  return `<main class="page-shell ranking-page" id="main"><section class="ranking-masthead"><div><h1>The ${escapeHtml(stage.label)} edition.</h1><p>${records.length} companies · Ranking ${formatDate(AS_OF)}</p><a class="text-link edition-history-link" href="?view=archive&stage=${state.stage}">Previous edition · 22 Aug 2026</a></div><a class="text-link" href="?view=methodology">Methodology ${arrowIcon()}</a></section>${renderStageTabs()}<div id="stage-content">${filtered ? "" : renderStageCover()}<div class="journal-index-layout">${renderRankingList()}<aside class="journal-rail">${renderLatestUpdates()}${renderChanges()}<p class="edition-note">${stage.eligibleCount} eligible candidates reviewed · ${stage.alternateCount} not selected.<br>Evidence updated ${formatDate(REFRESH_DATE)}.<br>Editorial beta.</p></aside></div></div></main>`;
}

export { filteredCompanies, rankingPreviewMarkup };
