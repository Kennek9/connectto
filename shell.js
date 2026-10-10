import { AS_OF, REFRESH_DATE, formatDate, searchIcon } from "./shared.js";
import { state } from "./state.js";

const viewUrl = (view, params = {}) => `?${new URLSearchParams({ view, ...params })}`;

export function renderHeader() {
  return `<header class="site-header">
    <div class="header-inner">
      <a class="brand" href="${viewUrl("ranking", { stage: "seed" })}" aria-label="Top Seed home"><span class="brand-name">Top Seed</span><span class="brand-line">Private AI financing · Seed to Series C</span></a>
      <nav class="primary-nav" aria-label="Primary">
        ${[["ranking", "Rankings"], ["signals", "Signals"]].map(([view, label]) => `<a id="${view}-nav-link" class="nav-link ${state.view === view || (view === "ranking" && state.view === "archive") ? "is-active" : ""}" href="${viewUrl(view, { stage: state.stage })}"${state.view === view ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
        <a id="search-trigger" class="nav-link nav-search ${state.view === "search" ? "is-active" : ""}" href="${viewUrl("search")}" aria-label="Search companies">${searchIcon()}<span>Search</span><kbd aria-hidden="true">⌘ K</kbd></a>
        <a class="nav-link nav-method ${state.view === "methodology" ? "is-active" : ""}" href="${viewUrl("methodology")}">Method</a>
      </nav>
      <p class="header-edition">Edition <time datetime="${AS_OF}">${formatDate(AS_OF)}</time><span>Evidence checked ${formatDate(REFRESH_DATE)}</span></p>
    </div>
  </header>`;
}

export function renderFooter() {
  return `<footer class="site-footer"><div class="footer-inner"><div><a class="footer-brand" href="?view=ranking&stage=seed">Top Seed</a><p>Rankings are editorial judgments built from public evidence. They are not prices, returns or investment advice.</p></div><nav aria-label="Site policies">${[["methodology", "Methodology"], ["evidence-policy", "Evidence policy"], ["corrections", "Corrections"], ["about", "About"]].map(([view, label]) => `<a href="${viewUrl(view)}">${label}</a>`).join("")}</nav></div></footer>`;
}
