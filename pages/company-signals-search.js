import { companySources } from "../evidence.js";
import { renderSourceLedger } from "./evidence.js";
import {
  AS_OF,
  REFRESH_DATE,
  COMPANIES,
  arrowIcon,
  companyRecordState,
  chevronIcon,
  closeIcon,
  escapeHtml,
  formatDate,
  latestPublicEvent,
  logo,
  searchIcon,
  signalLabel,
  sourceRecordState,
  sourceLink,
} from "../shared.js";
import { PUBLIC_STAGE_IDS, companyById, companyUrl, signalUrl, stageById, state } from "../state.js";

const WORKSPACE_LENSES = [
  { id: "business", label: "Business", description: "Product, audience, and operating use case." },
  { id: "capital", label: "Capital", description: "Round, lead investor, backers, and pace." },
  { id: "traction", label: "Traction", description: "Named customers, usage, deployments, and outcomes." },
  { id: "technology", label: "Technology", description: "Models, APIs, SDKs, and developer surface." },
  { id: "team-network", label: "Team & network", description: "Team background and source-backed relationships." },
];


function companyResearch(company) {
  return company?.companyDetails?.research || company?.research || {};
}

function companyProfile(company) {
  return company?.profile || company?.companyProfile || {};
}


function eventStatus(eventItem) {
  return eventItem?.status || eventItem?.evidenceState || eventItem?.evidence || "Not publicly observed";
}

function eventRelationship(eventItem) {
  return eventItem?.relationship || eventItem?.source?.relationship || eventItem?.source?.provenance || "Source relationship not observed";
}

function eventWhy(eventItem) {
  const explicit = eventItem?.whyItMatters || eventItem?.why;
  if (explicit) return String(explicit);
  if (eventItem?.type === "funding") return "Financing changes the company’s capital context; it does not mechanically set rank.";
  return eventItem?.detail || "Why this matters was not publicly observed.";
}

function eventSourceDate(eventItem) {
  return eventItem?.source?.publicationDate || eventItem?.source?.announcementDate || eventItem?.publicationDate || eventItem?.date;
}

function companyEvents(company) {
  const events = Array.isArray(company?.events) && company.events.length
    ? company.events
    : [
      ...(company?.funding ? [{
        id: `${company.id}-funding`,
        type: "funding",
        date: company.funding.date,
        title: `${company.funding.amount} ${company.funding.stage}`,
        detail: `${company.name} publicly disclosed its latest financing event on ${company.funding.date}.`,
        status: eventStatus(company.funding),
        source: company.funding.source,
      }] : []),
      ...(company?.signals || []),
    ];
  return events
    .filter((item) => item?.date || item?.source?.publicationDate)
    .map((item, index) => ({ ...item, id: item.id || `${company.id}-event-${index + 1}` }))
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
}

function signalTypeParam() {
  try { return new URL(window.location.href).searchParams.get("signalType") || ""; } catch { return ""; }
}

function signalTypeKey(type) {
  return String(type || "").replace(/[^a-z]/gi, "").toLowerCase();
}

const SIGNAL_FILTERS = {
  capital: "Funding", "product-work": "Products", "technical-work": "Research",
  adoption: "Adoption", company: "Company", other: "Other",
};
const SIGNAL_GROUPS = {
  funding: "capital",
  product: "product-work", productlaunch: "product-work", productrelease: "product-work",
  productupdate: "product-work", productcomplianceupdate: "product-work", clinicalproductlaunch: "product-work",
  research: "technical-work", technology: "technical-work", technical: "technical-work",
  opensource: "technical-work", technicalproductupdate: "technical-work", producttechnicalupdate: "technical-work", scienceproductupdate: "technical-work",
  customer: "adoption", usage: "adoption", deployment: "adoption", deploymentmilestone: "adoption",
  partnership: "adoption", deploymentpartnership: "adoption", productdeployment: "adoption",
  producttractionmilestone: "adoption", clinicalmilestone: "adoption", clinicalvalidation: "adoption", clinicalproductmilestone: "adoption",
  corporate: "company", corporatestatus: "company", productacquisition: "company",
  talent: "company", operations: "company", talentoperations: "company", manufacturing: "company", regulatory: "company",
};

function signalTypeMatches(eventItem, requested) {
  if (!requested) return true;
  const key = signalTypeKey(eventItem?.type);
  if (Object.hasOwn(SIGNAL_FILTERS, requested)) return (SIGNAL_GROUPS[key] || "other") === requested;
  // Retain the meaning of previously shared raw-type filter URLs.
  return key === signalTypeKey(requested) || (key === "opensource" && signalTypeKey(requested) === "developer");
}

function signalTypeOptions() {
  const groups = new Set(COMPANIES.flatMap(company => company.events.map(event => SIGNAL_GROUPS[signalTypeKey(event.type)] || "other")));
  return ["", ...Object.keys(SIGNAL_FILTERS).filter(key => groups.has(key))];
}


function lifecycleLabel(company) {
  const recordState = companyRecordState(company);
  return { archived: "Archived record", "stage-conflict": "Stage conflict under review", "stage-changed": `Now ${company.currentStage} · outside this index`, "not-selected": "Not selected this edition", "under-review": "Operating status under review" }[recordState] || "";
}

function renderDetailFact(fact, omitTitle = false) {
  const reviewed = fact.lastReviewed || fact.source?.lastChecked || fact.source?.asOf || AS_OF;
  const host = (() => { try { return new URL(fact.source?.href).hostname.replace(/^www\./, ""); } catch { return "Source"; } })();
  return `<article class="detail-fact">${omitTitle ? "" : `<h4>${escapeHtml(fact.title)}</h4>`}${fact.detail ? `<p>${escapeHtml(fact.detail)}</p>` : ""}<div class="fact-citation">${sourceLink(fact.source, host)}<span>${fact.date ? formatDate(fact.date) : `Checked ${formatDate(reviewed)}`}</span><span>${escapeHtml(fact.source?.relationship || fact.source?.provenance || fact.evidenceState)}</span></div></article>`;
}

function renderDetailFacts(facts, empty = "Not publicly observed", options = {}) {
  return facts?.length ? `<div class="detail-facts">${facts.map((fact, index) => renderDetailFact(fact, options.omitFirstTitle && index === 0)).join("")}</div>` : `<p class="detail-empty">${empty}</p>`;
}

function businessFact(company) {
  const research = companyResearch(company);
  const details = company?.companyDetails || {};
  return research.business?.facts?.[0] || { label: "Business profile", title: company.summary, detail: `${company.summary} For ${String(company.audience || "public users").toLowerCase()}.`, date: null, evidenceState: "Profile", source: details.links?.website || company.website };
}

function companyLensFacts(company, lensId) {
  const research = companyResearch(company);
  if (lensId === "business") return research.business?.facts?.length ? research.business.facts : [businessFact(company)];
  if (lensId === "capital") return research.capital?.facts || [];
  if (lensId === "traction") return research.traction?.facts || [];
  if (lensId === "technology") return research.technology?.facts || [];
  return [...(research.team?.facts || []), ...(research.network?.facts || [])];
}

function companyLensSpec(company) {
  const research = companyResearch(company);
  return WORKSPACE_LENSES.map((lens) => ({
    ...lens,
    facts: companyLensFacts(company, lens.id),
    connections: lens.id === "team-network" ? research.network?.connections || {} : null,
  }));
}


export function renderCompanyRecordState(company) {
  const recordState = companyRecordState(company);
  if (!recordState) return "";
  const text = company.rankingReview?.rationale || ({ archived: "Archived record", "stage-conflict": "Stage conflict under review" }[recordState] || "Eligibility under review.");
  return `<aside class="record-state record-state--${recordState}" role="status"><p>${escapeHtml(text)}</p><a class="text-link" href="?view=archive&stage=${company.historicalRanking?.stageId || company.stageId || "seed"}">Previous edition ${arrowIcon()}</a></aside>`;
}


function renderNetworkLensDetail(spec) {
  const groups = [["Investors", "investors"], ["Customers", "customers"], ["Partners", "partners"]];
  const chips = (facts) => facts?.length ? `<div class="connection-chips">${facts.map((fact) => sourceRecordState(fact.source) || !fact.source?.href ? `<span class="connection-chip connection-chip--missing" title="Source unavailable · replacement under review">${escapeHtml(fact.title)} · Source unavailable</span>` : `<a class="connection-chip" href="${escapeHtml(fact.source.href)}" target="_blank" rel="noreferrer" title="${escapeHtml(`${fact.date ? formatDate(fact.date) : `Profile snapshot · ${AS_OF}`} · ${eventStatus(fact)}`)}">${escapeHtml(fact.title)}</a>`).join("")}</div>` : `<p class="detail-empty">Public evidence not observed</p>`;
  return `<div class="detail-connections">${groups.filter(([, key]) => spec.connections?.[key]?.length).map(([label, key]) => `<div><span>${label}</span>${chips(spec.connections?.[key] || [])}</div>`).join("")}</div>`;
}


function renderCompanyProfile(company) {
  const sources = companySources(company);
  const funding = company.funding;
  const base = new URL(import.meta.url).protocol === "file:" ? "/" : new URL("../", import.meta.url).pathname;
  const values = [
    ["Equity round", `${funding.amount} · ${funding.stage}`],
    ["Announced", formatDate(funding.date)],
    ["Founders", company.founders?.names],
    ["Products", company.products],
    ["Serves", company.audience],
  ].filter(([, value]) => value && value !== "Not publicly observed" && (!Array.isArray(value) || value.length));
  return `<section class="company-profile-block" aria-labelledby="company-profile-title"><h2 id="company-profile-title">At a glance</h2><dl>${values.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${Array.isArray(value) ? value.map(escapeHtml).join("<br>") : escapeHtml(value)}</dd></div>`).join("")}</dl></section><section class="research-record"><h3>Research record</h3><p><a href="#sources">${sources.length} sources</a></p><p>Checked ${formatDate(company.refresh.checkedAt || AS_OF)}</p><p>Ranking ${formatDate(AS_OF)}</p><a class="text-link" href="${base}evidence/${company.id}.json" download="${company.id}-evidence.json">Download evidence ${arrowIcon()}</a><button id="rank-audit-trigger" class="text-link" type="button" data-action="open-rank-audit" data-company="${company.id}">${company.selected ? `Rank #${company.editorialRank}` : "Selection review"} ${arrowIcon()}</button></section>`;
}

function renderCompanyGaps(company) {
  const gaps = company.companyDetails?.evidenceGaps || company.evidenceGaps || [];
  if (!gaps.length) return "";
  return `<details class="company-section gap-note" id="evidence-gaps-title"><summary>Research limits</summary><p>${escapeHtml(Array.isArray(gaps) ? gaps.join(" ") : gaps)}</p></details>`;
}

function renderCompanyRank(company) {
  return `<header class="company-sheet" aria-labelledby="company-title"><span class="eyebrow">Company research / ${escapeHtml(company.currentStage)}</span><h1 id="company-title">${escapeHtml(company.name)}</h1><p class="company-deck">${escapeHtml(company.profile.shortDescription || company.summary)}</p><div class="company-meta"><span>${escapeHtml(company.hq)}</span><span>${escapeHtml(company.productForm)}</span><span>${escapeHtml(company.currentStage)}</span>${sourceLink(company.website, "Website")}<button id="share-company" class="text-link" type="button" data-action="share">Share</button>${state.toast ? `<span class="share-toast" role="status">${escapeHtml(state.toast)}</span>` : ""}</div></header>`;
}

function renderCompanyEvents(company) {
  const events = companyEvents(company);
  return `<section class="company-section company-signal-ledger" id="company-timeline"><h2>Timeline</h2><div class="evidence-timeline">${events.map(event => `<article class="evidence-event" id="timeline-evidence-${company.id}-${event.id}"><time datetime="${escapeHtml(event.date)}">${formatDate(event.date)}</time><div><h3><a href="${signalUrl(company, event)}">${escapeHtml(event.title)}</a></h3><p>${escapeHtml(event.detail)}</p><div class="fact-citation"><button class="text-link" type="button" id="timeline-open-${company.id}-${event.id}" data-action="open-evidence" data-company="${company.id}" data-event="${event.id}">Details ${arrowIcon()}</button>${sourceLink(event.source, "Source")}</div></div></article>`).join("")}</div></section>`;
}

function renderFundingHistory(company) {
  const funding = company.funding;
  const entries = company.events.filter(event => event.type === "funding");
  return `<div class="funding-history">${entries.map(event => {
    const isOriginal = event.id === `${company.id}-funding`;
    const isLatest = event.source.href === funding.source.href;
    const round = isLatest ? funding : isOriginal ? company.historicalFunding : null;
    const title = round ? `${round.amount} ${round.stage}` : event.title;
    const context = isLatest ? [funding.leadInvestor ? `Led by ${funding.leadInvestor}.` : "", funding.valuation ? `Valuation ${funding.valuation}.` : ""].filter(Boolean).join(" ") : "";
    return `<article><time datetime="${event.date}">${formatDate(event.date)}</time><div><strong>${escapeHtml(title)}</strong>${context ? `<p>${escapeHtml(context)}</p>` : ""}</div>${sourceLink(event.source, "Source")}</article>`;
  }).join("")}</div>`;
}

function renderCompanyContext(company) {
  const specs = companyLensSpec(company);
  const labels = { business: "Product", capital: "Funding", traction: "Adoption", technology: "Technology", "team-network": "Team" };
  const activeId = state.lens || "overview";
  const active = specs.find(spec => spec.id === activeId);
  const order = ["business", "traction", "capital", "technology", "team-network"];
  const shown = active ? [active] : order.map(id => specs.find(spec => spec.id === id)).filter(spec => spec.facts.length);
  const navigation = [["overview", "Overview"], ...Object.entries(labels)];
  return `<section class="company-section research-workspace" id="company-details"><nav class="company-topics" aria-label="Company research lenses"><div role="tablist" aria-label="Research sections">${navigation.map(([id, label]) => `<button id="lens-toggle-${id}" type="button" role="tab" data-action="toggle-lens" data-lens="${id}" aria-selected="${activeId === id}" aria-controls="lens-detail-${activeId}" class="topic-link ${activeId === id ? "is-active" : ""}">${label}</button>`).join("")}</div><a href="#company-timeline">Timeline</a><a href="#sources">Sources (${companySources(company).length})</a></nav><div class="workspace-stage" id="lens-detail-${activeId}" role="tabpanel">${shown.map(spec => `<section class="research-overview-section"><h2>${labels[spec.id]}</h2>${spec.id === "business" && company.products?.length ? `<h3>${escapeHtml(company.products.join(", "))}</h3>` : ""}${spec.id === "capital" ? renderFundingHistory(company) : spec.id === "team-network" ? renderDetailFacts(companyResearch(company).team?.facts) + renderNetworkLensDetail(spec) : renderDetailFacts(spec.facts, "No sourced detail.", { omitFirstTitle: spec.id === "business" })}</section>`).join("")}</div></section>`;
}

export function renderCompany() {
  const company = companyById(state.companyId);
  if (!company) return `<main class="page-shell" id="main"><section class="stage-empty"><h1>Company not found.</h1><a href="?view=search">Search companies</a></section></main>`;
  return `<main class="page-shell company-page" id="main"><nav class="company-breadcrumb" aria-label="Breadcrumb"><a href="?view=ranking&stage=${company.stageId}">${escapeHtml(company.stage)} index</a><span>/</span><span>${escapeHtml(company.name)}</span></nav><div class="company-article-layout"><div class="company-reading">${renderCompanyRank(company)}${renderCompanyRecordState(company)}${renderCompanyAssessment(company)}${renderCompanyContext(company)}${renderCompanyEvents(company)}${renderSourceLedger(company)}${renderCompanyGaps(company)}</div><aside class="company-facts-rail">${renderCompanyProfile(company)}</aside></div></main>`;
}

export function renderEvidenceDrawer(drawer) {
  if (!drawer || drawer.type !== "evidence") return "";
  const company = companyById(drawer.companyId);
  if (!company) return "";
  const eventItem = companyEvents(company).find((item) => item.id === drawer.eventId) || latestPublicEvent(company) || companyEvents(company)[0];
  if (!eventItem) return "";
  const sourceState = sourceRecordState(eventItem.source);
  const publicationDate = eventSourceDate(eventItem);
  return `<div class="drawer-backdrop" data-action="close-drawer"><aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" data-overlay-panel><button class="drawer-close" type="button" data-action="close-drawer" aria-label="Close evidence drawer">${closeIcon()}</button><span class="section-kicker">${escapeHtml(company.name)} · evidence</span><h2 id="drawer-title">${escapeHtml(eventItem.title || "Dated public event")}</h2><div class="drawer-facts"><div><span>Event date</span><strong>${formatDate(eventItem.date || publicationDate)}</strong></div><div><span>Source date</span><strong>${formatDate(publicationDate)}</strong></div><div><span>Type</span><strong>${signalLabel(eventItem.type, false)}</strong></div><div><span>Evidence state</span><strong>${escapeHtml(eventStatus(eventItem))}</strong></div><div><span>Relationship</span><strong>${escapeHtml(sourceState ? "Source unavailable · replacement under review" : eventRelationship(eventItem))}</strong></div></div><p class="drawer-detail">${escapeHtml(eventItem.detail || "Public detail not observed.")}</p><div class="drawer-source-block"><span class="section-kicker">Original source</span>${sourceLink(eventItem.source, eventItem.source?.label)}<small>Claim reviewed ${eventItem.lastReviewed || eventItem.source?.lastChecked || eventItem.source?.asOf || AS_OF}. Source relationship remains visible alongside evidence state.</small></div></aside></div>`;
}

function renderCompanyAssessment(company) {
  const previous = company.historicalRanking;
  const history = previous ? `<p class="rank-history"><a href="?view=archive&stage=${previous.stageId}#archive-${company.id}">${formatDate(previous.date)} · ${escapeHtml(previous.stage)} #${previous.rank}</a></p>` : `<p class="rank-history">First appearance in Top Seed.</p>`;
  return `<section class="company-section ranking-assessment" aria-labelledby="assessment-title"><h2 id="assessment-title">${company.selected ? `#${company.editorialRank} in ${escapeHtml(company.stage)}` : "Selection review"} · ${formatDate(AS_OF)}</h2>${company.selected ? `<p class="assessment-copy">${escapeHtml(company.rankingReview.rationale)}</p>` : ""}${history}${company.rankingCorrection ? `<p class="ranking-correction">${escapeHtml(company.rankingCorrection.note)} ${sourceLink(company.rankingCorrection.source, "Correction source")}</p>` : ""}<button id="assessment-evidence" class="text-link" type="button" data-action="open-rank-audit" data-company="${company.id}">Review ranking evidence ${arrowIcon()}</button></section>`;
}

export function renderRankAuditDrawer(drawer) {
  if (!drawer || drawer.type !== "rank") return "";
  const company = companyById(drawer.companyId);
  if (!company) return "";
  const previous = company.historicalRanking;
  const history = previous ? `${formatDate(previous.date)} · ${previous.stage} #${previous.rank}` : "New to this index";
  return `<div class="drawer-backdrop" data-action="close-drawer"><aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" data-overlay-panel><button class="drawer-close" type="button" data-action="close-drawer" aria-label="Close rank audit">${closeIcon()}</button><span class="section-kicker">${escapeHtml(company.name)} · editorial assessment</span><h2 id="drawer-title">Ranking review · ${formatDate(AS_OF)}</h2><p class="drawer-rationale">${escapeHtml(company.rankingReview.rationale)}</p><div class="drawer-facts"><div><span>Current rank</span><strong>${company.selected ? `#${company.editorialRank} · ${escapeHtml(company.stage)}` : "Not ranked"}</strong></div><div><span>Previous edition</span><strong>${escapeHtml(history)}</strong></div></div><div class="rank-evidence"><span class="section-kicker">Supporting evidence</span>${company.rankingReview.evidence.map(item => `<div class="rank-evidence-item"><div><strong>${escapeHtml(item.claim)}</strong><small>${escapeHtml(item.relationship)} · ${escapeHtml(item.evidenceState)}${item.publicationDate ? ` · ${formatDate(item.publicationDate)}` : ""}</small></div>${sourceLink(item, "Source")}</div>`).join("")}</div><div class="drawer-source-block"><a href="?view=methodology">Qualitative judgment · methodology</a></div></aside></div>`;
}

function publicSignalRows() {
  const query = state.query.trim().toLowerCase();
  const requestedType = signalTypeParam();
  return COMPANIES
    .filter((company) => !state.stage || company.stageId === state.stage)
    .flatMap((company) => companyEvents(company).map((eventItem) => ({ company, eventItem })))
    .filter(({ company, eventItem }) => signalTypeMatches(eventItem, requestedType))
    .filter(({ company, eventItem }) => !query || [company.name, company.summary, company.audience, company.category, company.stage, lifecycleLabel(company), eventItem.title, eventItem.detail, eventItem.type, eventStatus(eventItem), eventRelationship(eventItem), eventWhy(eventItem)].join(" ").toLowerCase().includes(query))
    .sort((a, b) => String(b.eventItem.date || eventSourceDate(b.eventItem) || "").localeCompare(String(a.eventItem.date || eventSourceDate(a.eventItem) || "")));
}

function renderSignalRow({ company, eventItem }) {
  return `<article id="signal-${escapeHtml(eventItem.id)}" class="signal-row signal-entry ${state.signalId === eventItem.id ? "is-selected" : ""}"><a class="signal-row-mark" href="${companyUrl(company)}" aria-label="Open ${escapeHtml(company.name)}">${logo(company, "small-mark")}</a><div class="signal-row-copy"><div class="signal-kicker"><a href="${companyUrl(company)}">${escapeHtml(company.name)}</a><span>${escapeHtml(company.currentStage)}</span>${lifecycleLabel(company) ? `<span>${escapeHtml(lifecycleLabel(company))}</span>` : ""}</div><h2><a href="${signalUrl(company, eventItem)}">${escapeHtml(eventItem.title)}</a></h2><p>${escapeHtml(eventItem.detail)}</p><div class="fact-citation">${sourceLink(eventItem.source, "Source")}<time datetime="${escapeHtml(eventItem.date)}">${formatDate(eventItem.date)}</time><span>${escapeHtml(eventRelationship(eventItem))} · ${escapeHtml(eventStatus(eventItem))}</span></div></div><button id="signal-open-${company.id}-${eventItem.id}" type="button" class="signal-row-open" data-action="open-evidence" data-company="${company.id}" data-event="${eventItem.id}" aria-label="Inspect ${escapeHtml(eventItem.title)}">${chevronIcon()}</button></article>`;
}

export function renderSignals() {
  const rows = publicSignalRows();
  const selectedIndex = state.signalId ? rows.findIndex(({ eventItem }) => eventItem.id === state.signalId) : -1;
  const displayed = rows.slice(0, Math.max(state.visibleCount, selectedIndex + 1));
  const remaining = rows.length - displayed.length;
  const type = signalTypeParam();
  const filterHref = nextType => `?${new URLSearchParams({ view: "signals", stage: state.stage, ...(state.query ? { q: state.query } : {}), ...(nextType ? { signalType: nextType } : {}) })}`;
  return `<main class="page-shell signals-page" id="main"><section class="ranking-masthead"><div><h1>Signals.</h1><p>${rows.length} events · ${escapeHtml(stageById(state.stage).label)} ranking cohort</p></div><label class="search-field">${searchIcon()}<input id="signals-search" type="search" aria-label="Find a signal" placeholder="Find a signal" value="${escapeHtml(state.query)}" data-action="signals-search"></label></section><nav class="stage-tabs" aria-label="Signal cohorts">${PUBLIC_STAGE_IDS.map(id => `<a class="stage-tab ${id === state.stage ? "is-active" : ""}" href="?view=signals&stage=${id}">${escapeHtml(stageById(id).label)}</a>`).join("")}</nav><nav class="signal-filter-strip" aria-label="Signal types">${signalTypeOptions().map(value => `<a class="signal-filter ${value === type ? "is-active" : ""}" href="${filterHref(value)}">${value ? SIGNAL_FILTERS[value] : "All events"}</a>`).join("")}</nav><section class="signals-stream" aria-label="Dated events">${displayed.length ? displayed.map(renderSignalRow).join("") : `<div class="list-empty"><strong>No public signals match.</strong><a class="text-link" href="?view=signals&stage=${state.stage}">Clear signal filters</a></div>`}</section>${remaining ? `<button class="load-more" type="button" data-action="load-more-signals">Load ${Math.min(20, remaining)} more</button>` : ""}</main>`;
}

function searchText(company) {
  const details = company.companyDetails || {};
  const profile = companyProfile(company);
  const research = companyResearch(company);
  const facts = [
    ...(research.team?.facts || []),
    ...(research.technology?.facts || []),
    ...(research.traction?.facts || []),
    ...(research.network?.facts || []),
  ];
  const connections = Object.values(research.network?.connections || {}).flat().map((fact) => fact.title);
  const events = companyEvents(company);
  const aliases = profile.aliases || profile.alternativeNames || company.aliases || [];
  const products = profile.products || company.products || [];
  return [company.name, ...(Array.isArray(aliases) ? aliases : [aliases]), company.summary, company.audience, company.category, company.stage, company.currentStage, lifecycleLabel(company), profile.region, profile.productForm, profile.founders, profile.keyTeam, profile.businessModel, ...(Array.isArray(products) ? products : [products]), ...facts.flatMap((fact) => [fact.title, fact.detail]), ...connections, ...events.flatMap((eventItem) => [eventItem.title, eventItem.detail, eventItem.type, eventStatus(eventItem), eventRelationship(eventItem), eventWhy(eventItem)])].join(" ").toLowerCase();
}

function searchMatches() {
  const query = state.query.trim().toLowerCase();
  return COMPANIES.filter((company) => PUBLIC_STAGE_IDS.includes(company.stageId) && (!query || searchText(company).includes(query)));
}

export function renderSearch() {
  const matches = searchMatches();
  const displayed = matches.slice(0, state.visibleCount);
  const remaining = matches.length - displayed.length;
  return `<main class="page-shell search-page" id="main"><section class="ranking-masthead"><div><h1>Company search.</h1><p>${COMPANIES.length} companies. Search products, founders and evidence.</p></div></section><label class="search-field search-page-field">${searchIcon()}<input id="search-page-input" type="search" aria-label="Find a company" placeholder="Find a company" value="${escapeHtml(state.query)}" data-action="search-page-input"></label><p class="search-count">${matches.length} results</p><section class="search-results" aria-label="Search results">${displayed.map(company => `<a class="search-result" href="${companyUrl(company)}" aria-label="Open ${escapeHtml(company.name)} company page">${logo(company, "small-mark")}<span><strong>${escapeHtml(company.name)}</strong><small>${escapeHtml(company.currentStage)} · ${escapeHtml(company.category)}${lifecycleLabel(company) ? ` · ${escapeHtml(lifecycleLabel(company))}` : ""}</small><p>${escapeHtml(company.summary)}</p></span>${chevronIcon()}</a>`).join("") || `<div class="list-empty"><strong>No companies match.</strong><a class="text-link" href="?view=search">Clear search</a></div>`}</section>${remaining ? `<button class="load-more" type="button" data-action="load-more-search">Load ${Math.min(10, remaining)} more</button>` : ""}</main>`;
}

export function renderCompanyPreview(drawer) {
  if (drawer?.type !== "company-preview") return "";
  const company = companyById(drawer.companyId);
  if (!company) return "";
  const sources = companySources(company);
  const event = latestPublicEvent(company);
  return `<div class="drawer-backdrop" data-action="close-drawer"><aside class="drawer company-preview-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" data-overlay-panel>
    <div class="preview-topline"><span class="eyebrow">Company brief</span><button class="drawer-close" type="button" data-action="close-drawer" aria-label="Close company brief">${closeIcon()}</button></div>
    <div class="preview-body"><div class="preview-identity">${logo(company)}<span>${escapeHtml(company.currentStage)} <span aria-hidden="true">/</span> ${company.selected ? `Rank ${company.editorialRank}` : "Not ranked"}</span></div>
    <h2 id="drawer-title">${escapeHtml(company.name)}</h2><p class="preview-description">${escapeHtml(company.summary)}</p>
    <dl class="brief-metrics"><div><dt>Named round</dt><dd>${escapeHtml(company.funding.amount)}</dd></div><div><dt>Announced</dt><dd>${formatDate(company.funding.date)}</dd></div><div><dt>Source library</dt><dd>${sources.length} sources</dd></div></dl>
    <section class="brief-assessment"><span class="eyebrow">Editorial assessment</span><p>${escapeHtml(company.rankingReview.rationale)}</p></section>
    ${event ? `<section class="brief-event"><span class="eyebrow">Latest recorded event</span><h3>${escapeHtml(event.title)}</h3><p>${formatDate(event.date)} · ${escapeHtml(event.source.relationship)}</p>${sourceLink(event.source, "Original source")}</section>` : ""}
    </div><div class="brief-actions"><a class="button button-primary" href="${companyUrl(company)}">Read full research ${arrowIcon()}</a><a class="text-link" href="${companyUrl(company)}#sources">Source library ${arrowIcon()}</a></div>
  </aside></div>`;
}
