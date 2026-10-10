import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { COMPANIES, AS_OF, REFRESH_DATE, SNAPSHOT_COMPANIES, HISTORICAL_AS_OF, STAGE_ORDER } from "../data.js";
import { companySources } from "../evidence.js";
import { state } from "../state.js";
import { renderCompany } from "../pages/company-signals-search.js";
import { renderArchive } from "../pages/archive.js";
import { renderRanking } from "../pages/ranking.js";
import { renderHeader, renderFooter } from "../shell.js";
import { escapeHtml } from "../shared.js";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
for (const file of ["tokens.css", "app.js", "router.js", "state.js", "shared.js", "shell.js", "data.js", "edition.js", "edition-candidates.js", "ranking-edition.js", "canonical-data.js", "seed-top20-research.js", "evidence.js", "source-access.js", "refresh.js", "refreshed-profiles.js", "reviewed-updates.js", "favicon.svg", "editorial.css"]) {
  await cp(file, `dist/${file}`);
}
const html = await readFile("index.html", "utf8");
const template = html.replace(/    <noscript>[\s\S]*?<\/noscript>\n/, "");
function documentFor(content, { title, description, depth = "", company = null }) {
  const app = `${renderHeader()}${content}${renderFooter()}`;
  let result = template.replace('<div id="app"></div>', `<div id="app">${app}</div>`)
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*("\s*\/>)/, (_, before, after) => `${before}${escapeHtml(description)}${after}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, (_, before) => `${before}${escapeHtml(title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, (_, before) => `${before}${escapeHtml(description)}`);
  if (depth) result = result.replace(/(href|src)="(tokens\.css|editorial\.css|favicon\.svg|canonical-data\.js|app\.js|assets\/fonts\/[^"]+)"/g, `$1="${depth}$2"`).replace(/href="\?/g, `href="${depth}?`);
  if (company) {
    const structured = { "@context": "https://schema.org", "@type": "Article", headline: `${company.name}: public evidence and company research`, description, dateModified: company.refresh.checkedAt || AS_OF, author: { "@type": "Organization", name: "Top Seed" }, about: { "@type": "Organization", name: company.name, url: company.website.href }, citation: companySources(company).map(source => source.href) };
    result = result.replace("</head>", `<script type="application/ld+json">${JSON.stringify(structured).replaceAll("<", "\\u003c")}</script>\n  </head>`);
  }
  return result;
}
state.view = "ranking";
state.stage = "seed";
await mkdir("dist/evidence", { recursive: true });
await writeFile("dist/index.html", documentFor(renderRanking(), { title: "Top Seed · AI company evidence index", description: `Explore AI companies, original sources, financing and product evidence. Ranking edition ${AS_OF}; evidence refresh ${REFRESH_DATE}.` }));
for (const company of COMPANIES) {
  state.view = "company";
  state.companyId = company.id;
  state.stage = company.stageId;
  await mkdir(`dist/companies/${company.id}`, { recursive: true });
  const evidence = { company: company.name, id: company.id, summary: company.summary, currentStage: company.currentStage, rankingStage: company.stage, rankingDate: AS_OF, rank: company.editorialRank, historicalRanking: company.historicalRanking, rankingReview: company.rankingReview, status: company.selectionStatus, refresh: company.refresh, funding: company.funding, events: company.events, sources: companySources(company) };
  await writeFile(`dist/evidence/${company.id}.json`, JSON.stringify(evidence, null, 2) + "\n");
  await writeFile(`dist/companies/${company.id}/index.html`, documentFor(renderCompany(), { title: `${company.name} · Public evidence | Top Seed`, description: company.summary, depth: "../../", company }));
}
await mkdir(`dist/editions/${HISTORICAL_AS_OF}`, { recursive: true });
await writeFile(`dist/editions/${HISTORICAL_AS_OF}/evidence.json`, JSON.stringify({ date: HISTORICAL_AS_OF, companies: SNAPSHOT_COMPANIES }, null, 2) + "\n");
state.view = "archive";
state.stage = "seed";
await writeFile(`dist/editions/${HISTORICAL_AS_OF}/index.html`, documentFor(renderArchive(), { title: `Top Seed · Archived edition ${HISTORICAL_AS_OF}`, description: "Original ranking order and evidence, preserved for comparison.", depth: "../../" }));
await writeFile(`dist/evidence/ranking-${AS_OF}.json`, JSON.stringify({ date: AS_OF, stages: STAGE_ORDER.filter(stage => stage.open), decisions: COMPANIES.map(company => ({ id: company.id, name: company.name, stage: company.currentStage, rank: company.editorialRank, historicalRanking: company.historicalRanking, ...company.rankingReview })) }, null, 2) + "\n");
await cp("pages", "dist/pages", { recursive: true });
await cp("assets", "dist/assets", { recursive: true });
console.log(`Static build complete: dist/ with ${COMPANIES.length} pre-rendered company pages and source libraries.`);
