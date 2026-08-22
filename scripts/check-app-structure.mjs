import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");

const [app, router, state, shell, ranking, companySignalsSearch, trust, build] = await Promise.all([
  read("app.js"),
  read("router.js"),
  read("state.js"),
  read("shell.js"),
  read("pages/ranking.js"),
  read("pages/company-signals-search.js"),
  read("pages/trust.js"),
  read("scripts/build.mjs"),
]);

assert.match(app, /startApp/, "app.js must remain a thin bootstrap");
assert.doesNotMatch(app, /function render(?:Ranking|Company|Compare)/, "page rendering belongs in page modules");
assert.match(state, /ranking|company|signals|search|methodology|evidence-policy|corrections|about/, "state must define the public route contract");
assert.doesNotMatch(router, /view=compare|Compare|Subscribe|series-d-plus|Series D\+/, "removed routes must not be reachable from the router");
assert.doesNotMatch(shell, /Compare|Subscribe|series-d-plus|Series D\+/, "removed entries must not be rendered by the shell");
assert.match(ranking, /renderRanking/, "Ranking must have an owned page seam");
assert.match(companySignalsSearch, /renderCompany|renderSignals|renderSearch/, "Company, Signals, and Search must share a future-safe seam");
assert.match(trust, /renderTrustPage/, "trust pages must have an owned page seam");
assert.match(build, /pages/, "the static build must copy page modules");

const [{ state: routeState, parseUrl, updateUrl }, { COMPANIES, companyRecordState, sourceRecordState, sourceLink }, { renderCompanyRecordState }] = await Promise.all([
  import("../state.js"),
  import("../shared.js"),
  import("../pages/company-signals-search.js"),
]);

const originalWindow = globalThis.window;
const fakeWindow = { location: { href: "http://top-seed.test/?view=signals&stage=seed&q=initial-filter" }, history: {} };
const writeHistory = (_state, _title, nextUrl) => { fakeWindow.location.href = String(nextUrl); };
fakeWindow.history.pushState = writeHistory;
fakeWindow.history.replaceState = writeHistory;
globalThis.window = fakeWindow;
try {
  parseUrl();
  assert.equal(routeState.query, "initial-filter", "Signals query must parse from a share URL");
  routeState.view = "signals";
  routeState.stage = "seed";
  routeState.query = "updated-filter";
  routeState.signalId = "";
  updateUrl(false);
  assert.equal(new URL(fakeWindow.location.href).searchParams.get("q"), "updated-filter", "Signals query must serialize to a share URL");
} finally {
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
}

assert.equal(companyRecordState(COMPANIES[0]), "", "existing company records must retain the neutral lifecycle state");
assert.equal(sourceRecordState(COMPANIES[0].events[0].source), "", "existing source records must retain the available state");
assert.equal(renderCompanyRecordState(COMPANIES[0]), "", "existing company pages must not render a lifecycle banner");
assert.match(renderCompanyRecordState({ recordStatus: "archived" }), /Archived record/, "archived records need an honest recovery state");
assert.match(renderCompanyRecordState({ stageConflict: true }), /Stage conflict under review/, "stage-conflict records need an honest recovery state");
assert.match(sourceLink({ href: "https://source.example.test/event", available: false }), /Source unavailable/, "unavailable sources need an honest recovery state");

console.log("App structure contract passed: target routes, URL restoration, lifecycle/source states, removed entries, seams, and build wiring are present.");
