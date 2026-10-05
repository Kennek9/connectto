import { writeFile, mkdir } from "node:fs/promises";
import { COMPANIES } from "../data.js";
import { companySources } from "../evidence.js";

// Transport checks are deliberately separate from editorial claim verification.
const urls = [...new Set(COMPANIES.flatMap((company) => companySources(company).map((source) => source.href)))];
const results = [];
let cursor = 0;
async function check(url) {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(12000),
      headers: { "User-Agent": "TopSeed-SourceCheck/1.0", Range: "bytes=0-8191" },
    });
    await response.body?.cancel();
    return { url, status: response.status, finalUrl: response.url, result: response.ok ? "reachable" : [404, 410].includes(response.status) ? "not-found" : "access-unconfirmed" };
  } catch (error) {
    return { url, status: null, result: "access-unconfirmed", error: error.name };
  }
}
await Promise.all(Array.from({ length: 16 }, async () => {
  while (cursor < urls.length) {
    const url = urls[cursor++];
    results.push(await check(url));
    if (results.length % 100 === 0) console.log(`Checked ${results.length}/${urls.length} source URLs`);
  }
}));
const counts = results.reduce((summary, item) => ({ ...summary, [item.result]: (summary[item.result] || 0) + 1 }), {});
await mkdir("research", { recursive: true });
await writeFile("research/source-check.json", JSON.stringify({ checkedAt: new Date().toISOString(), scope: "HTTP accessibility only; 403, timeouts, and network failures do not prove that a source is dead or a claim is false.", counts, results: results.sort((a, b) => a.url.localeCompare(b.url)) }, null, 2) + "\n");
console.log(JSON.stringify({ total: urls.length, ...counts }));

const checks = Object.fromEntries(results.map(({ url, result, status }) => [url, { result, status }]));
await writeFile("source-access.js", `// Generated HTTP checks; this is not claim verification.\nexport const SOURCE_ACCESS_DATE = ${JSON.stringify(new Date().toISOString().slice(0, 10))};\nexport const SOURCE_ACCESS = ${JSON.stringify(checks, null, 2)};\n`);
