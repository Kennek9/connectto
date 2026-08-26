import { cp, mkdir, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
for (const file of ["index.html", "styles.css", "app.js", "router.js", "state.js", "shared.js", "shell.js", "data.js", "canonical-data.js", "seed-top20-research.js", "favicon.svg"]) {
  await cp(file, `dist/${file}`);
}
await cp("pages", "dist/pages", { recursive: true });
await cp("assets", "dist/assets", { recursive: true });
console.log("Static build complete: dist/");
