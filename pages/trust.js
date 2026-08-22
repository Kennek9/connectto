import { AS_OF, arrowIcon, escapeHtml } from "../shared.js";

const TRUST_NAV = [
  ["methodology", "Methodology"],
  ["evidence-policy", "Evidence policy"],
  ["corrections", "Corrections"],
  ["about", "About"],
];

const TRUST_CONTENT = {
  methodology: {
    kicker: "Top Seed · methodology",
    title: "How the board is reviewed.",
    lead: "Top Seed is an editorial beta: a quarterly, stage-specific order built from public evidence, while Signals are reviewed continuously and kept separate from rank publication.",
    meta: ["Editorial beta", "Method v0.2", `Reviewed through ${AS_OF}`],
    sections: [
      ["The question", "Relative attention value, not a forecast.", "Ranking asks which companies in the current financing stage deserve sustained research attention. It does not predict investment returns, company quality, or short-term news performance."],
      ["Candidate pool", "Top 50 comes from the audited pool.", "Each stage selects 50 from the actual deduplicated companies that passed the same eligibility review by the same cutoff date. The candidate-pool count is a fact, not a target. Until a stage audit is complete, the public copy says Candidate pool under review and does not publish an estimate."],
      ["Eligibility", "One rule across product forms.", "A candidate must be independently operating, AI must be core to the product or technology, the company and main product must be identifiable, the current stage must be supportable, and at least one reliable public source must be available. Public candidate-pool companies are not a directory."],
      ["Financing classification", "Stage follows a named institutional equity round.", "A reliable public source must identify Seed, Series A, Series B, or Series C. Pre-seed is included in Seed. Grants, government awards, debt, venture debt, accelerator awards, token sales, and strategic investment without a named round remain in funding history but do not advance stage. Conflicting or unnamed round evidence stays in internal review."],
      ["Five qualitative dimensions", "Editors ask five questions.", "The review considers market importance; technology and product; execution and adoption; team and resources; and development progress. These are qualitative editorial dimensions. Top Seed publishes no numeric weights, pseudo-precise company score, or recipe to reproduce the order."],
      ["Form-specific evidence", "Same questions, different proof.", "Software is read through product capability, usage, customers, revenue, and developer adoption. Hardware, chips, and compute require evidence such as performance, efficiency, tape-out, manufacturing, availability, design wins, and deployment. Robotics, autonomy, and AI science add real-world reliability, certification, research, regulatory, clinical, or reproducible-result evidence. Software + hardware uses both sets."],
      ["Global coverage", "One global standard, no geographic quota.", "Eligibility is global and uses one standard; region is a visible filter and reporting lens, not a quota. The reviewed-pool distribution and known coverage gaps are disclosed as the research is completed. A region is never filled merely to create representative-looking numbers."],
      ["Publication cadence", "Quarterly Ranking, continuous Signals.", "Ranking is published as a quarterly version with a named cutoff date. Signals update continuously after evidence review and may update Company records immediately, but a new Signal changes the public order only in the next Ranking version unless a material correction requires a visible correction note."],
      ["Versioning", "A public change keeps its context.", "Method versions, ranking cutoffs, candidate-pool denominators, recompute dates, and material corrections remain visible. A later denominator does not rewrite the denominator attached to an older ranking version."],
      ["Independence", "No paid rank and no investment advice.", "Commercial support cannot buy inclusion, order, evidence status, Signal priority, or correction priority. Clearly labelled sponsored material, if present, sits outside the natural board. Top Seed is not an endorsement and the public ranking is not investment advice."],
    ],
  },
  "evidence-policy": {
    kicker: "Top Seed · evidence policy",
    title: "What a source can prove.",
    lead: "Source relationship and evidence state are shown separately so a reader can tell what was directly observed, who supplied it, and how confidently it can support a claim.",
    meta: ["Evidence semantics", "Source-linked records", `Checked through ${AS_OF}`],
    sections: [
      ["Source relationship", "Who is connected to the claim?", "A source can be company or founder material, a customer or partner, an investor, a regulator or government record, a technical repository or paper, an independent reporter, or a PR distributor. That relationship stays visible even when the fact itself is reliable."],
      ["Direct", "The original material supports the stated fact.", "Top Seed can inspect the primary source and tie it to a specific event, date, product, deployment, round, technical result, or organizational change. Direct does not mean the source has no interest; provenance remains visible."],
      ["Corroborated", "Independent sources agree on the same fact.", "Two or more independent sources can corroborate a fact. Later reporting may be attached as supporting context without creating duplicate Signals for the same underlying event."],
      ["Reported", "A credible source reports the claim.", "Reported evidence can inform a ranking when the relationship and uncertainty are explicit, but it is not presented as a direct observation by Top Seed. Company-provided reporting is not silently relabelled independent confirmation."],
      ["Unverified / Estimated", "Context only until checked.", "A single unverified claim, inference, or estimate may stay visible for context. It cannot by itself support inclusion, a rank change, or a definitive `Why selected` conclusion."],
      ["What a source cannot prove", "A homepage is orientation, not an event.", "A generic homepage, index, logo, job listing, or repeated press release can help locate a record, but it cannot stand in for a dated event or prove an outcome that the source does not state."],
      ["Signal rules", "One underlying fact, one public Signal.", "Product, customer, founder, team, technology, manufacturing, deployment, regulatory, and financing changes can be Signals when they change a research question. Duplicate announcements are merged; volume of coverage and financing frequency are not ranking proxies."],
      ["Source unavailable", "Keep the record; disclose the gap.", "When a source fails, the original record remains visible and is marked Source unavailable · replacement under review. Top Seed does not silently delete the judgment or turn a missing source into a verified fact."],
      ["Corrections", "A reader can follow the claim back.", "Readers, companies, and source owners can provide an original URL and the specific claim. The same evidence policy applies to supplied material, and the correction path is recorded with the affected Company or Signal."],
    ],
  },
  corrections: {
    kicker: "Top Seed · corrections",
    title: "A public record can be corrected.",
    lead: "Send the original URL, the specific claim, and what changed. The current conclusion, change date, and affected record remain traceable when a correction is confirmed.",
    meta: ["Corrections and appeals", "Versioned record", `Public record through ${AS_OF}`],
    sections: [
      ["What to send", "Make the disputed claim checkable.", "Users, companies, and source owners can submit a company-identity, stage, amount, date, person, Signal summary, `Why it matters`, candidate-qualification, or inclusion correction. Include the original source URL and the exact claim that should change."],
      ["Review path", "The same evidence policy applies to every sender.", "Top Seed checks the supplied source, compares it with the current record and related sources, records the conclusion, and updates the affected Company or Signal when the correction is confirmed. Supplementary company material is reviewed as evidence, not as a privileged override."],
      ["Visible history", "No silent rewrite.", "A confirmed factual correction updates Company and Signals immediately. A material ranking correction carries a visible version note with the reason, affected content, and change date; older ranking context is not silently rewritten."],
      ["Ranking timing", "Signals can move first; rank follows the version.", "A new or corrected Signal may appear as soon as it passes review. The next quarterly Ranking version incorporates ordinary changes. A material correction can trigger a visible rank correction before the next scheduled version."],
      ["Archived record", "History remains after the current rank ends.", "An IPO, complete acquisition, or publicly confirmed stop in operations removes a company from the next active ranking. The Company record remains archived with its historical stage, sources, and prior selection context."],
      ["Stage conflict", "Conflicting financing evidence stays under review.", "When reliable sources disagree about the current round, the record shows the conflict and is withheld from a new stage ranking until resolved. The last valid historical state remains visible; Top Seed does not guess a stage."],
      ["Source failure", "Unavailable is a visible state.", "A dead or inaccessible source is retained in the evidence trail and marked Source unavailable · replacement under review. A missing replacement does not erase the prior record or increase its certainty."],
      ["Equal priority", "Payment never changes the queue.", "Companies, readers, and source owners use the same correction path. Commercial support or payment cannot change correction priority, evidence state, inclusion, or rank."],
      ["Appeal outcome", "The record says what happened.", "When a challenge is not confirmed, the current conclusion and reason remain stated. When it is confirmed, the public record names the change date and affected Company, Signal, or Ranking version."],
    ],
  },
  about: {
    kicker: "Top Seed · about",
    title: "Research you can check.",
    lead: "Top Seed is an independent editorial beta for finding early-stage AI companies, understanding why they are on a stage board, and following public changes without confusing attention with certainty.",
    meta: ["Editorial beta", "Global research scope", "No paid rank"],
    sections: [
      ["What this is", "A shortlist with a source trail.", "Ranking narrows a large global field to a stage-specific Top 50. Company pages explain what is known and missing; Signals collect meaningful changes beyond a financing-news stream; sources stay close to each claim."],
      ["How to read it", "Ranking and Signals answer different questions.", "Ranking is a quarterly editorial version. Signals are continuously reviewed and can change the Company record before the next ranking publication. A Signal is not a popularity counter, and a rank is not a guarantee."],
      ["Who it is for", "A starting point for research teams.", "Investors, family offices, strategy teams, CVCs, consultants, operators, and professional readers can use the board to choose the next company or source to inspect. The product shortens the path to a better research question; it does not replace diligence."],
      ["Research independence", "No endorsement and no investment advice.", "Top Seed does not endorse a company, recommend an investment, predict returns, or present the public ranking as investment advice. Inclusion and order are editorial judgments from public evidence, not paid placement or a commercial relationship."],
      ["Global boundary", "No quota, with coverage-gap disclosure.", "All stages use one global eligibility standard and no geographic quota. Region remains visible so readers can inspect the reviewed-pool distribution and known coverage gaps rather than mistaking an incomplete sample for complete market coverage."],
      ["Public boundary", "Evidence is public; private certainty is not implied.", "Top Seed does not publish private cap-table data, hidden company claims, or a mechanically reproducible score. Missing facts say Not publicly observed. Public records can be challenged through Corrections."],
      ["Beta status", "The method is published while the system is tested.", "The board is labelled Editorial beta until the first full four-stage review is signed off. Method versions, cutoffs, candidate-pool truth, and material changes stay visible while the editorial process matures."],
      ["Review date", `This trust surface reflects the public build reviewed through ${AS_OF}.`, "The date is a freshness boundary, not a claim that every company has changed on that day. Open the Company, Signal, source, and correction record for the fact-level review date."],
    ],
  },
};

export function renderTrustPage(view) {
  const content = TRUST_CONTENT[view] || TRUST_CONTENT.about;
  const activeView = TRUST_CONTENT[view] ? view : "about";
  const nav = TRUST_NAV.map(([id, label]) => `<a class="stage-tab ${activeView === id ? "is-active" : ""}" href="?view=${id}"${activeView === id ? " aria-current=\"page\"" : ""}><span>${label}</span><small>Public policy</small></a>`).join("");
  const correctionSections = content.sections.map(([label, title, detail]) => {
    const sourceFailureLink = activeView === "corrections" && label === "Source failure" ? ` <a class="text-link" href="#correction-intake">See correction intake requirements ${arrowIcon()}</a>` : "";
    return `<article class="detail-fact"><div class="detail-fact-meta"><span>${escapeHtml(label)}</span><small>Top Seed policy</small></div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(detail)}${sourceFailureLink}</p></article>`;
  }).join("");
  const correctionIntake = activeView === "corrections" ? `<section class="company-section trust-intake" id="correction-intake" aria-labelledby="correction-intake-title"><div class="section-heading"><div><span class="section-kicker">Correction intake</span><h2 id="correction-intake-title">Correction intake opens before public release.</h2></div><p>No authorized inbox or form is live in this build.</p></div><p class="detail-empty"><strong>Required fields:</strong> company/entity; disputed fact; current URL/record; proposed correction; original source URL; event/publication date; submitter relationship/contact; appeal type.</p></section>` : "";
  const correctionFooter = activeView === "corrections" ? "" : `<a class="text-link" href="?view=corrections">Open corrections and appeals ${arrowIcon()}</a>`;
  return `<main class="page-shell company-page trust-page" id="main"><a class="back-link" href="?view=ranking&stage=seed">← Ranking</a><section class="ranking-masthead"><div><span class="section-kicker">${escapeHtml(content.kicker)}</span><h1>${escapeHtml(content.title)}</h1><p>${escapeHtml(content.lead)}</p></div><div class="masthead-meta"><span class="beta-flag">Editorial beta</span><p>${content.meta.map((item) => escapeHtml(item)).join("<br>")}</p></div><span class="masthead-trust"><span class="trust-dot"></span>Secondary trust surface · source relationships, decisions, and limits stay public</span></section><nav class="stage-tabs trust-nav" aria-label="Trust pages">${nav}</nav><section class="company-section trust-section" aria-label="${escapeHtml(content.kicker)}"><div class="detail-facts">${correctionSections}</div></section>${correctionIntake}<section class="company-footnote trust-footnote"><span>Public trust page · ${escapeHtml(content.meta[0])} · reviewed ${AS_OF}</span><span>${correctionFooter} <a class="text-link" href="?view=ranking&stage=seed">Back to Ranking ${arrowIcon()}</a></span></section></main>`;
}
