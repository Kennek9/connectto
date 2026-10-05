import { companyById, parseUrl, PUBLIC_STAGE_IDS, stageById, state, updateUrl } from "./state.js";
import { renderFooter, renderHeader } from "./shell.js";
import { filteredCompanies, renderRanking, rankingPreviewMarkup } from "./pages/ranking.js";
import { renderCompany, renderEvidenceDrawer, renderRankAuditDrawer, renderSearch, renderSignals } from "./pages/company-signals-search.js";
import { renderTrustPage } from "./pages/trust.js";

const pageForView = () => {
  if (state.view === "company") return renderCompany();
  if (state.view === "signals") return renderSignals();
  if (state.view === "search") return renderSearch();
  if (["methodology", "evidence-policy", "corrections", "about"].includes(state.view)) return renderTrustPage(state.view);
  return renderRanking();
};

const pageTitle = () => {
  if (state.view === "company") return `Top Seed · ${companyById(state.companyId)?.name || "Company"}`;
  if (state.view === "ranking") return `Top Seed · ${stageById(state.stage).label}`;
  if (state.view === "signals") return "Top Seed · Signals";
  if (state.view === "search") return "Top Seed · Search";
  return `Top Seed · ${state.view.replace("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}`;
};

function focusableElements(panel) {
  return [...panel.querySelectorAll("a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])")].filter((item) => !item.hidden && item.offsetParent !== null);
}

function trapOverlayFocus(event) {
  if (event.key !== "Tab") return;
  const panel = document.querySelector("[data-overlay-panel]");
  if (!panel) return;
  const focusables = focusableElements(panel);
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export function render(options = {}) {
  const app = document.querySelector("#app");
  if (!app) return;
  app.innerHTML = `${renderHeader()}${pageForView()}${renderFooter()}${renderEvidenceDrawer(state.drawer)}${renderRankAuditDrawer(state.drawer)}`;
  document.body.classList.toggle("has-overlay", Boolean(state.drawer));
  document.title = pageTitle();
  const basePath = new URL("./", import.meta.url).pathname;
  for (const link of app.querySelectorAll('a[href^="?"]')) link.setAttribute("href", basePath + link.getAttribute("href"));
  const company = state.view === "company" ? companyById(state.companyId) : null;
  const description = company?.summary || "Explore AI companies, original sources, financing and product evidence.";
  document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  document.querySelector('meta[property="og:title"]')?.setAttribute("content", document.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
  if (options.restoreFocusId) requestAnimationFrame(() => {
    const element = document.getElementById(options.restoreFocusId);
    element?.focus({ preventScroll: true });
    if (options.selection && element?.setSelectionRange) element.setSelectionRange(...options.selection);
  });
  if (state.lens && state.view === "company") requestAnimationFrame(() => {
    const tabs = document.querySelector(".workspace-tabs");
    const active = document.querySelector(".workspace-tab.is-active");
    if (tabs && active) tabs.scrollLeft = Math.max(0, active.offsetLeft - Math.max(0, (tabs.clientWidth - active.offsetWidth) / 2));
  });
  if (state.signalId && state.view === "signals") requestAnimationFrame(() => document.getElementById(`signal-${state.signalId}`)?.scrollIntoView({ block: "center" }));

}

function setDrawer(drawer, returnFocusId = null) {
  state.drawer = drawer;
  state.returnFocusId = returnFocusId;
  render();
  requestAnimationFrame(() => document.querySelector("[data-overlay-panel] button, [data-overlay-panel] input")?.focus());
}

function closeDrawer() {
  const focusId = state.returnFocusId;
  state.drawer = null;
  state.returnFocusId = null;
  render({ restoreFocusId: focusId });
}


function handleInput(event) {
  const action = event.target.dataset.action;
  if (!["ranking-search", "signals-search", "search-page-input"].includes(action)) return;
  state.query = event.target.value;
  state.visibleCount = 10;
  updateUrl(false);
  render({ restoreFocusId: event.target.id, selection: [event.target.selectionStart, event.target.selectionEnd] });
}

function handleChange(event) {
  if (event.target.dataset.action !== "set-category") return;
  state.category = event.target.value;
  state.visibleCount = 10;
  updateUrl();
  render({ restoreFocusId: "category-filter" });
}

function handleClick(event) {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  if (["open-evidence", "open-rank-audit", "close-drawer", "toggle-mobile-nav", "set-stage", "toggle-lens", "load-more", "load-more-signals", "load-more-search", "show-all", "reset-ranking-filter", "reset-signals-filter", "share"].includes(action)) event.preventDefault();
  if (action === "open-evidence") setDrawer({ type: "evidence", companyId: target.dataset.company, eventId: target.dataset.event }, target.id || null);
  if (action === "open-rank-audit") setDrawer({ type: "rank", companyId: target.dataset.company }, target.id || null);
  if (action === "close-drawer" && (event.target === target || target.classList.contains("drawer-close"))) closeDrawer();
  if (action === "toggle-mobile-nav") { state.mobileNav = !state.mobileNav; render({ restoreFocusId: target.id }); }
  if (action === "set-stage") {
    if (!PUBLIC_STAGE_IDS.includes(target.dataset.stage)) return;
    state.stage = target.dataset.stage;
    state.view = "ranking";
    state.query = "";
    state.category = "all";
    state.signalId = "";
    state.visibleCount = 10;
    state.mobileNav = false;
    state.lens = null;
    state.stageTransition = true;
    updateUrl();
    render({ restoreFocusId: target.id });
    window.setTimeout(() => { state.stageTransition = false; document.querySelector(".ranking-page")?.classList.remove("stage-transition"); }, 260);
  }
  if (action === "toggle-lens") { state.lens = state.lens === target.dataset.lens ? null : target.dataset.lens; updateUrl(false); render({ restoreFocusId: target.id }); }
  if (action === "load-more") { state.visibleCount += 10; render({ restoreFocusId: target.id }); }
  if (action === "load-more-signals") { state.visibleCount += 20; render({ restoreFocusId: target.id }); }
  if (action === "load-more-search") { state.visibleCount += 10; render({ restoreFocusId: target.id }); }
  if (action === "show-all") { state.visibleCount = filteredCompanies().length; render({ restoreFocusId: target.id }); }
  if (action === "reset-ranking-filter") { state.query = ""; state.category = "all"; state.visibleCount = 10; updateUrl(false); render(); }
  if (action === "reset-signals-filter") { const url = new URL(window.location.href); url.searchParams.delete("signalType"); window.history.replaceState({}, "", url); state.query = ""; state.signalId = ""; state.visibleCount = 10; updateUrl(false); render(); }
  if (action === "share") navigator.clipboard?.writeText(window.location.href).then(() => { state.toast = "Link copied"; render(); window.setTimeout(() => { state.toast = ""; render(); }, 1600); }).catch(() => { state.toast = "Copy unavailable"; render(); });
}

function handleKeydown(event) {
  if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key) && event.target.matches('[role="tab"]')) {
    const tabs = [...event.target.closest('[role="tablist"]').querySelectorAll('[role="tab"]')];
    const index = tabs.indexOf(event.target);
    const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    event.preventDefault();
    tabs[next].click();
    return;
  }
  if (event.key === "Tab") trapOverlayFocus(event);
  if (event.key === "Escape") {
    if (state.drawer) { closeDrawer(); event.preventDefault(); return; }
    if (state.lens) { const focusId = document.activeElement?.id || `lens-toggle-${state.lens}`; state.lens = null; updateUrl(false); render({ restoreFocusId: focusId }); event.preventDefault(); return; }
    if (state.mobileNav) { state.mobileNav = false; render({ restoreFocusId: "mobile-menu-trigger" }); event.preventDefault(); return; }
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    state.view = "search";
    state.mobileNav = false;
    state.visibleCount = 10;
    updateUrl();
    render();
    requestAnimationFrame(() => document.getElementById("search-page-input")?.focus());
  }
}

let previewHideTimer;
function showRankingPreview(target) {
  const row = target.closest?.(".ranking-row");
  const preview = document.querySelector("#ranking-preview");
  if (!row || !preview) return;
  const company = companyById(row.dataset.company);
  if (!company) return;
  preview.innerHTML = rankingPreviewMarkup(company);
  preview.hidden = false;
}

function queuePreviewHide() {
  window.clearTimeout(previewHideTimer);
  previewHideTimer = window.setTimeout(() => {
    if (!document.querySelector(".ranking-row:hover") && !document.activeElement?.closest(".ranking-row")) document.querySelector("#ranking-preview")?.setAttribute("hidden", "");
  }, 40);
}

export function startApp() {
  parseUrl();
  document.addEventListener("input", handleInput);
  document.addEventListener("change", handleChange);
  document.addEventListener("click", handleClick);
  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("pointerover", (event) => { if (event.target.closest?.(".ranking-row")) showRankingPreview(event.target); });
  document.addEventListener("pointerout", (event) => { const row = event.target.closest?.(".ranking-row"); if (row && !row.contains(event.relatedTarget)) queuePreviewHide(); });
  document.addEventListener("focusin", (event) => { if (event.target.closest?.(".ranking-row")) showRankingPreview(event.target); });
  document.addEventListener("focusout", (event) => { if (event.target.closest?.(".ranking-row")) queuePreviewHide(); });
  window.addEventListener("popstate", () => { state.drawer = null; parseUrl(); render(); });
  render();
}
