import { COMPANY_UPDATES, REFRESH_DATE, REVIEWED_EVENTS } from "./reviewed-updates.js";
import { REFRESHED_PROFILES } from "./refreshed-profiles.js";

export { REFRESH_DATE };

const LENS_BY_TYPE = {
  funding: "capital", customer: "traction", usage: "traction", partnership: "traction",
  corporate: "traction", talent: "team", operations: "team", product: "technology",
  technology: "technology", research: "technology", openSource: "technology",
};

// Remove publication-process boilerplate, preserving the source record itself.
function conciseDescription(value) {
  return String(value || "")
    .replace("This company event is separate from the financing record and is used only where the source documents a material product, deployment, clinical, technical, manufacturing, partnership, talent, or corporate-status change.", "")
    .replace("Founder names are preserved from the cohort record; additional team detail is not publicly observed.", "")
    .trim();
}

export function applyRefresh(snapshot) {
  const company = structuredClone(snapshot);
  const change = COMPANY_UPDATES[company.id];
  const profileUpdate = REFRESHED_PROFILES[company.id];
  const additions = REVIEWED_EVENTS.filter((event) => event.companyId === company.id).map((event) => ({
    ...structuredClone(event), status: event.evidenceState, publicationDate: event.source.publicationDate,
  }));
  company.historicalFunding = company.funding;
  company.currentStage = change?.currentStage || company.stage;
  company.recordStatus = change?.recordStatus || null;
  company.refresh = {
    searchedAt: REFRESH_DATE,
    checkedAt: additions.length || change || profileUpdate ? REFRESH_DATE : null,
    profileChecked: Boolean(profileUpdate),
    change: change || null,
    addedEventCount: additions.length,
  };
  // Searching for changes is not a new review of every inherited fact.
  company.events = [...company.events, ...additions].sort((a, b) => b.date.localeCompare(a.date));
  company.signals = company.events.filter((event) => event.type !== "funding");
  const research = company.companyDetails.research;
  if (profileUpdate) {
    const profileSource = structuredClone(profileUpdate.source);
    const recordedSource = company.profile.sources.find(source => source.href === profileSource.href);
    profileSource.publicationDate ||= recordedSource?.announcementDate || null;
    company.profile = { ...company.profile, ...structuredClone(profileUpdate.profile), currentSource: profileSource };
    if (profileUpdate.summary || profileUpdate.website) {
      company.refresh.profileChange = {
        source: profileSource,
        note: [
          profileUpdate.summary ? `Product description updated. Previous: ${snapshot.summary} Current: ${profileUpdate.summary}` : "",
          profileUpdate.website ? `Website updated from ${snapshot.website.href} to ${profileUpdate.website}. The old address remains in the historical evidence.` : "",
        ].filter(Boolean).join(" "),
      };
    }
    company.audience = profileUpdate.profile.whoItServes;
    company.products = profileUpdate.profile.products;
    if (profileUpdate.website) {
      company.historicalWebsite = company.website;
      company.domain = new URL(profileUpdate.website).hostname.replace(/^www\./, "");
      company.website = { href: profileUpdate.website, label: company.domain };
      company.companyDetails.links.website = { ...profileSource, href: profileUpdate.website };
    }
    if (profileUpdate.summary) {
      company.summary = profileUpdate.summary;
      company.profile.whatItDoes = profileUpdate.summary;
    }
    // The adapter's first business fact is the original profile description.
    // Keep it in the historical evidence trail rather than repeating it as current copy.
    company.historicalProfileFact = research.business.facts.shift();
    research.business.facts.unshift({
      label: "Product and use case", title: company.name,
      detail: profileUpdate.detail, date: null, evidenceState: profileSource.evidenceState,
      source: profileSource, lastReviewed: REFRESH_DATE,
    });
  }
  for (const fact of profileUpdate?.facts || []) {
    const { lens, ...detail } = fact;
    research[lens].facts.push(structuredClone(detail));
  }
  for (const fact of research.capital.facts) {
    if (fact.label === "Latest financing") fact.label = "Historical financing record";
  }
  research.capital.totalDisclosed = change?.funding?.totalDisclosed || "Not publicly observed";
  company.profile.funding.totalDisclosed = research.capital.totalDisclosed;
  for (const event of additions) {
    const lens = LENS_BY_TYPE[event.type] || "technology";
    research[lens].facts.unshift({
      eventId: event.id,
      label: event.type === "funding" ? "Financing update" : "Reviewed update",
      title: event.title, detail: event.detail, date: event.date,
      evidenceState: event.evidenceState, source: event.source,
      lastReviewed: event.lastReviewed, whyItMatters: event.whyItMatters,
    });
  }
  if (change?.funding) {
    company.funding = { ...change.funding, evidenceState: "Direct" };
    company.profile.funding = {
      ...company.profile.funding, latestRoundDate: company.funding.date,
      latestRoundAmount: company.funding.amount, latestRoundStage: company.funding.stage,
    };
    research.capital.leadInvestor = change.funding.leadInvestor;
    research.capital.notableBackers = change.funding.notableBackers;
  }
  const rawFounderSource = company.founders?.source;
  const founderSource = typeof rawFounderSource === "string"
    ? { href: rawFounderSource, relationship: "Founder reference", evidenceState: company.founders.evidenceState, asOf: company.cohortCutoff }
    : rawFounderSource && { ...rawFounderSource, href: rawFounderSource.href || rawFounderSource.url };
  if (founderSource?.href) {
    research.network.connections.founders = company.founders.names.map(title => ({ title, source: founderSource }));
  }
  if (change?.funding) {
    research.network.connections.investors = [change.funding.leadInvestor, ...change.funding.notableBackers]
      .filter(Boolean).map(title => ({ title, date: change.funding.date, source: change.source }));
  }
  research.capital.disclosedRoundCount = `${company.events.filter((event) => event.type === "funding").length} financing record(s) in this index`;
  for (const event of company.events) {
    event.detail = event.id === `${company.id}-funding`
      ? `${company.historicalFunding.amount} ${company.historicalFunding.stage}.`
      : conciseDescription(event.detail);
  }
  for (const lens of Object.values(research)) {
    for (const fact of lens.facts || []) {
      const event = fact.eventId && company.events.find(item => item.id === fact.eventId);
      fact.detail = event ? event.detail : conciseDescription(fact.detail);
    }
  }
  return company;
}
