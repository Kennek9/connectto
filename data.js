import { AS_OF as CANONICAL_AS_OF, CANONICAL_COMPANIES, COHORT_METADATA } from "./canonical-data.js";

export const AS_OF = CANONICAL_AS_OF;
export { COHORT_METADATA };

const cohortById = new Map(COHORT_METADATA.map((cohort) => [cohort.id, cohort]));

const PUBLIC_STAGE_ORDER = COHORT_METADATA.map((cohort) => ({
  id: cohort.id,
  label: cohort.label,
  note: "Editorial beta",
  open: true,
  cutoffDate: cohort.cutoffDate,
  methodVersion: cohort.methodVersion,
  publicationSize: cohort.selectedCount || 50,
  targetCount: cohort.selectedCount || 50,
  selectedCount: cohort.selectedCount || 50,
  eligibleCount: cohort.pool?.eligibleCount ?? null,
  reportedEligibleCount: cohort.pool?.reportedEligibleCount ?? null,
  poolStatus: cohort.poolStatus || cohort.pool?.status || "withheld",
  candidatePoolStatus: cohort.candidatePoolStatus,
  poolNote: cohort.pool?.note || null,
  pool: cohort.pool,
  alternateCount: cohort.pool?.alternateCount ?? null,
  reviewedCandidateCount: cohort.pool?.reviewedCandidateCount ?? null,
  adjudicatedCandidateCount: cohort.pool?.adjudicatedCandidateCount ?? null,
  discoveredRecordCount: cohort.pool?.discoveredRecordCount ?? null,
  discoveryOnlyCount: cohort.pool?.discoveryOnlyCount ?? null,
  internalReviewCount: cohort.pool?.internalReviewCount ?? null,
  reviewedExclusionCount: cohort.pool?.reviewedExclusionCount ?? null,
  denominator: cohort.pool?.denominator ?? null,
  coverage: cohort.coverage ?? null,
}));

export const STAGE_ORDER = [...PUBLIC_STAGE_ORDER, {
  id: "series-d-plus",
  label: "Series D+",
  note: "Coming soon",
  open: false,
  publicationSize: 0,
  targetCount: 0,
  selectedCount: 0,
  eligibleCount: null,
  poolStatus: "withheld",
  candidatePoolStatus: "Candidate pool under review",
  poolNote: null,
}];

const labelForSignalType = (type) => {
  const raw = String(type || "Signal");
  const key = raw.replace(/[^a-z]/gi, "").toLowerCase();
  if (key === "funding") return "Funding";
  if (key === "opensource" || key === "open") return "Open source / developer";
  if (key === "customer" || key === "usage") return "Customers / usage";
  if (key === "talent" || key === "operations") return "Talent / operations";
  return raw.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim() || "Signal";
};

const observedSignalTypes = new Set(CANONICAL_COMPANIES.flatMap(({ sourceRecord }) => (sourceRecord.signals || []).map((item) => item.type)).filter(Boolean));
export const SIGNALS = Object.fromEntries([...new Set(["funding", ...observedSignalTypes])].map((type) => [type, {
  label: labelForSignalType(type),
  short: labelForSignalType(type),
  className: String(type).replace(/[^a-z0-9]+/gi, "-").toLowerCase(),
}]));

const clone = (value) => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
const datePrecision = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")) ? "day" : /^\d{4}-\d{2}$/.test(String(value || "")) ? "month" : null;
const websiteHost = (value) => { try { return new URL(value).hostname.toLowerCase().replace(/^www\./, ""); } catch { return ""; } };
const typeKey = (value) => String(value || "").replace(/[^a-z]/gi, "").toLowerCase();
const blockedSignalPaths = new Set(["/", "/blog", "/news", "/research", "/releases", "/docs", "/changelog"]);
export const FALLBACK_ONLY_LOGO_HOSTS = new Set(["nexos.ai", "gamma.app", "orbitalindustries.com", "hailo.ai", "harmonic.fun"]);
const sourcePath = (href) => { try { return new URL(href).pathname.replace(/\/$/, "") || "/"; } catch { return ""; } };
const validSignalSource = (signal) => !blockedSignalPaths.has(sourcePath(signal?.source?.url || signal?.source?.href || signal?.sourceUrl));
const normalizeIdentity = (value) => String(value || "")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/&/g, " and ")
  .replace(/\b(incorporated|inc|corp|corporation|company|co|ltd|limited|llc|plc)\b/g, " ")
  .replace(/[^a-z0-9]+/g, "")
  .trim();
const publicDate = (value) => datePrecision(value) ? value : null;

function sourceFrom(rawSource, fallback = {}) {
  const raw = rawSource && typeof rawSource === "object" ? { ...rawSource } : {};
  const href = raw.href || raw.url || raw.sourceUrl || fallback.href || fallback.url || null;
  const type = raw.type || raw.sourceType || fallback.type || "Public source";
  const relationship = raw.relationship || raw.provenance || fallback.relationship || "Source relationship not observed";
  const announcementDate = publicDate(raw.announcementDate) || publicDate(raw.publicationDate) || publicDate(raw.publishedAt) || publicDate(fallback.announcementDate) || publicDate(fallback.publishedAt);
  const evidenceState = raw.evidenceState || raw.status || fallback.evidenceState || "Not publicly observed";
  return {
    ...raw,
    href,
    url: raw.url || href,
    label: raw.label || type,
    type,
    provenance: relationship,
    relationship,
    announcementDate,
    asOf: raw.asOf || fallback.asOf || AS_OF,
    evidenceState,
    status: evidenceState,
  };
}

function founderNames(candidate) {
  const usable = (values) => values.filter(Boolean).filter((value) => !/^not publicly observed$/i.test(String(value).trim()));
  if (Array.isArray(candidate.founderNames)) return usable(candidate.founderNames);
  if (Array.isArray(candidate.founders?.names)) return usable(candidate.founders.names);
  if (Array.isArray(candidate.founders)) return usable(candidate.founders);
  if (typeof candidate.founders === "string" && candidate.founders.trim() && !/^not publicly observed$/i.test(candidate.founders.trim())) return [candidate.founders.trim()];
  return [];
}

function founderSource(candidate, cutoff) {
  const rawSource = candidate.founderEvidence?.source || candidate.founders?.source;
  if (rawSource && typeof rawSource === "object") return sourceFrom(rawSource, { asOf: cutoff });
  if (typeof rawSource === "string") return sourceFrom({ url: rawSource }, { type: "Founder source", asOf: cutoff });
  return null;
}

function normalizeStageEvidence(candidate, latestRound, cutoff) {
  const entries = Array.isArray(candidate.stageEvidence) ? candidate.stageEvidence : candidate.stageEvidence ? [candidate.stageEvidence] : [];
  return entries.map((entry) => {
    const raw = entry && typeof entry === "object" ? clone(entry) : {};
    const inheritedDate = raw.eventDate || latestRound.eventDate || null;
    const source = sourceFrom(raw.source || raw, {
      url: raw.url || latestRound.sourceUrl,
      type: raw.sourceType || latestRound.sourceType || "Financing source",
      relationship: raw.relationship || latestRound.relationship || "Company or company-provided financing evidence",
      publishedAt: raw.publishedAt || latestRound.publishedAt || null,
      evidenceState: raw.evidenceState || latestRound.sourceStatus || "Not publicly observed",
      asOf: cutoff,
    });
    return {
      ...raw,
      round: raw.round || latestRound.round || latestRound.stage || null,
      eventDate: inheritedDate,
      publishedAt: raw.publishedAt || latestRound.publishedAt || source.announcementDate,
      amount: raw.amount || latestRound.amount || null,
      datePrecision: raw.datePrecision || latestRound.datePrecision || datePrecision(inheritedDate),
      source,
      sourceUrl: raw.sourceUrl || source.href,
      sourceStatus: raw.sourceStatus || raw.evidenceState || source.evidenceState,
    };
  });
}

function normalizeStatus(candidate, cutoff) {
  const raw = candidate.currentIndependentStatus;
  if (!raw || typeof raw !== "object") return raw || null;
  const checkedSources = raw.checkedSources || raw.sourceUrls || raw.sources || (raw.source ? [raw.source] : []);
  return {
    ...clone(raw),
    checkedSources: checkedSources.map((item) => typeof item === "string" ? item : sourceFrom(item, { asOf: cutoff }).href).filter(Boolean),
    source: raw.source ? sourceFrom(raw.source, { asOf: cutoff }) : raw.source,
  };
}

function normalizeSourceStatus(candidate) {
  const raw = candidate.sourceStatus;
  if (raw && typeof raw === "object") return clone(raw);
  const claims = candidate.sourceStatusByClaim || {};
  const claimState = (...keys) => keys.map((key) => claims[key]?.evidenceState || claims[key]?.status).find(Boolean) || null;
  return {
    stage: claimState("latestRound") || candidate.latestRound?.sourceStatus || raw || "Not publicly observed",
    profile: claimState("product", "entity") || "Not publicly observed",
    currentStatus: claimState("currentIndependentStatus") || "Not publicly observed",
  };
}

function normalizeFounders(candidate) {
  const names = founderNames(candidate);
  const raw = candidate.founders && typeof candidate.founders === "object" ? clone(candidate.founders) : {};
  return {
    ...raw,
    names,
    source: raw.source || candidate.founderEvidence?.source || null,
    evidenceState: raw.evidenceState || candidate.founderEvidence?.source?.evidenceState || "Not publicly observed",
  };
}

function eventFact(eventItem, label) {
  return {
    label,
    title: eventItem.title || "Dated public event",
    detail: eventItem.detail || eventItem.whyItMatters || "Public detail not observed.",
    date: eventItem.date || null,
    evidenceState: eventItem.status || eventItem.evidenceState || "Not publicly observed",
    source: eventItem.source,
  };
}

function adaptCompany(entry) {
  const candidate = entry.sourceRecord;
  const cohort = cohortById.get(entry.cohort);
  const cutoff = cohort?.cutoffDate || AS_OF;
  const stage = cohort?.label || candidate.stage || "Stage not publicly observed";
  const websiteUrl = candidate.website || "";
  const domain = websiteHost(websiteUrl);
  const category = candidate.marketCategoryLabel || candidate.marketCategory?.primary || (typeof candidate.marketCategory === "string" ? candidate.marketCategory : "Not publicly observed");
  const rawLatestRound = candidate.latestRound || {};
  const fundingStatus = rawLatestRound.sourceStatus || rawLatestRound.evidenceState || candidate.sourceStatus?.latestRound?.evidenceState || "Not publicly observed";
  const fundingStage = rawLatestRound.stage || rawLatestRound.round || stage;
  const fundingSource = sourceFrom(rawLatestRound.source || {
    url: rawLatestRound.sourceUrl,
    type: rawLatestRound.sourceType || "Financing source",
    relationship: rawLatestRound.relationship || "Company or company-provided financing evidence",
    publishedAt: rawLatestRound.publishedAt || null,
    evidenceState: fundingStatus,
  }, {
    url: rawLatestRound.sourceUrl,
    type: rawLatestRound.sourceType || "Financing source",
    relationship: rawLatestRound.relationship || "Company or company-provided financing evidence",
    publishedAt: rawLatestRound.publishedAt || null,
    evidenceState: fundingStatus,
    asOf: cutoff,
  });
  const fundingDate = rawLatestRound.eventDate || null;
  const funding = {
    ...clone(rawLatestRound),
    amount: rawLatestRound.amount || "Not publicly observed",
    stage: fundingStage,
    date: fundingDate,
    datePrecision: rawLatestRound.datePrecision || datePrecision(fundingDate),
    evidenceState: fundingStatus,
    source: fundingSource,
  };
  const rawSignals = Array.isArray(candidate.signals) ? candidate.signals : [];
  const excludedSignals = rawSignals.filter((item) => item?.type !== "funding" && !validSignalSource(item));
  const signals = rawSignals.filter((item) => item?.type !== "funding" && validSignalSource(item)).map((rawSignal, index) => {
    const status = rawSignal.evidenceState || rawSignal.status || rawSignal.source?.evidenceState || "Not publicly observed";
    const source = sourceFrom(rawSignal.source || {
      url: rawSignal.sourceUrl,
      type: rawSignal.sourceType,
      relationship: rawSignal.relationship,
      publishedAt: rawSignal.publishedAt || null,
      evidenceState: status,
    }, {
      url: rawSignal.sourceUrl,
      type: rawSignal.sourceType || "Public event source",
      relationship: rawSignal.relationship || "Source relationship not observed",
      publishedAt: rawSignal.publishedAt || null,
      evidenceState: status,
      asOf: cutoff,
    });
    return {
      ...clone(rawSignal),
      id: rawSignal.id || `${candidate.id}-signal-${index + 1}`,
      type: rawSignal.type,
      date: rawSignal.eventDate || rawSignal.date || null,
      datePrecision: rawSignal.datePrecision || datePrecision(rawSignal.eventDate || rawSignal.date),
      title: rawSignal.title || `${rawSignal.type || "Public"} event`,
      detail: rawSignal.detail || rawSignal.whyItMatters || "Public detail not observed.",
      whyItMatters: rawSignal.whyItMatters || null,
      evidenceState: status,
      status,
      publicationDate: rawSignal.publishedAt || null,
      source,
    };
  });
  const fundingEvent = {
    id: `${candidate.id}-funding`,
    type: "funding",
    date: fundingDate,
    eventDate: fundingDate,
    title: rawLatestRound.title || `${candidate.name} ${fundingStage} financing`,
    detail: rawLatestRound.note || `${fundingStage} financing evidence recorded in the reviewed cohort.`,
    evidenceState: fundingStatus,
    status: fundingStatus,
    source: fundingSource,
  };
  const events = [fundingEvent, ...signals];
  const websiteSource = sourceFrom({ url: websiteUrl, type: "Official company website", relationship: "Company current profile", evidenceState: "Direct" }, { asOf: cutoff });
  const candidateSources = (candidate.sources || []).map((source) => sourceFrom(source, { asOf: cutoff }));
  const sourceList = [];
  for (const source of [websiteSource, ...candidateSources, fundingSource, ...signals.map((item) => item.source)]) {
    const key = source?.href || source?.url || JSON.stringify(source);
    if (source && !sourceList.some((item) => (item.href || item.url || JSON.stringify(item)) === key)) sourceList.push(source);
  }
  const names = founderNames(candidate);
  const founderEvidenceSource = founderSource(candidate, cutoff);
  const trafficSignals = signals.filter((item) => /customer|usage|deployment|partnership|clinical|corporate|traction/i.test(typeKey(item.type)));
  const technologySignals = signals.filter((item) => !trafficSignals.includes(item));
  const teamSignals = signals.filter((item) => /talent|operations|team/i.test(typeKey(item.type)));
  const fallbackOnlyLogo = FALLBACK_ONLY_LOGO_HOSTS.has(domain);
  const logoUrl = domain && !fallbackOnlyLogo ? `https://${domain}/favicon.ico` : null;
  const logoSource = logoUrl
    ? sourceFrom({ url: logoUrl, type: "Official website favicon", relationship: "Company website brand asset", evidenceState: "Direct" }, { asOf: cutoff })
    : null;
  const rankRationale = typeof candidate.whySelected === "string" && candidate.whySelected.trim()
    ? candidate.whySelected
    : `Editorial rank ${entry.editorialRank} recorded for the ${stage} cohort.`;
  const research = {
    business: { facts: [{ label: "Business profile", title: candidate.name, detail: candidate.summary || "Company description not publicly observed.", date: null, evidenceState: "Profile", source: websiteSource }], conclusion: candidate.summary || "Public business detail not observed." },
    capital: { facts: [eventFact(fundingEvent, "Latest financing")], totalDisclosed: funding.amount, disclosedRoundCount: "1 public round", leadInvestor: "Not publicly observed", notableBackers: [], financingCadence: "Not publicly observed", conclusion: "Funding is shown as capital context; it does not mechanically set editorial rank." },
    traction: { facts: trafficSignals.map((item) => eventFact(item, "Public signal")), conclusion: trafficSignals.length ? "Dated public operating evidence is shown with its raw signal type and source." : "Public traction evidence not observed." },
    technology: { facts: technologySignals.map((item) => eventFact(item, "Public signal")), conclusion: technologySignals.length ? "Dated public product and technical evidence is shown with its raw signal type and source." : "Public technology evidence not observed." },
    team: { facts: [...(names.length ? [{ label: "Founding team", title: names.join(" · "), detail: "Founder names are preserved from the cohort record; additional team detail is not publicly observed.", date: null, evidenceState: founderEvidenceSource?.evidenceState || "Direct", source: founderEvidenceSource || websiteSource }] : []), ...teamSignals.map((item) => eventFact(item, "Public signal"))], conclusion: names.length ? "Founder evidence is preserved from the cohort record." : "Public team evidence not observed." },
    network: { facts: [], connections: { founders: [], investors: [], customers: [], partners: [] }, conclusion: "Public network evidence not observed." },
  };
  return {
    id: candidate.id,
    identityKey: candidate.normalizedIdentityKey || normalizeIdentity(candidate.name),
    name: candidate.name,
    aliases: clone(candidate.aliases || []),
    domain,
    website: { label: domain || websiteUrl, href: websiteUrl },
    logo: { url: logoUrl, fallbackOnly: fallbackOnlyLogo, source: logoSource },
    summary: candidate.summary || "Company description not publicly observed.",
    audience: "Not publicly observed",
    category,
    marketCategory: clone(candidate.marketCategory ?? null),
    marketCategoryLabel: candidate.marketCategoryLabel || category,
    productForm: candidate.productForm || "Not publicly observed",
    products: [],
    region: candidate.region || "Not publicly observed",
    hq: candidate.hq || "Not publicly observed",
    stage,
    stageId: entry.cohort,
    stageEvidence: normalizeStageEvidence(candidate, rawLatestRound, cutoff),
    stageConfidence: "clear",
    status: candidate.status ?? candidate.currentIndependentStatus?.status ?? null,
    currentIndependentStatus: normalizeStatus(candidate, cutoff),
    sourceStatus: normalizeSourceStatus(candidate),
    sourceStatusRaw: clone(candidate.sourceStatus ?? null),
    founders: normalizeFounders(candidate),
    founderNames: names,
    latestRound: clone(candidate.latestRound ?? null),
    funding,
    signals,
    excludedSignals: clone(excludedSignals),
    events,
    research: { lastChecked: candidate.lastReviewed || cutoff, stageBasis: fundingSource, logoSource: websiteSource, nonFundingSources: signals.map((item) => item.source) },
    profile: {
      whatItDoes: candidate.summary || "Company description not publicly observed.",
      whoItServes: "Not publicly observed",
      products: [],
      productForm: candidate.productForm || "Not publicly observed",
      category,
      region: candidate.region || "Not publicly observed",
      hq: candidate.hq || "Not publicly observed",
      foundedHq: candidate.hq || "Not publicly observed",
      founders: names.length ? names.join(" · ") : "Not publicly observed",
      businessModel: "Not publicly observed",
      developerLinks: "Not publicly observed",
      aliases: clone(candidate.aliases || []),
      funding: { latestRoundDate: fundingDate, latestRoundAmount: funding.amount, latestRoundUsd: null, latestRoundStage: funding.stage, totalDisclosed: funding.amount, previousRoundInterval: "Not publicly observed" },
      sources: sourceList,
    },
    companyDetails: {
      asOf: cutoff,
      research,
      fundingContext: "Funding is context only; editorial rank is taken from the reviewed cohort rank.",
      why: [{ label: "Why this rank", title: "Editorial selection rationale", detail: rankRationale, date: null, evidenceState: "Editorial", source: fundingSource }],
      productSummary: candidate.summary || "Company description not publicly observed.",
      product: candidate.productForm || "Not publicly observed",
      customerUsage: "Not publicly observed",
      developer: "Not publicly observed",
      talent: "Not publicly observed",
      links: { website: websiteSource },
    },
    whySelected: clone(candidate.whySelected ?? null),
    selectionRationale: clone(candidate.selectionRationale ?? null),
    evidenceGaps: clone(candidate.evidenceGaps || []),
    selectionStatus: candidate.selectionStatus || (candidate.selected ? "selected" : null),
    selected: candidate.selected === true,
    editorialRank: entry.editorialRank,
    proposedRank: candidate.proposedRank,
    cohort: entry.cohort,
    cohortMetadata: clone(cohort),
    cohortCutoff: cutoff,
    sourceRecord: candidate,
    rankRationale,
  };
}

const stageIndex = new Map(STAGE_ORDER.map((stage, index) => [stage.id, index]));
export const COMPANIES = CANONICAL_COMPANIES.map(adaptCompany).sort((a, b) => stageIndex.get(a.stageId) - stageIndex.get(b.stageId) || a.editorialRank - b.editorialRank);
export const COMPANY_BY_ID = Object.fromEntries(COMPANIES.map((item) => [item.id, item]));

export function disclosedMillions(value) {
  const text = String(value || "");
  if (!text || /undisclosed|combined|total capital/i.test(text)) return null;
  const match = text.replace(/,/g, "").match(/(?:USD\s*|[$€£])\s*(\d+(?:\.\d+)?)\s*(B|M|K)?/i);
  if (!match) return null;
  const amount = Number(match[1]) * ({ b: 1000, m: 1, k: 0.001 }[String(match[2] || "").toLowerCase()] || 1);
  return Number.isFinite(amount) ? amount : null;
}
