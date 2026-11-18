/**
 * Accurate Technology & Technical Skills Extraction & Matcher Engine.
 *
 * Detects strictly verified technologies, programming languages, libraries,
 * frameworks, databases, cloud platforms, DevOps tools, and engineering proficiencies
 * from Job Descriptions and Resumes — eliminating generic dictionary stop words.
 */

import { SKILLS_DATABASE, SkillCategory } from "@/lib/skills-database";
import type { ResumeContent } from "@/lib/types.resume";

/** Canonical skill entry with alias search patterns. */
interface SkillDefinition {
  canonical: string;
  category: string;
  aliases: (string | RegExp)[];
}

// Build a fast lookup dictionary from SKILLS_DATABASE + high-frequency alias synonyms
const SKILL_DEFINITIONS: SkillDefinition[] = [
  // Languages & Core
  { canonical: "TypeScript", category: "Frontend", aliases: [/\btypescript\b/i, /\bts\b(?!\s*w)/i] },
  { canonical: "JavaScript", category: "Frontend", aliases: [/\bjavascript\b/i, /\bjs\b/i, /\becmascript\b/i, /\bes6\b/i] },
  { canonical: "Python", category: "Backend", aliases: [/\bpython3?\b/i, /\bpy\b/i] },
  { canonical: "Java", category: "Backend", aliases: [/\bjava\b(?!\s*script)/i] },
  { canonical: "C++", category: "Backend", aliases: [/\bc\+\+\b/i, /\bcpp\b/i] },
  { canonical: "C# / .NET", category: "Backend", aliases: [/\bc#\b/i, /\bcsharp\b/i, /\b\.net\b/i, /\bdotnet\b/i, /\basp\.net\b/i] },
  { canonical: "Go (Golang)", category: "Backend", aliases: [/\bgolang\b/i, /\bgo\s+(?:language|lang|developer|backend)\b/i] },
  { canonical: "Rust", category: "Backend", aliases: [/\brust\b(?!\s*(?:belt|color))/i, /\brustlang\b/i] },
  { canonical: "PHP", category: "Backend", aliases: [/\bphp\d?\b/i] },
  { canonical: "Ruby", category: "Backend", aliases: [/\bruby\b/i, /\bruby\s+on\s+rails\b/i, /\brails\b/i] },
  { canonical: "Swift", category: "Mobile", aliases: [/\bswift(?:ui)?\b/i] },
  { canonical: "Kotlin", category: "Mobile", aliases: [/\bkotlin\b/i] },
  { canonical: "Dart", category: "Mobile", aliases: [/\bdart\b/i] },
  { canonical: "SQL", category: "Database", aliases: [/\bsql\b/i, /\bstructured\s+query\s+language\b/i] },
  { canonical: "HTML5 / CSS3", category: "Frontend", aliases: [/\bhtml5?\b/i, /\bcss3?\b/i] },

  // Frontend Frameworks & Libraries
  { canonical: "React", category: "Frontend", aliases: [/\breact(?:\.js|js)?\b/i] },
  { canonical: "Next.js", category: "Frontend", aliases: [/\bnext(?:\.js|js)?\b/i] },
  { canonical: "Vue.js", category: "Frontend", aliases: [/\bvue(?:\.js|js)?\b/i] },
  { canonical: "Nuxt.js", category: "Frontend", aliases: [/\bnuxt(?:\.js|js)?\b/i] },
  { canonical: "Angular", category: "Frontend", aliases: [/\bangular(?:\.js|js|\s*\d+)?\b/i] },
  { canonical: "Svelte", category: "Frontend", aliases: [/\bsvelte(?:kit)?\b/i] },
  { canonical: "Tailwind CSS", category: "Frontend", aliases: [/\btailwind(?:css)?\b/i] },
  { canonical: "Redux", category: "Frontend", aliases: [/\bredux(?:-toolkit)?\b/i] },
  { canonical: "Zustand", category: "Frontend", aliases: [/\bzustand\b/i] },
  { canonical: "React Query", category: "Frontend", aliases: [/\breact-query\b/i, /\btanstack\s+query\b/i] },
  { canonical: "Webpack", category: "Frontend", aliases: [/\bwebpack\b/i] },
  { canonical: "Vite", category: "Frontend", aliases: [/\bvite(?:js)?\b/i] },

  // Backend Frameworks & APIs
  { canonical: "Node.js", category: "Backend", aliases: [/\bnode(?:\.js|js)?\b/i] },
  { canonical: "Express.js", category: "Backend", aliases: [/\bexpress(?:\.js|js)?\b/i] },
  { canonical: "NestJS", category: "Backend", aliases: [/\bnest(?:\.js|js)?\b/i] },
  { canonical: "FastAPI", category: "Backend", aliases: [/\bfastapi\b/i] },
  { canonical: "Django", category: "Backend", aliases: [/\bdjango\b/i] },
  { canonical: "Flask", category: "Backend", aliases: [/\bflask\b/i] },
  { canonical: "Spring Boot", category: "Backend", aliases: [/\bspring\s+boot\b/i, /\bspring\s+framework\b/i] },
  { canonical: "GraphQL", category: "Backend", aliases: [/\bgraphql\b/i, /\bgql\b/i] },
  { canonical: "REST API", category: "Backend", aliases: [/\brest(?:ful)?(?:\s+api[s]?)?\b/i] },
  { canonical: "gRPC", category: "Backend", aliases: [/\bgrpc\b/i] },
  { canonical: "WebSockets", category: "Backend", aliases: [/\bwebsockets?\b/i, /\bsocket\.io\b/i] },
  { canonical: "Microservices", category: "Architecture", aliases: [/\bmicroservices?\b/i, /\bmicro-services?\b/i] },

  // Databases & Storage
  { canonical: "PostgreSQL", category: "Database", aliases: [/\bpostgres(?:ql)?\b/i, /\bpsql\b/i] },
  { canonical: "MySQL", category: "Database", aliases: [/\bmysql\b/i] },
  { canonical: "MongoDB", category: "Database", aliases: [/\bmongo(?:db)?\b/i] },
  { canonical: "Redis", category: "Database", aliases: [/\bredis\b/i] },
  { canonical: "Elasticsearch", category: "Database", aliases: [/\belasticsearch\b/i, /\bopensearch\b/i] },
  { canonical: "Prisma ORM", category: "Database", aliases: [/\bprisma(?:\s+orm)?\b/i] },
  { canonical: "Drizzle ORM", category: "Database", aliases: [/\bdrizzle(?:\s+orm)?\b/i] },
  { canonical: "DynamoDB", category: "Database", aliases: [/\bdynamodb\b/i] },
  { canonical: "Cassandra", category: "Database", aliases: [/\bcassandra\b/i] },
  { canonical: "Supabase", category: "Database", aliases: [/\bsupabase\b/i] },
  { canonical: "Firebase", category: "Database", aliases: [/\bfirebase\b/i] },

  // Cloud & DevOps
  { canonical: "AWS", category: "Cloud & DevOps", aliases: [/\baws\b/i, /\bamazon\s+web\s+services\b/i, /\bec2\b/i, /\bs3\b/i, /\blambda\b/i] },
  { canonical: "Docker", category: "Cloud & DevOps", aliases: [/\bdocker\b/i, /\bcontainer(?:ization|s)?\b/i] },
  { canonical: "Kubernetes", category: "Cloud & DevOps", aliases: [/\bkubernetes\b/i, /\bk8s\b/i] },
  { canonical: "CI/CD", category: "Cloud & DevOps", aliases: [/\bci\s*\/\s*cd\b/i, /\bcicd\b/i, /\bcontinuous\s+integration\b/i] },
  { canonical: "GitHub Actions", category: "Cloud & DevOps", aliases: [/\bgithub\s+actions\b/i] },
  { canonical: "Terraform", category: "Cloud & DevOps", aliases: [/\bterraform\b/i, /\biac\b/i, /\binfrastructure\s+as\s+code\b/i] },
  { canonical: "Azure", category: "Cloud & DevOps", aliases: [/\bazure\b/i, /\bmicrosoft\s+azure\b/i] },
  { canonical: "Google Cloud (GCP)", category: "Cloud & DevOps", aliases: [/\bgcp\b/i, /\bgoogle\s+cloud(?:\s+platform)?\b/i] },
  { canonical: "Linux", category: "Cloud & DevOps", aliases: [/\blinux\b/i, /\bubuntu\b/i, /\bdebian\b/i] },
  { canonical: "Nginx", category: "Cloud & DevOps", aliases: [/\bnginx\b/i] },
  { canonical: "Kafka", category: "Cloud & DevOps", aliases: [/\b(?:apache\s+)?kafka\b/i] },
  { canonical: "RabbitMQ", category: "Cloud & DevOps", aliases: [/\brabbitmq\b/i] },

  // AI & Data
  { canonical: "Machine Learning", category: "AI & ML", aliases: [/\bmachine\s+learning\b/i, /\bml\b/i] },
  { canonical: "PyTorch", category: "AI & ML", aliases: [/\bpytorch\b/i] },
  { canonical: "TensorFlow", category: "AI & ML", aliases: [/\btensorflow\b/i] },
  { canonical: "LangChain", category: "AI & ML", aliases: [/\blangchain\b/i] },
  { canonical: "LLMs / Generative AI", category: "AI & ML", aliases: [/\bllms?\b/i, /\bgenerative\s+ai\b/i, /\bopenai\b/i, /\brag\b/i] },
  { canonical: "Pandas / NumPy", category: "AI & ML", aliases: [/\bpandas\b/i, /\bnumpy\b/i] },

  // Mobile
  { canonical: "React Native", category: "Mobile", aliases: [/\breact\s+native\b/i] },
  { canonical: "Flutter", category: "Mobile", aliases: [/\bflutter\b/i] },
  { canonical: "iOS Development", category: "Mobile", aliases: [/\bios\s+(?:development|developer|app[s]?)\b/i] },
  { canonical: "Android Development", category: "Mobile", aliases: [/\bandroid\s+(?:development|developer|app[s]?)\b/i] },

  // Testing & Quality
  { canonical: "Jest", category: "Testing", aliases: [/\bjest\b/i] },
  { canonical: "Cypress", category: "Testing", aliases: [/\bcypress\b/i] },
  { canonical: "Playwright", category: "Testing", aliases: [/\bplaywright\b/i] },
  { canonical: "Unit Testing / TDD", category: "Testing", aliases: [/\bunit\s+testing\b/i, /\btdd\b/i, /\btest-driven\b/i] },

  // Version Control & Methodologies
  { canonical: "Git", category: "Tools", aliases: [/\bgit\b(?!\s*(?:hub|lab))/i] },
  { canonical: "GitHub / GitLab", category: "Tools", aliases: [/\bgithub\b/i, /\bgitlab\b/i] },
  { canonical: "Agile / Scrum", category: "Tools", aliases: [/\bagile\b/i, /\bscrum\b/i, /\bkanban\b/i] },
  { canonical: "System Design", category: "Architecture", aliases: [/\bsystem\s+design\b/i, /\bhigh\s+availability\b/i, /\bscalable\s+systems\b/i] },
];

// Add any missing skills from SKILLS_DATABASE
for (const cat of SKILLS_DATABASE) {
  for (const skill of cat.skills) {
    if (!SKILL_DEFINITIONS.some((d) => d.canonical.toLowerCase() === skill.toLowerCase())) {
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      SKILL_DEFINITIONS.push({
        canonical: skill,
        category: cat.category,
        aliases: [new RegExp(`\\b${escaped}\\b`, "i")],
      });
    }
  }
}

/**
 * Extracts strictly verified technologies and engineering skills from arbitrary text.
 * Returns unique canonical skill names and a category mapping.
 */
export function extractTechnologies(rawText: string): {
  skills: string[];
  byCategory: Record<string, string[]>;
} {
  if (!rawText || !rawText.trim()) {
    return { skills: [], byCategory: {} };
  }

  const text = rawText;
  const foundMap = new Map<string, string>(); // canonical -> category

  for (const def of SKILL_DEFINITIONS) {
    for (const pattern of def.aliases) {
      const matches = typeof pattern === "string"
        ? text.toLowerCase().includes(pattern.toLowerCase())
        : pattern.test(text);

      if (matches) {
        foundMap.set(def.canonical, def.category);
        break;
      }
    }
  }

  const skills = Array.from(foundMap.keys()).sort((a, b) => a.localeCompare(b));
  const byCategory: Record<string, string[]> = {};

  foundMap.forEach((category, skill) => {
    if (!byCategory[category]) {
      byCategory[category] = [];
    }
    byCategory[category].push(skill);
  });

  return { skills, byCategory };
}

/**
 * Result of comparing a Resume against a Job Description.
 */
export interface JobMatchAnalysis {
  matchPercentage: number;
  rating: "Exceptional Match" | "Strong Match" | "Moderate Match" | "Low Match";
  requiredSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  bonusSkills: string[];
  skillsByCategory: {
    category: string;
    matched: string[];
    missing: string[];
  }[];
  experienceDetails: {
    detectedYearsInJob?: string;
    detectedSeniorityInJob?: string;
  };
  recommendations: string[];
}

/**
 * Compares resume text vs job description text with strict technical skill detection.
 */
export function calculateJobMatch(resumeText: string, jobDescriptionText: string): JobMatchAnalysis {
  const jobExtracted = extractTechnologies(jobDescriptionText);
  const resumeExtracted = extractTechnologies(resumeText);

  const jobSkillSet = new Set(jobExtracted.skills);
  const resumeSkillSet = new Set(resumeExtracted.skills);

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  const bonusSkills: string[] = [];

  for (const skill of jobExtracted.skills) {
    if (resumeSkillSet.has(skill)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  for (const skill of resumeExtracted.skills) {
    if (!jobSkillSet.has(skill)) {
      bonusSkills.push(skill);
    }
  }

  // Calculate percentage
  let matchPercentage = 0;
  if (jobExtracted.skills.length > 0) {
    matchPercentage = Math.round((matchedSkills.length / jobExtracted.skills.length) * 100);
  } else if (resumeExtracted.skills.length > 0) {
    matchPercentage = 80;
  }

  // Cap between 0 and 100
  matchPercentage = Math.max(0, Math.min(100, matchPercentage));

  let rating: JobMatchAnalysis["rating"] = "Low Match";
  if (matchPercentage >= 80) rating = "Exceptional Match";
  else if (matchPercentage >= 65) rating = "Strong Match";
  else if (matchPercentage >= 40) rating = "Moderate Match";

  // Build category grouping
  const allCategories = new Set([
    ...Object.keys(jobExtracted.byCategory),
    ...Object.keys(resumeExtracted.byCategory),
  ]);

  const skillsByCategory = Array.from(allCategories)
    .sort()
    .map((category) => {
      const inJob = jobExtracted.byCategory[category] || [];
      const matched = inJob.filter((s) => resumeSkillSet.has(s));
      const missing = inJob.filter((s) => !resumeSkillSet.has(s));
      return { category, matched, missing };
    })
    .filter((g) => g.matched.length > 0 || g.missing.length > 0);

  // Detect experience or seniority requirements from Job Description
  const yearsMatch = jobDescriptionText.match(/(\d+\+?\s*(?:to|-)\s*\d+|\d+\+?)\s*(?:years|yrs)\b/i);
  const seniorityMatch = jobDescriptionText.match(/\b(senior|lead|staff|principal|junior|entry-level|mid-level)\b/i);

  // Generate actionable, highly targeted recommendations
  const recommendations: string[] = [];

  if (missingSkills.length > 0) {
    const topMissing = missingSkills.slice(0, 5);
    recommendations.push(
      `Add key missing technologies required by this job: ${topMissing.join(", ")}.`
    );
    recommendations.push(
      `Incorporate missing skills directly into your Work Experience accomplishment bullets (e.g., "Engineered ${topMissing[0] || "services"}...").`
    );
  } else {
    recommendations.push(
      "Excellent skill alignment! Your resume covers all key technologies explicitly identified in the job requirements."
    );
  }

  if (seniorityMatch?.[1]) {
    recommendations.push(
      `Tailor your Professional Title and Summary to emphasize ${seniorityMatch[1].toUpperCase()} level leadership and ownership.`
    );
  }

  if (bonusSkills.length > 0) {
    recommendations.push(
      `You possess valuable extra skills (${bonusSkills.slice(0, 4).join(", ")}) that differentiate you from other candidates.`
    );
  }

  return {
    matchPercentage,
    rating,
    requiredSkills: jobExtracted.skills,
    matchedSkills,
    missingSkills,
    bonusSkills,
    skillsByCategory,
    experienceDetails: {
      detectedYearsInJob: yearsMatch ? yearsMatch[0] : undefined,
      detectedSeniorityInJob: seniorityMatch ? seniorityMatch[1] : undefined,
    },
    recommendations,
  };
}

/**
 * Converts structured ResumeContent into comprehensive searchable text.
 */
export function extractTextFromResumeContent(c: ResumeContent): string {
  const parts: string[] = [];
  parts.push(c.personal.fullName || "");
  parts.push(c.personal.title || "");
  parts.push(c.personal.location || "");
  parts.push(c.summary || c.personal.summary || "");

  for (const exp of c.experience || []) {
    parts.push(`${exp.jobTitle} ${exp.company} ${exp.location}`);
    parts.push(exp.bullets.join(" "));
  }

  for (const g of c.skillGroups || []) {
    parts.push(`${g.category}: ${g.skills.join(", ")}`);
  }

  for (const pr of c.projects || []) {
    parts.push(`${pr.name} ${pr.description} ${pr.technologies.join(", ")} ${pr.outcomes}`);
  }

  for (const ed of c.education || []) {
    parts.push(`${ed.degree} ${ed.field} ${ed.institution}`);
  }

  for (const cert of c.certifications || []) {
    parts.push(`${cert.title} ${cert.issuer}`);
  }

  return parts.join("\n");
}
