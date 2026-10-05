import { COMPANIES, COMPANY_BY_ID, STAGE_ORDER } from "./data.js";

export const PUBLIC_VIEW_IDS = [
  "ranking",
  "archive",
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
export const SORT_OPTIONS = { rank: "Editorial rank", name: "Company A–Z", recent: "Latest named round" };

export const LENS_IDS = ["overview", "business", "capital", "traction", "technology", "team-network"];

export const state = {
  view: "ranking",
  stage: "seed",
  query: "",
  category: "all",
  productForm: "all",
  region: "all",
  sort: "rank",
  filtersOpen: false,
  visibleCount: 10,
  signalId: "",
  drawer: null,
  mobileNav: false,
  returnFocusId: null,
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
  const base = new URL(import.meta.url).protocol === "file:" ? "/" : new URL("./", import.meta.url).pathname;
  return `${base}companies/${encodeURIComponent(company.id)}/`;
}

export function signalUrl(company, eventItem) {
  return `?view=signals&stage=${encodeURIComponent(company.stageId)}&signal=${encodeURIComponent(eventItem.id)}`;
}

export function parseUrl() {
  const url = new URL(window.location.href);
  const pathCompany = url.pathname.match(/\/companies\/([^/]+)\/(?:index\.html)?$/)?.[1];
  const requestedView = url.searchParams.get("view") || (pathCompany ? "company" : url.pathname.includes("/editions/2026-08-22/") ? "archive" : null);
  const requestedStage = url.searchParams.get("stage");
  state.view = PUBLIC_VIEW_IDS.includes(requestedView) ? requestedView : "ranking";
  state.stage = isPublicStage(requestedStage) ? requestedStage : "seed";
  state.query = url.searchParams.get("q") || "";
  state.category = CATEGORY_OPTIONS.includes(url.searchParams.get("category")) ? url.searchParams.get("category") : "all";
  const forms = new Set(COMPANIES.map(company => company.productForm));
  const regions = new Set(COMPANIES.map(company => company.region));
  const requestedForm = url.searchParams.get("form") === "not-observed" ? "Not publicly observed" : url.searchParams.get("form");
  const requestedRegion = url.searchParams.get("region") === "not-observed" ? "Not publicly observed" : url.searchParams.get("region");
  state.productForm = forms.has(requestedForm) ? requestedForm : "all";
  state.region = regions.has(requestedRegion) ? requestedRegion : "all";
  state.sort = Object.hasOwn(SORT_OPTIONS, url.searchParams.get("sort")) ? url.searchParams.get("sort") : "rank";
  state.filtersOpen = state.productForm !== "all" || state.region !== "all";
  state.signalId = url.searchParams.get("signal") || "";
  if (state.view === "signals" && state.signalId) {
    const owner = COMPANIES.find(company => company.events.some(event => event.id === state.signalId));
    if (owner) state.stage = owner.stageId;
  }
  state.drawer = null;
  state.mobileNav = false;
  state.stageTransition = false;
  state.toast = "";
  const requestedCompany = url.searchParams.get("company") || pathCompany;
  state.companyId = requestedCompany ? (companyById(requestedCompany)?.id || requestedCompany) : defaultCompanyId(state.stage) || "";
  if (state.view === "company" && companyById(state.companyId)) state.stage = companyById(state.companyId).stageId;
  let requestedLens = "";
  try { requestedLens = url.hash.startsWith("#lens=") ? decodeURIComponent(url.hash.slice(6)) : ""; } catch { requestedLens = ""; }
  state.lens = LENS_IDS.includes(requestedLens) && state.view === "company" ? requestedLens : null;
  state.visibleCount = 10;
}

export function updateUrl(push = true) {
  const url = new URL(window.location.href);
  const signalType = url.searchParams.get("signalType");
  url.search = "";
  if (["ranking", "archive"].includes(state.view)) {
    url.searchParams.set("view", state.view);
    url.searchParams.set("stage", state.stage);
    if (state.query) url.searchParams.set("q", state.query);
    if (state.category !== "all") url.searchParams.set("category", state.category);
    if (state.productForm !== "all") url.searchParams.set("form", state.productForm);
    if (state.region !== "all") url.searchParams.set("region", state.region);
    if (state.sort !== "rank") url.searchParams.set("sort", state.sort);
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
    if (signalType) url.searchParams.set("signalType", signalType);
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
