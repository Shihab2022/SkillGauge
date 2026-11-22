import { z } from "zod";

export const JobWorkplaceTypeEnum = z.enum(["REMOTE", "HYBRID", "ON_SITE"]);
export const JobEmploymentTypeEnum = z.enum([
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
]);
export const JobSeniorityEnum = z.enum([
  "ENTRY",
  "MID",
  "SENIOR",
  "LEAD",
  "EXECUTIVE",
]);
export const JobPostingStatusEnum = z.enum([
  "DRAFT",
  "PUBLISHED",
  "CLOSED",
  "ARCHIVED",
]);
export const JobApplicationStatusEnum = z.enum([
  "APPLIED",
  "SCREENING",
  "SHORTLISTED",
  "INTERVIEWING",
  "OFFERED",
  "REJECTED",
  "HIRED",
  "WITHDRAWN",
]);

export const customQuestionSchema = z.object({
  id: z.string(),
  question: z.string().min(3),
  type: z.enum(["text", "textarea", "select", "radio", "boolean", "number"]),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  description: z.string().optional(),
});

export const createJobPostingSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(200),
    department: z.string().min(1).max(100).default("Engineering"),
    location: z.string().min(1).max(150).default("Remote"),
    workplaceType: JobWorkplaceTypeEnum.default("REMOTE"),
    employmentType: JobEmploymentTypeEnum.default("FULL_TIME"),
    seniority: JobSeniorityEnum.default("MID"),
    salaryCurrency: z.string().min(1).max(10).default("USD"),
    salaryMin: z.number().int().nonnegative().nullable().optional(),
    salaryMax: z.number().int().nonnegative().nullable().optional(),
    salaryInterval: z.string().default("YEARLY"),
    equityBonus: z.string().max(200).nullable().optional(),
    overview: z.string().max(2000).nullable().optional(),
    description: z.string().min(20, "Job description must be at least 20 characters"),
    requirements: z.string().nullable().optional(),
    customQuestions: z.array(customQuestionSchema).optional().default([]),
    assessmentId: z.string().uuid().nullable().optional(),
    interviewId: z.string().uuid().nullable().optional(),
    status: JobPostingStatusEnum.default("PUBLISHED"),
  }),
});

export const updateJobPostingSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    department: z.string().min(1).max(100).optional(),
    location: z.string().min(1).max(150).optional(),
    workplaceType: JobWorkplaceTypeEnum.optional(),
    employmentType: JobEmploymentTypeEnum.optional(),
    seniority: JobSeniorityEnum.optional(),
    salaryCurrency: z.string().min(1).max(10).optional(),
    salaryMin: z.number().int().nonnegative().nullable().optional(),
    salaryMax: z.number().int().nonnegative().nullable().optional(),
    salaryInterval: z.string().optional(),
    equityBonus: z.string().max(200).nullable().optional(),
    overview: z.string().max(2000).nullable().optional(),
    description: z.string().min(20).optional(),
    requirements: z.string().nullable().optional(),
    customQuestions: z.array(customQuestionSchema).optional(),
    assessmentId: z.string().uuid().nullable().optional(),
    interviewId: z.string().uuid().nullable().optional(),
    status: JobPostingStatusEnum.optional(),
  }),
});

export const listJobPostingsQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    department: z.string().optional(),
    workplaceType: JobWorkplaceTypeEnum.optional(),
    employmentType: JobEmploymentTypeEnum.optional(),
    seniority: JobSeniorityEnum.optional(),
    companySlug: z.string().optional(),
    status: JobPostingStatusEnum.optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const submitApplicationSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, "Full name is required").max(120),
    email: z.string().email("Valid email address is required"),
    phone: z.string().max(40).optional().nullable(),
    location: z.string().max(120).optional().nullable(),
    currentCompany: z.string().max(120).optional().nullable(),
    currentTitle: z.string().max(120).optional().nullable(),
    linkedinUrl: z.string().url().max(300).optional().nullable().or(z.literal("")),
    githubUrl: z.string().url().max(300).optional().nullable().or(z.literal("")),
    portfolioUrl: z.string().url().max(300).optional().nullable().or(z.literal("")),
    resumeUrl: z.string().max(2000).optional().nullable(),
    resumeFileName: z.string().max(255).optional().nullable(),
    resumeText: z.string().optional().nullable(),
    resumeData: z.string().optional().nullable(),
    resumeSourceId: z.string().uuid().optional().nullable(),
    coverLetter: z.string().max(10000).optional().nullable(),
    answers: z
      .array(
        z.object({
          questionId: z.string(),
          question: z.string(),
          answer: z.any(),
        }),
      )
      .optional()
      .default([]),
  }),
});

export const updateApplicationStatusSchema = z.object({
  body: z.object({
    status: JobApplicationStatusEnum.optional(),
    notes: z.string().max(5000).optional().nullable(),
    rating: z.number().int().min(1).max(5).optional().nullable(),
  }),
});

export const inviteApplicantAssessmentSchema = z.object({
  body: z.object({
    assessmentId: z.string().uuid().optional(),
  }),
});

export const inviteApplicantInterviewSchema = z.object({
  body: z.object({
    interviewId: z.string().uuid().optional(),
  }),
});
