import assert from "node:assert/strict";
import { AS_OF, COMPANIES, COMPANY_BY_ID, SNAPSHOT_COMPANIES, STAGE_ORDER } from "../data.js";
import { rankedCompanies, rankFor } from "../shared.js";
import { companySources } from "../evidence.js";
import { state, parseUrl } from "../state.js";
import { renderRanking } from "../pages/ranking.js";
import { renderArchive } from "../pages/archive.js";
import { renderCompany, renderRankAuditDrawer, renderSignals } from "../pages/company-signals-search.js";

assert.equal(AS_OF, "2026-10-10");
assert.equal(COMPANIES.length, 213, "Review the previous 200 and 13 new candidates");
assert.equal(COMPANIES.filter(company => company.selected).length, 200);
assert.equal(COMPANIES.filter(company => company.selectionStatus === "alternate").length, 5);
assert.equal(COMPANIES.filter(company => company.selectionStatus === "excluded").length, 8);
assert.equal(new Set(COMPANIES.map(company => company.id)).size, COMPANIES.length);
assert.equal(new Set(COMPANIES.map(company => company.domain)).size, COMPANIES.length, "Do not publish the same company twice under different IDs");
for (const stage of STAGE_ORDER.filter(stage => stage.open)) {
  const rows = rankedCompanies(stage.id);
  assert.equal(rows.length, 50);
  assert.deepEqual(rows.map(company => rankFor(company)), Array.from({ length: 50 }, (_, index) => index + 1));
  assert.equal(stage.eligibleCount, 50 + stage.alternateCount);
  state.stage = stage.id;
  state.query = "";
  state.category = "all";
  state.visibleCount = 50;
  const html = renderRanking();
  assert.match(html, /10 Oct 2026/);
  assert.equal((html.match(/class="ranking-row"/g) || []).length, 50);
}
for (const company of COMPANIES) {
  assert.equal(company.rankingReview.date, AS_OF);
  assert.ok(company.rankingReview.rationale.length > 50, `${company.id}: missing decision rationale`);
  assert.ok(company.rankingReview.evidence.length >= 1);
  const sources = new Set(companySources(company).map(source => source.href));
  for (const evidence of company.rankingReview.evidence) {
    assert.ok(sources.has(new URL(evidence.href).href), `${company.id}: ranking evidence is absent from source library`);
    assert.ok(!evidence.publicationDate || evidence.publicationDate <= AS_OF, `${company.id}: future evidence`);
  }
  const ids = company.events.map(event => event.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(company.events.every(event => event.date && event.date <= AS_OF));
  const old = SNAPSHOT_COMPANIES.find(record => record.id === company.id);
  if (old) {
    assert.deepEqual(company.sourceRecord, old.sourceRecord, `${company.id}: archive source changed`);
    assert.equal(company.historicalRanking.rank, old.editorialRank);
    assert.equal(company.historicalRanking.stageId, old.stageId);
    assert.equal(company.historicalRanking.date, "2026-08-22");
  } else {
    assert.equal(company.historicalRanking, null, "Do not invent a prior rank for a new candidate");
    assert.ok(company.products.length && company.audience);
  }
  if (!company.selected) assert.equal(rankFor(company), null);
}
// Independent behavioral expectations from dated financing and lifecycle sources.
for (const [id, stage, rank] of [["wafer", "series-a", 20], ["typesafe-ai", "series-a", 19], ["physicsx", "series-c", 6], ["positron", "series-c", 14], ["celero-communications", "series-c", 31]]) {
  assert.equal(COMPANY_BY_ID[id].stageId, stage);
  assert.equal(rankFor(COMPANY_BY_ID[id]), rank);
}
for (const id of ["xtend", "arize-ai", "hailo", "blaxel", "mistral-ai", "clay", "tensorzero", "terray-therapeutics"]) assert.equal(rankFor(COMPANY_BY_ID[id]), null);
assert.equal(COMPANY_BY_ID.xtend.exclusionReason, "public");
assert.equal(COMPANY_BY_ID["terray-therapeutics"].recordStatus, "stage-conflict");
assert.equal(COMPANY_BY_ID["resolve-ai"].funding.amount, "$125M");
assert.equal(COMPANY_BY_ID["resolve-ai"].funding.date, "2026-02-04");
assert.equal(COMPANY_BY_ID.n8n.funding.amount, "$180M");
assert.equal(COMPANY_BY_ID["nexos-ai"].funding.amount, "$30M");
assert.equal(COMPANY_BY_ID["browser-use"].funding.date, "2025-03-22");
assert.equal(COMPANY_BY_ID["general-intuition"].currentStage, "Series A", "Unnamed capital must not advance the stage");
assert.equal(COMPANY_BY_ID.nscale.currentStage, "Series C", "A proposed IPO must not be treated as completed");

state.companyId = "resolve-ai";
state.lens = "capital";
const corrected = renderCompany();
assert.match(corrected, /\$125M Series A/);
assert.doesNotMatch(corrected, /<strong>\$40M/);
state.companyId = "gradium";
assert.match(renderCompany(), /First appearance/);
assert.match(renderRankAuditDrawer({ type: "rank", companyId: "gradium" }), /Supporting evidence/);
assert.doesNotMatch(renderCompany(), /rank null|rank undefined/i);
state.companyId = "xtend";
assert.match(renderCompany(), /NYSE/);
state.stage = "seed";
const archive = renderArchive();
assert.match(archive, /22 Aug 2026/);
assert.equal((archive.match(/class="archive-entry"/g) || []).length, 50);
assert.match(archive, /id="archive-wafer"/);
assert.match(archive, /id="archive-unconventional-ai"/);
assert.doesNotMatch(archive, /id="archive-gradium"/);

const originalWindow = globalThis.window;
try {
  const oldSignal = SNAPSHOT_COMPANIES.find(company => company.id === "wafer").events[0].id;
  globalThis.window = { location: { href: `http://top-seed.test/?view=signals&stage=seed&signal=${oldSignal}` } };
  parseUrl();
  assert.equal(state.stage, "series-a", "Existing signal links follow the company into its new cohort");
  assert.match(renderSignals(), new RegExp(`id="signal-${oldSignal}"`));
  globalThis.window.location.href = "http://top-seed.test/editions/2026-08-22/";
  parseUrl();
  assert.equal(state.view, "archive");
} finally {
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
}
console.log("Ranking edition passed: 4 × 50, 213 decisions, migration/exclusion, corrections, historical archive and old signal links.");
