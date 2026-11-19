import {
  ANTI_CHEAT_EVENT_TYPES,
  type BadgeTone,
} from "./constants";

/**
 * Landing-page content & marketing registry.
 *
 * All platform capabilities, feature descriptions, live statistics, navigation
 * links, and FAQ entries are centralized here.
 */

/* -------------------------------------------------------------------- nav */

export interface LandingNavLink {
  href: string;
  label: string;
  badge?: string;
}

/**
 * Primary header navigation with direct real routes.
 */
export const LANDING_NAV: LandingNavLink[] = [
  { href: "/practice", label: "Practice Arena" },
  { href: "/playground", label: "Compiler" },
  { href: "/exams", label: "Exams" },
  { href: "/resume-builder", label: "Resume Suite" },
  { href: "/competitions", label: "Competitions" },
];

/**
 * Secondary routes / links shown in header navigation.
 */
export const HEADER_ROUTE_LINKS: LandingNavLink[] = [
  { href: "#ai-interviews", label: "AI Interviews", badge: "AI" },
  { href: "/register/company", label: "For Teams" },
];

/**
 * Resolves a navigation href for the current route.
 */
export function resolveNavHref(href: string, pathname: string | null): string {
  if (!href.startsWith("#")) return href;
  return pathname === "/" ? href : `/${href}`;
}

/* ------------------------------------------------------------------ stats */

export interface LandingStat {
  value: string;
  label: string;
  hint: string;
}

/** Verified capability numbers across the SkillGauge platform. */
export const LANDING_STATS: LandingStat[] = [
  {
    value: "1,000+",
    label: "Curated Practice Problems",
    hint: "DSA, frontend, backend & SQL with visible and hidden test cases",
  },
  {
    value: "10 Runtimes",
    label: "In-Browser Compiler",
    hint: "JS, TS, Python WASM, SQLite WASM, Go, Java, React + MUI",
  },
  {
    value: "AI Proctoring",
    label: "Video Interviews",
    hint: "Multi-face, phone, voice & tab defocus infraction telemetry",
  },
  {
    value: "0–100 ATS",
    label: "Deterministic Resume Score",
    hint: "6-pillar evaluation rubric & Job Description keyword gap match",
  },
  {
    value: "100% Server",
    label: "Authoritative Clock",
    hint: "Zero client clock drift, auto-submit & multi-session lock",
  },
];

/* ---------------------------------------------------------------- pillars */

export interface LandingFeature {
  id: string;
  eyebrow: string;
  title: string;
  blurb: string;
  icon: string;
  tone: BadgeTone;
  bullets: string[];
  cta: { label: string; href: string };
  featured?: boolean;
}

export const LANDING_FEATURES: LandingFeature[] = [
  {
    id: "ai-interviews",
    eyebrow: "AI Video Interviews · B2B",
    title: "Proctored Asynchronous AI Video Interviews",
    blurb:
      "Screen candidates asynchronously with in-browser webcam & microphone recordings, dynamic question feeds, real-time AI proctoring telemetry, and automated rubric evaluation.",
    icon: "Video",
    tone: "violet",
    featured: true,
    bullets: [
      "Zero-install browser recording room with dynamic per-question timers & progressive hints",
      "Real-time AI proctoring: multiple faces, mobile phones, secondary voices & tab blur",
      "Visual evidence capture: automated timestamped snapshots at every infraction",
      "AI transcript grading with actionable hiring recommendations (STRONG_HIRE to NO_HIRE)",
    ],
    cta: { label: "Explore AI Interviews", href: "/recruiter/interviews" },
  },
  {
    id: "resume-suite",
    eyebrow: "AI Resume Suite · Free Guest Mode",
    title: "Visual Resume Builder & Deterministic ATS Analyzer",
    blurb:
      "Build ATS-parseable resumes from 20+ professional templates, score your resume 0–100 against real job descriptions, and export print-ready A4 PDFs with zero login required.",
    icon: "FileText",
    tone: "blue",
    featured: true,
    bullets: [
      "Deterministic 0–100 scoring across 6 key pillars: ATS layout, experience impact, skills, summary, education & grammar",
      "Job Description keyword match & skill gap analysis identifying missing competencies",
      "20+ ATS-optimized templates across 10 categories with live styling & section reordering",
      "Instant Guest Mode: build, edit and analyze immediately without an account",
    ],
    cta: { label: "Launch Resume Builder", href: "/resume-builder" },
  },
  {
    id: "practice",
    eyebrow: "Practice Arena",
    title: "1,000+ Problem Practice Arena with Test Runner",
    blurb:
      "Work through LeetCode-style challenges across algorithms, data structures, full-stack, and SQL. Code in Monaco and test against visible examples and strict hidden test cases.",
    icon: "Code2",
    tone: "green",
    bullets: [
      "1,000+ curated problems categorized into Easy, Medium, and Hard tiers",
      "Dual test cases: visible examples for debugging plus hidden test suite for strict grading",
      "Monaco editor with multi-language execution, instant output, and memory/runtime metrics",
      "Filter by technology, tags (Dynamic Programming, Trees, SQL, Hooks), and difficulty",
    ],
    cta: { label: "Solve Problems Free", href: "/practice" },
  },
  {
    id: "playground",
    eyebrow: "Online Compiler",
    title: "10-Language In-Browser Compiler & REPL",
    blurb:
      "A fast, zero-install scratchpad for 10 runtimes: JavaScript, TypeScript, Python (Pyodide WASM), SQLite WASM with live tabular data, Go, Java, HTML, CSS, Tailwind, and React + MUI.",
    icon: "Terminal",
    tone: "indigo",
    bullets: [
      "Client-side Web Worker sandboxes for JavaScript & TypeScript with zero latency",
      "Full CPython execution inside WebAssembly via Pyodide — run real Python in the browser",
      "In-browser SQLite WASM with pre-loaded schemas and live relational result tables",
      "Live sandboxed preview for HTML, CSS, Tailwind CSS, and React + MUI",
    ],
    cta: { label: "Open Online Compiler", href: "/playground" },
  },
  {
    id: "exams",
    eyebrow: "Certification Exams",
    title: "Standardized Technology Certification Exams",
    blurb:
      "Sit timed, auto-graded technology exams across React, Node.js, TypeScript, Python, SQL, and DevOps. Earn shareable digital scorecards that prove hands-on proficiency.",
    icon: "Award",
    tone: "amber",
    bullets: [
      "Exams across modern frontend, backend, databases, and DevOps technologies",
      "Server-authoritative timer prevents browser tampering or client clock modification",
      "Anti-cheat question and option randomization per candidate attempt",
      "Digital scorecards with skill-wise breakdowns and verifiable pass/fail verdicts",
    ],
    cta: { label: "Take a Tech Exam", href: "/exams" },
  },
  {
    id: "assessments",
    eyebrow: "Recruiter Platform",
    title: "Enterprise Assessments & Candidate Pipeline",
    blurb:
      "Companies and universities create custom technical assessments, dispatch single-use email invitations, track candidates through hiring stages, and export detailed CSV reports.",
    icon: "Users",
    tone: "blue",
    bullets: [
      "Author coding problems with custom test cases, MCQs, and subjective written questions",
      "Candidate pipeline management: Invited → Started → Completed → Shortlisted → Hired",
      "Single-use secure email invitation tokens with granular lifecycle status",
      "Collaborative recruiter notes, analytics dashboards, and one-click CSV export",
    ],
    cta: { label: "Create Team Workspace", href: "/register/company" },
  },
  {
    id: "competitions",
    eyebrow: "Competitions",
    title: "Live Coding Competitions & Hackathons",
    blurb:
      "Host time-boxed coding tournaments with real-time synchronized leaderboards, strict timers, and automated tie-breaking based on score and submission speed.",
    icon: "Trophy",
    tone: "red",
    bullets: [
      "Configurable contest parameters: duration, open window, pass mark, and attempt rules",
      "Live synchronized leaderboard ranking participants by points and earliest solve",
      "Automated evaluation pipeline for instantaneous verdict generation",
      "Ideal for university hackathons, corporate coding challenges, and public cups",
    ],
    cta: { label: "Browse Competitions", href: "/competitions" },
  },
  {
    id: "proctoring",
    eyebrow: "Anti-Cheating Telemetry",
    title: "Multi-Sensor Proctoring & Audit Trail",
    blurb:
      "Every exam attempt and interview is monitored by multi-layered integrity telemetry, giving review panels a timestamped infraction timeline and calculated risk score.",
    icon: "ShieldCheck",
    tone: "red",
    bullets: [
      `${ANTI_CHEAT_EVENT_TYPES.length} telemetry signals: tab switches, window blur, fullscreen exits & clipboard copy/paste`,
      "Multi-session and concurrent IP detection to eliminate proxy test taking",
      "Immutable audit logs, soft-deletion recovery, and role-based access control",
      "Server-authoritative timers that auto-submit attempts immediately upon expiration",
    ],
    cta: { label: "See Security Details", href: "/register/company" },
  },
];

export const LANDING_PILLARS = LANDING_FEATURES;

export const LANDING_PILLARS_BY_ID: Record<string, LandingFeature> = Object.fromEntries(
  LANDING_FEATURES.map((pillar) => [pillar.id, pillar]),
);

/** Look up a pillar's copy (falls back to the first feature). */
export function pillarById(id: string): LandingFeature {
  return LANDING_PILLARS_BY_ID[id] ?? LANDING_FEATURES[0]!;
}

/* ----------------------------------------------------------------- tracks */

export interface LandingTrackGroup {
  category: string;
  description: string;
  items: string[];
}

/** Technologies a candidate can be examined or tested on today. */
export const LANDING_TRACKS: LandingTrackGroup[] = [
  {
    category: "Frontend & UI",
    description: "Semantics, responsive styling, modern frameworks and UI component design.",
    items: ["React", "Next.js", "TypeScript", "JavaScript", "HTML5", "CSS3", "Tailwind CSS"],
  },
  {
    category: "Backend & Systems",
    description: "API design, concurrency, relational data modelling and server runtimes.",
    items: ["Node.js", "Express", "Python", "SQL", "PostgreSQL", "Go", "Java", "Prisma"],
  },
  {
    category: "DevOps & Cloud",
    description: "Containerization, deployment lifecycles, automation and infrastructure.",
    items: ["Docker", "Linux CLI", "Git & CI/CD", "Redis", "Cloud Deployment"],
  },
  {
    category: "Computer Science",
    description: "Core problem-solving fundamentals that transcend language boundaries.",
    items: ["Data Structures", "Algorithms", "Time Complexity", "System Design", "Clean Code"],
  },
];

/* ------------------------------------------------------------- playground */

export interface PlaygroundDemo {
  language: string;
  label: string;
  file: string;
  code: string[];
  output: string[];
  elapsed: string;
}

/** Preview snippets for the marketing code panel. */
export const PLAYGROUND_DEMOS: PlaygroundDemo[] = [
  {
    language: "javascript",
    label: "JavaScript",
    file: "twoSum.js",
    code: [
      "// Two Sum - Find indices of numbers adding to target",
      "function twoSum(nums, target) {",
      "  const map = new Map();",
      "  for (let i = 0; i < nums.length; i++) {",
      "    const diff = target - nums[i];",
      "    if (map.has(diff)) return [map.get(diff), i];",
      "    map.set(nums[i], i);",
      "  }",
      "  return [];",
      "}",
      "",
      "console.log('Result:', twoSum([2, 7, 11, 15], 9));",
    ],
    output: ["> Result: [0, 1]", "exit 0 · 38 ms · 0 errors"],
    elapsed: "38 ms",
  },
  {
    language: "typescript",
    label: "TypeScript",
    file: "analytics.ts",
    code: [
      "interface Candidate { id: string; score: number; passed: boolean }",
      "",
      "function calculatePassingRate(candidates: Candidate[]): string {",
      "  const passed = candidates.filter(c => c.passed).length;",
      "  const rate = (passed / candidates.length) * 100;",
      "  return `${rate.toFixed(1)}%`;",
      "}",
      "",
      "const data = [{ id: 'c1', score: 92, passed: true }, { id: 'c2', score: 84, passed: true }];",
      "console.log('Pass rate:', calculatePassingRate(data));",
    ],
    output: ["> Pass rate: 100.0%", "typecheck passed · exit 0"],
    elapsed: "1.1 s",
  },
  {
    language: "python",
    label: "Python",
    file: "solution.py",
    code: [
      "# Pyodide In-Browser Python REPL",
      "def max_subarray(nums: list[int]) -> int:",
      "    cur_sum = max_sum = nums[0]",
      "    for num in nums[1:]:",
      "        cur_sum = max(num, cur_sum + num)",
      "        max_sum = max(max_sum, cur_sum)",
      "    return max_sum",
      "",
      "print('Max contiguous sum:', max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]))",
    ],
    output: ["> Max contiguous sum: 6", "Pyodide WASM runtime · exit 0 · 62 ms"],
    elapsed: "62 ms",
  },
  {
    language: "sql",
    label: "SQL",
    file: "queries.sql",
    code: [
      "-- In-Browser SQLite WASM Query",
      "SELECT",
      "  c.name AS company,",
      "  COUNT(a.id) AS total_assessments,",
      "  AVG(att.score) AS average_score",
      "FROM companies c",
      "JOIN assessments a ON a.company_id = c.id",
      "JOIN attempts att ON att.assessment_id = a.id",
      "WHERE att.status = 'COMPLETED'",
      "GROUP BY c.id",
      "ORDER BY average_score DESC;",
    ],
    output: [
      "company         | total_assessments | average_score",
      "Acme Cloud Corp | 48                | 88.6",
      "Nexus Systems   | 32                | 84.1",
      "2 rows returned · 14 ms",
    ],
    elapsed: "14 ms",
  },
];

/* ---------------------------------------------------------- how it works */

export interface LandingStep {
  step: string;
  title: string;
  description: string;
  icon: string;
}

export const LANDING_STEPS: LandingStep[] = [
  {
    step: "01",
    title: "Pick Your Path",
    description:
      "Join as a developer to practice 1,000+ problems, build an ATS resume, and certify skills — or create a company workspace to hire at scale.",
    icon: "UserPlus",
  },
  {
    step: "02",
    title: "Assess or Practice",
    description:
      "Take timed technology exams, test solutions in the 10-language sandbox, or set up proctored AI video interviews with automated rubrics.",
    icon: "FilePlus2",
  },
  {
    step: "03",
    title: "Real-Time Proctoring",
    description:
      "Server-authoritative timers, tab focus detection, copy-paste guards, and AI facial/audio monitoring ensure uncompromised integrity.",
    icon: "Timer",
  },
  {
    step: "04",
    title: "Instant AI & Automated Scoring",
    description:
      "Get deterministic 0–100 ATS feedback, instant code verdicts across hidden tests, and AI interview hiring recommendations.",
    icon: "BarChart3",
  },
];

/* ------------------------------------------------------------- audiences */

export interface LandingAudience {
  id: string;
  label: string;
  kind: "B2B" | "B2C";
  headline: string;
  description: string;
  bullets: string[];
  cta: { label: string; href: string };
}

export const LANDING_AUDIENCES: LandingAudience[] = [
  {
    id: "candidates",
    label: "Developers & Candidates",
    kind: "B2C",
    headline: "Prove real engineering skills, not just resume keywords",
    description:
      "SkillGauge gives engineers a complete career toolkit: solve 1,000+ LeetCode-style problems, experiment in a 10-language online compiler, build ATS-optimized resumes with instant score feedback, and sit standardized exams for digital scorecards.",
    bullets: [
      "1,000+ coding challenges across algorithms, data structures, SQL and frontend",
      "10-language in-browser compiler with Pyodide Python WASM & SQLite WASM",
      "Visual ATS Resume Builder with deterministic 0–100 score & job description match",
      "Standardized technology certification exams with verifiable digital scorecards",
      "Completely free for individual developers with zero credit card required",
    ],
    cta: { label: "Start Practicing Free", href: "/practice" },
  },
  {
    id: "companies",
    label: "Companies & Recruiters",
    kind: "B2B",
    headline: "Hire verified technical talent faster with AI proctoring",
    description:
      "Screen engineering candidates with standardized coding assessments, run asynchronous proctored AI video interviews, evaluate full candidate pipelines, and eliminate resume fraud with multi-sensor telemetry.",
    bullets: [
      "Proctored asynchronous AI video interviews with webcam, mic, and face/phone detection",
      "Server-authoritative exams with zero client clock drift and tab blur telemetry",
      "Recruiter candidate pipeline: Invited → Started → Completed → Shortlisted → Hired",
      "Private company question authoring alongside 1,000+ shared questions",
      "Pay per candidate with transparent credit packages, not bloated per-seat pricing",
    ],
    cta: { label: "Create Company Workspace", href: "/register/company" },
  },
  {
    id: "institutes",
    label: "Universities & Bootcamps",
    kind: "B2B",
    headline: "Run classroom exams and hackathons on one engine",
    description:
      "Universities, coding bootcamps, and developer communities use SkillGauge to administer semester exams, lab practicals, and inter-college hackathons with synchronized live leaderboards.",
    bullets: [
      "Bulk invite entire student cohorts with single-use secure exam links",
      "Real-time synchronized leaderboards for coding competitions and hackathons",
      "Anti-cheating detection logs every tab switch, copy-paste, and unauthorized window blur",
      "Automated evaluation across hidden test suites for unbiased objective grading",
      "Export cohort grade sheets and analytics directly to CSV for administrative records",
    ],
    cta: { label: "Set Up Cohort Assessments", href: "/register/company" },
  },
];

/* --------------------------------------------------- extra capabilities */

export interface LandingCapability {
  title: string;
  description: string;
  icon: string;
}

export const LANDING_CAPABILITIES: LandingCapability[] = [
  {
    title: "AI Video Interviews",
    description:
      "Asynchronous video screening with automated AI transcription, question rubrics, and hiring recommendations.",
    icon: "Video",
  },
  {
    title: "ATS Resume Analyzer",
    description:
      "Deterministic 0–100 scoring, job description keyword gap match, and 20+ ATS-optimized templates.",
    icon: "FileText",
  },
  {
    title: "10-Language Browser Compiler",
    description:
      "Monaco editor with Pyodide Python WASM, SQLite WASM tables, Web Worker JS/TS, and live HTML/CSS previews.",
    icon: "Terminal",
  },
  {
    title: "Anti-Cheating Telemetry",
    description:
      "Server-authoritative clock, tab switch tracking, window blur detection, and multi-session locks.",
    icon: "ShieldCheck",
  },
  {
    title: "Recruitment Pipeline & Notes",
    description:
      "Track candidates through hiring stages, share internal recruiter notes, and export CSV reports.",
    icon: "Users",
  },
  {
    title: "Digital Certifications & Scorecards",
    description:
      "Verifiable scorecards showing percentage, points, percentile rank, and question-by-question breakdown.",
    icon: "Award",
  },
];

/* -------------------------------------------------------------------- faq */

export interface LandingFaq {
  question: string;
  answer: string;
}

export const LANDING_FAQ: LandingFaq[] = [
  {
    question: "What makes SkillGauge different from other coding platforms?",
    answer:
      "SkillGauge is an all-in-one developer career and assessment platform with two front doors. For developers (B2C), it offers a completely free 1,000+ problem practice arena, a 10-language in-browser compiler, standardized certification exams, and a visual ATS resume builder with deterministic 0–100 scoring. For companies (B2B), it provides proctored AI video interviews, server-timed coding assessments with anti-cheat telemetry, and candidate pipeline tracking.",
  },
  {
    question: "How do proctored AI Video Interviews work?",
    answer:
      "Candidates complete asynchronous interview questions in their browser with their camera and microphone enabled — no desktop apps needed. SkillGauge's AI proctoring telemetry monitors the attempt in real-time, detecting multiple faces, obstructed cameras, mobile phone usage, secondary voices, and tab switches. Visual snapshot evidence is captured for every infraction. Transcripts are automatically evaluated by AI against structured rubrics to generate candidate strengths, weaknesses, and hiring recommendations (STRONG_HIRE, HIRE, MAYBE, NO_HIRE).",
  },
  {
    question: "How does the ATS Resume Analyzer and Builder work?",
    answer:
      "The Resume Suite features a visual drag-and-drop builder with 20+ ATS-optimized templates and real-time A4 PDF export. The ATS Analyzer uses a deterministic 0–100 rubric evaluating 6 core pillars: ATS parseability, quantified experience impact, skills coverage, professional summary, education/projects, and grammar. You can also compare your resume against any Job Description to identify missing keywords and technical competencies. It even features a zero-login Guest Mode so you can build and analyze immediately.",
  },
  {
    question: "Which programming languages and runtimes are supported?",
    answer:
      "The in-browser Online Compiler supports 10 runtimes: JavaScript and TypeScript run in zero-latency client Web Workers, Python runs via full CPython compiled to WebAssembly (Pyodide), SQL runs client-side with SQLite WASM and interactive result tables, HTML/CSS/Tailwind and React + MUI render in a sandboxed live preview, while Go and Java execute via remote sandboxes with streaming stdout/stderr.",
  },
  {
    question: "How does anti-cheating and proctoring work on technical exams?",
    answer:
      "SkillGauge uses a server-authoritative clock where attempt durations are strictly calculated against database timestamps, completely eliminating client clock manipulation. Real-time telemetry records tab switches, window blur, fullscreen exits, copy-paste attempts, and concurrent multi-device logins. Recruiters receive an infraction timeline and calculated risk score with every completed attempt.",
  },
  {
    question: "Is SkillGauge free for individual developers, and how do teams pay?",
    answer:
      "Yes, SkillGauge is 100% free for individual developers: you can practice problems, use the 10-language compiler, take standardized certification exams, and build ATS resumes without paying a cent. Companies purchase transparent credit packages: each invited candidate consumes one credit from the company balance, meaning teams only pay per candidate evaluated instead of expensive per-seat subscriptions.",
  },
];

/* ---------------------------------------------------------------- footer */

export interface LandingFooterGroup {
  title: string;
  links: { label: string; href: string }[];
}

export const LANDING_FOOTER_GROUPS: LandingFooterGroup[] = [
  {
    title: "Developers & Learners (B2C)",
    links: [
      { label: "Practice Arena (1,000+ Problems)", href: "/practice" },
      { label: "10-Language Online Compiler", href: "/playground" },
      { label: "Technology Certification Exams", href: "/exams" },
      { label: "AI ATS Resume Builder", href: "/resume-builder" },
      { label: "Deterministic Resume Analyzer", href: "/resume-analyzer" },
      { label: "ATS Resume Templates", href: "/resume-templates" },
      { label: "Coding Competitions", href: "/competitions" },
    ],
  },
  {
    title: "Enterprise & Recruiters (B2B)",
    links: [
      { label: "Proctored AI Video Interviews", href: "/recruiter/interviews" },
      { label: "Assessment Builder & Question Bank", href: "/register/company" },
      { label: "Candidate Pipeline & Analytics", href: "/recruiter/candidates" },
      { label: "Anti-Cheating Telemetry", href: "/register/company" },
      { label: "Create Company Workspace", href: "/register/company" },
      { label: "Recruiter Join with Code", href: "/register/recruiter" },
    ],
  },
  {
    title: "Platform & Quick Access",
    links: [
      { label: "Candidate Registration", href: "/register/candidate" },
      { label: "Company Registration", href: "/register/company" },
      { label: "Account Sign In", href: "/login" },
      { label: "Platform Overview", href: "/#features" },
      { label: "Frequently Asked Questions", href: "/#faq" },
    ],
  },
];
