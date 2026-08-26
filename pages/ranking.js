import { AS_OF, arrowIcon, chevronIcon, evidenceCoverage, escapeHtml, formatDate, latestSignal, logo, rankFor, rankedCompanies, searchIcon, signalLabel, sourceLink, sourceRecordState, stageCompanies } from "../shared.js";
import { CATEGORY_OPTIONS, PUBLIC_STAGE_IDS, stageById, state, companyUrl } from "../state.js";

const METHOD_VERSION = "v0.2";
const RANKING_TARGET = 50;
const PRODUCT_FORM_OPTIONS = ["Software", "Hardware", "Software + Hardware"];

function currentSearchParams() {
  try { return new URL(window.location.href).searchParams; } catch { return new URLSearchParams(); }
}

function firstValue(...values) {
  return values.map((value) => String(value || "").trim()).find(Boolean) || "";
}

function companyProductForm(company) {
  return firstValue(company?.productForm, company?.form, company?.product_form, company?.profile?.productForm, company?.profile?.form);
}

function companyRegion(company) {
  return firstValue(company?.region, company?.hqRegion, company?.operatingRegion, company?.profile?.region, company?.profile?.hqRegion);
}

function companyProducts(company) {
  const products = company?.products || company?.profile?.products || [];
  return Array.isArray(products) ? products.join(" ") : String(products || "");
}

function filterValue(value) {
  const clean = String(value || "").trim();
  return clean || "all";
}

function rankingFilters() {
  const params = currentSearchParams();
  return {
    query: state.query.trim(),
    category: filterValue(state.category),
    form: filterValue(params.get("form")),
    region: filterValue(params.get("region")),
  };
}

function stagePublicationSize(stage) {
  const size = Number(stage?.publicationSize || stage?.topN || stage?.targetCount || RANKING_TARGET);
  return Number.isFinite(size) && size > 0 ? size : RANKING_TARGET;
}

function stageCandidateCount(stage) {
  const count = Number(stage?.eligibleCount ?? stage?.candidatePoolCount ?? stage?.eligibleCompanyCount ?? stage?.candidateCount);
  return Number.isFinite(count) && count > 0 ? count : null;
}

function stagePoolCopy(stage) {
  const candidateCount = stageCandidateCount(stage);
  return candidateCount ? `Selected from ${candidateCount} eligible ${stage.label} companies.` : "Candidate pool under review.";
}

function stageRecordCopy(stageId) {
  const count = stageCompanies(stageId).length;
  return count ? `${count} reviewed` : "Candidate pool under review";
}

function stageFilterValues(companies, getter, fallback = []) {
  return [...new Set([...fallback, ...companies.map(getter).filter(Boolean)])].sort((a, b) => a.localeCompare(b));
}

function filterOption(value, selected, allLabel) {
  const label = value === "all" ? allLabel : value === "not-observed" ? "Not publicly observed" : value;
  return `<option value="${escapeHtml(value)}" ${selected === value ? "selected" : ""}>${escapeHtml(label)}</option>`;
}

function filterHref(overrides = {}) {
  const params = new URLSearchParams();
  params.set("view", "ranking");
  params.set("stage", overrides.stage || state.stage);
  const filters = rankingFilters();
  const next = { ...filters, ...overrides };
  if (next.query) params.set("q", next.query);
  if (next.category && next.category !== "all") params.set("category", next.category);
  if (next.form && next.form !== "all") params.set("form", next.form);
  if (next.region && next.region !== "all") params.set("region", next.region);
  return `?${params.toString()}`;
}

function renderStageTabs() {
  return `<div class="stage-tabs" role="tablist" aria-label="Funding stage">${PUBLIC_STAGE_IDS.map((stageId) => {
    const stage = stageById(stageId);
    const hasRecords = stageCompanies(stageId).length > 0;
    const candidateCount = stageCandidateCount(stage);
    const note = hasRecords ? `${stageRecordCopy(stageId)} · ${candidateCount ? `${candidateCount} eligible` : "Candidate pool under review"}` : "Candidate pool under review";
    const active = state.stage === stageId;
    return `<button id="stage-tab-${escapeHtml(stageId)}" type="button" role="tab" class="stage-tab ${active ? "is-active" : ""}" data-action="set-stage" data-stage="${escapeHtml(stageId)}" aria-selected="${active}" aria-controls="stage-content"><span>${escapeHtml(stage.label)}</span><small>${escapeHtml(note)}</small></button>`;
  }).join("")}</div>`;
}

function renderGrowthLine() {
  const count = stageCompanies(state.stage).length;
  return `<div class="growth-linework" aria-hidden="true"><svg viewBox="0 0 460 280"><path class="growth-root" d="M24 245C95 220 129 235 185 184s105-24 133-71 72-56 120-52"/><path class="growth-stem" d="M175 194c-8-46-3-92 29-137M285 120c4-29 22-56 49-82M337 78c34 18 59 20 91 13M204 142c-34-16-61-14-94-2M185 184c40-1 71 15 103 37"/><path class="growth-leaf" d="M144 144c18-22 42-27 63-21-13 25-34 34-63 21ZM238 112c9-24 28-36 50-36-1 27-18 41-50 36ZM298 177c25-9 47-4 65 12-24 12-44 7-65-12Z"/><circle class="growth-seed" cx="24" cy="245" r="5"/><circle class="growth-seed" cx="204" cy="57" r="5"/><circle class="growth-seed" cx="428" cy="61" r="5"/></svg><span class="growth-caption"><span>Reviewed records</span><span>${count} in ${escapeHtml(stageById(state.stage).label)}</span></span></div>`;
}

function renderTopCompany(company, position) {
  const signalItem = latestSignal(company);
  const rank = rankFor(company);
  const signalSourceState = sourceRecordState(signalItem?.source);
  const signalMeta = signalItem ? (signalSourceState ? `${formatDate(signalItem.date)} · Source unavailable` : `${formatDate(signalItem.date)} · ${escapeHtml(signalItem.status)}`) : "";
  const source = signalItem?.source || company.funding.source;
  return `<article class="cover-profile cover-profile--${position} ${position === 1 ? "is-lead" : ""}"><a class="cover-profile-link" href="${companyUrl(company)}"><div class="cover-profile-top"><span class="cover-rank">${String(rank || position).padStart(2, "0")}</span>${logo(company, `cover-mark stamp-mark stamp-mark--${position}`)}<h2>${escapeHtml(company.name)}</h2><span class="cover-stage">${escapeHtml(company.stage)}</span></div><p>${escapeHtml(company.summary)}<span>For ${escapeHtml(company.audience.toLowerCase())}</span></p></a><div class="cover-funding"><span>Latest round</span><strong>${escapeHtml(company.funding.amount)}</strong><b>${escapeHtml(company.funding.stage)}</b><small>${formatDate(company.funding.date)} · ${escapeHtml(company.funding.evidenceState)}</small>${sourceLink(company.funding.source, "Funding source")}</div><div class="cover-signal">${signalItem ? `${signalLabel(signalItem.type)}<strong>${escapeHtml(signalItem.title)}</strong><span>${signalMeta}</span>` : `<span class="signal-label">Latest signal</span><strong>Not publicly observed</strong><span>Source unavailable</span>`}</div><div class="cover-source-actions">${signalItem ? `<button id="cover-evidence-${company.id}" class="cover-source" type="button" data-action="open-evidence" data-company="${company.id}" data-event="${signalItem.id}" aria-label="Open evidence for ${escapeHtml(company.name)}">Open evidence ${arrowIcon()}</button>` : ""}${sourceLink(source, "Open source")}</div></article>`;
}

function renderLeadProof(company) {
  const signalItem = latestSignal(company);
  const signalSourceState = sourceRecordState(signalItem?.source);
  const signalMeta = signalItem ? `${formatDate(signalItem.date)} · ${signalSourceState ? "Source unavailable" : escapeHtml(signalItem.status)}` : "Source unavailable";
  const source = signalItem?.source;
  return `<article class="cover-signal cover-lead-proof" data-company="${escapeHtml(company.id)}" aria-label="Lead evidence for ${escapeHtml(company.name)}"><span class="signal-label">Lead evidence</span><a href="${companyUrl(company)}"><strong>${escapeHtml(company.name)}</strong><span>${signalItem ? `${escapeHtml(signalItem.title)} · ${signalMeta}` : "Latest signal not publicly observed"}</span></a>${sourceLink(source, "Open evidence source")}</article>`;
}

function renderStageCover() {
  const stage = stageById(state.stage);
  const top = rankedCompanies(state.stage).slice(0, 3);
  if (!top.length) return `<section class="stage-empty" id="stage-content" aria-labelledby="stage-empty-title"><span class="section-kicker">${escapeHtml(stage.label)} · Editorial beta</span><h2 id="stage-empty-title">Candidate pool under review.</h2><p>Top Seed will publish this stage after entity, eligibility, stage, and source checks are complete. No denominator or placeholder company is shown before that review.</p><div class="stage-empty-meta"><span>Methodology ${METHOD_VERSION}</span><span>Cutoff ${formatDate(AS_OF)}</span><span>No paid rank</span></div><a class="text-link" href="?view=methodology">Read methodology ${arrowIcon()}</a></section>`;
  return `<section class="stage-cover" id="stage-content" aria-labelledby="cover-title">${renderLeadProof(top[0])}<div class="cover-heading"><div class="cover-heading-copy"><span class="section-kicker">${escapeHtml(stage.label)} stage · current board</span><h2 id="cover-title">Top three <em>with the clearest proof.</em></h2><p>Funding is shown first, then the dated public signal that explains the position. Editorial ordinals are not numeric company scores.</p></div>${renderGrowthLine()}</div><div class="cover-profiles">${top.map((company, index) => renderTopCompany(company, index + 1)).join("")}</div></section>`;
}

function renderLatestUpdates() {
  const updates = stageCompanies(state.stage).flatMap((company) => company.events.filter((eventItem) => eventItem.type !== "funding" && ["Verified", "Reported", "Direct", "Corroborated"].includes(eventItem.status)).map((eventItem) => ({ company, eventItem }))).sort((a, b) => b.eventItem.date.localeCompare(a.eventItem.date)).slice(0, 3);
  if (!updates.length) return "";
  return `<section class="updates-strip" aria-labelledby="updates-title"><div class="updates-label"><span class="section-kicker">${escapeHtml(stageById(state.stage).label)} board</span><strong id="updates-title">Latest updates</strong><small>Non-funding public signals</small></div><div class="updates-list">${updates.map(({ company, eventItem }) => `<div class="update-item"><button id="update-evidence-${company.id}-${eventItem.id}" class="update-item-trigger" type="button" data-action="open-evidence" data-company="${company.id}" data-event="${eventItem.id}" aria-label="Open evidence for ${escapeHtml(company.name)}: ${escapeHtml(eventItem.title)}">${logo(company, "small-mark")}<span><strong>${escapeHtml(company.name)}</strong><small>${escapeHtml(eventItem.title)} · ${formatDate(eventItem.date)}</small></span>${chevronIcon()}</button><div class="update-source">${sourceLink(eventItem.source, "Source")}</div></div>`).join("")}</div></section>`;
}

function filteredCompanies() {
  const filters = rankingFilters();
  const query = filters.query.toLowerCase();
  return rankedCompanies(state.stage).filter((company) => {
    const form = companyProductForm(company);
    const region = companyRegion(company);
    const latest = latestSignal(company);
    const searchable = [company.name, company.summary, company.audience, company.category, form, region, company.domain, companyProducts(company), latest?.title, latest?.detail].filter(Boolean).join(" ").toLowerCase();
    const queryMatch = !query || searchable.includes(query);
    const categoryMatch = filters.category === "all" || company.category === filters.category;
    const formMatch = filters.form === "all" || (filters.form === "not-observed" ? !form : form === filters.form);
    const regionMatch = filters.region === "all" || (filters.region === "not-observed" ? !region : region === filters.region);
    return queryMatch && categoryMatch && formMatch && regionMatch;
  });
}

function rankingPreviewMarkup(company) {
  const facts = (company.companyDetails?.why || []).slice(1, 3);
  return `<div class="ranking-preview-inner"><div><span class="section-kicker">${escapeHtml(company.name)} · #${String(rankFor(company)).padStart(2, "0")}</span><strong>${escapeHtml(company.funding.amount)}</strong><small>${escapeHtml(company.funding.stage)} · ${formatDate(company.funding.date)} · ${escapeHtml(company.funding.evidenceState)}</small></div><div><span class="section-kicker">Evidence</span><strong>${evidenceCoverage(company).signalCount} dated signals</strong><small>No numeric company score shown</small></div><div class="ranking-preview-facts">${facts.map((fact) => `<span>${escapeHtml(fact.title)} <small>${formatDate(fact.date)} · ${escapeHtml(fact.evidenceState)}</small></span>`).join("")}</div><a href="${companyUrl(company)}">Open company ${arrowIcon()}</a></div>`;
}

function renderFilterForm(companies) {
  const filters = rankingFilters();
  const forms = stageFilterValues(companies, companyProductForm, PRODUCT_FORM_OPTIONS);
  if (!forms.includes("not-observed")) forms.push("not-observed");
  const regions = stageFilterValues(companies, companyRegion);
  if (!regions.includes("not-observed")) regions.push("not-observed");
  return `<form class="list-tools ranking-filter-form" method="get" action="" role="search" aria-label="Filter the active ranking"><input type="hidden" name="view" value="ranking" /><input type="hidden" name="stage" value="${escapeHtml(state.stage)}" /><label class="search-field"><span class="sr-only">Find a company</span>${searchIcon()}<input id="ranking-search" type="search" name="q" placeholder="Search companies or evidence" value="${escapeHtml(filters.query)}" aria-label="Find a company or evidence" /></label><label class="category-field"><span class="sr-only">Filter by category</span><select id="category-filter" name="category" aria-label="Filter by market category">${["all", ...CATEGORY_OPTIONS.filter((category) => category !== "all")].map((value) => filterOption(value, filters.category, "All categories")).join("")}</select></label><label class="category-field"><span class="sr-only">Filter by product form</span><select id="form-filter" name="form" aria-label="Filter by product form">${["all", ...forms].map((value) => filterOption(value, filters.form, "All product forms")).join("")}</select></label><label class="category-field"><span class="sr-only">Filter by region</span><select id="region-filter" name="region" aria-label="Filter by region">${["all", ...regions].map((value) => filterOption(value, filters.region, "All regions")).join("")}</select></label><button class="button button-secondary filter-submit" type="submit">Apply filters</button><a class="text-link filter-clear" href="${filterHref({ query: "", category: "all", form: "all", region: "all" })}">Clear filters</a><a class="text-link filter-search-entry" href="?view=search">Search all records ${arrowIcon()}</a></form>`;
}

function renderListRow(company) {
  const signalItem = latestSignal(company);
  const rank = rankFor(company);
  const form = companyProductForm(company) || "Product form not publicly observed";
  const region = companyRegion(company) || "Region not publicly observed";
  const fundingSourceState = sourceRecordState(company.funding.source);
  const fundingCell = `<div class="row-funding ${fundingSourceState ? "row-funding--missing" : ""}"><strong>${escapeHtml(company.funding.amount)}</strong><small>${escapeHtml(company.funding.stage)} · ${formatDate(company.funding.date)}</small><em>${escapeHtml(fundingSourceState ? "Source unavailable · replacement under review" : `${company.funding.evidenceState} funding source`)}</em>${sourceLink(company.funding.source, "Open funding source")}</div>`;
  const signalSourceState = sourceRecordState(signalItem?.source);
  const signalMeta = signalItem ? (signalSourceState ? `${formatDate(signalItem.date)} · Source unavailable` : `${formatDate(signalItem.date)} · ${escapeHtml(signalItem.status)}`) : "";
  const signalCell = signalItem ? `<div class="row-signal-wrap"><button id="row-evidence-${company.id}-${signalItem.id}" class="row-signal" type="button" data-action="open-evidence" data-company="${company.id}" data-event="${signalItem.id}" aria-label="Open evidence for ${escapeHtml(company.name)}: ${escapeHtml(signalItem.title)}"><span>${escapeHtml(signalItem.title)}</span><small>${signalMeta}</small></button>${sourceLink(signalItem.source, "Open signal source")}</div>` : `<span class="row-signal row-signal--missing"><span>Latest signal unavailable</span><small>Source not publicly observed</small></span>`;
  return `<article class="ranking-row" data-company="${escapeHtml(company.id)}"><span class="row-rank" aria-label="Rank ${rank}">#${String(rank).padStart(2, "0")}</span><a class="row-company" href="${companyUrl(company)}">${logo(company, "row-mark")}<span><strong>${escapeHtml(company.name)}</strong><small>${escapeHtml(company.summary)}</small><em>${escapeHtml(company.category)} · ${escapeHtml(form)} · ${escapeHtml(region)} · ${evidenceCoverage(company).signalCount} dated signals</em></span></a>${fundingCell}${signalCell}</article>`;
}

function renderRankingList() {
  const stage = stageById(state.stage);
  const records = stageCompanies(state.stage);
  const filtered = filteredCompanies();
  const displayed = filtered.slice(0, state.visibleCount);
  const remaining = filtered.length - displayed.length;
  const target = stagePublicationSize(stage);
  const coverage = `${filtered.length} of ${target} target rank slots visible · ${records.length} reviewed records in this snapshot`;
  return `<section class="full-ranking" id="full-ranking" aria-labelledby="ranking-list-title"><div class="list-heading"><details class="ranking-context"><summary><span class="section-kicker" id="ranking-list-title">Full ranking · Editorial beta</span></summary><p>${escapeHtml(coverage)}. ${stageCandidateCount(stage) ? escapeHtml(stagePoolCopy(stage)) : "Candidate pool under review; the denominator is not published until the stage audit is complete."}</p></details>${renderFilterForm(records)}</div><div class="list-columns" aria-hidden="true"><span>Rank</span><span>Company + what it does</span><span>Funding</span><span>Latest move</span></div><div id="ranking-preview" class="ranking-preview" hidden></div><div class="ranking-rows">${displayed.length ? displayed.map(renderListRow).join("") : `<div class="list-empty"><strong>No ranked company matches.</strong><span>Try another query or clear one of the filters.</span><button type="button" data-action="reset-ranking-filter">Clear filters</button></div>`}</div>${remaining > 0 ? `<div class="load-more-group"><button class="load-more" type="button" data-action="load-more"><span>Load ${Math.min(10, remaining)} more</span><span>${displayed.length} of ${filtered.length}</span></button><button class="load-more load-more-secondary" type="button" data-action="show-all">Show all ${filtered.length}</button></div>` : ""}</section>`;
}

function renderMethodSummary() {
  return `<section class="method-summary"><div><span class="section-kicker">Editorial beta · Methodology ${METHOD_VERSION}</span><h2>Evidence first. Context visible.</h2></div><p>Top Seed publishes a versioned editorial order with a named cutoff and dated public evidence. The ranking principle is visible; internal weighting and normalization are not presented as a reproducible company score.</p><a class="text-link" href="?view=methodology">Read methodology ${arrowIcon()}</a></section><section class="sponsor-boundary"><div><span class="section-kicker">Independence</span><h2>No paid rank.</h2></div><p>Signals update after review. Confirmed corrections update Company and Signals immediately; commercial support never changes the public order.</p><a class="text-link" href="?view=evidence-policy">Evidence policy ${arrowIcon()}</a></section>`;
}

export function renderRanking() {
  const stage = stageById(state.stage);
  const records = stageCompanies(state.stage);
  const ranked = rankedCompanies(state.stage);
  const target = stagePublicationSize(stage);
  const poolCopy = stagePoolCopy(stage);
  return `<main class="page-shell ranking-page ${state.stageTransition ? "stage-transition" : ""}" id="main"><section class="ranking-masthead"><div><span class="section-kicker">Top Seed · evidence board</span><h1>${escapeHtml(stage.label)} ranking</h1><p>AI companies with public product and financing evidence reviewed through ${formatDate(AS_OF)}. Editorial beta; ordinal order is not an investment judgement.</p></div><div class="masthead-meta"><span class="beta-flag">Editorial beta · Methodology ${METHOD_VERSION}</span><p>Cutoff ${formatDate(AS_OF)}<br>${records.length ? `${records.length} reviewed · ${ranked.length} ranked · ${target} target slots` : "Candidate pool under review"}<br>${escapeHtml(poolCopy)}<br>No paid rank</p></div><span class="masthead-trust"><span class="trust-dot"></span>Source-linked records · <a href="?view=search">Search all records</a></span></section>${renderStageTabs()}${renderStageCover()}${renderLatestUpdates()}${ranked.length ? renderRankingList() : ""}${renderMethodSummary()}</main>`;
}

export { filteredCompanies, rankingPreviewMarkup };
