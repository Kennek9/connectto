import { REFRESH_DATE, formatDate } from "./shared.js";
import { state } from "./state.js";

const viewUrl = (view, params = {}) => `?${new URLSearchParams({ view, ...params })}`;

export function renderHeader() {
  const links = [["ranking", "Ranking"], ["signals", "Signals"], ["search", "Search"]];
  return `<header class="site-header"><div class="header-inner journal-header"><a class="brand" href="${viewUrl("ranking", { stage: "seed" })}" aria-label="Top Seed home">Top Seed</a><nav class="primary-nav" aria-label="Primary">${links.map(([view, label]) => `<a id="${view === "search" ? "search-trigger" : `${view}-nav-link`}" class="nav-link ${state.view === view ? "is-active" : ""}" href="${viewUrl(view, view === "search" ? {} : { stage: state.stage })}"${state.view === view ? ' aria-current="page"' : ""}>${label}</a>`).join("")}</nav><time class="header-date" datetime="${REFRESH_DATE}">${formatDate(REFRESH_DATE)}</time></div></header>`;
}

export function renderFooter() {
  return `<footer class="site-footer"><div class="footer-inner journal-footer"><a class="footer-brand" href="?view=ranking&stage=seed">Top Seed</a><nav aria-label="Site policies">${[["methodology", "Methodology"], ["evidence-policy", "Evidence policy"], ["corrections", "Corrections"], ["about", "About"]].map(([view, label]) => `<a href="${viewUrl(view)}">${label}</a>`).join("")}</nav></div></footer>`;
}
