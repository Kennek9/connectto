import { EDITION_DATE, EDITION_RANKINGS, EDITION_ALTERNATES, METHOD_VERSION } from "./ranking-edition.js";

export { EDITION_DATE, EDITION_RANKINGS, EDITION_ALTERNATES, METHOD_VERSION };
const LABELS = { seed: "Seed", "series-a": "Series A", "series-b": "Series B", "series-c": "Series C" };
const STAGES = Object.fromEntries(Object.entries(LABELS).map(([id, label]) => [label, id]));
const entries = new Map(Object.entries(EDITION_RANKINGS).flatMap(([stageId, rows]) => rows.map(([id, rationale], index) => [id, { stageId, rank: index + 1, rationale }])));

const source = (href, relationship, publicationDate = null, evidenceState = "Direct") => ({
  href, label: relationship, relationship, publicationDate, lastChecked: EDITION_DATE, evidenceState,
});

const CORRECTIONS = {
  "resolve-ai": {
    amount: "$125M", stage: "Series A", date: "2026-02-04",
    url: "https://resolve.ai/news/resolveai-raises-125-million-series-a",
    note: "The formal company release reports a $125M Series A on 4 February 2026. It replaces the previous $40M / 16 April entry; this is a correction, not another round.",
  },
  "browser-use": {
    amount: "$17M", stage: "Seed", date: "2025-03-22",
    url: "https://browser-use.com/posts/seed-round",
    note: "The company announcement is dated 22 March 2025. The previous 29 January date is retained only in the archived edition.",
  },
  "n8n": {
    amount: "$180M", stage: "Series C", date: "2025-10-09",
    url: "https://blog.n8n.io/series-c/",
    note: "The company announcement specifies US dollars, not euros. This corrects the currency of the same round.",
  },
  "nexos-ai": {
    amount: "$30M", stage: "Series A", date: "2025-09-29", publicationDate: "2025-10-21",
    url: "https://nexos.ai/blog/nexos-funding-announcement/",
    note: "The announcement body specifies $30M and a 29 September dateline; the page displays 21 October. The dollar amount replaces the previous euro amount; both dates remain explicit.",
  },
};

const EXCLUSIONS = {
  xtend: {
    status: "archived", reason: "public", title: "XTEND completes its public-company combination", date: "2026-09-03",
    source: source("https://www.nasdaqtrader.com/TraderNews.aspx?id=ECA2026-630", "Exchange corporate action", "2026-09-03"),
    detail: "The JFB and XTEND business combination closed after market on 3 September. XTND trading on the NYSE began on 4 September. XTEND is excluded from the private-company ranking.",
  },
  "arize-ai": {
    status: "archived", reason: "acquired", title: "Dynatrace completes its acquisition of Arize", date: "2026-10-01",
    source: source("https://www.dynatrace.com/news/blog/dynatrace-completes-acquisition-of-arize/", "Acquirer announcement", "2026-10-01"),
    detail: "Dynatrace confirmed completion of its Arize acquisition on 1 October. Continued availability of Arize products does not make it an independent company for this ranking.",
  },
  "terray-therapeutics": {
    status: "stage-conflict", reason: "stage-unconfirmed",
    source: source("https://forgeglobal.com/terray-therapeutics_stock/", "Private-market data provider", null, "Reported"),
    detail: "Forge lists a $125M Series C dated 9 September 2026, while the retained primary financing record is Series B. A matching primary announcement was not located. Excluded pending confirmation; not silently promoted or left in Series B.",
  },
};

const ADDITIONAL_EVENTS = {
  "general-intuition": {
    id: "general-intuition-2026-09-capital", type: "funding", date: "2026-09-29",
    title: "General Intuition raises $220M in an unnamed round",
    detail: "Investor Coalition Capital reports $220M of new financing at a $6.2B valuation. The source does not name the equity stage; the last confirmed named stage remains Series A.",
    source: source("https://www.coalition.vc/en/news/proudly-doubling-down-on-general-intuition", "Investor announcement", "2026-09-29"),
  },
  livekit: {
    id: "livekit-loophole-2026-09", type: "corporate", date: "2026-09-24",
    title: "LiveKit acquires Loophole Labs",
    detail: "LiveKit announced the acquisition of Loophole Labs and its eight-person engineering team. Integration and faster agent startup are planned outcomes, not confirmed production results.",
    source: source("https://www.eznewswire.com/newsroom/livekit-acquires-loophole-labs-ai-agent-infrastructure", "Company-provided press release", "2026-09-24"),
  },
};

export function adaptEditionCandidate(record, adaptCompany) {
  const fundingSource = source(record.fundingUrl, record.relationship, record.date, record.fundingState || "Direct");
  const productSource = source(record.productUrl, record.productUrl === record.fundingUrl ? record.relationship : "Company product material", null);
  const founderEvidence = source(record.founderUrl || record.fundingUrl, record.founderUrl ? "Company or investor team material" : record.relationship);
  const raw = {
    id: record.id, name: record.name, website: record.website, summary: record.summary,
    marketCategoryLabel: record.category, region: record.region, hq: record.hq, productForm: record.productForm,
    founders: { names: record.founders, source: founderEvidence, evidenceState: "Direct" },
    latestRound: { amount: record.amount, round: record.round, stage: record.round, eventDate: record.date, publishedAt: record.date, source: fundingSource, sourceStatus: record.fundingState || "Direct", note: record.dateNote || "Date shown is the financing announcement date." },
    sources: [fundingSource, productSource, founderEvidence], signals: [], lastReviewed: EDITION_DATE,
  };
  const company = adaptCompany({ cohort: record.stageId, cutoffDate: EDITION_DATE, sourceRecord: raw, editorialRank: null });
  company.profile = { ...company.profile, whoItServes: record.audience, products: record.products, currentSource: productSource };
  company.audience = record.audience;
  company.products = record.products;
  company.currentStage = LABELS[record.stageId];
  company.companyDetails.research.business.facts = [{ label: "Product and use case", title: record.name, detail: record.detail, source: productSource, evidenceState: "Direct", lastReviewed: EDITION_DATE }];
  company.companyDetails.research.capital.totalDisclosed = record.total || "Not publicly observed";
  company.profile.funding.totalDisclosed = record.total || "Not publicly observed";
  company.events[0].detail = `${record.amount} ${record.round}. ${record.dateNote || "Financing announcement date shown."}`;
  company.events[0].lastReviewed = EDITION_DATE;
  company.historicalFunding = null;
  company.refresh = { searchedAt: EDITION_DATE, checkedAt: EDITION_DATE, profileChecked: true, change: null, addedEventCount: 1 };
  return company;
}

function correctFunding(company, correction) {
  const replacementSource = source(correction.url, "Company announcement", correction.publicationDate || correction.date);
  company.funding = { ...company.funding, amount: correction.amount, stage: correction.stage, round: correction.stage, date: correction.date, eventDate: correction.date, publishedAt: correction.publicationDate || correction.date, source: replacementSource, sourceUrl: correction.url, sourceStatus: "Direct", evidenceState: "Direct", datePrecision: "day" };
  company.latestRound = structuredClone(company.funding);
  company.stageEvidence = [{ round: correction.stage, stage: correction.stage, amount: correction.amount, eventDate: correction.date, source: replacementSource }];
  company.profile.funding = { ...company.profile.funding, latestRoundDate: correction.date, latestRoundStage: correction.stage, latestRoundAmount: correction.amount };
  // Replace the current representation of the same event, rather than count it twice.
  const event = company.events.find(item => item.id === `${company.id}-funding`);
  Object.assign(event, { date: correction.date, eventDate: correction.date, title: `${company.name}: ${correction.amount} ${correction.stage}`, detail: `${correction.amount} ${correction.stage}. ${correction.note}`, source: replacementSource, lastReviewed: EDITION_DATE, status: "Direct", evidenceState: "Direct" });
  for (const fact of company.companyDetails.research.capital.facts) {
    if (fact.eventId === event.id) Object.assign(fact, { title: event.title, detail: event.detail, date: event.date, source: replacementSource, lastReviewed: EDITION_DATE, evidenceState: "Direct" });
  }
  company.rankingCorrection = { note: correction.note, source: replacementSource };
}

export function applyEdition(record, historical = null) {
  const company = structuredClone(record);
  company.historicalRanking = historical ? { date: historical.cohortCutoff, stageId: historical.stageId, stage: historical.stage, rank: historical.editorialRank, rationale: historical.rankRationale } : null;
  if (CORRECTIONS[company.id]) correctFunding(company, CORRECTIONS[company.id]);
  const addition = ADDITIONAL_EVENTS[company.id];
  if (addition) {
    const event = { ...structuredClone(addition), evidenceState: "Direct", status: "Direct", lastReviewed: EDITION_DATE };
    company.events.unshift(event);
    const lens = event.type === "funding" ? "capital" : "traction";
    company.companyDetails.research[lens].facts.unshift({ ...event, eventId: event.id, label: "Reviewed update" });
  }
  const exclusion = EXCLUSIONS[company.id];
  if (exclusion) {
    company.recordStatus = exclusion.status;
    company.exclusionReason = exclusion.reason;
    if (exclusion.status === "stage-conflict") company.currentStage = "Stage under review";
    company.refresh.change = { note: exclusion.detail, publicSummary: exclusion.detail, source: exclusion.source };
    if (exclusion.title) {
      const event = { id: `${company.id}-edition-status`, type: "corporate", title: exclusion.title, date: exclusion.date, detail: exclusion.detail, source: exclusion.source, evidenceState: "Direct", status: "Direct", lastReviewed: EDITION_DATE };
      company.events.unshift(event);
      company.companyDetails.research.traction.facts.unshift({ ...event, eventId: event.id, label: "Operating status" });
    }
  }
  const selected = entries.get(company.id);
  company.selected = Boolean(selected);
  company.selectionStatus = selected ? "selected" : EDITION_ALTERNATES[company.id] ? "alternate" : "excluded";
  company.editorialRank = selected?.rank ?? null;
  if (selected) {
    const expected = STAGES[company.currentStage];
    if (expected !== selected.stageId) throw new Error(`${company.id}: selected stage disagrees with financing review`);
    if (company.recordStatus && company.recordStatus !== "stage-changed") throw new Error(`${company.id}: ineligible company selected`);
    company.stageId = selected.stageId;
    company.stage = LABELS[selected.stageId];
    company.cohort = selected.stageId;
    company.cohortCutoff = EDITION_DATE;
    company.recordStatus = null;
    if (historical && historical.stageId !== selected.stageId) {
      company.stageEvidence.push({ round: company.funding.stage, stage: company.currentStage, amount: company.funding.amount, eventDate: company.funding.date, source: company.funding.source });
    }
  } else if (company.selectionStatus === "alternate") company.recordStatus = "not-selected";
  const rationale = selected?.rationale || EDITION_ALTERNATES[company.id] || company.refresh.change?.publicSummary || company.refresh.change?.note;
  company.rankingReview = {
    date: EDITION_DATE, methodVersion: METHOD_VERSION, decision: company.selectionStatus, rationale,
    evidence: [...new Map([
      [company.funding.source.href, { ...company.funding.source, claim: `${company.funding.amount} ${company.funding.stage}` }],
      ...(company.events || []).map(event => [event.source.href, { ...event.source, claim: event.title }]),
      [company.profile.currentSource.href, { ...company.profile.currentSource, claim: company.companyDetails.research.business.facts[0].detail }],
      ...(company.refresh.change?.source ? [[company.refresh.change.source.href, { ...company.refresh.change.source, claim: company.refresh.change.note }]] : []),
    ]).values()],
  };
  company.rankRationale = rationale;
  company.whySelected = rationale;
  company.companyDetails.why = [{ label: "Editorial assessment", title: "Why selected", detail: rationale, date: EDITION_DATE, evidenceState: "Editorial" }];
  company.events.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  company.signals = company.events.filter(event => event.type !== "funding");
  return company;
}

export function editionStages(companies) {
  return Object.entries(LABELS).map(([id, label]) => {
    const eligible = companies.filter(company => STAGES[company.currentStage] === id && ["selected", "alternate"].includes(company.selectionStatus));
    return {
      id, label, open: true, note: "Editorial beta", cutoffDate: EDITION_DATE, methodVersion: METHOD_VERSION,
      publicationSize: 50, targetCount: 50, selectedCount: eligible.filter(company => company.selected).length,
      eligibleCount: eligible.length, alternateCount: eligible.filter(company => !company.selected).length,
      candidatePoolStatus: "Reviewed candidate set", poolStatus: "reviewed", poolNote: "This edition reviews the previous 200 records and 13 added candidates. It is not a census of all eligible AI companies.",
    };
  });
}
