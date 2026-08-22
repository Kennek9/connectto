import { AS_OF, COMPANIES } from "./shared.js";
import { PUBLIC_STAGE_IDS, state } from "./state.js";

const viewUrl = (view, params = {}) => {
  const query = new URLSearchParams({ view, ...params });
  return `?${query.toString()}`;
};

const primaryNavigation = [
  ["ranking", "Ranking", viewUrl("ranking", { stage: state.stage })],
  ["signals", "Signals", viewUrl("signals", { stage: state.stage })],
  ["search", "Search", viewUrl("search")],
];

const navLink = ([view, label, href]) => `<a id="${view === "search" ? "search-trigger" : `${view}-nav-link`}" class="nav-link ${state.view === view ? "is-active" : ""}" href="${href}"${state.view === view ? ' aria-current="page"' : ""}>${label}${view === "search" ? ' <kbd>⌘K</kbd>' : ""}</a>`;

export function renderHeader() {
  return `<header class="site-header"><div class="utility-bar"><div class="header-inner utility-inner"><a class="brand" href="${viewUrl("ranking", { stage: "seed" })}" aria-label="Top Seed home"><span class="brand-monogram" aria-hidden="true">TS</span><span class="brand-name"><span>Top</span><span>Seed</span></span></a><span class="header-context">Public evidence index</span><span class="header-date">Reviewed through ${AS_OF}</span></div></div><div class="header-inner header-nav"><nav class="primary-nav" aria-label="Primary">${primaryNavigation.map(navLink).join("")}</nav></div></header>`;
}

export function renderFooter() {
  const stageLabels = { seed: "Seed", "series-a": "Series A", "series-b": "Series B", "series-c": "Series C" };
  const stageLinks = PUBLIC_STAGE_IDS.map((stageId) => `<a href="${viewUrl("ranking", { stage: stageId })}">${stageLabels[stageId] || stageId} ranking</a>`).join("");
  return `<footer class="site-footer"><div class="footer-inner"><div class="footer-lead"><div class="footer-brand"><span>Top</span><span>Seed</span></div><p>AI companies ranked by public evidence.</p></div><div class="footer-groups"><div><span class="section-kicker">Explore</span>${stageLinks}<a href="${viewUrl("signals", { stage: state.stage })}">Signals</a><a href="${viewUrl("search")}">Search</a></div><div><span class="section-kicker">Trust</span><a href="${viewUrl("methodology")}">Methodology</a><a href="${viewUrl("evidence-policy")}">Evidence policy</a><a href="${viewUrl("corrections")}">Corrections</a><a href="${viewUrl("about")}">About</a></div></div></div><div class="footer-bottom"><span>Updated ${AS_OF} · ${COMPANIES.length} reviewed records · no paid rank</span><span>Editorial beta · source-linked records</span></div></footer>`;
}
