// Edition-level figures derived from reviewed records. Every number is computed here; none is typed in.
import { COMPANIES, rankedCompanies, stageCompanies } from "../shared.js";
import { disclosedMillions } from "../data.js";
import { PUBLIC_STAGE_IDS, stageById } from "../state.js";

export const CATEGORY_LABELS = {
  "Foundation Models & Research": "Models & research",
  "Data, Infrastructure & Developer Tools": "Data & developer tools",
  "Compute, Chips & Data Centers": "Compute & semiconductors",
  "Robotics, Autonomy & Defense": "Robotics & autonomy",
  "Horizontal Applications": "Enterprise applications",
  "Vertical Applications": "Industry applications",
  "AI Science, Biotech & Healthcare": "Science & healthcare",
};
export const categoryLabel = (company) => CATEGORY_LABELS[company.category] || company.category;

export const roundMillions = (company) => disclosedMillions(company.funding?.amount);

// Some financing records carry a sentence ("$520M extension; $935M total Series A"); those drop to body size.
export const amountSizeClass = (amount) => String(amount || "").length > 14 ? " is-long-amount" : "";

export function formatMillions(value) {
  if (value == null) return "Undisclosed";
  if (value >= 1000) return `$${(value / 1000).toFixed(1).replace(/\.0$/, "")}B`;
  return `$${Math.round(value)}M`;
}

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function founderNames(company) {
  return company.founders?.names?.length ? company.founders.names : company.founderNames || [];
}

// One entry per named founder, with the most specific public source recorded for that person.
export function founderRecords(company) {
  const linked = company.companyDetails?.research?.network?.connections?.founders || [];
  const fallback = typeof company.founders?.source === "string" ? { href: company.founders.source, relationship: "Founder reference", evidenceState: company.founders.evidenceState } : company.founders?.source;
  return founderNames(company).map((name) => {
    const source = linked.find((item) => item.title === name)?.source || fallback || null;
    return { name, source, evidenceState: source?.evidenceState || company.founders?.evidenceState || "Not recorded" };
  });
}

export function namedInvestors(company) {
  return company.companyDetails?.research?.network?.connections?.investors || [];
}

export function editionChanges(stageId) {
  const current = rankedCompanies(stageId);
  const entered = current.filter((company) => !company.historicalRanking || company.historicalRanking.stageId !== stageId);
  const left = COMPANIES.filter((company) => company.historicalRanking?.stageId === stageId && !current.includes(company));
  const exitReason = (company) => company.selected && company.stageId !== stageId ? `Moved to ${company.stage} #${company.editorialRank}`
    : company.exclusionReason === "public" ? "Public company"
    : company.recordStatus === "archived" ? "Acquired"
    : company.recordStatus === "stage-changed" ? `Now ${company.currentStage}`
    : company.recordStatus === "stage-conflict" ? "Stage evidence conflicts"
    : company.recordStatus === "under-review" ? "Under review"
    : "Not selected";
  return {
    entered,
    left: left.map((company) => ({ company, reason: exitReason(company), previousRank: company.historicalRanking.rank })).sort((a, b) => a.previousRank - b.previousRank),
  };
}

export function stageSummary(stageId) {
  const companies = rankedCompanies(stageId);
  const disclosed = companies.map((company) => ({ company, value: roundMillions(company) })).filter((item) => item.value != null).sort((a, b) => b.value - a.value);
  const total = disclosed.reduce((sum, item) => sum + item.value, 0);
  const risers = companies.filter((company) => company.historicalRanking?.stageId === stageId && company.historicalRanking.rank > company.editorialRank)
    .sort((a, b) => (b.historicalRanking.rank - b.editorialRank) - (a.historicalRanking.rank - a.editorialRank));
  const changes = editionChanges(stageId);
  return {
    stage: stageById(stageId),
    companies,
    disclosed,
    total,
    median: median(disclosed.map((item) => item.value)),
    largest: disclosed[0] || null,
    biggestRiser: risers[0] || null,
    entered: changes.entered.length,
    left: changes.left.length,
  };
}

export const ladderSummaries = () => PUBLIC_STAGE_IDS.map(stageSummary);

export function sectorMix(stageId) {
  const rows = new Map();
  for (const company of stageCompanies(stageId)) {
    const label = categoryLabel(company);
    const row = rows.get(label) || { label, count: 0, total: 0 };
    row.count += 1;
    row.total += roundMillions(company) || 0;
    rows.set(label, row);
  }
  return [...rows.values()].sort((a, b) => b.count - a.count || b.total - a.total);
}
