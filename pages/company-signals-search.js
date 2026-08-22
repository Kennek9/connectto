import {
  AS_OF,
  COMPANIES,
  arrowIcon,
  companyRecordState,
  chevronIcon,
  closeIcon,
  evidenceCoverage,
  escapeHtml,
  formatDate,
  latestPublicEvent,
  latestSignal,
  logo,
  publicSignals,
  rankFor,
  rankedCompanies,
  searchIcon,
  signalLabel,
  signalPictogram,
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

function detailValue(value) {
  return value ? escapeHtml(value) : `<span class="not-observed">Not publicly observed</span>`;
}

function companyResearch(company) {
  return company?.companyDetails?.research || company?.research || {};
}

function companyProfile(company) {
  return company?.profile || company?.companyProfile || {};
}

function profileValue(company, ...keys) {
  const profile = companyProfile(company);
  const research = companyResearch(company);
  for (const key of keys) {
    const value = profile[key] ?? company?.[key] ?? research[key];
    if (Array.isArray(value) && value.length) return value.join(" · ");
    if (value && !/^not publicly observed$/i.test(String(value))) return String(value);
  }
  return "";
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

function signalTypeMatches(eventItem, requested) {
  if (!requested) return true;
  const key = signalTypeKey(eventItem?.type);
  return key === signalTypeKey(requested) || (key === "opensource" && signalTypeKey(requested) === "developer");
}

function signalTypeOptions() {
  const options = [...new Set(COMPANIES.flatMap((company) => companyEvents(company).map((item) => item.type)).filter(Boolean))];
  return ["", ...options];
}

function lifecycleLabel(company) {
  const recordState = companyRecordState(company);
  return recordState === "archived" ? "Archived record" : recordState === "stage-conflict" ? "Stage conflict under review" : "";
}

function companyWhySelected(company) {
  const details = company?.companyDetails || {};
  const candidates = [company?.whySelected, company?.selectionReason, company?.why, details.whySelected, details.selection?.why, company?.rankRationale];
  for (const value of candidates) {
    if (Array.isArray(value)) {
      const item = value.find((entry) => entry?.detail || entry?.title);
      if (item) return item.detail || item.title;
    } else if (value && !/^not publicly observed$/i.test(String(value))) return String(value);
  }
  return "Top Seed’s editorial selection rationale was not publicly observed in this snapshot.";
}

function companyEvidenceGaps(company) {
  const details = company?.companyDetails || {};
  const profile = companyProfile(company);
  const raw = company?.evidenceGaps ?? company?.gaps ?? details.evidenceGaps ?? profile.evidenceGaps;
  if (Array.isArray(raw)) return raw.filter(Boolean).join(" ");
  if (raw && !/^not publicly observed$/i.test(String(raw))) return String(raw);
  return "Not publicly observed in this snapshot. Missing evidence is not negative evidence.";
}

function renderDetailFact(fact, omitTitle = false) {
  const factDate = fact.date ? formatDate(fact.date) : `Profile snapshot · ${AS_OF}`;
  return `<article class="detail-fact"><div class="detail-fact-meta"><span>${escapeHtml(fact.label || "Public fact")}</span><small>${factDate} · ${escapeHtml(fact.evidenceState || "Source")}</small></div>${omitTitle ? "" : `<strong>${escapeHtml(fact.title)}</strong>`}<p>${escapeHtml(fact.detail)}</p>${sourceLink(fact.source, "Original source")}</article>`;
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
  if (lensId === "business") return [businessFact(company)];
  if (lensId === "capital") return research.capital?.facts || [];
  if (lensId === "traction") return research.traction?.facts || [];
  if (lensId === "technology") return research.technology?.facts || [];
  return [...(research.team?.facts || []), ...(research.network?.facts || [])];
}

function companyLensSpec(company) {
  const details = company.companyDetails || {};
  const research = companyResearch(company);
  return WORKSPACE_LENSES.map((lens) => ({
    ...lens,
    facts: companyLensFacts(company, lens.id),
    conclusion: lens.id === "business" ? `${company.summary} For ${String(company.audience || "public users").toLowerCase()}.` : research[lens.id === "team-network" ? "network" : lens.id]?.conclusion || "Public evidence was not observed after review.",
    connections: lens.id === "team-network" ? research.network?.connections || {} : null,
    links: lens.id === "team-network" ? details.links : null,
  }));
}

function lensConfidence(facts) {
  if (!facts.length) return "Public evidence not observed";
  return facts.every((fact) => ["Verified", "Direct", "Corroborated"].includes(fact.evidenceState)) ? "High confidence" : "Medium confidence";
}

const RECORD_STATE_COPY = {
  archived: ["Archived record", "This company is kept for historical reference and is not assigned a current rank."],
  "stage-conflict": ["Stage conflict under review", "The available sources disagree about this company’s financing stage, so it is withheld from the current stage ranking until the record is resolved."],
};

export function renderCompanyRecordState(company) {
  const recordState = companyRecordState(company);
  const copy = RECORD_STATE_COPY[recordState];
  if (!copy) return "";
  return `<aside class="stage-empty record-state record-state--${recordState}" role="status"><span class="section-kicker">Record status</span><h2>${copy[0]}</h2><p>${copy[1]}</p><a class="text-link" href="?view=corrections">Review the source or suggest a correction ${arrowIcon()}</a></aside>`;
}

function renderFundingLensDetail(company, compact = false) {
  const funding = companyResearch(company).capital || {};
  return `<div class="lens-funding"><div class="lens-funding-fact">${renderDetailFacts(companyLensFacts(company, "capital"), "Not publicly observed", { omitFirstTitle: compact })}</div><div class="detail-funding-grid"><div><span>Total disclosed</span><strong>${detailValue(funding.totalDisclosed)}</strong></div><div><span>Lead investor</span><strong>${detailValue(funding.leadInvestor)}</strong></div><div><span>Notable backers</span><strong>${detailValue((funding.notableBackers || []).join(" · "))}</strong></div><div><span>Public history</span><strong>${detailValue(funding.disclosedRoundCount)}</strong><small>${detailValue(funding.financingCadence)}</small></div></div></div>`;
}

function renderNetworkLensDetail(spec) {
  const groups = [["Founders", "founders"], ["Investors", "investors"], ["Customers", "customers"], ["Partners", "partners"]];
  const links = spec.links || {};
  const link = (label, item) => item ? sourceLink(item, label) : "";
  const chips = (facts) => facts?.length ? `<div class="connection-chips">${facts.map((fact) => sourceRecordState(fact.source) || !fact.source?.href ? `<span class="connection-chip connection-chip--missing" title="Source unavailable · replacement under review">${escapeHtml(fact.title)} · Source unavailable</span>` : `<a class="connection-chip" href="${escapeHtml(fact.source.href)}" target="_blank" rel="noreferrer" title="${escapeHtml(`${fact.date ? formatDate(fact.date) : `Profile snapshot · ${AS_OF}`} · ${eventStatus(fact)}`)}">${escapeHtml(fact.title)}</a>`).join("")}</div>` : `<p class="detail-empty">Public evidence not observed</p>`;
  return `<div class="detail-links lens-links">${link("Website", links.website)}${link("X", links.x)}${link("LinkedIn", links.linkedin)}</div><div class="detail-connections">${groups.map(([label, key]) => `<div><span>${label}</span>${chips(spec.connections?.[key] || [])}</div>`).join("")}</div>`;
}

function renderLensDetail(company, spec, compact = false) {
  if (spec.id === "capital") return renderFundingLensDetail(company, compact);
  if (spec.id === "team-network") return `${renderDetailFacts(companyResearch(company).team?.facts, "Public evidence not observed", { omitFirstTitle: compact })}${renderNetworkLensDetail(spec)}`;
  return renderDetailFacts(spec.facts, "Public evidence not observed", { omitFirstTitle: compact });
}

function renderCompanyProfile(company) {
  const profile = companyProfile(company);
  const values = [
    ["What it does", profileValue(company, "whatItDoes", "summary") || company.summary],
    ["Who it serves", profileValue(company, "whoItServes", "audience") || company.audience],
    ["Products", profileValue(company, "products") || profileValue(company, "productSummary")],
    ["Product form", profileValue(company, "productForm", "form", "productType")],
    ["Market category", profileValue(company, "category") || company.category],
    ["Primary region", profileValue(company, "region", "primaryRegion", "hqRegion")],
    ["Founded / HQ", profileValue(company, "foundedHq", "founded", "headquarters")],
    ["Founders / key team", profileValue(company, "founders", "keyTeam") || companyResearch(company).team?.facts?.[0]?.title],
    ["Business model", profileValue(company, "businessModel")],
    ["Developer surface", profileValue(company, "developerLinks")],
  ];
  const links = Object.entries(company?.companyDetails?.links || {}).filter(([, item]) => item).map(([label, item]) => sourceLink(item, label === "website" ? "Official website" : label));
  return `<section class="company-section company-profile-block fact-list profile-facts" aria-labelledby="company-profile-title"><div class="section-heading"><div><span class="section-kicker">Company profile</span><h2 id="company-profile-title">Start with the public record.</h2></div><p>Facts, product context, and missing fields stay separate from the editorial rank.</p></div><dl>${values.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${detailValue(value)}</dd></div>`).join("")}</dl><div class="profile-sources"><span class="section-kicker">Profile sources</span>${links.length ? links.join("") : `<span class="not-observed">Not publicly observed</span>`}</div></section>`;
}

function renderCompanyGaps(company) {
  return `<section class="company-section gap-note evidence-gaps" aria-labelledby="evidence-gaps-title"><span class="section-kicker">Evidence gaps</span><h2 id="evidence-gaps-title">What is still missing.</h2><p>${escapeHtml(companyEvidenceGaps(company))}</p><span class="not-observed">Not publicly observed ≠ negative evidence.</span><a class="text-link" href="?view=corrections">Suggest a source or correction ${arrowIcon()}</a></section>`;
}

function renderCompanyRank(company) {
  const details = company.companyDetails || {};
  const research = companyResearch(company);
  const capital = research.capital || {};
  const traction = research.traction || {};
  const technology = research.technology || {};
  const team = research.team || {};
  const coverage = evidenceCoverage(company);
  const recordState = companyRecordState(company);
  const currentRank = rankFor(company);
  const support = [traction.facts?.[0], technology.facts?.[0], team.facts?.[0]].filter(Boolean).slice(0, 2);
  const links = [["Website", details.links?.website || company.website], ["X", details.links?.x], ["LinkedIn", details.links?.linkedin]].filter(([, item]) => item);
  const strongestAdoption = traction.facts?.[0];
  const strongestTech = technology.facts?.[0];
  const funding = company.funding || {};
  const fundingAmount = funding.amount || profileValue(company, "latestRoundAmount", "latestFundingAmount");
  const fundingSource = funding.source || company.profile?.sources?.find?.((item) => /fund/i.test(item?.label || ""));
  const eventCount = companyEvents(company).length;
  const websiteAction = company.website?.href ? `<a class="button button-primary" href="${escapeHtml(company.website.href)}" target="_blank" rel="noreferrer">Visit website ${arrowIcon()}</a>` : `<span class="button button-primary button-disabled" aria-disabled="true">Website not publicly observed</span>`;
  return `<section class="decision-snapshot company-hero company-sheet" aria-labelledby="company-title"><div class="decision-head company-hero-main"><div class="decision-identity company-identity"><button id="logo-inspector-trigger" class="evidence-stamp-trigger" type="button" data-action="open-logo-inspector" data-company="${company.id}" aria-haspopup="dialog" aria-controls="logo-inspector" aria-label="Inspect ${escapeHtml(company.name)} logo"><span class="evidence-stamp-kicker">Public mark</span>${logo(company, "hero-mark inspector-trigger-mark") }<span class="evidence-stamp-caption">${escapeHtml(company.stage || "Stage not observed")} · checked ${formatDate(companyResearch(company).lastChecked || AS_OF)}</span><span class="evidence-stamp-arrow" aria-hidden="true">↗</span></button><div><span class="section-kicker">${escapeHtml(company.stage || "Stage not observed")} · ${escapeHtml(company.category || "Category not observed")}</span><h1 id="company-title">${escapeHtml(company.name)}</h1><p>${escapeHtml(company.summary || "Company description not publicly observed.")} For ${escapeHtml(String(company.audience || "public users").toLowerCase())}</p><div class="company-actions">${websiteAction}<button class="button button-secondary" type="button" data-action="share">Share</button></div>${state.toast ? `<span class="share-toast" role="status">${escapeHtml(state.toast)}</span>` : ""}</div></div><div class="decision-rank company-rank"><span class="section-kicker">${recordState ? "Current rank status" : `Current ${escapeHtml(company.stage || "stage")} rank`}</span><strong class="giant-rank">${recordState ? "Under review" : currentRank ? `#${String(currentRank).padStart(2, "0")}` : "Not published"}</strong><span>${recordState ? "No current rank" : currentRank ? `of ${rankedCompanies(company.stageId).length} reviewed companies` : "No current rank publicly observed"}</span></div></div><div class="decision-grid company-rank-strip"><div><span class="section-kicker">Latest round</span><strong>${detailValue(fundingAmount)}</strong><small>${detailValue(funding.stage || company.profile?.funding?.latestRoundStage)} · ${funding.date ? formatDate(funding.date) : "Date not publicly observed"} · ${escapeHtml(eventStatus(funding))}</small>${sourceLink(fundingSource, "Funding source")}</div><div><span class="section-kicker">Funding context</span><strong>${detailValue(capital.totalDisclosed)}</strong><small>${detailValue(capital.disclosedRoundCount)}</small><b>Context only; funding does not mechanically set rank.</b></div><div><span class="section-kicker">Strongest non-funding signal</span><strong>${escapeHtml(strongestAdoption?.title || strongestTech?.title || "Public evidence not observed")}</strong><small>${strongestAdoption || strongestTech ? `${formatDate((strongestAdoption || strongestTech).date)} · ${escapeHtml(eventStatus(strongestAdoption || strongestTech))}` : "Product, customer, or usage evidence not observed"}</small></div><div><span class="section-kicker">Dated evidence</span><strong>${eventCount}</strong><small>${coverage.signalCount} non-funding signal${coverage.signalCount === 1 ? "" : "s"} · ${coverage.verifiedCount} reviewed</small></div></div><div class="decision-why selection-note"><span class="section-kicker">Why selected</span><strong>${escapeHtml(companyWhySelected(company))}</strong><p>${support.length ? support.map((fact) => `${escapeHtml(fact.title)} · ${escapeHtml(eventStatus(fact))}`).join(" · ") : "Public evidence supporting the selection was not observed beyond the financing record."}</p><small>Top Seed editorial interpretation; it is not a hidden score or investment recommendation.</small></div><div class="decision-links"><span class="section-kicker">Primary links</span><div>${links.map(([label, item]) => sourceLink(item, label)).join("")}</div></div><button id="rank-audit-trigger" class="text-link" type="button" data-action="open-rank-audit" data-company="${company.id}">Open rank review ${arrowIcon()}</button></section>`;
}

function renderCompanyEvents(company) {
  const events = companyEvents(company);
  return `<details class="company-section timeline-disclosure company-signal-ledger"><summary><span><span class="section-kicker">Signals timeline</span><strong>${events.length} dated records</strong></span><small>Funding and non-funding events stay in date order with evidence state, relationship, and source.</small><span class="timeline-chevron">${chevronIcon()}</span></summary><div class="evidence-timeline">${events.length ? events.map((eventItem) => { const sourceState = sourceRecordState(eventItem.source); const sourceMeta = sourceState ? "Source unavailable · replacement under review" : eventRelationship(eventItem); const sourceLabel = sourceState ? "Source unavailable · suggest a correction" : eventItem.source?.label || "Source not publicly observed"; const eventDate = eventItem.date || eventSourceDate(eventItem); return `<article id="timeline-evidence-${company.id}-${eventItem.id}" class="evidence-event signal-entry ${sourceState ? "is-source-unavailable" : ""}"><span class="evidence-event-marker">${signalPictogram(eventItem.type)}</span><span class="evidence-event-body"><span class="evidence-event-meta">${formatDate(eventDate)} · ${escapeHtml(eventStatus(eventItem))} · ${escapeHtml(sourceMeta)}</span><strong><a href="${signalUrl(company, eventItem)}">${escapeHtml(eventItem.title || "Dated public event")}</a></strong><p>${escapeHtml(eventItem.detail || "Public detail not observed.")}</p><p class="why-line"><b>WHY IT MATTERS</b> ${escapeHtml(eventWhy(eventItem))}</p><div class="evidence-event-actions"><button id="timeline-open-${company.id}-${eventItem.id}" class="text-link" type="button" data-action="open-evidence" data-company="${company.id}" data-event="${eventItem.id}">Inspect evidence ${arrowIcon()}</button>${sourceLink(eventItem.source, sourceState ? "Source status" : "Original source")}</div></span></article>`; }).join("") : `<div class="list-empty"><strong>No dated public events.</strong><span>Signals for this company are not publicly observed in this snapshot.</span></div>`}</div></details>`;
}

function renderCompanyContext(company) {
  const specs = companyLensSpec(company);
  const activeId = state.lens || "business";
  const active = specs.find((spec) => spec.id === activeId) || specs[0];
  return `<section class="company-section research-workspace" id="company-details"><div class="section-heading"><div><span class="section-kicker">Research workspace</span><h2>Evidence, organized for a decision.</h2></div><p>Choose one lens to inspect the strongest fact, the evidence gap, and original sources.</p></div><div class="workspace-shell"><nav class="workspace-tabs" aria-label="Company research lenses" role="tablist">${specs.map((spec) => { const first = spec.facts[0]; const selected = spec.id === active.id; return `<button id="lens-toggle-${spec.id}" class="workspace-tab ${selected ? "is-active" : ""}" type="button" role="tab" data-action="toggle-lens" data-lens="${spec.id}" aria-selected="${selected}" aria-controls="lens-detail-${spec.id}"><strong>${escapeHtml(spec.label)}</strong><small>${escapeHtml(first?.title || "Public evidence not observed")}</small><em>${first ? `${escapeHtml(first.evidenceState)} · ${spec.facts.length} fact${spec.facts.length === 1 ? "" : "s"}` : "Public evidence not observed"}</em><span class="workspace-tab-preview">${escapeHtml(spec.description)}</span></button>`; }).join("")}</nav><div class="workspace-stage" id="lens-detail-${active.id}" role="tabpanel" tabindex="-1"><div class="workspace-stage-head"><div><span class="section-kicker">${escapeHtml(active.label)}</span><h3>${escapeHtml(active.facts[0]?.title || "Public evidence not observed")}</h3></div><span class="workspace-confidence">${escapeHtml(lensConfidence(active.facts))}</span></div>${renderLensDetail(company, active, true)}</div></div></section>`;
}

export function renderCompany() {
  const company = companyById(state.companyId);
  const recordState = company ? companyRecordState(company) : "";
  if (!company || (!PUBLIC_STAGE_IDS.includes(company.stageId) && !recordState)) return `<main class="page-shell company-page" id="main"><section class="stage-empty"><span class="section-kicker">Company</span><h1>Company not publicly observed.</h1><p>The requested company is not in the current Top Seed records.</p><a class="text-link" href="?view=search">Search reviewed companies ${arrowIcon()}</a></section></main>`;
  return `<main class="page-shell company-page" id="main"><a class="back-link company-breadcrumb" href="?view=ranking&stage=${company.stageId}">← ${escapeHtml(company.stage || "Stage")} ranking</a>${renderCompanyRecordState(company)}${renderCompanyRank(company)}${renderCompanyProfile(company)}${renderCompanyGaps(company)}${renderCompanyContext(company)}${renderCompanyEvents(company)}<section class="company-footnote"><span>Public profile · editorial beta · ${companyEvents(company).length} dated records · checked ${companyResearch(company).lastChecked || AS_OF}</span><a class="text-link" href="?view=corrections">Suggest a correction ${arrowIcon()}</a></section></main>`;
}

export function renderLogoInspector() {
  if (!state.logoInspector) return "";
  const company = companyById(state.logoInspector);
  if (!company) return "";
  const source = company.logo?.source;
  return `<dialog id="logo-inspector" class="logo-inspector" aria-labelledby="logo-inspector-title" aria-describedby="logo-inspector-description"><button class="logo-inspector-close" type="button" data-action="close-logo-inspector" aria-label="Close logo inspection">${closeIcon()}</button><div class="logo-inspector-grid"><div class="logo-inspector-visual"><span class="section-kicker">Source check</span><div class="inspector-lens">${logo(company, "inspector-mark stamp-mark stamp-mark--inspector")}</div><span class="logo-inspector-note">Displayed at source size when the mark is smaller than the inspection frame.</span></div><div class="logo-inspector-copy"><span class="section-kicker">${escapeHtml(company.stage || "Stage not observed")} · public mark</span><h2 id="logo-inspector-title">${escapeHtml(company.name)}</h2><p id="logo-inspector-description">The mark is used for nominative identification on the Top Seed board.</p><div class="logo-inspector-facts"><div><span>Stage</span><strong>${escapeHtml(company.stage || "Not publicly observed")}</strong></div><div><span>Checked</span><strong>${formatDate(companyResearch(company).lastChecked || AS_OF)}</strong></div><div><span>Source</span><strong>${escapeHtml(source?.provenance || "Source relationship not observed")}</strong></div></div><div class="logo-inspector-source">${sourceLink(source, "Open mark source")}</div></div></div></dialog>`;
}

export function renderEvidenceDrawer(drawer) {
  if (!drawer || drawer.type !== "evidence") return "";
  const company = companyById(drawer.companyId);
  if (!company) return "";
  const eventItem = companyEvents(company).find((item) => item.id === drawer.eventId) || latestPublicEvent(company) || companyEvents(company)[0];
  if (!eventItem) return "";
  const sourceState = sourceRecordState(eventItem.source);
  const publicationDate = eventSourceDate(eventItem);
  return `<div class="drawer-backdrop" data-action="close-drawer"><aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" data-overlay-panel><button class="drawer-close" type="button" data-action="close-drawer" aria-label="Close evidence drawer">${closeIcon()}</button><span class="section-kicker">${escapeHtml(company.name)} · evidence</span><h2 id="drawer-title">${escapeHtml(eventItem.title || "Dated public event")}</h2><div class="drawer-facts"><div><span>Event date</span><strong>${formatDate(eventItem.date || publicationDate)}</strong></div><div><span>Source date</span><strong>${formatDate(publicationDate)}</strong></div><div><span>Type</span><strong>${signalLabel(eventItem.type, false)}</strong></div><div><span>Evidence state</span><strong>${escapeHtml(eventStatus(eventItem))}</strong></div><div><span>Relationship</span><strong>${escapeHtml(sourceState ? "Source unavailable · replacement under review" : eventRelationship(eventItem))}</strong></div></div><p class="drawer-detail">${escapeHtml(eventItem.detail || "Public detail not observed.")}</p><p class="drawer-rationale"><strong>Why it matters</strong><br>${escapeHtml(eventWhy(eventItem))}</p><div class="drawer-source-block"><span class="section-kicker">Original source</span>${sourceLink(eventItem.source, eventItem.source?.label)}<small>Last checked ${companyResearch(company).lastChecked || AS_OF}. Source relationship remains visible alongside evidence state.</small></div></aside></div>`;
}

function rankEvidence(company) {
  return companyEvents(company).slice(0, 3);
}

export function renderRankAuditDrawer(drawer) {
  if (!drawer || drawer.type !== "rank") return "";
  const company = companyById(drawer.companyId);
  if (!company) return "";
  const coverage = evidenceCoverage(company);
  const recordState = companyRecordState(company);
  const keyEvidence = rankEvidence(company);
  return `<div class="drawer-backdrop" data-action="close-drawer"><aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" data-overlay-panel><button class="drawer-close" type="button" data-action="close-drawer" aria-label="Close rank audit">${closeIcon()}</button><span class="section-kicker">${escapeHtml(company.name)} · rank review</span><h2 id="drawer-title">Why this position</h2><p class="drawer-rationale">${escapeHtml(companyWhySelected(company))}</p><div class="drawer-facts"><div><span>Rank</span><strong>${recordState ? "Under review" : `#${rankFor(company)}`}</strong></div><div><span>Stage</span><strong>${escapeHtml(company.stage || "Stage not observed")}</strong></div><div><span>Dated signals</span><strong>${coverage.signalCount}</strong></div><div><span>Publication</span><strong>Editorial beta</strong></div></div><p class="drawer-detail">The public review names the dated evidence behind the position. Internal weighting and normalization are not exposed as a pseudo-precise score.</p><div class="rank-evidence"><span class="section-kicker">Key evidence</span>${keyEvidence.map((eventItem) => `<div class="rank-evidence-item"><div><strong>${escapeHtml(eventItem.title || "Dated public event")}</strong><small>${formatDate(eventItem.date || eventSourceDate(eventItem))} · ${escapeHtml(eventStatus(eventItem))} · ${escapeHtml(sourceRecordState(eventItem.source) ? "Source unavailable · replacement under review" : eventRelationship(eventItem))}</small></div>${sourceLink(eventItem.source, "Open source")}</div>`).join("")}</div><div class="drawer-source-block"><span class="section-kicker">Evidence policy</span><p>Specific dated events support the position. A homepage or generic index can orient a reader but cannot stand in for an event.</p></div></aside></div>`;
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
  const selected = state.signalId === eventItem.id;
  const sourceState = sourceRecordState(eventItem.source);
  const eventDate = eventItem.date || eventSourceDate(eventItem);
  const sourceDate = eventSourceDate(eventItem);
  const dateMeta = `${formatDate(eventDate)} · ${escapeHtml(eventStatus(eventItem))}`;
  const sourceMeta = sourceState ? "Source unavailable · replacement under review" : eventRelationship(eventItem);
  return `<article id="signal-${escapeHtml(eventItem.id)}" class="signal-row signal-entry ${sourceState ? "is-source-unavailable" : ""} ${selected ? "is-selected" : ""}"><a class="signal-row-mark" href="${companyUrl(company)}" aria-label="Open ${escapeHtml(company.name)} company">${logo(company, "small-mark")}</a><div class="signal-row-copy signal-body"><div class="signal-kicker"><span>${escapeHtml(company.stage || "Stage not observed")}</span><span class="signal-kicker-separator"> · </span><a href="${companyUrl(company)}">${escapeHtml(company.name)}</a>${lifecycleLabel(company) ? `<span class="record-state-label"> · ${escapeHtml(lifecycleLabel(company))}</span>` : ""}</div><strong><a href="${signalUrl(company, eventItem)}">${escapeHtml(eventItem.title || "Dated public event")}</a></strong><p class="signal-meta-mobile"><time datetime="${escapeHtml(eventDate || "")}">${dateMeta}</time> · ${escapeHtml(sourceMeta)}${sourceDate && sourceDate !== eventDate ? ` · Source date ${formatDate(sourceDate)}` : ""}</p><p>${escapeHtml(eventItem.detail || "Public detail not observed.")}</p><p class="why-line"><b>WHY IT MATTERS</b> ${escapeHtml(eventWhy(eventItem))}</p><div class="signal-foot">${sourceLink(eventItem.source, sourceState ? "Source status" : eventItem.source?.label || "Original source")}</div></div><span class="signal-row-type">${signalLabel(eventItem.type)}</span><span class="signal-row-date"><time datetime="${escapeHtml(eventDate || "")}">${dateMeta}</time><span class="signal-row-date-separator"> · </span><small>${sourceDate && sourceDate !== eventDate ? `Source date ${formatDate(sourceDate)}` : "Source date matches event date"}<br><span class="signal-source-separator"> · </span>${escapeHtml(sourceMeta)}</small></span><button id="signal-open-${escapeHtml(company.id)}-${escapeHtml(eventItem.id)}" type="button" class="signal-row-open" data-action="open-evidence" data-company="${escapeHtml(company.id)}" data-event="${escapeHtml(eventItem.id)}" aria-label="Open evidence for ${escapeHtml(eventItem.title || "dated public event")}">${chevronIcon()}</button></article>`;
}

export function renderSignals() {
  const rows = publicSignalRows();
  const displayed = rows.slice(0, state.visibleCount);
  const remaining = rows.length - displayed.length;
  const stage = stageById(state.stage);
  const requestedType = signalTypeParam();
  const filterHref = (type) => {
    const params = new URLSearchParams();
    params.set("view", "signals");
    params.set("stage", state.stage);
    if (state.query) params.set("q", state.query);
    if (type) params.set("signalType", type);
    return `?${params.toString()}`;
  };
  const options = signalTypeOptions();
  const hasQuery = Boolean(state.query.trim() || requestedType);
  const emptyCopy = !rows.length && (state.stage === "series-b" || state.stage === "series-c")
    ? `<div class="list-empty stage-empty"><strong>Candidate pool under review.</strong><span>No public Signals are published for ${escapeHtml(stage.label)} yet. This stage remains visible so the missing coverage is explicit.</span><a class="text-link" href="?view=corrections">Suggest a source ${arrowIcon()}</a></div>`
    : `<div class="list-empty"><strong>${hasQuery ? "No public signals match." : "No dated public signals."}</strong><span>${hasQuery ? "Try another search, signal type, or stage." : "The reviewed records do not contain a dated public event for this view."}</span>${hasQuery ? `<a class="text-link" href="${filterHref("")}">Clear signal filters ${arrowIcon()}</a>` : `<a class="text-link" href="?view=search">Search reviewed companies ${arrowIcon()}</a>`}</div>`;
  return `<main class="page-shell ranking-page signals-page" id="main"><section class="ranking-masthead signals-masthead compact"><div><span class="section-kicker">Top Seed · public signal desk</span><h1>Signals</h1><p>Read dated company changes with evidence state, source relationship, and why each record matters. Funding is included as context, not a rank shortcut.</p></div><div class="masthead-meta"><span class="beta-flag">Continuous review</span><p>Stage · ${escapeHtml(stage.label)}<br>${rows.length} dated record${rows.length === 1 ? "" : "s"}<br>Source-linked records</p></div><span class="masthead-trust"><span class="trust-dot"></span>Evidence state and source relationship stay visible.</span></section><section class="full-ranking" aria-labelledby="signals-title"><div class="list-heading"><div><span class="section-kicker" id="signals-title">${escapeHtml(stage.label)} signal stream</span><p>${rows.length} public record${rows.length === 1 ? "" : "s"} match this view.</p></div><label class="search-field"><span class="filter-label">Find a signal</span>${searchIcon()}<input id="signals-search" type="search" placeholder="Company, signal, or source" value="${escapeHtml(state.query)}" data-action="signals-search" /></label></div><nav class="signal-filter-strip" aria-label="Filter signals by type">${options.map((type) => `<a class="signal-filter ${(!requestedType && !type) || signalTypeKey(requestedType) === signalTypeKey(type) ? "is-active" : ""}" href="${filterHref(type)}" ${(!requestedType && !type) || signalTypeKey(requestedType) === signalTypeKey(type) ? "aria-current=\"page\"" : ""}>${type ? signalLabel(type) : "All signals"}</a>`).join("")}</nav><div class="signals-stream">${displayed.length ? displayed.map(renderSignalRow).join("") : emptyCopy}</div>${remaining > 0 ? `<button class="load-more" type="button" data-action="load-more-signals"><span>Load ${Math.min(20, remaining)} more</span><span>${displayed.length} of ${rows.length}</span></button>` : ""}</section></main>`;
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
  return [company.name, ...(Array.isArray(aliases) ? aliases : [aliases]), company.summary, company.audience, company.category, company.stage, profile.region, profile.productForm, profile.founders, profile.keyTeam, profile.businessModel, ...(Array.isArray(products) ? products : [products]), ...facts.flatMap((fact) => [fact.title, fact.detail]), ...connections, ...events.flatMap((eventItem) => [eventItem.title, eventItem.detail, eventItem.type, eventStatus(eventItem), eventRelationship(eventItem), eventWhy(eventItem)])].join(" ").toLowerCase();
}

function searchMatches() {
  const query = state.query.trim().toLowerCase();
  return COMPANIES.filter((company) => PUBLIC_STAGE_IDS.includes(company.stageId) && (!query || searchText(company).includes(query)));
}

export function renderSearch() {
  const matches = searchMatches();
  const displayed = matches.slice(0, state.visibleCount);
  const remaining = matches.length - displayed.length;
  return `<main class="page-shell ranking-page search-page" id="main"><section class="ranking-masthead search-masthead compact"><div><span class="section-kicker">Top Seed · company index</span><h1>Search</h1><p>Find reviewed companies by name, alias, product, category, founder, or source-backed context. Candidate-pool companies stay excluded.</p></div><div class="masthead-meta"><span class="beta-flag">Reviewed index</span><p>${matches.length} result${matches.length === 1 ? "" : "s"}<br>Company pages restore source context<br>URL query state is shareable</p></div></section><section class="full-ranking" aria-labelledby="search-title"><div class="list-heading"><div><span class="section-kicker" id="search-title">Reviewed companies</span><p>${matches.length} result${matches.length === 1 ? "" : "s"} for this query.</p></div><label class="search-field"><span class="filter-label">Find a company</span>${searchIcon()}<input id="search-page-input" type="search" placeholder="Company, product, founder, or category" value="${escapeHtml(state.query)}" data-action="search-page-input" autofocus /></label></div><div class="search-results">${displayed.length ? displayed.map((company) => { const recordState = companyRecordState(company); const latestEvent = companyEvents(company)[0]; const rankMeta = recordState ? `${recordState === "archived" ? "Archived record" : "Stage conflict under review"} · no current rank` : `${escapeHtml(company.stage || "Stage not observed")} · #${String(rankFor(company)).padStart(2, "0")}`; const latestMeta = latestEvent ? `${formatDate(latestEvent.date || eventSourceDate(latestEvent))} · ${escapeHtml(String(latestEvent.type || "Signal"))} · ${escapeHtml(eventStatus(latestEvent))}` : "No dated public event"; return `<a class="search-result" href="${companyUrl(company)}" aria-label="Open ${escapeHtml(company.name)} company page"><span class="search-result-mark">${logo(company, "small-mark")}</span><span><strong>${escapeHtml(company.name)}</strong><small>${rankMeta} · ${escapeHtml(company.category || "Category not observed")}</small><small>${escapeHtml(company.summary || "Company description not publicly observed.")}</small><small class="search-result-signal">Latest signal · ${latestMeta}</small></span>${chevronIcon()}</a>`; }).join("") : `<div class="search-empty"><strong>No reviewed company matches.</strong><span>Try a company, product, category, or founder.</span><a class="text-link" href="?view=search">Clear search ${arrowIcon()}</a></div>`}</div>${remaining > 0 ? `<button class="load-more" type="button" data-action="load-more-search"><span>Load ${Math.min(10, remaining)} more</span><span>${displayed.length} of ${matches.length}</span></button>` : ""}</section></main>`;
}
