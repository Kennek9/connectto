import { REFRESH_DATE, formatDate, searchIcon } from "./shared.js";
import { state } from "./state.js";

const viewUrl = (view, params = {}) => `?${new URLSearchParams({ view, ...params })}`;

export function renderHeader() {
  return `<header class="site-header">
    <div class="publication-line"><span>Private markets <span aria-hidden="true">/</span> Artificial intelligence</span><span>Research edition <time datetime="${REFRESH_DATE}">${formatDate(REFRESH_DATE)}</time></span></div>
    <div class="header-inner journal-header">
      <a class="brand" href="${viewUrl("ranking", { stage: "seed" })}" aria-label="Top Seed home"><span class="brand-seal" aria-hidden="true">ts</span>Top Seed<span class="brand-period" aria-hidden="true">.</span></a>
      <nav class="primary-nav" aria-label="Primary">
        ${[["ranking", "Rankings"], ["signals", "Signals"]].map(([view, label]) => `<a id="${view}-nav-link" class="nav-link ${state.view === view || (view === "ranking" && state.view === "archive") ? "is-active" : ""}" href="${viewUrl(view, { stage: state.stage })}"${state.view === view ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
        <a id="search-trigger" class="nav-link nav-search ${state.view === "search" ? "is-active" : ""}" href="${viewUrl("search")}" aria-label="Search companies">${searchIcon()}<span>Search</span><kbd aria-hidden="true">⌘ K</kbd></a>
      </nav>
    </div>
  </header>`;
}

export function renderFooter() {
  return `<footer class="site-footer"><div class="footer-inner journal-footer"><div><a class="footer-brand" href="?view=ranking&stage=seed">Top Seed.</a><p>AI company research · Public-source evidence</p></div><nav aria-label="Site policies">${[["methodology", "Methodology"], ["evidence-policy", "Evidence policy"], ["corrections", "Corrections"], ["about", "About"]].map(([view, label]) => `<a href="${viewUrl(view)}">${label}</a>`).join("")}</nav></div></footer>`;
}
