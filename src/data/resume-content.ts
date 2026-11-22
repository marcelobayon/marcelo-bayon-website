/**
 * Resume content — source of truth for everything the /resume route renders
 * (3D station cards AND the accessible HTML resume).
 *
 * INTEGRITY RULES (do not relax without Marcelo's sign-off):
 * - Only confirmed facts. No invented titles, dates, degrees, book titles,
 *   metrics, or links.
 * - `verification: "needs-review"` marks a field Marcelo should confirm before
 *   it is treated as settled. It still renders, but it is the first thing to
 *   check. See CONTENT_NOTES at the bottom for the open items.
 * - Status on ventures must stay accurate: concept vs in-development vs live.
 *   Do not imply customers, revenue, or production readiness without evidence.
 */

export type Verification = "confirmed" | "needs-review";

export type ResumeLink = { label: string; href: string };

export type ExperienceLens = "software" | "operations" | "both";

export type ResumeItem = {
  id: string;
  title: string;
  organization?: string;
  period?: string;
  location?: string;
  lens?: ExperienceLens;
  summary: string;
  highlights?: string[];
  tech?: string[];
  links?: ResumeLink[];
  verification: Verification;
};

export type VentureStatus =
  | "concept"
  | "prototype"
  | "in-development"
  | "live"
  | "needs-review";

export type ResumeProject = {
  id: string;
  name: string;
  description: string;
  status: VentureStatus;
  url?: string;
  technologies?: string[];
  verification: Verification;
};

export type SkillGroup = {
  id: string;
  label: string;
  items: string[];
};

export type ResumeStation = {
  id: string;
  title: string;
  shortLabel: string;
  eyebrow: string;
  progress: number; // normalized position along the railway, 0–1
  summary: string;
};

export const PROFILE = {
  name: "Marcelo Bayon",
  headline: "Software Developer & Operational Leader",
  tagline:
    "I build the software and the operations around it — Salesforce/Omnistudio platforms, internal tooling, automation, and the teams that ship them.",
  introduction:
    "I started in operations and sales, taught myself to code, and now work where the two meet: turning messy real-world processes into reliable software. I like seeing around corners, building custom tools, and getting ideas all the way to something that works.",
  location: "Salt Lake City, Utah",
  // Already published on the resumes Marcelo distributes. A marcelo@marcelobayon.com
  // address would look sharper on a public site — swap when ready.
  email: "Marcelo.Bayon1987@gmail.com",
  links: {
    github: "https://github.com/marcelobayon",
    site: "https://marcelobayon.com",
    // linkedin: add the profile URL to render the LinkedIn link.
  } as Record<string, string>,
  availability:
    "Open to software, platform, and operations roles — and to collaborations that combine technology, finance, and real estate.",
};

export const STATIONS: ResumeStation[] = [
  {
    id: "valley-station",
    title: "Valley Station",
    shortLabel: "Introduction",
    eyebrow: "The starting point",
    progress: 0.06,
    summary: "Who I am and the thread that connects the work.",
  },
  {
    id: "academy-ridge",
    title: "Academy Ridge",
    shortLabel: "Education",
    eyebrow: "Learning & training",
    progress: 0.23,
    summary: "Formal studies, technical training, and continuous self-teaching.",
  },
  {
    id: "foundry-crossing",
    title: "Foundry Crossing",
    shortLabel: "Experience",
    eyebrow: "Work & operations",
    progress: 0.43,
    summary:
      "Professional experience across software, platform work, and operational leadership.",
  },
  {
    id: "developers-pass",
    title: "Developer's Pass",
    shortLabel: "Technical",
    eyebrow: "Software & skills",
    progress: 0.62,
    summary: "Languages, platforms, and the engineering practices behind the work.",
  },
  {
    id: "innovation-village",
    title: "Innovation Village",
    shortLabel: "Ventures & writing",
    eyebrow: "Building ideas into products",
    progress: 0.81,
    summary: "Entrepreneurial ventures and published work — with honest status labels.",
  },
  {
    id: "summit-observatory",
    title: "Summit Observatory",
    shortLabel: "What's next",
    eyebrow: "Direction & contact",
    progress: 0.97,
    summary: "The problems I want to work on, and how to reach me.",
  },
];

export const EDUCATION: ResumeItem[] = [
  {
    id: "amazon-technical-academy",
    title: "Software Development & AWS Fundamentals",
    organization: "Amazon Technical Academy",
    period: "2021",
    summary:
      "Intensive software-development training — Python, data structures, object-oriented programming, and AWS fundamentals.",
    verification: "confirmed",
  },
  {
    id: "slcc",
    title: "A.S., Finance & Credit",
    organization: "Salt Lake Community College",
    period: "2012",
    location: "Salt Lake City, UT",
    summary: "Associate of Science in Finance & Credit.",
    verification: "confirmed",
  },
  {
    id: "self-directed",
    title: "Self-directed software education",
    organization: "Independent",
    summary:
      "Ongoing coursework in Python, JavaScript, C#, and Java, funded in part by proceeds from Utah Taco Fest. Learning every week is a standing habit, not a phase.",
    verification: "confirmed",
  },
];

export const EXPERIENCE: ResumeItem[] = [
  {
    id: "udaf",
    title: "Office Solutions Specialist II",
    organization: "State of Utah — Department of Agriculture & Food (UDAF)",
    period: "Jul 2023 – Jul 2025",
    location: "Salt Lake City, UT",
    lens: "both",
    summary:
      "Owned the Salesforce/Omnistudio platform for UDAF's laboratories — building the software and supporting the 55-person user base that ran on it.",
    highlights: [
      "Led the Salesforce integration and migration for UDAF laboratory data — custom objects, automation, and flows managing testing results and inventory across multiple lab teams.",
      "Supported 55 Salesforce users (business analysts and senior engineers): solution design, platform guidance, code review input, and secure-data-handling practices.",
      "Built Lightning Web Components for the Inventory Control System (ICS) — seed-to-sale tracking for Utah's medical cannabis program with real-time validation.",
      "Designed and shipped 15+ continuously deployed internal apps (Google Apps Script/JavaScript + Omnistudio) forming a decoupled Laboratory Inventory Management System (LIMS).",
      "Introduced Docker-based CI/CD to streamline deployments, and ran the work on an agile cadence (sprint planning, retrospectives, stand-ups).",
    ],
    tech: [
      "Apex",
      "LWC / Aura",
      "Omnistudio",
      "Google Apps Script",
      "JavaScript",
      "Docker",
      "CI/CD",
      "Jira",
    ],
    verification: "confirmed",
  },
  {
    id: "amazon",
    title: "Software Development Engineer I",
    organization: "Amazon",
    period: "May 2021 – Feb 2023",
    location: "Salt Lake City, UT",
    lens: "software",
    summary:
      "Built internal tooling for the Transportation Operations team — turning manual yard and reporting workflows into dashboards and automation.",
    highlights: [
      "Built and maintained 11 internal tools for Transportation Operations — a smart yard map, end-of-day yard reporting, and process automation.",
      "Used AWS Redshift, QuickSight, and RDS to turn operational data into dashboards, cutting manual report-creation time by roughly half.",
      "Integrated Salesforce Quip for real-time collaboration across distributed logistics teams.",
      "Applied test-driven development to keep the tools reliable in daily operational use.",
    ],
    tech: ["JavaScript", "HTML/CSS", "AWS Redshift", "AWS QuickSight", "AWS RDS", "TDD"],
    verification: "needs-review",
  },
  {
    id: "braveheart",
    title: "Technical Sales Engineer",
    organization: "BraveHeart Wireless (startup)",
    period: "Feb 2018 – Apr 2019",
    location: "Sandy, UT",
    lens: "both",
    summary:
      "Bridged clinical research and product engineering for a Bluetooth patient-monitoring device — requirements, a working dashboard, and the proposals to close research partners.",
    highlights: [
      "Gathered system requirements from PhD researchers at cardiovascular medical universities and wrote the specifications to close them.",
      "Built a modular dashboard (HTML/CSS/JS, Node.js) for real-time monitoring of Bluetooth-enabled patient vital-sign devices.",
      "Advised on compliance for sensitive patient data, and authored letters of intent and solution proposals.",
    ],
    tech: ["HTML/CSS/JS", "Node.js", "Requirements engineering"],
    verification: "confirmed",
  },
  {
    id: "origin-studios",
    title: "Software Developer",
    organization: "Origin Studios",
    period: "Apr 2017 – Jul 2017",
    location: "Salt Lake City, UT",
    lens: "software",
    summary:
      "Built an augmented-reality plug-in for a client's tech-conference app across Android and iOS.",
    highlights: [
      "Developed AR features using Vuforia, Unity, C#, Swift, and Xcode for Android/iOS.",
      "Followed secure-coding practices for integrated 3D assets and data streams.",
    ],
    tech: ["Unity", "C#", "Swift", "Vuforia", "Xcode"],
    verification: "confirmed",
  },
  {
    id: "foot-scientific",
    title: "Software Developer",
    organization: "Foot Scientific",
    period: "2018 · 3-month project",
    location: "Draper, UT",
    lens: "software",
    summary:
      "Connected ShipStation and HSN APIs to synchronize orders and manage multi-facility fulfillment.",
    highlights: [
      "Integrated ShipStation and Home Shopping Network APIs for order sync and fulfillment (HTML/JS, Express, Node).",
    ],
    tech: ["Node.js", "Express", "ShipStation API"],
    verification: "confirmed",
  },
  {
    id: "mortgage",
    title: "Mortgage Loan Officer (FHA / USDA)",
    organization: "United Security Financial",
    period: "2019 – 2021",
    location: "Murray, UT",
    lens: "operations",
    summary:
      "Ran the full borrower lifecycle for government-backed loans — the domain that still anchors my fintech and real-estate work.",
    highlights: [
      "Managed borrowers from inquiry through closing; reviewed appraisals and title, validated financial documents, and tracked underwriting conditions to resolution.",
      "Coordinated title, appraisal, underwriting, and closing teams to hit deadlines.",
    ],
    verification: "needs-review",
  },
  {
    id: "alorica",
    title: "Operations Manager (progressed from Technical Support)",
    organization: "Alorica",
    period: "2012 – 2016",
    location: "Salt Lake City, UT",
    lens: "operations",
    summary:
      "Grew from front-line technical support to running the day-to-day of a client account — the operational-leadership foundation under everything since.",
    highlights: [
      "Led day-to-day operations for a client account supporting 700+ employees.",
      "Progressed Technical Support → Team Manager → Operations Manager, reporting KPIs to corporate clients and senior management on a daily-to-annual cadence.",
    ],
    verification: "needs-review",
  },
  {
    id: "taco-fest",
    title: "Founder & Operations Lead",
    organization: "Utah Taco Fest (Tacofest LLC)",
    period: "Four years",
    location: "Salt Lake City, UT",
    lens: "operations",
    summary:
      "Organized and operated a city-wide food festival for four years — vendors, logistics, and the automation to make it run without me.",
    highlights: [
      "Built systems and automation to make the festival self-sustaining across vendors and staffing.",
      "Reinvested proceeds into the software-development and marketing education that launched my technical career.",
      "Raised $7,500 for Meals on Wheels through the event.",
    ],
    verification: "needs-review",
  },
  {
    id: "earlier-career",
    title: "Earlier career — sales, customer service & operations",
    organization: "Qwest, ACS, Extend Health, La Prensa, and others",
    period: "2006 – 2012",
    location: "Salt Lake City area, UT",
    lens: "operations",
    summary:
      "A decade of bilingual (English/Spanish) sales, customer service, and team operations — where the rapport-building and process instincts come from.",
    verification: "needs-review",
  },
];

export const SKILL_GROUPS: SkillGroup[] = [
  {
    id: "languages",
    label: "Languages",
    items: ["JavaScript / TypeScript", "Apex", "Python", "C#", "Swift", "PHP", "SQL"],
  },
  {
    id: "salesforce",
    label: "Salesforce platform",
    items: [
      "Apex (classes, triggers)",
      "Lightning Web Components",
      "Aura / Visualforce",
      "Omnistudio (FlexCards, OmniScripts, Integration Procedures)",
      "MuleSoft integration",
      "Trailhead — 45,000+ points",
    ],
  },
  {
    id: "cloud-data",
    label: "Cloud & data",
    items: [
      "AWS (EC2, Redshift, RDS, QuickSight)",
      "Google Workspace / Apps Script",
      "Node.js",
      "REST APIs & OAuth 2.0",
      "SQL / NoSQL (MongoDB, Firebase)",
    ],
  },
  {
    id: "devops",
    label: "DevOps & practice",
    items: [
      "Docker",
      "CI/CD pipelines",
      "Git / GitHub",
      "Test-driven development",
      "Agile (Scrum, Kanban, Jira)",
      "Technical documentation",
    ],
  },
  {
    id: "leadership",
    label: "Leadership & operations",
    items: [
      "Team leadership & mentoring",
      "Operations management",
      "Requirements & stakeholder management",
      "Business development",
      "Process reengineering",
    ],
  },
];

export const VENTURES: ResumeProject[] = [
  {
    id: "mitig8-ai",
    name: "Mitig8 AI",
    description:
      "AI-assisted income analysis for self-employed mortgage borrowers — scoring the income that traditional underwriting struggles with.",
    status: "in-development",
    technologies: ["Fintech", "ML scoring"],
    verification: "needs-review",
  },
  {
    id: "ground-stasis",
    name: "Ground Stasis",
    description:
      "Construction-activity intelligence for lenders — monitoring whether funded projects are actually progressing.",
    status: "in-development",
    technologies: ["Satellite / monitoring", "Lending"],
    verification: "needs-review",
  },
  {
    id: "northreserve",
    name: "NorthReserve",
    description:
      "A financial decision engine and education tools — helping people assess and improve their financial footing.",
    status: "in-development",
    verification: "needs-review",
  },
  {
    id: "mortgagedev",
    name: "MortgageDev",
    description:
      "An agentic software concept built specifically for mortgage professionals' workflows.",
    status: "concept",
    verification: "needs-review",
  },
  {
    id: "kawsah-studio",
    name: "Kawsah Studio",
    description:
      "Real-estate technology and property-presentation concepts.",
    status: "concept",
    verification: "needs-review",
  },
];

export const PUBLICATIONS: ResumeItem[] = [
  {
    id: "books",
    title: "Three published books",
    organization: "Independently published",
    summary:
      "Books on buying real estate, selling & negotiation, and marketing systems. Titles and purchase links to be added.",
    verification: "needs-review",
  },
];

export const CERTIFICATIONS: ResumeItem[] = [
  {
    id: "mlo",
    title: "Licensed Mortgage Loan Originator — Utah",
    organization: "NMLS",
    summary:
      "Active Utah mortgage loan originator license. (NMLS number available on request.)",
    verification: "confirmed",
  },
  {
    id: "nlp",
    title: "NLP Practitioner",
    summary:
      "Practitioner-level certification in Neuro-Linguistic Programming (communication and rapport methods — not a clinical or medical credential).",
    verification: "needs-review",
  },
];

export const SUMMIT = {
  heading: "Where I'm pointed",
  statement:
    "I want to work on software that touches the real economy — finance, real estate, operations — and, further out, on bringing capital, science, and vision together to expand what's possible. Short version: practical systems now, ambitious ones next.",
  values: ["Moxie", "Perpetual learning", "Valor", "Boldness", "Integrity"],
};

/**
 * CONTENT_NOTES — open items for Marcelo to confirm. Not rendered publicly.
 * These are the only places this resume leans on judgment calls:
 *
 * 1. Amazon title — resumes say "SDE I"; the job-history dump lists the same
 *    dates/tools under "Fleet Asset Specialist (L4)." Confirm the official
 *    title (Amazon verifies on background checks). EXPERIENCE.amazon flagged.
 * 2. UDAF end date — set to Jul 2025 per project docs (the 2025 PDF said
 *    "Present" but predates the departure). Confirm the exact end date.
 * 3. Colorado College "BCS 2017" — intentionally omitted (only on the 2023
 *    resume, inconsistent, and absent from your own project docs). Add only if
 *    it's a real, completed degree.
 * 4. Alorica + mortgage + Taco Fest dates — approximate ranges from the job
 *    history; confirm exact dates.
 * 5. Contact — using Gmail + GitHub. Add LinkedIn URL; consider a
 *    marcelo@marcelobayon.com address. Phone intentionally omitted (privacy).
 * 6. NMLS number — omitted per README; say the word to include it.
 * 7. Book titles / links — needed to make PUBLICATIONS clickable.
 * 8. Venture statuses — confirm concept vs in-development per project.
 */
