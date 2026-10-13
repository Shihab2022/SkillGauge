import { z } from "zod";

const personalInfoSchema = z.object({
  fullName: z.string().min(1).max(120),
  title: z.string().max(120).optional().default(""),
  email: z.string().email().max(160).or(z.literal("")),
  phone: z.string().max(40).optional().default(""),
  location: z.string().max(120).optional().default(""),
  linkedin: z.string().max(255).optional().default(""),
  github: z.string().max(255).optional().default(""),
  portfolio: z.string().max(255).optional().default(""),
  summary: z.string().max(2000).optional().default(""),
});

const experienceSchema = z.object({
  id: z.string().max(64).optional(),
  company: z.string().min(1).max(160),
  jobTitle: z.string().min(1).max(160),
  startDate: z.string().max(20).optional().default(""),
  endDate: z.string().max(20).optional().default(""),
  current: z.boolean().optional().default(false),
  location: z.string().max(120).optional().default(""),
  bullets: z.array(z.string().max(600)).max(20).default([]),
});

const educationSchema = z.object({
  id: z.string().max(64).optional(),
  institution: z.string().min(1).max(160),
  degree: z.string().max(160).optional().default(""),
  field: z.string().max(160).optional().default(""),
  graduationDate: z.string().max(20).optional().default(""),
  gpa: z.string().max(20).optional().default(""),
});

const projectSchema = z.object({
  id: z.string().max(64).optional(),
  name: z.string().min(1).max(160),
  description: z.string().max(1200).optional().default(""),
  technologies: z.array(z.string().max(60)).max(30).default([]),
  url: z.string().max(255).optional().default(""),
  githubUrl: z.string().max(255).optional().default(""),
  outcomes: z.string().max(600).optional().default(""),
});

const skillGroupSchema = z.object({
  id: z.string().max(64).optional(),
  category: z.string().min(1).max(80),
  skills: z.array(z.string().max(60)).max(40).default([]),
});

const genericItemSchema = z.object({
  id: z.string().max(64).optional(),
  title: z.string().min(1).max(200),
  issuer: z.string().max(200).optional().default(""),
  date: z.string().max(20).optional().default(""),
  description: z.string().max(800).optional().default(""),
  url: z.string().max(255).optional().default(""),
});

export const resumeContentSchema = z.object({
  personal: personalInfoSchema,
  summary: z.string().max(2000).optional().default(""),
  experience: z.array(experienceSchema).max(15).default([]),
  education: z.array(educationSchema).max(8).default([]),
  skillGroups: z.array(skillGroupSchema).max(10).default([]),
  projects: z.array(projectSchema).max(10).default([]),
  certifications: z.array(genericItemSchema).max(20).default([]),
  languages: z.array(z.object({ language: z.string().max(60), proficiency: z.string().max(60).optional().default("") })).max(15).default([]),
  awards: z.array(genericItemSchema).max(20).default([]),
  volunteer: z.array(genericItemSchema).max(15).default([]),
  publications: z.array(genericItemSchema).max(15).default([]),
  sectionOrder: z.array(z.string().max(40)).max(20).optional().default([]),
});

export const customizationSchema = z.object({
  font: z.string().max(60).optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  spacing: z.enum(["compact", "normal", "relaxed"]).optional(),
  fontSize: z.enum(["small", "medium", "large"]).optional(),
}).partial();

export type ResumeContent = z.infer<typeof resumeContentSchema>;

export const createResumeSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(160),
    targetRole: z.string().max(120).optional(),
    content: resumeContentSchema.optional(),
    templateId: z.string().min(1).max(80).optional(),
    customization: customizationSchema.optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  }).strict(),
});

export const updateResumeSchema = z.object({
  params: z.object({ resumeId: z.string().uuid("Invalid resume id") }),
  body: z.object({
    title: z.string().min(1).max(160).optional(),
    targetRole: z.string().max(120).optional().nullable(),
    content: resumeContentSchema.optional(),
    templateId: z.string().min(1).max(80).optional(),
    customization: customizationSchema.optional().nullable(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
    isPublic: z.boolean().optional(),
  }).strict().refine((d) => Object.keys(d).length > 0, { message: "At least one field must be provided" }),
});

export const resumeParamsSchema = z.object({
  params: z.object({ resumeId: z.string().uuid("Invalid resume id") }),
});

export const resumeListQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    q: z.string().max(120).optional(),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  }).strict(),
});

export const duplicateResumeSchema = z.object({
  params: z.object({ resumeId: z.string().uuid("Invalid resume id") }),
  body: z.object({ title: z.string().min(1).max(160).optional() }).strict(),
});

export const createVersionSchema = z.object({
  params: z.object({ resumeId: z.string().uuid("Invalid resume id") }),
  body: z.object({ label: z.string().max(160).optional() }).strict(),
});

export const createJobSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(160),
    company: z.string().max(160).optional(),
    description: z.string().min(20).max(20000),
    sourceUrl: z.string().url().max(500).optional(),
  }).strict(),
});

export const updateJobSchema = z.object({
  params: z.object({ jobId: z.string().uuid("Invalid job id") }),
  body: z.object({
    title: z.string().min(1).max(160).optional(),
    company: z.string().max(160).optional().nullable(),
    description: z.string().min(20).max(20000).optional(),
    sourceUrl: z.string().url().max(500).optional().nullable(),
  }).strict().refine((d) => Object.keys(d).length > 0, { message: "At least one field must be provided" }),
});

export const jobParamsSchema = z.object({
  params: z.object({ jobId: z.string().uuid("Invalid job id") }),
});

export const createAnalysisSchema = z.object({
  body: z.object({
    resumeId: z.string().uuid().optional(),
    resumeText: z.string().min(50).max(30000).optional(),
    jobDescriptionId: z.string().uuid().optional(),
    jobDescription: z.string().min(20).max(20000).optional(),
    source: z.enum(["BUILDER", "UPLOAD", "URL"]).optional(),
    fileName: z.string().max(255).optional(),
    fileMime: z.string().max(120).optional(),
    sourceUrl: z.string().url().max(500).optional(),
  }).strict(),
});

export const analysisParamsSchema = z.object({
  params: z.object({ analysisId: z.string().uuid("Invalid analysis id") }),
});

export const analysisListQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }).strict(),
});

export const AI_ASSIST_ACTIONS = [
  "improve-bullet",
  "professional-tone",
  "make-concise",
  "highlight-impact",
  "improve-summary",
  "fix-grammar",
  "suggest-skills",
  "make-clearer",
  "tailor-to-job",
  "generate-summary",
  "cover-letter",
  "interview-questions",
] as const;

export const aiAssistSchema = z.object({
  body: z.object({
    action: z.enum(AI_ASSIST_ACTIONS),
    text: z.string().min(1).max(8000),
    context: z.string().max(20000).optional(),
    targetRole: z.string().max(120).optional(),
  }).strict(),
});

export const fetchUrlSchema = z.object({
  body: z.object({
    url: z.string().url("Must be a valid http(s) URL").max(500),
  }).strict(),
});

export const publicResumeParamsSchema = z.object({
  params: z.object({ slug: z.string().min(1).max(64) }),
});

