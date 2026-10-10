import assert from "node:assert/strict";
import { state, parseUrl, updateUrl } from "../state.js";
import { filteredCompanies, renderRanking } from "../pages/ranking.js";
import { renderCompanyPreview, renderCompany, renderSignals } from "../pages/company-signals-search.js";

const initial = { ...state };
const originalWindow = globalThis.window;
const browser = { location: { href: "http://top-seed.test/?view=ranking&stage=seed&region=Europe&form=Software&sort=name" }, history: {} };
browser.history.pushState = browser.history.replaceState = (_state, _title, url) => { browser.location.href = String(url); };
globalThis.window = browser;
try {
  parseUrl();
  assert.equal(state.region, "Europe");
  assert.equal(state.productForm, "Software");
  assert.equal(state.sort, "name");
  assert.equal(state.filtersOpen, true);
  const filtered = filteredCompanies();
  assert.ok(filtered.length > 0 && filtered.length < 50);
  assert.ok(filtered.every(company => company.region === "Europe" && company.productForm === "Software"));
  assert.deepEqual(filtered.map(company => company.name), filtered.map(company => company.name).sort((a, b) => a.localeCompare(b)));
  assert.equal(filtered.find(company => company.id === "gradium").editorialRank, 6, "Display sorting must not renumber the edition");
  state.query = "Gradium";
  updateUrl(false);
  assert.equal(new URL(browser.location.href).searchParams.get("region"), "Europe", "Typing must preserve advanced filters");
  assert.equal(new URL(browser.location.href).searchParams.get("form"), "Software");
  assert.equal(new URL(browser.location.href).searchParams.get("sort"), "name");
  parseUrl();
  assert.equal(filteredCompanies().length, 1);
  assert.match(renderRanking(), /aria-label="Rank 6"/);
  assert.match(renderRanking(), /aria-label="Quick view of Gradium"/);
  state.query = "no-such-company-xyz";
  assert.equal(filteredCompanies().length, 0);
  assert.match(renderRanking(), /Clear filters/);

  browser.location.href = "http://top-seed.test/?view=ranking&stage=seed&sort=recent&region=bogus&form=bogus";
  parseUrl();
  assert.equal(state.region, "all");
  assert.equal(state.productForm, "all");
  assert.equal(filteredCompanies()[0].id, "fish-audio", "Fish Audio holds the latest reviewed named Seed announcement after TypeSafe AI moved cohorts");
  assert.equal(filteredCompanies()[0].editorialRank, 5);
  browser.location.href = "http://top-seed.test/?view=ranking&sort=constructor";
  parseUrl();
  assert.equal(state.sort, "rank");

  state.stage = "seed";
  state.query = "";
  state.visibleCount = 1000;
  browser.location.href = "http://top-seed.test/?view=signals&stage=seed";
  const allSignals = renderSignals();
  const eventIds = html => [...html.matchAll(/<article id="signal-([^"]+)"/g)].map(match => match[1]);
  const grouped = [];
  for (const group of ["capital", "product-work", "technical-work", "adoption", "company"]) {
    browser.location.href = `http://top-seed.test/?view=signals&stage=seed&signalType=${group}`;
    grouped.push(...eventIds(renderSignals()));
  }
  assert.equal(new Set(grouped).size, grouped.length, "An event must have one filter group");
  assert.deepEqual(grouped.sort(), eventIds(allSignals).sort(), "Compact filters must retain every original event");
  assert.equal((allSignals.match(/class="signal-filter /g) || []).length, 6);
  browser.location.href = "http://top-seed.test/?view=signals&stage=seed&signalType=funding";
  assert.ok(eventIds(renderSignals()).includes("gradium-funding"), "Legacy raw-type URLs must still work");

  const brief = renderCompanyPreview({ type: "company-preview", companyId: "gradium" });
  assert.match(brief, /role="dialog"/);
  assert.match(brief, /aria-modal="true"/);
  assert.match(brief, /Rank 6/);
  assert.match(brief, /\$100M/);
  assert.match(brief, /href="\/companies\/gradium\/"/);
  assert.match(brief, /Original source/);
  assert.equal(renderCompanyPreview({ type: "company-preview", companyId: "missing" }), "");
  state.companyId = "wafer";
  state.lens = "technology";
  const research = renderCompany();
  for (const label of ["Overview", "Product", "Funding", "Adoption", "Technology", "Team"]) assert.ok(research.includes(`>${label}</button>`), `Missing research tab: ${label}`);
  assert.match(research, /id="lens-detail-technology"/);
} finally {
  Object.assign(state, initial);
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
}
console.log("Research interactions passed: filter/sort URL round-trips, immutable ranks, empty recovery, company brief and research tabs.");
