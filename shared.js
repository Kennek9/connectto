import { safeSourceUrl, sourceAccess } from "./evidence.js";
import { AS_OF, REFRESH_DATE, COMPANIES, COMPANY_BY_ID, SIGNALS, STAGE_ORDER } from "./data.js";

const BLOCKED_SIGNAL_PATHS = new Set(["/", "/blog", "/news", "/research", "/releases", "/docs", "/changelog"]);

export const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));

export const formatDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date || "")
  ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`))
  : date || "Date not publicly observed";

export const initials = (name = "") => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

const normalizedState = (value = "") => String(value).trim().toLowerCase().replace(/[ _]+/g, "-");

export function companyRecordState(company) {
  const lifecycle = normalizedState(company?.recordStatus || company?.lifecycle || company?.state || company?.status);
  if (company?.archived === true || lifecycle === "archived") return "archived";
  if (company?.stageConflict === true || normalizedState(company?.stageStatus) === "conflict" || lifecycle === "stage-conflict") return "stage-conflict";
  if (["stage-changed", "under-review"].includes(company?.recordStatus)) return company.recordStatus;
  return "";
}

export function sourceRecordState(source) {
  if (sourceAccess(source?.href || source?.url)?.result === "not-found") return "source-unavailable";
  const availability = normalizedState(source?.availability || source?.sourceState || source?.status || source?.state);
  if (source?.available === false || source?.unavailable === true || ["unavailable", "source-unavailable", "failed", "source-failed", "dead"].includes(availability)) return "source-unavailable";
  return "";
}

export function sourcePath(href) {
  try { return new URL(href).pathname.replace(/\/$/, "") || "/"; } catch { return ""; }
}

export function validSignal(eventItem) {
  return eventItem.type !== "funding"
    && ["Verified", "Reported", "Direct", "Corroborated"].includes(eventItem.status)
    && !BLOCKED_SIGNAL_PATHS.has(sourcePath(eventItem.source?.href));
}

export const publicSignals = (company) => (company?.events || []).filter(validSignal);

export function eventAgeDays(eventItem) {
  const date = String(eventItem?.date || "");
  const parseValue = /^\d{4}-\d{2}$/.test(date) ? `${date}-01` : /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";
  if (!parseValue) return null;
  return Math.max(0, (Date.parse(`${REFRESH_DATE}T00:00:00Z`) - Date.parse(`${parseValue}T00:00:00Z`)) / 86400000);
}

export function stageCompanies(stageId = "seed") {
  return COMPANIES.filter((company) => company.stageId === stageId && !companyRecordState(company));
}

export function rankedCompanies(stageId = "seed") {
  return stageCompanies(stageId).slice().sort((a, b) => a.editorialRank - b.editorialRank || a.name.localeCompare(b.name));
}

export const allCompaniesForStage = rankedCompanies;

export function rankFor(company) {
  return !companyRecordState(company) && Number.isInteger(company?.editorialRank) ? company.editorialRank : null;
}

export function latestSignal(company) {
  return [...publicSignals(company)].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))[0] || null;
}

export function latestPublicEvent(company) {
  return [...(company?.events || [])]
    .filter((eventItem) => !["Estimated", "Unverified"].includes(eventItem.status))
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))[0] || null;
}

export function evidenceCoverage(company) {
  const signals = publicSignals(company);
  return {
    signalCount: signals.length,
    verifiedCount: signals.filter((eventItem) => ["Verified", "Direct", "Corroborated"].includes(eventItem.status)).length,
    reportedCount: signals.filter((eventItem) => eventItem.status === "Reported").length,
    typeCount: new Set(signals.map((eventItem) => eventItem.type)).size,
  };
}

export const arrowIcon = () => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
export const closeIcon = () => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
export const chevronIcon = () => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
export const searchIcon = () => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="5.8" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="m15.2 15.2 4.8 4.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

export function logoMark() {
  return `<svg class="logo-mark logo-stamp-mark" viewBox="0 0 36 32" aria-hidden="true"><rect x="2" y="2" width="32" height="28" rx="1.8" fill="#fffefa"/><rect x="3.4" y="3.4" width="29.2" height="25.2" rx="1" fill="none" stroke="currentColor" stroke-width=".6" opacity=".45"/><text x="6" y="23" fill="currentColor" font-family="Iowan Old Style, Baskerville, Georgia, serif" font-size="18.5" font-weight="700">T</text><text x="18" y="24.2" fill="currentColor" font-family="Iowan Old Style, Baskerville, Georgia, serif" font-size="19.5" font-weight="700">S</text></svg>`;
}

export function logo(company, size = "") {
  return `<span class="company-mark ${size}" aria-hidden="true"><span class="company-mark-fallback">${escapeHtml(initials(company.name))}</span></span>`;
}

export function signalPictogram(type) {
  const paths = {
    funding: `<path d="M5 9h14v10H5zM8 9V6h8v3M8 13h8M8 16h5"/>`,
    product: `<path d="m12 4 2.2 5.2L20 12l-5.8 2.8L12 20l-2.2-5.2L4 12l5.8-2.8L12 4Z"/>`,
    customer: `<path d="M6 19v-1.2a3.8 3.8 0 0 1 3.8-3.8h4.4a3.8 3.8 0 0 1 3.8 3.8V19M12 11a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 12 11Z"/>`,
    openSource: `<path d="M8 8 4 12l4 4M16 8l4 4-4 4M14 5l-4 14"/>`,
    talent: `<path d="M7 19v-1.1a3.1 3.1 0 0 1 3.1-3.1h3.8a3.1 3.1 0 0 1 3.1 3.1V19M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM5 11a2.4 2.4 0 0 0-2 2.3V15M19 11a2.4 2.4 0 0 1 2 2.3V15"/>`,
  };
  return `<svg class="signal-pictogram signal-pictogram--${escapeHtml(type)}" viewBox="0 0 24 24" aria-hidden="true">${paths[type] || paths.product}</svg>`;
}

export function signalLabel(type, includeIcon = true) {
  const item = SIGNALS[type] || { label: type || "Signal" };
  return `<span class="signal-label signal-label--${escapeHtml(type)}">${includeIcon ? signalPictogram(type) : ""}${escapeHtml(item.label)}</span>`;
}

export function sourceLink(item, label = "Open source") {
  if (sourceRecordState(item)) return `<a class="source-link source-link--missing" href="?view=corrections">Source unavailable ${arrowIcon()}</a>`;
  if (!safeSourceUrl(item?.href)) return `<span class="source-link source-link--missing">Source not publicly observed</span>`;
  return `<a class="source-link" href="${escapeHtml(item.href)}" target="_blank" rel="noreferrer">${escapeHtml(label)} ${arrowIcon()}</a>`;
}

export { AS_OF, REFRESH_DATE, COMPANIES, COMPANY_BY_ID, SIGNALS, STAGE_ORDER };
