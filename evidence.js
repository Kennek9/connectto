import { SOURCE_ACCESS, SOURCE_ACCESS_DATE } from "./source-access.js";

export function sourceAccess(href) {
  const check = SOURCE_ACCESS[safeSourceUrl(href)];
  return check ? { ...check, checkedAt: SOURCE_ACCESS_DATE } : null;
}

// One source may support several claims. Keep those claims and their dates distinct.
export function safeSourceUrl(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export function companySources(company) {
  const sources = new Map();
  function add(raw, claim, kind, date = null, reviewedAt = null) {
    const source = typeof raw === "string" ? { href: raw } : raw;
    const href = safeSourceUrl(source?.href || source?.url);
    if (!href) return;
    const entry = sources.get(href) || { href, label: source.label || source.type || new URL(href).hostname, claims: [] };
    const detail = {
      claim, kind, date,
      publicationDate: [source.publicationDate, source.announcementDate, source.publishedAt].find(value => /^\d{4}-\d{2}(-\d{2})?$/.test(value || "")) || null,
      reviewedAt: reviewedAt || source.lastChecked || source.asOf || company.cohortCutoff,
      relationship: source.relationship || source.provenance || "Relationship not recorded",
      evidenceState: source.evidenceState || "Not recorded",
    };
    if (!entry.claims.some((item) => item.claim === claim && item.kind === kind)) entry.claims.push(detail);
    sources.set(href, entry);
  }
  for (const event of company.events || []) add(event.source, event.detail || event.title, event.type, event.date, event.lastReviewed);
  for (const [lens, research] of Object.entries(company.companyDetails?.research || {})) {
    for (const fact of research?.facts || []) {
      const isEventCopy = fact.eventId && (company.events || []).some(event => event.id === fact.eventId);
      if (!isEventCopy) add(fact.source, fact.detail || fact.title, lens, fact.date, fact.lastReviewed);
    }
  }
  for (const source of company.profile?.sources || []) {
    if (sources.has(safeSourceUrl(source.href || source.url)) && !source.note) continue;
    add(source, source.note || "Company reference", "reference");
  }
  for (const evidence of company.stageEvidence || []) add(evidence.source, `${evidence.round || evidence.stage} classification`, "stage", evidence.eventDate);
  if (company.historicalProfileFact) add(company.historicalProfileFact.source, company.historicalProfileFact.detail, "historical profile");
  add(company.currentIndependentStatus?.source, "Historical operating-status review", "status");
  add(company.founders?.source, (company.founders?.names || []).join(", "), "team");
  if (company.refresh?.change) add(company.refresh.change.source, company.refresh.change.note, "correction", null, company.refresh.checkedAt);
  if (company.refresh?.profileChange) add(company.refresh.profileChange.source, company.refresh.profileChange.note, "profile correction", null, company.refresh.checkedAt);
  if (company.rankingCorrection) add(company.rankingCorrection.source, company.rankingCorrection.note, "correction", null, company.rankingReview.date);
  return [...sources.values()];
}
