import { COMPANIES, COMPANY_BY_ID, STAGE_ORDER } from "./data.js";

export const PUBLIC_VIEW_IDS = [
  "ranking",
  "company",
  "signals",
  "search",
  "methodology",
  "evidence-policy",
  "corrections",
  "about",
];

export const PUBLIC_STAGE_IDS = ["seed", "series-a", "series-b", "series-c"];
export const CATEGORY_OPTIONS = [
  "all",
  "Foundation Models & Research",
  "Data, Infrastructure & Developer Tools",
  "Compute, Chips & Data Centers",
  "Robotics, Autonomy & Defense",
  "Horizontal Applications",
  "Vertical Applications",
  "AI Science, Biotech & Healthcare",
];
export const LENS_IDS = ["business", "capital", "traction", "technology", "team-network"];

export const state = {
  view: "ranking",
  stage: "seed",
  query: "",
  category: "all",
  visibleCount: 10,
  signalId: "",
  drawer: null,
  mobileNav: false,
  returnFocusId: null,
  logoInspector: null,
  logoInspectorReturnFocusId: null,
  lens: null,
  stageTransition: false,
  companyId: "airweave",
  toast: "",
};

export function stageById(id) {
  return STAGE_ORDER.find((item) => item.id === id) || STAGE_ORDER[0];
}

export function isPublicStage(id) {
  return PUBLIC_STAGE_IDS.includes(id);
}

export function companyById(id) {
  return COMPANY_BY_ID[id] || null;
}

export function defaultCompanyId(stageId = state.stage) {
  return COMPANIES.find((company) => company.stageId === stageId)?.id || null;
}

export function companyUrl(company) {
  return `?view=company&stage=${encodeURIComponent(company.stageId)}&company=${encodeURIComponent(company.id)}`;
}

export function signalUrl(company, eventItem) {
  return `?view=signals&stage=${encodeURIComponent(company.stageId)}&signal=${encodeURIComponent(eventItem.id)}`;
}

export function parseUrl() {
  const url = new URL(window.location.href);
  const requestedView = url.searchParams.get("view");
  const requestedStage = url.searchParams.get("stage");
  state.view = PUBLIC_VIEW_IDS.includes(requestedView) ? requestedView : "ranking";
  state.stage = isPublicStage(requestedStage) ? requestedStage : "seed";
  state.query = url.searchParams.get("q") || "";
  state.category = CATEGORY_OPTIONS.includes(url.searchParams.get("category")) ? url.searchParams.get("category") : "all";
  state.signalId = url.searchParams.get("signal") || "";
  state.drawer = null;
  state.mobileNav = false;
  state.logoInspector = null;
  state.logoInspectorReturnFocusId = null;
  state.stageTransition = false;
  state.toast = "";
  const requestedCompany = url.searchParams.get("company");
  state.companyId = requestedCompany ? (companyById(requestedCompany)?.id || requestedCompany) : defaultCompanyId(state.stage) || "";
  let requestedLens = "";
  try { requestedLens = url.hash.startsWith("#lens=") ? decodeURIComponent(url.hash.slice(6)) : ""; } catch { requestedLens = ""; }
  state.lens = LENS_IDS.includes(requestedLens) && state.view === "company" ? requestedLens : null;
  state.visibleCount = 10;
}

export function updateUrl(push = true) {
  const url = new URL(window.location.href);
  url.search = "";
  if (state.view === "ranking") {
    url.searchParams.set("view", "ranking");
    url.searchParams.set("stage", state.stage);
    if (state.query) url.searchParams.set("q", state.query);
    if (state.category !== "all") url.searchParams.set("category", state.category);
  } else if (state.view === "company") {
    const company = companyById(state.companyId);
    if (company) {
      url.searchParams.set("view", "company");
      url.searchParams.set("stage", company.stageId);
      url.searchParams.set("company", company.id);
    } else {
      url.searchParams.set("view", "ranking");
      url.searchParams.set("stage", state.stage);
    }
  } else if (state.view === "signals") {
    url.searchParams.set("view", "signals");
    url.searchParams.set("stage", state.stage);
    if (state.query) url.searchParams.set("q", state.query);
    if (state.signalId) url.searchParams.set("signal", state.signalId);
  } else if (state.view === "search") {
    url.searchParams.set("view", "search");
    if (state.query) url.searchParams.set("q", state.query);
  } else {
    url.searchParams.set("view", state.view);
  }
  url.hash = state.view === "company" && state.lens ? `lens=${encodeURIComponent(state.lens)}` : "";
  window.history[push ? "pushState" : "replaceState"]({}, "", url);
}
