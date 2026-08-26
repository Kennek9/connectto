import assert from "node:assert/strict";
import { AS_OF, COMPANIES, COMPANY_BY_ID, COHORT_METADATA, ENRICHED_SEED_IDS, FALLBACK_ONLY_LOGO_HOSTS, STAGE_ORDER } from "../data.js";
import { eventAgeDays, logo, rankedCompanies } from "../shared.js";

const errors = [];
const expectedCutoff = "2026-08-22";
const expectedStages = ["seed", "series-a", "series-b", "series-c"];
const blockedSignalPaths = new Set(["/", "/blog", "/news", "/research", "/releases", "/docs", "/changelog"]);
const dateKind = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")) ? "day" : /^\d{4}-\d{2}$/.test(String(value || "")) ? "month" : "";
const dateValue = (value) => {
  const kind = dateKind(value);
  if (!kind) return NaN;
  return Date.parse(`${value}${kind === "month" ? "-01" : ""}T00:00:00Z`);
};
const dateInRange = (value) => dateKind(value) && dateValue(value) <= dateValue(expectedCutoff);
const isSentinel = (value) => value === null || value === undefined || /^(?:not publicly observed|unknown|n\/a)$/i.test(String(value).trim());
const validUrl = (value) => {
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
};
const sourceHref = (source) => source?.href || source?.url || "";
const sourceHost = (href) => {
  try { return new URL(href).hostname.toLowerCase().replace(/^www\./, ""); } catch { return ""; }
};
const sourcePath = (href) => { try { return new URL(href).pathname.replace(/\/$/, "") || "/"; } catch { return ""; } };
const normalize = (value) => String(value || "")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/&/g, " and ")
  .replace(/\b(incorporated|inc|corp|corporation|company|co|ltd|limited|llc|plc)\b/g, " ")
  .replace(/[^a-z0-9]+/g, "")
  .trim();
const stableJson = (value) => JSON.stringify(value === undefined ? null : value);
const add = (message) => errors.push(message);
const metadataById = new Map(COHORT_METADATA.map((cohort) => [cohort.id, cohort]));
const stageById = new Map(STAGE_ORDER.map((stage) => [stage.id, stage]));

if (AS_OF !== expectedCutoff) add(`AS_OF ${AS_OF}, expected ${expectedCutoff}`);
if (!Number.isFinite(eventAgeDays({ date: "2024-08" })) || eventAgeDays({ date: "2024-08" }) < 0) add("partial YYYY-MM dates are not age-comparable without changing their stored precision");
if (COMPANIES.length !== 200) add(`global count ${COMPANIES.length}, expected 200`);
const publicStageOrder = STAGE_ORDER.filter((stage) => stage.open !== false);
if (new Set(expectedStages).size !== publicStageOrder.length || publicStageOrder.some((stage) => !expectedStages.includes(stage.id))) add("public stage order does not contain exactly the four current cohorts");
if (!STAGE_ORDER.some((stage) => stage.id === "series-d-plus" && stage.open === false)) add("closed Series D+ stage is missing");

const ids = new Set();
const names = new Map();
const hosts = new Map();
const identityKeys = new Map();
const stageCounts = Object.fromEntries(expectedStages.map((stageId) => [stageId, 0]));
const signalCounts = Object.fromEntries(expectedStages.map((stageId) => [stageId, 0]));

for (const stageId of expectedStages) {
  const stage = stageById.get(stageId);
  const metadata = metadataById.get(stageId);
  if (!metadata) { add(`missing cohort metadata: ${stageId}`); continue; }
  if (metadata.cohort !== stageId || metadata.stageId !== stageId || metadata.stageLabel !== stage?.label) add(`${stageId}: cohort metadata identity is incomplete`);
  if (metadata.cutoffDate !== expectedCutoff) add(`${stageId}: cutoff ${metadata.cutoffDate}, expected ${expectedCutoff}`);
  if (metadata.pool?.eligibleCount !== null && (!Number.isInteger(metadata.pool?.eligibleCount) || metadata.pool.eligibleCount <= 0)) add(`${stageId}: invalid public eligibleCount`);
  if ((stage?.eligibleCount ?? null) !== (metadata.pool?.eligibleCount ?? null)) add(`${stageId}: stage denominator does not match the public cohort value`);
  if (stage?.publicationSize !== 50 || stage?.selectedCount !== 50) add(`${stageId}: publication size/selected count is not 50`);
  if (stage?.poolStatus !== (metadata.pool?.status || "withheld")) add(`${stageId}: pool status mismatch`);
  if ((metadata.pool?.eligibleCount === null && stage?.poolStatus !== "withheld") || (metadata.pool?.eligibleCount !== null && stage?.poolStatus !== "reviewed-bounded")) add(`${stageId}: denominator trust state is inconsistent`);
  if (["candidatePoolCount", "eligibleCompanyCount", "candidateCount"].some((key) => Object.hasOwn(stage || {}, key))) add(`${stageId}: stage exposes a non-public candidate denominator field`);
  const rows = COMPANIES.filter((company) => company.stageId === stageId);
  stageCounts[stageId] = rows.length;
  if (rows.length !== 50) add(`${stageId} count ${rows.length}, expected 50`);
  const ranks = rows.map((company) => company.editorialRank);
  if (ranks.length !== 50 || new Set(ranks).size !== 50 || [...ranks].sort((a, b) => a - b).some((rank, index) => rank !== index + 1)) add(`${stageId}: editorialRank is not exactly 1..50`);
  const sorted = rankedCompanies(stageId);
  if (sorted.some((company, index) => company.editorialRank !== index + 1)) add(`${stageId}: rankedCompanies is not editorialRank order`);
}

for (const company of COMPANIES) {
  const raw = company.sourceRecord;
  const stageId = company.stageId;
  const stage = stageById.get(stageId);
  const metadata = metadataById.get(stageId);
  if (!raw || typeof raw !== "object") { add(`missing raw sourceRecord: ${company.id}`); continue; }
  if (ids.has(company.id)) add(`duplicate id: ${company.id}`);
  ids.add(company.id);
  if (COMPANY_BY_ID[company.id] !== company) add(`companyById does not point at canonical record: ${company.id}`);
  const identityValues = [company.name, ...(company.aliases || [])].map(normalize).filter(Boolean);
  for (const identity of identityValues) {
    const previous = names.get(identity);
    if (previous && previous !== `${stageId}/${company.id}`) add(`cross-stage name/alias collision: ${identity} (${previous}, ${stageId}/${company.id})`);
    names.set(identity, `${stageId}/${company.id}`);
  }
  const host = sourceHost(company.website?.href);
  if (host) {
    const previous = hosts.get(host);
    if (previous && previous !== `${stageId}/${company.id}`) add(`cross-stage website collision: ${host} (${previous}, ${stageId}/${company.id})`);
    hosts.set(host, `${stageId}/${company.id}`);
  }
  const key = normalize(company.identityKey);
  if (key) {
    const previous = identityKeys.get(key);
    if (previous && previous !== `${stageId}/${company.id}`) add(`cross-stage identityKey collision: ${key} (${previous}, ${stageId}/${company.id})`);
    identityKeys.set(key, `${stageId}/${company.id}`);
  }

  if (raw.selected !== true) add(`sourceRecord is not selected: ${company.id}`);
  if (company.selected !== true || company.selectionStatus !== "selected") add(`canonical selection state is not selected: ${company.id}`);
  if (company.editorialRank !== raw.proposedRank) add(`editorialRank/proposedRank mismatch: ${company.id}`);
  if (company.cohortCutoff !== expectedCutoff || metadata?.cutoffDate !== expectedCutoff) add(`company cutoff mismatch: ${company.id}`);
  if (!company.name || !company.summary || !company.category || !company.productForm || !company.region || !company.hq) add(`missing canonical profile field: ${company.id}`);
  if (ENRICHED_SEED_IDS.has(company.id)) {
    if (isSentinel(company.audience) || isSentinel(company.profile?.whoItServes)) add(`enriched audience missing: ${company.id}`);
  } else if (company.audience !== "Not publicly observed" || company.profile?.whoItServes !== "Not publicly observed") add(`audience was inferred: ${company.id}`);
  if (!validUrl(company.website?.href) || !company.domain) add(`invalid website/domain: ${company.id}`);
  if (company.logo?.fallbackOnly === true) {
    if (!FALLBACK_ONLY_LOGO_HOSTS.has(company.domain) || company.logo.url !== null || company.logo.source !== null) add(`fallback-only logo contract mismatch: ${company.id}`);
    if (logo(company).includes("<img")) add(`fallback-only logo still emits an image request: ${company.id}`);
  } else if (!company.logo?.url || !validUrl(company.logo.url) || !validUrl(sourceHref(company.logo.source))) {
    add(`missing logo URL/source: ${company.id}`);
  }
  if (!company.rankRationale?.trim()) add(`missing editorial rank rationale: ${company.id}`);

  for (const field of ["aliases", "productForm", "marketCategory", "region", "hq", "evidenceGaps", "selectionRationale"]) {
    if (stableJson(company[field]) !== stableJson(raw[field])) add(`raw field was not preserved: ${company.id}/${field}`);
  }
  for (const field of ["status", "evidence", "evidenceState", "independenceEvidenceState", "lastReviewed", "notes", "asOf", "reviewedThrough"]) {
    if (Object.hasOwn(raw.currentIndependentStatus || {}, field) && stableJson(company.currentIndependentStatus?.[field]) !== stableJson(raw.currentIndependentStatus[field])) add(`current status field was not preserved: ${company.id}/${field}`);
  }
  for (const field of ["stage", "profile", "currentStatus"]) {
    if (raw.sourceStatus && typeof raw.sourceStatus === "object" && stableJson(company.sourceStatus?.[field]) !== stableJson(raw.sourceStatus[field])) add(`source status field was not preserved: ${company.id}/${field}`);
  }
  const rawFounderNames = (Array.isArray(raw.founderNames) ? raw.founderNames : Array.isArray(raw.founders?.names) ? raw.founders.names : []).filter(Boolean).filter((value) => !/^not publicly observed$/i.test(String(value).trim()));
  if (rawFounderNames.some((name) => !company.founders?.names?.includes(name))) add(`founder names were not preserved: ${company.id}`);
  if (raw.founders?.source && !company.founders?.source) add(`founder source was not preserved: ${company.id}`);
  if (!Array.isArray(company.stageEvidence)) add(`stageEvidence is not canonical array: ${company.id}`);
  if (Object.hasOwn(raw, "status") && stableJson(company.status) !== stableJson(raw.status)) add(`raw field was not preserved: ${company.id}/status`);
  if (stableJson(company.sourceRecord) !== stableJson(raw)) add(`sourceRecord changed during adaptation: ${company.id}`);

  if (company.funding?.date !== raw.latestRound?.eventDate || company.funding?.amount !== raw.latestRound?.amount || company.funding?.stage !== (raw.latestRound?.stage || raw.latestRound?.round || company.stage)) add(`funding/latestRound mapping mismatch: ${company.id}`);
  if (!company.funding?.amount || !company.funding?.stage || !dateKind(company.funding.date) || !dateInRange(company.funding.date)) add(`missing or invalid funding amount/date/stage: ${company.id}`);
  if (!validUrl(sourceHref(company.funding?.source))) add(`invalid funding source URL: ${company.id}`);
  if (company.stageId !== stage?.id || company.stage !== stage?.label) add(`stage mapping mismatch: ${company.id}`);
  if (!Number.isInteger(company.editorialRank) || company.editorialRank < 1 || company.editorialRank > 50) add(`invalid editorialRank: ${company.id}`);

  const fundingEvents = (company.events || []).filter((eventItem) => eventItem.type === "funding");
  if (fundingEvents.length !== 1) add(`funding event count ${fundingEvents.length}, expected 1: ${company.id}`);
  const fundingEvent = fundingEvents[0];
  if (fundingEvent && (fundingEvent.date !== company.funding.date || sourceHref(fundingEvent.source) !== sourceHref(company.funding.source))) add(`funding event does not match funding field: ${company.id}`);
  const sourceSignals = (raw.signals || []).filter((signal) => signal?.type !== "funding" && !blockedSignalPaths.has(sourcePath(signal?.source?.url || signal?.source?.href || signal?.sourceUrl)));
  const canonicalSignals = company.signals || [];
  if (canonicalSignals.length !== sourceSignals.length) add(`non-funding Signal count mismatch: ${company.id}`);
  if (canonicalSignals.some((signal, index) => signal.type !== sourceSignals[index]?.type || signal.date !== (sourceSignals[index]?.eventDate || sourceSignals[index]?.date))) add(`raw Signal type/date was not preserved: ${company.id}`);
  if (canonicalSignals.some((signal) => signal.type === "funding")) add(`funding leaked into non-funding Signals: ${company.id}`);
  const fundingHref = sourceHref(company.funding?.source);
  const signalHrefs = new Set();
  const signalFingerprints = new Set();
  for (const signal of canonicalSignals) {
    if (!dateKind(signal.date) || !dateInRange(signal.date)) add(`invalid/out-of-cutoff Signal date: ${company.id}/${signal.id}`);
    const href = sourceHref(signal.source);
    if (!validUrl(href)) add(`invalid Signal source URL: ${company.id}/${signal.id}`);
    if (blockedSignalPaths.has(sourcePath(href))) add(`generic Signal URL is not publishable: ${company.id}/${signal.id}`);
    if (href === fundingHref) add(`non-funding Signal reuses funding URL: ${company.id}/${signal.id}`);
    if (signalHrefs.has(href)) add(`duplicate non-funding Signal source: ${company.id}`);
    signalHrefs.add(href);
    const fingerprint = [signal.type, signal.date, signal.title].map((value) => String(value || "").trim().toLowerCase()).join("|");
    if (signalFingerprints.has(fingerprint)) add(`duplicate non-funding Signal fingerprint: ${company.id}`);
    signalFingerprints.add(fingerprint);
    if (!signal.title || !signal.status || !signal.evidenceState) add(`Signal missing title/evidence state: ${company.id}/${signal.id}`);
  }
  if ((company.events || []).length !== canonicalSignals.length + 1) add(`events do not equal one funding event plus non-funding Signals: ${company.id}`);
  if ((company.research?.nonFundingSources || []).length !== canonicalSignals.length) add(`research Signal source count mismatch: ${company.id}`);
  signalCounts[stageId] += canonicalSignals.length;

  for (const source of [...(raw.sources || [])]) {
    if (!validUrl(source?.url)) add(`invalid raw source URL: ${company.id}`);
  }
  const expectedBusinessFacts = ENRICHED_SEED_IDS.has(company.id) ? 3 : 1;
  if (company.research?.lastChecked !== expectedCutoff || company.companyDetails?.asOf !== expectedCutoff || company.companyDetails?.research?.business?.facts?.length !== expectedBusinessFacts) add(`snapshot/detail mapping mismatch: ${company.id}`);
  if (!validUrl(sourceHref(company.research?.stageBasis))) add(`missing stage provenance: ${company.id}`);
  if (!validUrl(sourceHref(company.companyDetails?.links?.website))) add(`missing company website link: ${company.id}`);
  if (company.companyDetails?.research?.capital?.facts?.length !== 1) add(`funding lens missing one fact: ${company.id}`);
  if (company.companyDetails?.research?.capital?.facts?.[0]?.date !== company.funding.date) add(`funding lens date mismatch: ${company.id}`);
  if (company.companyDetails?.research?.capital?.facts?.[0]?.source?.href !== company.funding.source?.href) add(`funding lens source mismatch: ${company.id}`);
  for (const eventItem of company.events || []) {
    if (!dateKind(eventItem.date) || !dateInRange(eventItem.date)) add(`invalid event date: ${company.id}/${eventItem.id}`);
    if (!validUrl(sourceHref(eventItem.source))) add(`invalid event source URL: ${company.id}/${eventItem.id}`);
  }
  if (rawFounderNames.length && isSentinel(company.profile?.founders)) add(`founder display was lost: ${company.id}`);
}

for (const cohort of COHORT_METADATA) {
  if (!expectedStages.includes(cohort.id)) add(`unexpected cohort metadata: ${cohort.id}`);
}

const observedFallbackOnlyLogoHosts = new Set(COMPANIES.filter((company) => company.logo?.fallbackOnly === true).map((company) => company.domain));
if (observedFallbackOnlyLogoHosts.size !== FALLBACK_ONLY_LOGO_HOSTS.size || [...FALLBACK_ONLY_LOGO_HOSTS].some((host) => !observedFallbackOnlyLogoHosts.has(host))) add("fallback-only logo host set does not match the five audited failures");
for (const host of FALLBACK_ONLY_LOGO_HOSTS) {
  const matches = COMPANIES.filter((company) => company.domain === host);
  if (matches.length !== 1 || matches[0].logo?.fallbackOnly !== true || matches[0].logo.url !== null || matches[0].logo.source !== null) add(`audited fallback-only logo missing null contract: ${host}`);
}
const faviconCompany = COMPANIES.find((company) => company.logo?.fallbackOnly !== true && company.logo?.url);
if (!faviconCompany || !logo(faviconCompany).includes("<img")) add("non-audited logo hosts must retain favicon image markup");

const totalSignals = Object.values(signalCounts).reduce((sum, value) => sum + value, 0);
console.log(`Data audit: ${expectedStages.map((stageId) => `${stageCounts[stageId]} ${stageById.get(stageId)?.label}`).join(" + ")} = ${COMPANIES.length} selected; ${totalSignals} non-funding Signals.`);
console.log(`Editorial order: ${expectedStages.map((stageId) => `${stageId} 1..50`).join(", ")}; denominator: ${expectedStages.map((stageId) => `${stageId}=${stageById.get(stageId)?.eligibleCount ?? "withheld"}`).join(", ")}.`);
if (errors.length) {
  console.error(`Data audit failed (${errors.length}):\n- ${errors.join("\n- ")}`);
  process.exitCode = 1;
} else {
  console.log("Data audit passed: four 50-company cohorts, editorial-rank ordering, one funding event per company, optional non-funding Signals, raw field preservation, date precision, public denominators, source validity, and cross-stage uniqueness.");
}

assert.equal(COMPANIES.length, 200);
