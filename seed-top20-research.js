// allow: SIZE_OK — sourced data table for the bounded Seed Top 20 cohort.
const AS_OF = "2026-08-22";

const source = (url, label, date = null) => ({
  href: url,
  url,
  label,
  type: label,
  relationship: "Company",
  provenance: "Company",
  announcementDate: date,
  asOf: AS_OF,
  evidenceState: "Direct",
  status: "Direct",
});

const fact = (label, title, detail, url, date = null) => ({
  label,
  title,
  detail,
  date,
  evidenceState: "Direct",
  source: source(url, label, date),
});

export const SEED_TOP20_RESEARCH = {
  "unconventional-ai": {
    profile: {
      whoItServes: "Researchers and infrastructure teams exploring energy-efficient alternatives to conventional AI compute.",
      products: ["Un-0 open model and research code", "Physics-based AI compute substrate in development"],
      businessModel: "Pre-commercial research company; no public product pricing or deployment model.",
      developerLinks: "Open weights plus training, evaluation, and ablation code for Un-0.",
      competitiveContext: "Editorial context: physical, analog, and neuromorphic AI-compute approaches; no production accelerator is publicly available yet.",
      watchNext: "A physical-chip demonstration with independently comparable quality, throughput, and joules-per-inference results.",
    },
    businessFacts: [
      fact("Product scope", "Building a new physical substrate for AI", "The company says its goal is to run neural networks on silicon physics directly rather than simulate them on conventional digital computers.", "https://unconventional.ws/blog/introducing-unconventional-ai/", "2025-12-08"),
      fact("Commercial state", "Research artifact available; commercial product undisclosed", "Un-0 is open for experimentation, while pricing, production hardware, customer deployments, and a delivery model have not been announced.", "https://unconventional.ws/blog/introducing-un-0-generating-images-with-coupled-oscillators/", "2026-06-25"),
    ],
    technologyFacts: [
      fact("Technical proof", "Un-0 reaches FID 6.74 on ImageNet 64×64", "The largest disclosed Un-0 model uses coupled oscillators, publishes weights and code, and still trails later conventional state-of-the-art generators on absolute quality.", "https://unconventional.ws/blog/introducing-un-0-generating-images-with-coupled-oscillators/", "2026-06-25"),
    ],
    evidenceGaps: "No production chip, customer deployment, price, revenue, or independently reproduced energy-efficiency result is publicly documented.",
  },
  inception: {
    profile: {
      whoItServes: "Teams building latency-sensitive coding, agent, voice, advertising, search, and retrieval applications.",
      products: ["Mercury 2 reasoning model", "OpenAI-compatible model API", "Mercury Chat"],
      businessModel: "Usage-priced API at $0.25 per million input tokens and $0.75 per million output tokens, plus enterprise evaluations.",
      developerLinks: "OpenAI-compatible API, documentation, integrations, and chat playground.",
      competitiveContext: "Editorial context: competes with other fast hosted LLM APIs on latency, quality, price, and production reliability.",
      watchNext: "Sustained production usage and independent latency-quality results under real concurrency.",
    },
    businessFacts: [
      fact("Target workload", "Production AI where latency compounds", "Mercury 2 is positioned for coding, agentic loops, real-time voice, and multi-step search or RAG workloads.", "https://www.inceptionlabs.ai/blog/introducing-mercury-2", "2026-02-24"),
      fact("Commercial model", "Metered API with enterprise support", "The company publishes per-token pricing and offers workload-fit, evaluation-design, and performance-validation support for enterprises.", "https://www.inceptionlabs.ai/blog/introducing-mercury-2", "2026-02-24"),
    ],
    tractionFacts: [
      fact("Customer evidence", "Named production evaluators across coding, advertising, voice, and search", "The launch includes statements from Zed, Viant, Wispr Flow, Skyvern, Happyverse AI, OpenCall, and SearchBlox.", "https://www.inceptionlabs.ai/blog/introducing-mercury-2", "2026-02-24"),
    ],
    evidenceGaps: "Customer retention, paid usage, revenue, gross margin, and independently reproduced high-concurrency performance are not publicly disclosed.",
  },
  "thinking-machines-lab": {
    profile: {
      whoItServes: "AI researchers, developers, enterprises, and institutions that want customizable open models without managing training infrastructure.",
      products: ["Tinker training API", "Inkling open model", "Inkling-Small open model"],
      businessModel: "Usage-priced training API billed per million tokens, with paid checkpoint storage; open model weights are distributed separately.",
      developerLinks: "Tinker API, documentation, cookbook, downloadable checkpoints, and Hugging Face model weights.",
      competitiveContext: "Editorial context: spans managed fine-tuning infrastructure and open foundation models, competing on control, research flexibility, and compute access.",
      watchNext: "Tinker usage outside flagship case studies and the delivery of the announced NVIDIA Vera Rubin capacity.",
    },
    businessFacts: [
      fact("Product scope", "Tinker abstracts model-training infrastructure", "Researchers control forward/backward passes, optimization, sampling, and checkpoints while the platform handles scheduling and distributed infrastructure.", "https://thinkingmachines.ai/tinker/"),
      fact("Commercial model", "Usage pricing for training and storage", "Tinker charges by model and token volume, with checkpoint storage listed at $0.10 per GB-month.", "https://thinkingmachines.ai/tinker/"),
    ],
    tractionFacts: [
      fact("Customer evidence", "Glean, Chroma, and research teams publish Tinker outcomes", "The product page documents training work from Glean, Chroma, Lightning Rod Labs, Mantic, Trajectory, Stanford, and Axiom Math.", "https://thinkingmachines.ai/tinker/"),
    ],
    technologyFacts: [
      fact("Model portfolio", "Inkling models combine open weights and multimodal input", "Inkling and Inkling-Small support text, image, and audio input and are designed to be fine-tuned on Tinker.", "https://thinkingmachines.ai/inkling/"),
    ],
    evidenceGaps: "Tinker revenue, active paid users, utilization economics, and independent Inkling benchmark reproduction are not publicly disclosed.",
  },
  sycamore: {
    profile: {
      whoItServes: "Large enterprises moving autonomous agents from proof of concept into governed production workflows.",
      products: ["Agent Operating System", "Adaptive Factory", "Collective Intelligence layer"],
      businessModel: "Enterprise design-partner and deployment model; pricing and contract structure are not public.",
      developerLinks: "No public developer API or self-serve documentation observed; access is through the company waitlist and enterprise engagement.",
      competitiveContext: "Editorial context: competes with enterprise agent platforms, internal AI platforms, and custom consulting-led automation.",
      watchNext: "Named production customers, deployment duration, user adoption, and measurable operating outcomes.",
    },
    businessFacts: [
      fact("Target customer", "Enterprise teams with governance and production-agent constraints", "Sycamore positions the product for large organizations that need trust, security, compliance, permissions, and auditability around autonomous agents.", "https://sycamore.so/blog/company/building-the-ai-native-enterprise-os/", "2026-03-30"),
      fact("Product architecture", "Operating system, software factory, and organizational context", "The company describes an agent kernel, an Adaptive Factory that generates software, and Collective Intelligence that incorporates company knowledge and roles.", "https://sycamore.so/blog/company/building-the-ai-native-enterprise-os/", "2026-03-30"),
    ],
    tractionFacts: [
      fact("Deployment evidence", "Fortune 500 design partners are unnamed", "Sycamore says it is working with Fortune 500 enterprises to deploy agents in production, but does not name them or publish outcomes.", "https://sycamore.so/blog/company/building-the-ai-native-enterprise-os/", "2026-03-30"),
    ],
    evidenceGaps: "Customer names, contract value, production usage, retention, implementation time, and quantified ROI are not publicly disclosed.",
  },
  neuraltrust: {
    profile: {
      whoItServes: "CISOs, security teams, and AI platform teams deploying generative applications and autonomous agents.",
      products: ["Agent Runtime Security", "Agent Gateway", "Agent Posture Management", "AI Red Teaming", "Generative Application Firewall"],
      businessModel: "Enterprise security software sold through demos; public pricing is not disclosed.",
      developerLinks: "Public documentation, GitHub projects, product sign-in, and security research.",
      competitiveContext: "Editorial context: AI runtime security, agent gateways, posture management, red teaming, and LLM guardrail platforms.",
      watchNext: "Named customer deployments and measured detection, false-positive, latency, and incident-prevention results.",
    },
    businessFacts: [
      fact("Buyer", "Security and platform teams governing enterprise agents", "The product family covers runtime interactions, tool connectivity, agent discovery and governance, and adversarial testing.", "https://neuraltrust.ai/news/introducing-the-generative-application-firewall-gaf", "2026-01-23"),
      fact("Commercial motion", "Demo-led enterprise sale", "The public site directs buyers to request a demo and does not publish self-serve or seat-based pricing.", "https://neuraltrust.ai/news/introducing-the-generative-application-firewall-gaf", "2026-01-23"),
    ],
    technologyFacts: [
      fact("Security architecture", "GAF enforces policy across users, sessions, and agent tools", "The proposed firewall covers network, access, syntactic, semantic, and context layers and can intercept tool calls and untrusted tool outputs.", "https://neuraltrust.ai/news/introducing-the-generative-application-firewall-gaf", "2026-01-23"),
    ],
    evidenceGaps: "Public customer names, pricing, production scale, detection benchmarks, false-positive rates, and latency overhead are not disclosed.",
  },
  "browser-use": {
    profile: {
      whoItServes: "Developers and automation teams building agents that must operate real websites reliably.",
      products: ["Browser Use open-source library", "Browser Use Agents", "Managed browser infrastructure", "Custom browser-use models"],
      businessModel: "Open-source library plus usage-priced agents and browsers, with free, developer, and business subscription tiers.",
      developerLinks: "Python library, cloud API, SDK, OpenAPI, webhooks, MCP, and managed browser sessions.",
      competitiveContext: "Editorial context: browser automation frameworks, managed anti-blocking browser infrastructure, and task-level web-agent services.",
      watchNext: "Paid conversion, success rates on independent tasks, and reliability across authentication, anti-bot, and long-running workflows.",
    },
    businessFacts: [
      fact("Product scope", "Open-source browser agents plus managed execution", "Browser Use offers both a developer library and hosted task/browser infrastructure for teams that do not want to operate browser fleets.", "https://browser-use.com/"),
      fact("Commercial model", "Subscription credits plus usage pricing", "The public pricing presents free, developer, and business tiers alongside per-browser-hour and per-solved-task usage.", "https://browser-use.com/"),
    ],
    tractionFacts: [
      fact("Developer adoption", "Large open-source and package footprint", "The company homepage reports more than 110,000 GitHub stars and 46 million monthly downloads for the open-source project.", "https://browser-use.com/"),
    ],
    evidenceGaps: "Paid customer count, net revenue retention, gross margin, independent benchmark reproduction, and blocked-site failure rates are not publicly disclosed.",
  },
  flexai: {
    profile: {
      whoItServes: "AI builders, startups, growing AI teams, enterprises, and systems integrators running open models.",
      products: ["Token Factory", "Agent SDK", "Dedicated Endpoints", "AI Factory", "Training and fine-tuning platform"],
      businessModel: "Usage-priced managed inference with paths to reserved endpoints and private-cloud deployments.",
      developerLinks: "OpenAI-compatible API, API key, CLI, documentation, blueprints, model catalog, and migration guides.",
      competitiveContext: "Editorial context: hyperscaler AI services, token API providers, dedicated inference platforms, and self-managed stacks.",
      watchNext: "Named production customers, workload-level price/performance, fleet utilization, and private-cloud adoption.",
    },
    businessFacts: [
      fact("Customer range", "From startups to enterprise and systems integrators", "FlexAI explicitly segments builders, growing AI teams, enterprises, and systems integrators and offers UI, CLI, and API access.", "https://flex.ai/why-us"),
      fact("Commercial ladder", "Serverless inference to dedicated and private deployments", "Customers can start on shared inference, reserve endpoints as volume grows, and move into their own cloud without rebuilding the application surface.", "https://flex.ai/why-us"),
    ],
    technologyFacts: [
      fact("Platform approach", "Heterogeneous managed inference", "FlexAI combines an OpenAI-compatible surface with NVIDIA and AMD infrastructure and positions itself against cloud, endpoint, and DIY lock-in.", "https://flex.ai/why-us"),
    ],
    evidenceGaps: "Named customers, revenue, paid usage, utilization, independent price-performance results, and retention are not publicly disclosed.",
  },
  "synthesize-bio": {
    profile: {
      whoItServes: "Biopharma research and clinical-development teams prioritizing indications, patients, and trial designs.",
      products: ["GEM-1 genomics model", "Virtual Human framework", "SYNTH-cancer dataset and web application"],
      businessModel: "Enterprise research collaboration model; public pricing, licensing, and contract structure are not disclosed.",
      developerLinks: "Public preprint, research web application, and generated cancer datasets; no public production API observed.",
      competitiveContext: "Editorial context: generative biology models, virtual-cell or virtual-patient platforms, and computational clinical-development tools.",
      watchNext: "Prospective validation in live programs, named biopharma customers, and decisions changed by the model rather than retrospective fit.",
    },
    businessFacts: [
      fact("Target workflow", "Clinical-development decisions rather than general biology benchmarks", "The company positions GEM-1 for indication prioritization, patient stratification, treatment simulation, and trial-success forecasting.", "https://synthesizebio.substack.com/p/gem-1-predicts-clinical-trial-response", "2026-04-09"),
      fact("Commercial state", "Research collaboration is visible; pricing is not", "The company invites drug-development teams to engage but does not publish a self-serve API, subscription, or licensing price.", "https://synthesizebio.substack.com/p/gem-1-predicts-clinical-trial-response", "2026-04-09"),
    ],
    technologyFacts: [
      fact("Retrospective model result", "GEM-1 estimated a 15% response-rate gain in a trial analysis", "The company reports retrospective and simulated results; these are not prospective clinical outcomes or customer ROI.", "https://synthesizebio.substack.com/p/gem-1-predicts-clinical-trial-response", "2026-04-09"),
    ],
    evidenceGaps: "No named paying customers, contract value, prospective clinical validation, regulatory use, or independently reproduced model result is public.",
  },
  "argon-ai": {
    profile: {
      whoItServes: "Clinical, commercial, strategy, and consulting teams in pharma and life sciences.",
      products: ["AI-native life-science workspace", "Unified secondary-data knowledge base", "Primary market-research workflow automation", "Sell-side analyst research access"],
      businessModel: "Enterprise SaaS sold through contact-sales engagements; public pricing is not disclosed.",
      developerLinks: "Hosted application; no public API or developer documentation observed.",
      competitiveContext: "Editorial context: life-science intelligence databases, primary-research tools, and pharma-specialized AI workspaces.",
      watchNext: "More named customers, repeat usage by clinical and commercial teams, and quantified time or decision-quality improvements.",
    },
    businessFacts: [
      fact("Target users", "Clinical and commercial life-science teams", "Argon combines medical literature, company information, development assets, proprietary analyst research, and workflow automation in one workspace.", "https://argon-ai.com/"),
      fact("Commercial motion", "Contact-sales enterprise workspace", "The product is accessed through a hosted login and sales conversation; public seat or usage pricing is not listed.", "https://argon-ai.com/"),
    ],
    tractionFacts: [
      fact("Use-case evidence", "Primary market-research workflow for a life-science consultancy", "Argon describes automating interview transcription and insight generation for a top life-science consulting firm, but the customer is not named on the homepage.", "https://argon-ai.com/"),
    ],
    evidenceGaps: "Customer count, contract value, renewal, active usage, source coverage, and independently measured time savings are not publicly disclosed.",
  },
  airweave: {
    profile: {
      whoItServes: "Developers building agents and RAG systems that need fresh context from business applications and databases.",
      products: ["Context retrieval layer", "Application and database connectors", "Searchable collections", "Cloud and open-source SDKs"],
      businessModel: "Free self-serve entry with paid cloud tiers and enterprise demos.",
      developerLinks: "Python and TypeScript SDKs, documentation, GitHub repository, API keys, and connector guides.",
      competitiveContext: "Editorial context: context engines, RAG data pipelines, connector platforms, and agent memory or retrieval services.",
      watchNext: "Named production customers, connector freshness and failure rates, retrieval quality, and paid expansion beyond the free tier.",
    },
    businessFacts: [
      fact("Product job", "Give agents searchable context from many systems", "Airweave syncs applications and databases into collections that agents and RAG pipelines can query through one retrieval layer.", "https://airweave.ai/"),
      fact("Commercial path", "Self-serve start plus enterprise sale", "The site offers free signup, published pricing, and a separate enterprise demo path.", "https://airweave.ai/"),
    ],
    tractionFacts: [
      fact("Internal production usage", "About 40,000 Airweave queries per month in its own monitoring agent", "The team says its Donke agent clusters errors and searches GitHub and Linear, enabling a tenfold increase in improvement volume and quality.", "https://airweave.ai/blog/how-we-use-airweave-to-improve-airweave", "2025-12-03"),
    ],
    evidenceGaps: "External customer usage, paid conversion, retention, connector reliability, retrieval benchmarks, and gross margin are not publicly disclosed.",
  },
  "maisa-ai": {
    profile: {
      whoItServes: "Regulated enterprises in banking, insurance, engineering, infrastructure, and manufacturing.",
      products: ["Maisa Digital Workers", "Agentic process-automation platform", "Maisa Studio"],
      businessModel: "Enterprise software sold through demos and cloud-marketplace deployment; public pricing is not disclosed.",
      developerLinks: "Hosted product and AWS Marketplace availability; no public general-purpose developer API observed.",
      competitiveContext: "Editorial context: enterprise agent platforms, robotic process automation, and consulting-led process transformation.",
      watchNext: "Named production workflows, audited ROI, deployment time, and expansion beyond initial regulated-industry programs.",
    },
    businessFacts: [
      fact("Target customer", "High-stakes regulated operations", "Maisa focuses on processes that require traceability, reproducibility, governance, and direct links to revenue, cost, or risk outcomes.", "https://maisa.ai/blog/maisa-x-santander", "2026-05-26"),
      fact("Product promise", "Digital workers that document their work", "The platform is positioned beyond conversational agents, with model-agnostic execution and accountable process automation.", "https://maisa.ai/blog/maisa-x-santander", "2026-05-26"),
    ],
    tractionFacts: [
      fact("Enterprise evidence", "A year of implementation work with Santander", "Maisa says its CEO and Santander's global AI leader had spent the prior year implementing AI in high-stakes banking operations.", "https://maisa.ai/blog/maisa-x-santander", "2026-05-26"),
    ],
    evidenceGaps: "The exact Santander workflows, production volume, contract value, measured ROI, and renewal or expansion are not public.",
  },
  "fish-audio": {
    profile: {
      whoItServes: "Developers, creators, voice-agent teams, media producers, game studios, and localization workflows.",
      products: ["S2.1 Pro text-to-speech API", "S2 open model", "Voice cloning", "Creator voice platform"],
      businessModel: "Free evaluation tier plus paid API plans with production SLA, latency commitments, and commercial licensing.",
      developerLinks: "API keys, TTS and cloning APIs, documentation, JavaScript and Python examples, MCP, and agent integrations.",
      competitiveContext: "Editorial context: ElevenLabs, OpenAI TTS, Google speech models, and self-hosted open voice models.",
      watchNext: "Conversion from free API usage to paid production, retention of creators, unit economics, and consent or data-retention controls.",
    },
    businessFacts: [
      fact("Target use", "Production voice APIs and creator workflows", "Fish Audio markets low-latency multilingual speech, voice cloning, long-form narration, game dialogue, and voice-agent use cases.", "https://fish.audio/zh-CN/blog/s2-1-pro-free-api/", "2026-06-23"),
      fact("Commercial model", "Free evaluation with paid production guarantees", "The free model has no SLA and may retain requests for model improvement; paid plans add SLA, latency guarantees, and commercial authorization.", "https://fish.audio/zh-CN/blog/s2-1-pro-free-api/", "2026-06-23"),
    ],
    tractionFacts: [
      fact("Audience scale", "More than 8 million creators", "The Fish Audio product banner reports over eight million creators; independently audited active-user and paid-user counts are not published.", "https://fish.audio/zh-CN/blog/s2-1-pro-free-api/", "2026-06-23"),
    ],
    evidenceGaps: "Paid-user count, API revenue, retention, gross margin, consent disputes, and independently benchmarked quality are not publicly disclosed.",
  },
  "dedalus-labs": {
    profile: {
      whoItServes: "Developers and marketplaces that need to connect AI models with hosted or local MCP tools securely.",
      products: ["MCP Gateway", "Agents SDK", "Hosted MCP servers", "Dedalus Store", "Dedalus Auth"],
      businessModel: "Usage-priced developer platform with free entry, paid tiers, and a planned marketplace revenue share.",
      developerLinks: "Agents SDK, documentation, hosted MCP deployment, model gateway, marketplace, and authentication layer.",
      competitiveContext: "Editorial context: agent SDKs, MCP hosting and gateways, tool marketplaces, and agent authentication infrastructure.",
      watchNext: "Production customers, secure-credential audits, marketplace activity, paid usage, and creator earnings.",
    },
    businessFacts: [
      fact("Product job", "Connect any model to any MCP server through one API", "The platform combines model access, hosted MCP deployment, tool routing, marketplace discovery, and agent orchestration.", "https://dedaluslabs.pro/"),
      fact("Commercial model", "Developer pricing plus planned marketplace take rate", "Dedalus publishes a pricing path and says marketplace creators will receive an 80% share when monetization launches.", "https://dedaluslabs.pro/"),
    ],
    technologyFacts: [
      fact("Security layer", "DAuth protects multi-tenant MCP credentials", "Dedalus says the SDK encrypts credentials client-side and uses a networkless hardware-secured enclave so raw secrets are not exposed to the host or MCP server.", "https://www.dedaluslabs.ai/blog/dedalus-auth-launch", "2026-01-19"),
    ],
    evidenceGaps: "Paid developer count, request volume, authentication audits, marketplace activity, uptime, and customer retention are not public.",
  },
  dottxt: {
    profile: {
      whoItServes: "AI application teams, self-hosted inference teams, and inference providers that require schema-valid model outputs.",
      products: ["api.dottxt.ai", "Self-hosted inference integrations", "dotjson", "dotgrammar", "dotlambda", "Outlines"],
      businessModel: "Pay-per-token hosted API plus commercial integrations for self-hosted teams and inference providers.",
      developerLinks: "API, documentation, quickstart, open-source Outlines, and libraries for JSON Schema, grammars, and function calling.",
      competitiveContext: "Editorial context: llguidance, xgrammar, native provider structured-output features, and retry-based validation stacks.",
      watchNext: "Production adoption, provider integrations, reliability outside published benchmarks, latency overhead, and recurring revenue.",
    },
    businessFacts: [
      fact("Customer job", "Enforce output contracts during generation", ".txt targets teams that need JSON Schema, grammar-constrained, and function-calling outputs without retry and post-hoc validation loops.", "https://dottxt.ai/"),
      fact("Commercial model", "Hosted usage plus self-hosted and provider integrations", "The hosted API is described as pay-per-token, while self-hosted teams and inference providers integrate the company's libraries into existing serving stacks.", "https://dottxt.ai/"),
    ],
    technologyFacts: [
      fact("Benchmark claim", "dotjson reports zero provable mask errors in a 5,047-schema comparison", "The company-authored benchmark compares dotjson with llguidance and xgrammar and labels its counts as lower bounds, not exhaustive error rates.", "https://blog.dottxt.ai/comparing-the-quality-of-structured-generation-engines.html", "2026-06-22"),
    ],
    evidenceGaps: "Named paying customers, revenue, production error rates, independent benchmark reproduction, and performance overhead are not public.",
  },
  wafer: {
    profile: {
      whoItServes: "AI-native product teams and enterprises serving open models under latency, throughput, and cost constraints.",
      products: ["Optimized open-model inference", "Dedicated endpoints", "Agentic optimization loop", "KernelArena"],
      businessModel: "Usage-priced inference plus dedicated enterprise capacity and workload-specific engineering.",
      developerLinks: "Self-serve application, enterprise engineering engagement, GitHub, benchmark leaderboards, and public SLA.",
      competitiveContext: "Editorial context: hosted open-model inference providers, dedicated GPU endpoints, and internal inference-optimization teams.",
      watchNext: "Independent price-performance results, customer concentration, gross margin, and repeatable gains across models and hardware.",
    },
    businessFacts: [
      fact("Customer job", "Optimize open-model inference against real traffic", "Wafer profiles models, decode strategies, serving engines, kernels, and hardware, then verifies candidate changes before deployment.", "https://www.wafer.ai/"),
      fact("Commercial model", "Hosted inference and dedicated enterprise capacity", "The company offers self-serve access and dedicated endpoints tailored to custom models, hardware, traffic, and production constraints.", "https://www.wafer.ai/"),
    ],
    tractionFacts: [
      fact("Usage claim", "More than two trillion tokens served per month", "The homepage reports monthly token volume and shows customer or ecosystem logos including Vercel, Convoso, Inworld, Brilliant, AWS, and Ollama.", "https://www.wafer.ai/"),
    ],
    evidenceGaps: "Paid customer count, token mix, revenue, gross margin, customer concentration, and independent 2–3× efficiency validation are not public.",
  },
  "pramaana-labs": {
    profile: {
      whoItServes: "Organizations using AI in rule-bound, mission-critical domains where outputs must be formally checked and auditable.",
      products: ["Pramaana verified-AI stack", "Lean 4 domain compilers", "Project 1729", "Tax optimization reference implementation"],
      businessModel: "Domain partnership and enterprise implementation model; pricing and contract structure are not public.",
      developerLinks: "Technical articles and Lean 4 examples; no self-serve production API or public SDK observed.",
      competitiveContext: "Editorial context: formal-methods tooling, verified AI systems, rules engines, and expert-built compliance software.",
      watchNext: "A named production customer, time-to-model a new domain, proof-maintenance cost, and measurable error reduction in live use.",
    },
    businessFacts: [
      fact("Target workflow", "High-stakes decisions with machine-checkable rules", "Pramaana targets domains where a model answer must be compliant, optimal, reproducible, and audit-defensible rather than merely plausible.", "https://pramaanalabs.ai/blog/audit-defensible-tax-optimization", "2026-06-17"),
      fact("Commercial motion", "Bring-your-domain engagement", "The company invites organizations to bring a domain for formalization but does not publish a self-serve product or price.", "https://pramaanalabs.ai/blog/audit-defensible-tax-optimization", "2026-06-17"),
    ],
    technologyFacts: [
      fact("Reference implementation", "A 265-cell Lean 4 model of U.S. Form 1040 workflows", "The published example checks tax-plan compliance and optimization and compares its machine-checked result with frontier-model answers.", "https://pramaanalabs.ai/blog/audit-defensible-tax-optimization", "2026-06-17"),
    ],
    evidenceGaps: "No named customer, paid deployment, implementation duration, domain-maintenance cost, or independent verification of the tax benchmark is public.",
  },
  taho: {
    profile: {
      whoItServes: "Infrastructure teams operating AI, HPC, cloud, on-premises, or edge compute across heterogeneous hardware.",
      products: ["TAHO Execution Fabric", "Cloud-marketplace deployment", "Compute-efficiency tooling"],
      businessModel: "Infrastructure software sold through workload trials, published pricing, and cloud-marketplace distribution.",
      developerLinks: "Documentation, support, GitHub, pricing, and deployment through existing Kubernetes, SLURM, CUDA, and ROCm stacks.",
      competitiveContext: "Editorial context: workload schedulers, GPU orchestration, cluster-optimization layers, and vendor-specific serving stacks.",
      watchNext: "Named production deployments and independently measured utilization, speed, and cost gains on customer workloads.",
    },
    businessFacts: [
      fact("Target environment", "Heterogeneous compute below orchestration", "TAHO positions its execution fabric below Kubernetes, SLURM, and serving frameworks and above NVIDIA, AMD, CPU, accelerator, and edge hardware.", "https://taholabs.com/"),
      fact("Commercial path", "Workload proof followed by cloud or infrastructure deployment", "The site asks customers to bring a real workload and lists pricing, documentation, and Microsoft marketplace availability.", "https://taholabs.com/"),
    ],
    technologyFacts: [
      fact("Performance claim", "Up to 10× faster execution and 90% lower compute cost", "The figures are company claims based on decomposing workloads and routing smaller jobs to better-fitting resources; independent customer validation is not published.", "https://taholabs.com/"),
    ],
    evidenceGaps: "Customer names, production scale, independent utilization measurements, revenue, deployment overhead, and workload limits are not public.",
  },
  ncodin: {
    profile: {
      whoItServes: "AI-processor, chiplet, advanced-packaging, HPC, and telecom teams constrained by electrical interconnect bandwidth and power.",
      products: ["NConnect optical network-on-chip", "Integrated nanolaser and optical-interposer technology"],
      businessModel: "Semiconductor component and integration-partnership model; pricing, manufacturing terms, and customer contracts are not public.",
      developerLinks: "Technology and application documentation; no public software SDK or evaluation kit observed.",
      competitiveContext: "Editorial context: copper die-to-die links, silicon-photonics interconnects, co-packaged optics, and other optical I/O startups.",
      watchNext: "Tape-out or production milestones, packaging compatibility, foundry yield, named design wins, and independently measured link performance.",
    },
    businessFacts: [
      fact("Target customer", "Processor and packaging teams scaling AI and HPC systems", "NConnect is presented as a plug-in optical network for existing chiplet architectures and advanced packaging.", "https://ncodin.com/technology/"),
      fact("Commercial state", "Integration and product-development stage", "The company describes NConnect and has product and business-development leadership, but does not publish customer, pricing, or manufacturing commitments.", "https://ncodin.com/about/"),
    ],
    technologyFacts: [
      fact("Device claim", "500× smaller laser with dense optical integration", "NcodiN reports less than 0.1 pJ/bit energy, more than 10,000 devices per mm², at least 60 Tbps/mm² bandwidth density, and at least 50 mm reach.", "https://ncodin.com/technology/"),
    ],
    evidenceGaps: "No named design win, production wafer, yield, qualification result, volume-manufacturing plan, pricing, or independent performance reproduction is public.",
  },
  lightium: {
    website: "https://careers.lightium.com/",
    profile: {
      whoItServes: "Photonic-device companies in data communications, telecom, AI infrastructure, quantum, and other high-speed optical markets.",
      products: ["200 mm thin-film lithium-niobate foundry platform", "Photonic integrated-circuit design services", "Validated process-design kit"],
      businessModel: "Foundry and photonic design services sold to device makers and infrastructure partners; public pricing is not disclosed.",
      developerLinks: "Process-design and foundry collaboration rather than a software SDK; public production documentation is limited.",
      competitiveContext: "Editorial context: silicon-photonics foundries, other TFLN process platforms, and vertically integrated optical-component suppliers.",
      watchNext: "Customer tape-outs, qualified production yield, recurring foundry volume, and independently verified device performance.",
    },
    businessFacts: [
      fact("Customer job", "Scale TFLN photonic devices through an industrial foundry", "Lightium describes a high-volume production-grade platform for device companies facing data-rate and energy constraints.", "https://careers.lightium.com/"),
      fact("Commercial model", "Foundry and design services", "The company is positioned as a manufacturing and design partner rather than a finished data-center equipment vendor.", "https://www.venturekick.ch/demandit/files/M_BB941CC4DCEF687AD98/dms/File/PRVK3_Lightium.pdf", "2025-02-03"),
    ],
    tractionFacts: [
      fact("Operating signal", "Hiring across photonics, verification, data, and customer roles", "The official careers site shows an expanding Zurich team and open technical and account-management roles.", "https://careers.lightium.com/"),
    ],
    evidenceGaps: "The former public root domain now serves unrelated gambling content. Customer names, tape-outs, foundry yield, production volume, pricing, and revenue are not public.",
  },
  "azalea-robotics": {
    profile: {
      whoItServes: "Airport operators, airlines, and aviation ground-service teams handling baggage in carts, ULDs, belts, and bagrooms.",
      products: ["ARC 1 autonomous baggage manipulator", "Mobile baggage-handling robots", "Fleet management and bag-tracking software"],
      businessModel: "Flexible robotics deployment with no fixed customer capital expenditure; contract pricing is not public.",
      developerLinks: "Operational deployment product; no public developer API or robotics SDK observed.",
      competitiveContext: "Editorial context: fixed baggage automation, industrial robot integrators, manual ground handling, and emerging mobile airport-robotics systems.",
      watchNext: "Named airports, deployed fleet size, bags handled, uptime, safety record, labor economics, and contract renewal.",
    },
    businessFacts: [
      fact("Customer workflow", "Load, unload, sort, track, and validate airport bags", "Azalea targets bagrooms and ground operations with mobile robots that work across belts, carts, ULDs, and containers.", "https://www.azalearobotics.com/"),
      fact("Commercial model", "Flexible deployment without fixed CapEx", "The company says customers can scale deployments up or down rather than purchase fixed capital equipment; detailed pricing is not public.", "https://www.azalearobotics.com/"),
    ],
    tractionFacts: [
      fact("Deployment claim", "ARC 1 is rolling out in airports", "The company reports live airport rollout and claims more than 98% bag transferability, 24/7 operation, and zero lost or damaged bags without naming sites or denominators.", "https://www.azalearobotics.com/insights/introducing-arc-1", "2026-01-21"),
    ],
    evidenceGaps: "Airport names, fleet size, bag volume, uptime denominator, incident history, deployment economics, and contract value are not public.",
  },
};

export const ENRICHED_SEED_IDS = new Set(Object.keys(SEED_TOP20_RESEARCH));
