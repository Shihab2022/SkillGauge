import type { ResumeContent } from "./resume.validation";

export const SCORING_WEIGHTS = {
  atsReadability: 25,
  experience: 25,
  skills: 20,
  summary: 10,
  educationProjects: 10,
  grammar: 10,
} as const;

export interface CategoryScore {
  key: keyof typeof SCORING_WEIGHTS;
  label: string;
  max: number;
  score: number;
  deductions: string[];
}

export interface DeterministicScore {
  total: number;
  categories: CategoryScore[];
}

const ACTION_VERBS = ["built", "led", "designed", "developed", "implemented"];
const MEASURE_RE = /(\d+\s?%|\d[\d,.]*\s?(users|ms|req|tests?|engineers?)|\$\s?\d)/i;
const VAGUE_RE = /\b(responsible for|helped with|worked on|various|etc)\b/i;

export function resumeToPlainText(c: ResumeContent, role?: string | null): string {
  const parts: string[] = [];
  parts.push(`${c.personal.fullName} — ${c.personal.title}`);
  parts.push(`${c.personal.email} | ${c.personal.phone} | ${c.personal.location}`);
  const summary = c.summary || c.personal.summary;
  if (summary) parts.push(`SUMMARY\n${summary}`);
  parts.push("EXPERIENCE");
  for (const e of c.experience) {
    parts.push(`${e.jobTitle} at ${e.company}`);
    for (const b of e.bullets) parts.push(`- ${b}`);
  }
  parts.push("EDUCATION");
  for (const ed of c.education) parts.push(`${ed.degree} ${ed.field}, ${ed.institution}`);
  parts.push("SKILLS");
  for (const g of c.skillGroups) parts.push(`${g.category}: ${g.skills.join(", ")}`);
  if (role) parts.push(`TARGET ROLE: ${role}`);
  return parts.join("\n");
}

export function scoreResumeDeterministic(c: ResumeContent): DeterministicScore {
  const cats: CategoryScore[] = [];
  const push = (key: CategoryScore["key"], label: string, max: number, score: number, deductions: string[] = []) =>
    cats.push({ key, label, max, score: Math.max(0, Math.min(max, Math.round(score))), deductions });

  let s1 = 25;
  const d1: string[] = [];
  if (!c.personal.fullName.trim()) { s1 -= 5; d1.push("Missing full name (-5)."); }
  if (!c.personal.email.trim()) { s1 -= 5; d1.push("Missing contact email (-5)."); }
  if (!c.experience.length) { s1 -= 5; d1.push("No experience section (-5)."); }
  if (!c.education.length) { s1 -= 3; d1.push("No education section (-3)."); }
  if (!c.skillGroups.length) { s1 -= 3; d1.push("No skills section (-3)."); }
  push("atsReadability", "ATS readability & structure", 25, s1, d1);

  const d2: string[] = [];
  let s2 = 0;
  if (!c.experience.length) d2.push("Add experience with achievement bullets.");
  else {
    s2 = 12;
    const bullets = c.experience.flatMap((e) => e.bullets);
    const measured = bullets.filter((b) => MEASURE_RE.test(b)).length;
    const verbs = bullets.filter((b) => ACTION_VERBS.some((v) => b.toLowerCase().startsWith(v))).length;
    const vague = bullets.filter((b) => VAGUE_RE.test(b)).length;
    s2 += Math.min(6, measured * 2) + Math.min(4, verbs);
    if (!measured) d2.push("No measurable results — quantify impact.");
    if (vague) { s2 -= Math.min(4, vague); d2.push(`${vague} vague bullet(s).`); }
    s2 = Math.min(25, s2);
  }
  push("experience", "Experience & achievements", 25, s2, d2);

  const n = c.skillGroups.reduce((x, g) => x + g.skills.length, 0);
  const d3: string[] = [];
  let s3 = Math.min(20, 6 + n);
  if (n < 5) d3.push(`Only ${n} skills — aim for 8+.`);
  if (!c.skillGroups.length) { s3 = 4; d3.push("Categorize skills."); }
  push("skills", "Skills & role relevance", 20, s3, d3);

  const summary = (c.summary || c.personal.summary || "").trim();
  const words = summary ? summary.split(/\s+/).length : 0;
  const d4: string[] = [];
  let s4 = 0;
  if (!summary) d4.push("Add a 2-4 line professional summary.");
  else if (words < 20) { s4 = 4; d4.push("Summary too short."); }
  else if (words > 120) { s4 = 6; d4.push("Summary too long."); }
  else s4 = 9;
  push("summary", "Professional summary", 10, s4, d4);

  const d5: string[] = [];
  let s5 = 2;
  if (c.education.length) s5 += 3; else d5.push("Add education.");
  if (c.projects.length) s5 += 3; else d5.push("Add 1-3 projects.");
  if (c.certifications.length) s5 += 2;
  push("educationProjects", "Education & projects", 10, s5, d5);

  const d6: string[] = [];
  let s6 = 10;
  const bulletsAll = c.experience.flatMap((e) => e.bullets);
  if (bulletsAll.filter((b) => /^[a-z]/.test(b.trim())).length > 0) { s6 -= 2; d6.push("Some bullets start lowercase."); }
  push("grammar", "Grammar & consistency", 10, s6, d6);

  return { total: cats.reduce((x, y) => x + y.score, 0), categories: cats };
}

export interface JobMatch {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  demonstratedExperience: string[];
  bulletImprovements: string[];
  emphasis: string[];
  checklist: string[];
}

export interface AnalysisReport {
  overallScore: number;
  categoryScores: CategoryScore[];
  ats: { extraction: string; headings: string[]; risks: string[]; contact: string[] };
  content: { summary: string[]; experience: string[]; skills: string[]; language: string[] };
  keywords: { present: string[]; notes: string[] };
  actionPlan: { critical: string[]; highImpact: string[]; optional: string[] };
  jobMatch: JobMatch | null;
  provider: "openai" | "deterministic";
}

const TECHNICAL_SKILLS_DICTIONARY: { name: string; pattern: RegExp }[] = [
  { name: "TypeScript", pattern: /\btypescript\b|\bts\b(?!\s*w)/i },
  { name: "JavaScript", pattern: /\bjavascript\b|\bjs\b|\bes6\b/i },
  { name: "React", pattern: /\breact(?:\.js|js)?\b/i },
  { name: "Next.js", pattern: /\bnext(?:\.js|js)?\b/i },
  { name: "Node.js", pattern: /\bnode(?:\.js|js)?\b/i },
  { name: "Python", pattern: /\bpython3?\b/i },
  { name: "PostgreSQL", pattern: /\bpostgres(?:ql)?\b|\bpsql\b/i },
  { name: "MongoDB", pattern: /\bmongo(?:db)?\b/i },
  { name: "Redis", pattern: /\bredis\b/i },
  { name: "Docker", pattern: /\bdocker\b/i },
  { name: "Kubernetes", pattern: /\bkubernetes\b|\bk8s\b/i },
  { name: "AWS", pattern: /\baws\b|\bamazon\s+web\s+services\b/i },
  { name: "Azure", pattern: /\bazure\b/i },
  { name: "GCP", pattern: /\bgcp\b|\bgoogle\s+cloud\b/i },
  { name: "GraphQL", pattern: /\bgraphql\b/i },
  { name: "REST API", pattern: /\brest(?:ful)?(?:\s+api)?\b/i },
  { name: "CI/CD", pattern: /\bci\s*\/\s*cd\b|\bcicd\b/i },
  { name: "Tailwind CSS", pattern: /\btailwind(?:css)?\b/i },
  { name: "Java", pattern: /\bjava\b(?!\s*script)/i },
  { name: "Go / Golang", pattern: /\bgolang\b|\bgo\s+language\b/i },
  { name: "Rust", pattern: /\brustlang\b|\brust\b(?!\s*belt)/i },
  { name: "C# / .NET", pattern: /\bc#\b|\bcsharp\b|\b\.net\b/i },
  { name: "SQL", pattern: /\bsql\b/i },
  { name: "Jest / Vitest", pattern: /\bjest\b|\bvitest\b/i },
  { name: "Cypress / Playwright", pattern: /\bcypress\b|\bplaywright\b/i },
  { name: "Microservices", pattern: /\bmicroservices?\b/i },
  { name: "System Design", pattern: /\bsystem\s+design\b/i },
  { name: "Git", pattern: /\bgit\b(?!\s*(?:hub|lab))/i },
  { name: "Linux", pattern: /\blinux\b/i },
  { name: "Kafka", pattern: /\bkafka\b/i },
  { name: "RabbitMQ", pattern: /\brabbitmq\b/i },
  { name: "Machine Learning", pattern: /\bmachine\s+learning\b|\bml\b/i },
];

export function buildDeterministicReport(content: ResumeContent, text: string, job?: string | null): AnalysisReport {
  const { total, categories } = scoreResumeDeterministic(content);
  const lower = text.toLowerCase();
  const present = TECHNICAL_SKILLS_DICTIONARY.filter((s) => s.pattern.test(text)).map((s) => s.name);
  let jobMatch: JobMatch | null = null;
  if (job) {
    const jobSkills = TECHNICAL_SKILLS_DICTIONARY.filter((s) => s.pattern.test(job)).map((s) => s.name);
    const resumeSkills = TECHNICAL_SKILLS_DICTIONARY.filter((s) => s.pattern.test(text)).map((s) => s.name);

    const matched = jobSkills.filter((s) => resumeSkills.includes(s));
    const missing = jobSkills.filter((s) => !resumeSkills.includes(s));

    const score = jobSkills.length > 0
      ? Math.round((matched.length / jobSkills.length) * 100)
      : (resumeSkills.length > 5 ? 80 : 50);

    jobMatch = {
      score,
      matchedSkills: matched,
      missingSkills: missing,
      demonstratedExperience: content.experience.slice(0, 3).map((e) => `${e.jobTitle} at ${e.company}`),
      bulletImprovements: missing.length > 0
        ? [`Incorporate missing required skills (${missing.slice(0, 3).join(", ")}) into work achievements.`]
        : ["Mirror the job ad verbs in top bullets."],
      emphasis: [matched.length > 0 ? `Highlight top matching technologies: ${matched.slice(0, 4).join(", ")}.` : "Reorder skills so ad-mentioned skills appear first."],
      checklist: ["Add exact job title once if it matches.", "Quantify one more bullet per role."],
    };
  }
  return {
    overallScore: total, categoryScores: categories,
    ats: {
      extraction: text.length > 200 ? "Good — text extracted cleanly." : "Weak — little extractable text.",
      headings: ["Use SUMMARY, EXPERIENCE, EDUCATION, SKILLS, PROJECTS."],
      risks: ["Single-column parses best; avoid tables, icons, headers/footers."],
      contact: [content.personal.email ? "Email readable." : "Email missing."],
    },
    content: {
      summary: categories.find((c) => c.key === "summary")?.deductions ?? [],
      experience: categories.find((c) => c.key === "experience")?.deductions ?? [],
      skills: categories.find((c) => c.key === "skills")?.deductions ?? [],
      language: categories.find((c) => c.key === "grammar")?.deductions ?? [],
    },
    keywords: { present, notes: ["Mirror job-ad vocabulary; never stuff keywords."] },
    actionPlan: {
      critical: categories.flatMap((c) => c.deductions).slice(0, 3),
      highImpact: ["Quantify 2-3 more achievements.", "Tailor summary to target role."],
      optional: ["Add certifications or languages if relevant."],
    },
    jobMatch, provider: "deterministic",
  };
}

