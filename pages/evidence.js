import { companySources, sourceAccess } from "../evidence.js";
import { arrowIcon, chevronIcon, escapeHtml, formatDate } from "../shared.js";

export function renderSourceLedger(company) {
  const sources = companySources(company);
  const base = new URL(import.meta.url).protocol === "file:" ? "/" : new URL("../", import.meta.url).pathname;
  return `<section class="company-section source-ledger" id="sources" aria-labelledby="sources-title"><div class="source-heading"><h2 id="sources-title">Sources <span class="source-total">${sources.length}</span></h2><a class="text-link" href="${base}evidence/${company.id}.json" download="${company.id}-evidence.json">Download ${arrowIcon()}</a></div><div class="source-ledger-list">${sources.map((source, index) => {
    const access = sourceAccess(source.href);
    const dates = source.claims.map(claim => claim.publicationDate).filter(Boolean).sort();
    const publisher = new URL(source.href).hostname.replace(/^www\./, "");
    return `<details class="source-ledger-entry"><summary><span class="source-number">${String(index + 1).padStart(2, "0")}</span><span><strong>${escapeHtml(source.label)}</strong><small>${escapeHtml(publisher)}${dates.length ? ` · ${formatDate(dates.at(-1))}` : ""}</small></span>${chevronIcon()}</summary><div class="source-ledger-body"><a class="source-link" href="${escapeHtml(source.href)}" target="_blank" rel="noreferrer">Original source ${arrowIcon()}</a>${access && access.result !== "reachable" ? `<p class="source-warning">${access.result === "not-found" ? "Page not found" : "Automated access restricted"} · ${access.checkedAt}</p>` : ""}${source.claims.map(claim => `<article class="source-claim"><p>${escapeHtml(claim.claim)}</p><div class="fact-citation"><span>${escapeHtml(claim.relationship)} · ${escapeHtml(claim.evidenceState)}</span>${claim.date ? `<span>Event ${formatDate(claim.date)}</span>` : ""}${claim.publicationDate ? `<span>Published ${formatDate(claim.publicationDate)}</span>` : ""}<span>Claim reviewed ${formatDate(claim.reviewedAt)}</span></div></article>`).join("")}</div></details>`;
  }).join("")}</div></section>`;
}
