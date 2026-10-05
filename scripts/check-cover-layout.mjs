import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { renderRanking } from "../pages/ranking.js";
import { state } from "../state.js";

// The approved editorial redesign replaces the old three-card cover.
// Preserve ranked discovery and filter behavior; browser QA checks geometry.
const before = { ...state };
try {
  state.stage = "seed";
  state.query = "";
  state.category = "all";
  state.visibleCount = 10;
  const index = renderRanking();
  assert.match(index, /The Seed edition/);
  assert.equal((index.match(/class="featured-company /g) || []).length, 3);
  assert.equal((index.match(/class="ranking-row"/g) || []).length, 10);
  assert.match(index, /aria-label="Funding stage"/);
  assert.match(index, /id="stage-content"/);
  assert.match(index, /id="ranking-list-title"/);
  assert.match(index, /Recent evidence/);
  assert.doesNotMatch(index, /Top three with the clearest proof|Evidence first\. Context visible/);

  state.query = "Bauplan";
  const filtered = renderRanking();
  assert.equal((filtered.match(/class="ranking-row"/g) || []).length, 1);
  assert.match(filtered, /aria-label="Rank 20"/);
  assert.doesNotMatch(filtered, /class="featured-edition"/);

  state.query = "Wafer";
  assert.match(renderRanking(), /No companies match/);
  state.query = "zz-no-company-zz";
  assert.match(renderRanking(), /Clear filters/);
} finally {
  Object.assign(state, before);
}
const template = await readFile("index.html", "utf8");
const build = await readFile("scripts/build.mjs", "utf8");
assert.match(template, /href="editorial.css"/);
assert.match(build, /editorial\.css/);
console.log("Editorial index contract passed: featured records, complete index, stable filtered ranks, excluded records and style build wiring.");
