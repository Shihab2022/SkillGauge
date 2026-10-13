/* Resume builder & ATS analyzer domain types (mirror server validation). */

export interface ResumePersonal {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  summary: string;
}

export interface ResumeExperience {
  id?: string;
  company: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  current: boolean;
  location: string;
  bullets: string[];
}

export interface ResumeEducation {
  id?: string;
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
  gpa: string;
}

export interface ResumeSkillGroup {
  id?: string;
  category: string;
  skills: string[];
}

export interface ResumeProject {
  id?: string;
  name: string;
  description: string;
  technologies: string[];
  url: string;
  githubUrl: string;
  outcomes: string;
}

export interface ResumeGenericItem {
  id?: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
  url: string;
}

export interface ResumeLanguage {
  language: string;
  proficiency: string;
}

export interface ResumeContent {
  personal: ResumePersonal;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skillGroups: ResumeSkillGroup[];
  projects: ResumeProject[];
  certifications: ResumeGenericItem[];
  languages: ResumeLanguage[];
  awards: ResumeGenericItem[];
  volunteer: ResumeGenericItem[];
  publications: ResumeGenericItem[];
  sectionOrder: string[];
}

export interface ResumeCustomization {
  font?: string;
  accentColor?: string;
  spacing?: "compact" | "normal" | "relaxed";
  fontSize?: "small" | "medium" | "large";
}

export type ResumeStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Resume {
  id: string;
  ownerId: string;
  title: string;
  targetRole: string | null;
  content: ResumeContent;
  templateId: string;
  customization: ResumeCustomization | null;
  status: ResumeStatus;
  publicSlug: string | null;
  isPublic: boolean;
  latestScore: number | null;
  lastAnalyzedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeVersion {
  id: string;
  resumeId: string;
  version: number;
  content: ResumeContent;
  templateId: string | null;
  label: string | null;
  createdAt: string;
}

export interface JobDescription {
  id: string;
  ownerId: string;
  title: string;
  company: string | null;
  description: string;
  sourceUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryScore {
  key: string;
  label: string;
  max: number;
  score: number;
  deductions: string[];
}

export interface AnalysisReport {
  overallScore: number;
  categoryScores: CategoryScore[];
  ats: { extraction: string; headings: string[]; risks: string[]; contact: string[] };
  content: { summary: string[]; experience: string[]; skills: string[]; language: string[] };
  keywords: { present: string[]; notes: string[] };
  actionPlan: { critical: string[]; highImpact: string[]; optional: string[] };
  jobMatch: {
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    demonstratedExperience: string[];
    bulletImprovements: string[];
    emphasis: string[];
    checklist: string[];
  } | null;
  provider: "openai" | "deterministic";
}

export interface ResumeAnalysis {
  id: string;
  ownerId: string;
  resumeId: string | null;
  jobDescriptionId: string | null;
  source: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  resumeText: string | null;
  fileName: string | null;
  fileMime: string | null;
  sourceUrl: string | null;
  score: number | null;
  categoryScores: CategoryScore[] | null;
  report: AnalysisReport | null;
  provider: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}
