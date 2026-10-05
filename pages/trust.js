import { AS_OF, REFRESH_DATE, COMPANIES, arrowIcon, escapeHtml, formatDate, sourceLink } from "../shared.js";
import { companyUrl } from "../state.js";

const TRUST_NAV = [["methodology", "Methodology"], ["evidence-policy", "Evidence policy"], ["corrections", "Corrections"], ["about", "About"]];
const TRUST_CONTENT = {
  methodology: {
    title: "How the index is built.",
    lead: "Selection, financing stages and ranking editions.",
    sections: [
      ["Eligibility", "An identifiable, independently operating company with AI central to its product and at least one reliable public source."],
      ["Financing stage", "Stage follows an explicitly named institutional equity round. Pre-seed is grouped with Seed. Debt, grants and unnamed strategic investments do not advance the stage."],
      ["Ranking", "Editors consider market relevance, product and technology, adoption, team and resources, and recent progress. The order is a qualitative judgment, not a numerical score."],
      ["Publication", `The current ranking edition is dated ${formatDate(AS_OF)}. Each stage contains 50 selected companies. Confirmed stage changes move companies to the corresponding cohort; public, acquired and unresolved records are excluded. The 22 August edition remains available unchanged.`],
      ["Coverage", "This edition reviews 213 records: the previous 200 companies and 13 additions. Of 205 eligible candidates, 200 are selected and five are alternates. Eight records are excluded. This bounded review is not a complete global census."],
    ],
  },
  "evidence-policy": {
    title: "Reading the evidence.",
    lead: "A source’s relationship and a claim’s evidence state are separate.",
    sections: [
      ["Direct", "The original source states the claim. Company and investor announcements remain interested sources; Direct does not mean independent validation."],
      ["Reported", "The claim is available through reporting or an indexed source, without a complete primary-source review. Indexed-only company profiles are labelled explicitly."],
      ["Corroborated", "Independent sources support the same fact. Republishing one press release does not create independent confirmation."],
      ["Dates", "Event date, publication date and review date refer to different things. A recent review does not make an old event new."],
      ["Missing evidence", "Unknown facts remain unstated. Projections, conditional milestones and company-reported metrics are identified in the claim itself."],
      ["Source access", "Unavailable original links remain in the record. Automated access failures are distinguished from a missing page. Link checks do not verify the underlying claims."],
    ],
  },
  corrections: {
    title: "Record changes.",
    lead: `Material corrections and updates reviewed ${formatDate(REFRESH_DATE)}.`,
    sections: [],
  },
  about: {
    title: "About Top Seed.",
    lead: "A research index of AI companies, with sources attached.",
    sections: [
      ["The index", `${COMPANIES.length} company records cover products, financing, dated events and original sources. The public ranking spans Seed through Series C; later-stage and acquired companies retain historical profiles.`],
      ["Readers", "Built for investors, operators and analysts choosing which companies and claims to investigate further."],
      ["Independence", "Payment cannot buy inclusion, rank or favorable evidence treatment. The index does not provide investment recommendations."],
      ["Publication status", `Editorial beta. Ranking edition: ${formatDate(AS_OF)}. Latest evidence refresh: ${formatDate(REFRESH_DATE)}. Updates are reviewed in batches.`],
    ],
  },
};

function correctionHistory() {
  const changed = COMPANIES.filter(company => company.rankingCorrection || company.refresh?.change || company.refresh?.profileChange);
  return `<section class="company-section correction-history"><p class="correction-count">${changed.length} changes</p>${changed.map(company => {
    const change = company.rankingCorrection || company.refresh.change || company.refresh.profileChange;
    const label = company.rankingCorrection ? "Financing correction" : company.exclusionReason === "public" ? "Public listing" : company.recordStatus === "archived" ? "Acquired" : company.historicalRanking?.stage !== company.currentStage ? `${company.historicalRanking?.stage} → ${company.currentStage}` : ["under-review", "stage-conflict"].includes(company.recordStatus) ? "Eligibility under review" : "Profile updated";
    return `<article class="detail-fact"><div class="detail-fact-meta"><span>${escapeHtml(label)}</span></div><h3><a href="${companyUrl(company)}">${escapeHtml(company.name)}</a></h3><p>${escapeHtml(change.note)}</p>${sourceLink(change.source, "Original source")}</article>`;
  }).join("")}</section>`;
}

export function renderTrustPage(view) {
  const active = TRUST_CONTENT[view] ? view : "about";
  const content = TRUST_CONTENT[active];
  const nav = TRUST_NAV.map(([id, label]) => `<a class="stage-tab ${active === id ? "is-active" : ""}" href="?view=${id}"${active === id ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  const base = new URL(import.meta.url).protocol === "file:" ? "/" : new URL("../", import.meta.url).pathname;
  const editionDownload = active === "methodology" ? `<a class="text-link" href="${base}evidence/ranking-${AS_OF}.json" download>Download edition decisions and sources ${arrowIcon()}</a>` : "";
  const sections = content.sections.map(([title, detail]) => `<section class="policy-section"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(detail)}</p></section>`).join("");
  return `<main class="page-shell trust-page" id="main"><section class="ranking-masthead"><div><h1>${escapeHtml(content.title)}</h1><p>${escapeHtml(content.lead)}</p></div></section><nav class="stage-tabs trust-nav" aria-label="Policies">${nav}</nav><article class="policy-body">${sections}${editionDownload}</article>${active === "corrections" ? `${correctionHistory()}<section class="trust-intake"><p>The public contact inbox is not active yet. Corrections cannot be submitted through this page.</p></section>` : ""}<a class="text-link policy-back" href="?view=ranking&stage=seed">Back to the index ${arrowIcon()}</a></main>`;
}
