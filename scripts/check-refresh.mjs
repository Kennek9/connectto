import assert from "node:assert/strict";
import { REFRESHED_COMPANIES as COMPANIES, SNAPSHOT_COMPANIES, HISTORICAL_AS_OF as AS_OF, REFRESH_DATE } from "../data.js";
import { companyRecordState, rankFor, sourceLink } from "../shared.js";
import { companySources } from "../evidence.js";
import { REFRESHED_PROFILES } from "../refreshed-profiles.js";
import { REVIEWED_EVENTS } from "../reviewed-updates.js";
import { state } from "../state.js";
import { renderCompany, renderSignals, renderSearch } from "../pages/company-signals-search.js";

const COMPANY_BY_ID = Object.fromEntries(COMPANIES.map(company => [company.id, company]));
const rankedCompanies = stage => COMPANIES.filter(company => company.stageId === stage && !companyRecordState(company));

assert.equal(AS_OF, "2026-08-22", "Evidence updates must not silently publish a new ranking edition");
assert.equal(REFRESH_DATE, "2026-10-05");
for (const company of COMPANIES) {
  const previous = SNAPSHOT_COMPANIES.find(item => item.id === company.id);
  assert.deepEqual(company.sourceRecord, previous.sourceRecord, `${company.id}: preserve the original record`);
  assert.equal(company.editorialRank, previous.editorialRank, "Do not renumber ranks after an exclusion");
  for (const event of previous.events) assert.ok(company.events.some(item => item.id === event.id && item.source.href === event.source.href), `${company.id}: missing historical event`);
  const ids = company.events.map(event => event.id);
  assert.equal(new Set(ids).size, ids.length, `${company.id}: duplicate event IDs`);
  const sources = companySources(company);
  assert.equal(new Set(sources.map(source => source.href)).size, sources.length);
  for (const event of company.events) assert.ok(sources.some(source => source.href === new URL(event.source.href).href), `${company.id}: event missing from source library`);
  if (companyRecordState(company)) {
    assert.equal(rankFor(company), null);
    assert.ok(!rankedCompanies(company.stageId).some(item => item.id === company.id));
  }
}
assert.equal(Object.keys(REFRESHED_PROFILES).length, 200, "Every published company needs a sourced product profile");
for (const [id, profile] of Object.entries(REFRESHED_PROFILES)) {
  assert.equal(COMPANY_BY_ID[id].profile.whoItServes, profile.profile.whoItServes);
  assert.ok(companySources(COMPANY_BY_ID[id]).some(source => source.href === profile.source.href));
  assert.equal(profile.source.lastChecked, REFRESH_DATE);
  assert.equal(COMPANY_BY_ID[id].companyDetails.research.business.facts[0].evidenceState, profile.source.evidenceState, "Do not upgrade indexed sources to direct verification");
}
for (const event of REVIEWED_EVENTS) {
  assert.ok(event.date <= REFRESH_DATE, "Do not publish future events");
  assert.ok(event.source.href && event.source.relationship && event.whyItMatters);
  assert.equal(event.source.lastChecked, REFRESH_DATE);
}
for (const [id, stage, amount] of [["wafer", "Series A", "$40M"], ["physicsx", "Series C", "$300M"], ["positron", "Series C", "$875M"], ["celero-communications", "Series C", "$275M"], ["mistral-ai", "Series D", "€3B"], ["clay", "Series D", "$115M"]]) {
  assert.equal(COMPANY_BY_ID[id].currentStage, stage);
  assert.equal(COMPANY_BY_ID[id].funding.amount, amount);
  assert.equal(companyRecordState(COMPANY_BY_ID[id]), "stage-changed");
}
assert.equal(COMPANY_BY_ID["dedalus-labs"].website.href, "https://www.dedaluslabs.ai/");
assert.equal(COMPANY_BY_ID["slingshot-ai"].website.href, "https://slingshotai.com/");
assert.ok(COMPANY_BY_ID["dedalus-labs"].refresh.profileChange.note.includes("dedaluslabs.pro"));
assert.equal(companyRecordState(COMPANY_BY_ID.blaxel), "archived");
assert.equal(companyRecordState(COMPANY_BY_ID.hailo), "archived");
assert.equal(companyRecordState(COMPANY_BY_ID.tensorzero), "under-review", "Unmaintained software alone does not prove legal closure");
assert.equal(COMPANY_BY_ID.nscale.currentStage, "Series C", "Convertible debt and a proposed IPO do not advance equity stage");
assert.equal(COMPANY_BY_ID.nscale.funding.amount, COMPANY_BY_ID.nscale.historicalFunding.amount);
assert.equal(COMPANY_BY_ID["contextual-ai"].companyDetails.research.capital.totalDisclosed, "Not publicly observed", "A single round is not cumulative capital");
assert.doesNotMatch(sourceLink({ href: "javascript:alert(1)" }), /href=/);

state.companyId = "mistral-ai";
assert.match(renderCompany(), /Series D/);
assert.match(renderCompany(), /id="sources-title"/);
assert.match(renderCompany(), /Claim reviewed/);
state.stage = "seed";
state.signalId = "unconventional-ai-funding";
state.query = "";
state.visibleCount = 10;
assert.match(renderSignals(), /id="signal-unconventional-ai-funding"/, "A linked older signal must render beyond the first page");
state.query = "Microchip";
assert.match(renderSearch(), /Hailo/, "Archived companies must remain discoverable through new evidence");
console.log(`Refresh audit passed: ${COMPANIES.length} preserved profiles; ${REVIEWED_EVENTS.length} reviewed additions; stage, lifecycle, sources and deep links validated.`);
