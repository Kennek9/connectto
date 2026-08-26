import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
for (const file of ["tokens.css", "app.js", "router.js", "state.js", "shared.js", "shell.js", "data.js", "canonical-data.js", "seed-top20-research.js", "favicon.svg"]) {
  await cp(file, `dist/${file}`);
}
const [html, tokens, styles] = await Promise.all(["index.html", "tokens.css", "styles.css"].map((file) => readFile(file, "utf8")));
await writeFile("dist/index.html", html.replace('    <link rel="stylesheet" href="tokens.css" />\n', ""));
await writeFile("dist/styles.css", `${tokens}\n${styles}`);
await cp("pages", "dist/pages", { recursive: true });
await cp("assets", "dist/assets", { recursive: true });
console.log("Static build complete: dist/");
