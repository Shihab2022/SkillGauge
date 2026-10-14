import type { ResumeCustomization } from "@/lib/types.resume";

export type TemplateCategory =
  | "Classic Professional"
  | "Modern Professional"
  | "Minimalist"
  | "Corporate"
  | "Executive"
  | "Creative"
  | "Technical"
  | "Academic"
  | "Graduate"
  | "Experienced";

export interface ResumeTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  atsSafe: boolean;
  atsNote?: string;
  accent: string;
  font: "serif" | "sans" | "mono" | "display";
  layout: "single" | "sidebar-left" | "header-band" | "two-col" | "centered" | "ruled" | "executive";
}

export const TEMPLATES: ResumeTemplate[] = [
  { id: "ats-classic-01", name: "ATS Classic", category: "Classic Professional", description: "Plain single-column default.", atsSafe: true, accent: "#1e3a5f", font: "serif", layout: "single" },
  { id: "classic-ledger-02", name: "Ledger Classic", category: "Classic Professional", description: "Ruled serif headings with generous whitespace.", atsSafe: true, accent: "#334155", font: "serif", layout: "ruled" },
  { id: "modern-nova-01", name: "Nova Modern", category: "Modern Professional", description: "Clean sans, teal accents.", atsSafe: true, accent: "#0f766e", font: "sans", layout: "single" },
  { id: "modern-pulse-02", name: "Pulse Modern", category: "Modern Professional", description: "Indigo header band.", atsSafe: true, accent: "#4f46e5", font: "sans", layout: "header-band" },
  { id: "minimal-essence-01", name: "Essence Minimal", category: "Minimalist", description: "Monochrome whitespace.", atsSafe: true, accent: "#111827", font: "sans", layout: "single" },
  { id: "minimal-line-02", name: "Hairline Minimal", category: "Minimalist", description: "Centered quiet type.", atsSafe: true, accent: "#374151", font: "sans", layout: "centered" },
  { id: "corporate-board-01", name: "Boardroom", category: "Corporate", description: "Navy structured headings for corporate roles.", atsSafe: true, accent: "#1e40af", font: "serif", layout: "executive" },
  { id: "corporate-slate-02", name: "Slate Corporate", category: "Corporate", description: "Slate sidebar layout.", atsSafe: false, atsNote: "Sidebar order may confuse older parsers.", accent: "#0f172a", font: "sans", layout: "sidebar-left" },
  { id: "exec-summit-01", name: "Summit Executive", category: "Executive", description: "Centered senior masthead.", atsSafe: true, accent: "#7c2d12", font: "serif", layout: "centered" },
  { id: "exec-heritage-02", name: "Heritage Executive", category: "Executive", description: "Gold-rule serif polish for senior leaders.", atsSafe: true, accent: "#92400e", font: "serif", layout: "executive" },
];

export const TEMPLATES_EXTRA: ResumeTemplate[] = [
  { id: "creative-muse-01", name: "Muse Creative", category: "Creative", description: "Editorial display type for design portfolios.", atsSafe: false, atsNote: "Decorative layout — not for ATS portals. Export PDF for email/direct sends.", accent: "#db2777", font: "display", layout: "centered" },
  { id: "creative-studio-02", name: "Studio Creative", category: "Creative", description: "Bold band with card-style sections.", atsSafe: false, atsNote: "Card blocks may not parse — keep an ATS twin for portals.", accent: "#7c3aed", font: "display", layout: "header-band" },
  { id: "tech-terminal-01", name: "Terminal Engineer", category: "Technical", description: "Monospace developer sheet with skill chips.", atsSafe: true, accent: "#065f46", font: "mono", layout: "single" },
  { id: "tech-stack-02", name: "Stack Engineer", category: "Technical", description: "Two-column technical sheet for deep stacks.", atsSafe: false, atsNote: "Columns can scramble reading order — use the single-column twin for ATS.", accent: "#0e7490", font: "mono", layout: "two-col" },
  { id: "academic-scholar-01", name: "Scholar Academic", category: "Academic", description: "Publication-first serif for researchers.", atsSafe: true, accent: "#3f3f46", font: "serif", layout: "ruled" },
  { id: "academic-ivy-02", name: "Ivy Academic", category: "Academic", description: "Classic research detail with numbered sections.", atsSafe: true, accent: "#1c1917", font: "serif", layout: "single" },
  { id: "grad-launch-01", name: "Launch Graduate", category: "Graduate", description: "Entry-level layout leading with projects and education.", atsSafe: true, accent: "#15803d", font: "sans", layout: "single" },
  { id: "grad-campus-02", name: "Campus Graduate", category: "Graduate", description: "Internship header band for recent graduates.", atsSafe: true, accent: "#0369a1", font: "sans", layout: "header-band" },
  { id: "senior-veteran-01", name: "Veteran Pro", category: "Experienced", description: "Dense long-career layout with timeline rules.", atsSafe: true, accent: "#44403c", font: "serif", layout: "ruled" },
  { id: "senior-command-02", name: "Command Pro", category: "Experienced", description: "Left-rail timeline for 10+ year careers.", atsSafe: false, atsNote: "Use the ATS-safe twin for portals; rail order may confuse parsers.", accent: "#9a3412", font: "sans", layout: "sidebar-left" },
];

export const ALL_TEMPLATES: ResumeTemplate[] = [...TEMPLATES, ...TEMPLATES_EXTRA];

export const TEMPLATE_CATEGORY_LIST: TemplateCategory[] = ["Classic Professional", "Modern Professional", "Minimalist", "Corporate", "Executive", "Creative", "Technical", "Academic", "Graduate", "Experienced"];

export function getTemplate(id: string): ResumeTemplate {
  return ALL_TEMPLATES.find((t) => t.id === id) ?? ALL_TEMPLATES[0]!;
}

export function templateStyle(t: ResumeTemplate, c?: ResumeCustomization | null) {
  const accent = c?.accentColor ?? t.accent;
  const spacing = c?.spacing ?? "normal";
  const size = c?.fontSize ?? "medium";
  const fontFamily =
    t.font === "serif" ? "Georgia, 'Times New Roman', serif"
    : t.font === "mono" ? "ui-monospace, SFMono-Regular, Menlo, monospace"
    : t.font === "display" ? "'Segoe UI', Verdana, sans-serif"
    : "Inter, 'Segoe UI', Arial, sans-serif";
  return {
    "--accent": accent, fontFamily,
    fontSize: size === "small" ? "12.5px" : size === "large" ? "14.5px" : "13.5px",
    lineHeight: spacing === "compact" ? 1.35 : spacing === "relaxed" ? 1.7 : 1.5,
  } as React.CSSProperties;
}

export const DEFAULT_SECTION_ORDER = ["summary", "experience", "skills", "projects", "education", "certifications", "languages", "awards", "volunteer", "publications"];

export function emptyResumeContent() {
  const uid = () => Math.random().toString(36).slice(2, 9);
  return {
    personal: { fullName: "", title: "", email: "", phone: "", location: "", linkedin: "", github: "", portfolio: "", summary: "" },
    summary: "", experience: [], education: [],
    skillGroups: [{ id: uid(), category: "Technical Skills", skills: [] as string[] }],
    projects: [], certifications: [], languages: [], awards: [], volunteer: [], publications: [],
    sectionOrder: [...DEFAULT_SECTION_ORDER],
  };
}

export function sampleResumeContent() {
  const uid = () => Math.random().toString(36).slice(2, 9);
  return {
    personal: {
      fullName: "Shihab Rahman", title: "Full-Stack Engineer",
      email: "shihab@example.com", phone: "+880 1700-000000", location: "Dhaka, Bangladesh",
      linkedin: "linkedin.com/in/shihab", github: "github.com/shihab", portfolio: "shihab.dev", summary: "",
    },
    summary: "Full-stack engineer with 4 years building SaaS products in React, Node.js and PostgreSQL. Shipped features used by 40k users and cut API latency by 45%.",
    experience: [
      { id: uid(), company: "TechCorp Solutions", jobTitle: "Full-Stack Engineer", startDate: "Jan 2023", endDate: "", current: true, location: "Dhaka", bullets: ["Built a multi-tenant assessment platform serving 40k candidates.", "Reduced API p95 latency by 45% with Redis caching.", "Led 3 engineers; shipped CI/CD cutting release time to 2 hours."] },
    ],
    education: [{ id: uid(), institution: "Bangladesh University of Engineering", degree: "B.Sc.", field: "Computer Science", graduationDate: "2021", gpa: "3.7/4.0" }],
    skillGroups: [{ id: uid(), category: "Languages", skills: ["TypeScript", "JavaScript", "Python", "SQL"] }],
    projects: [{ id: uid(), name: "SkillGauge", description: "Developer assessment platform.", technologies: ["Next.js", "Express", "PostgreSQL"], url: "", githubUrl: "", outcomes: "500 weekly users." }],
    certifications: [{ id: uid(), title: "AWS Certified Developer", issuer: "Amazon", date: "2023", description: "", url: "" }],
    languages: [{ language: "English", proficiency: "Fluent" }],
    awards: [], volunteer: [], publications: [],
    sectionOrder: [...DEFAULT_SECTION_ORDER],
  };
}
