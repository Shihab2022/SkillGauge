export type JobWorkplaceType = "REMOTE" | "HYBRID" | "ON_SITE";
export type JobEmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "INTERNSHIP";
export type JobSeniority = "ENTRY" | "MID" | "SENIOR" | "LEAD" | "EXECUTIVE";
export type JobPostingStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
export type JobApplicationStatus =
  | "APPLIED"
  | "SCREENING"
  | "SHORTLISTED"
  | "INTERVIEWING"
  | "OFFERED"
  | "REJECTED"
  | "HIRED"
  | "WITHDRAWN";

export interface CustomQuestion {
  id: string;
  question: string;
  type:
    | "text"
    | "textarea"
    | "select"
    | "radio"
    | "boolean"
    | "number"
    | "file"
    | "url";
  required?: boolean;
  placeholder?: string;
  options?: string[];
  description?: string;
}

export interface JobCompanyInfo {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  description?: string | null;
  website?: string | null;
  industry?: string | null;
  location?: string | null;
  size?: string | null;
}

export interface JobPosting {
  id: string;
  companyId: string;
  company: JobCompanyInfo;
  creatorId: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  workplaceType: JobWorkplaceType;
  employmentType: JobEmploymentType;
  seniority: JobSeniority;
  salaryCurrency: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryInterval: string;
  equityBonus?: string | null;
  overview?: string | null;
  description: string;
  requirements?: string | null;
  customQuestions?: CustomQuestion[];
  assessmentId?: string | null;
  assessment?: { id: string; title: string; durationMinutes?: number } | null;
  interviewId?: string | null;
  interview?: { id: string; title: string; technology?: string } | null;
  status: JobPostingStatus;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    applications: number;
  };
  applicationBreakdown?: Record<string, number>;
}

export interface JobApplicationAnswer {
  questionId: string;
  question: string;
  answer: any;
}

export interface JobApplication {
  id: string;
  jobPostingId: string;
  jobPosting?: {
    id: string;
    title: string;
    slug: string;
    department: string;
    location?: string;
    workplaceType?: JobWorkplaceType;
    employmentType?: JobEmploymentType;
    company?: JobCompanyInfo;
    assessmentId?: string | null;
    interviewId?: string | null;
    assessment?: { id: string; title: string } | null;
    interview?: { id: string; title: string } | null;
  };
  candidateId?: string | null;
  candidate?: {
    id: string;
    name: string;
    email: string;
    profileImageUrl?: string | null;
    skills?: string[];
  } | null;
  fullName: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  currentCompany?: string | null;
  currentTitle?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  resumeUrl?: string | null;
  resumeFileName?: string | null;
  resumeText?: string | null;
  resumeData?: string | null;
  resumeSourceId?: string | null;
  coverLetter?: string | null;
  answers?: JobApplicationAnswer[];
  status: JobApplicationStatus;
  notes?: string | null;
  rating?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobPostingPayload {
  title: string;
  department: string;
  location: string;
  workplaceType: JobWorkplaceType;
  employmentType: JobEmploymentType;
  seniority: JobSeniority;
  salaryCurrency?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryInterval?: string;
  equityBonus?: string | null;
  overview?: string | null;
  description: string;
  requirements?: string | null;
  customQuestions?: CustomQuestion[];
  assessmentId?: string | null;
  interviewId?: string | null;
  status?: JobPostingStatus;
}

export interface SubmitApplicationPayload {
  fullName: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  currentCompany?: string | null;
  currentTitle?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  resumeUrl?: string | null;
  resumeFileName?: string | null;
  resumeText?: string | null;
  resumeData?: string | null;
  resumeSourceId?: string | null;
  coverLetter?: string | null;
  answers?: JobApplicationAnswer[];
}
