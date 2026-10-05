import assert from "node:assert/strict";
import { SNAPSHOT_COMPANIES as COMPANIES, ENRICHED_SEED_IDS } from "../data.js";

const topTwenty = COMPANIES
  .filter((company) => company.stageId === "seed")
  .sort((left, right) => left.editorialRank - right.editorialRank)
  .slice(0, 20);

assert.equal(topTwenty.length, 20, "Seed Top 20 must contain exactly 20 companies");
assert.equal(ENRICHED_SEED_IDS.size, 20, "Only the Seed Top 20 should be enriched");

for (const company of topTwenty) {
  assert.ok(ENRICHED_SEED_IDS.has(company.id), `${company.name}: missing enrichment record`);
  assert.notEqual(company.profile.whoItServes, "Not publicly observed", `${company.name}: missing audience`);
  assert.ok(company.profile.products.length > 0, `${company.name}: missing products`);
  assert.notEqual(company.profile.businessModel, "Not publicly observed", `${company.name}: missing business model`);
  assert.notEqual(company.profile.competitiveContext, "Not publicly observed", `${company.name}: missing competitive context`);
  assert.notEqual(company.profile.watchNext, "Not publicly observed", `${company.name}: missing watch item`);
  assert.ok(company.companyDetails.research.business.facts.length >= 3, `${company.name}: business lens needs at least three sourced facts`);
  for (const fact of company.companyDetails.research.business.facts) {
    assert.ok(fact.title && fact.detail, `${company.name}: incomplete business fact`);
    assert.match(new URL(fact.source.href).protocol, /^https?:$/, `${company.name}: invalid business source`);
  }
}

const lightium = topTwenty.find((company) => company.id === "lightium");
assert.ok(lightium, "Lightium must remain in the Seed Top 20");
assert.equal(new URL(lightium.website.href).hostname, "careers.lightium.com", "Lightium must not link to the compromised public domain");
assert.ok(lightium.profile.sources.every((item) => !["lightium.co", "lightium.com"].includes(new URL(item.href).hostname)), "Lightium profile must not expose the compromised public domain");

console.log("Archived Seed Top 20 depth audit passed: 20 enriched profiles with sourced decision fields.");
