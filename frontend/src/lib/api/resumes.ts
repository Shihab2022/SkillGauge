import { apiDelete, apiGet, apiGetPaginated, apiPatch, apiPost } from "@/lib/api/client";
import { endpoints } from "./endpoints";
import { compactParams } from "@/lib/utils";
import type {
  JobDescription, Resume, ResumeAnalysis, ResumeContent, ResumeCustomization, ResumeStatus, ResumeVersion,
} from "@/lib/types.resume";

export interface ResumeListParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: ResumeStatus;
}

export interface CreateResumePayload {
  title: string;
  targetRole?: string;
  content?: ResumeContent;
  templateId?: string;
  customization?: ResumeCustomization;
  status?: ResumeStatus;
}

export interface UpdateResumePayload {
  title?: string;
  targetRole?: string | null;
  content?: ResumeContent;
  templateId?: string;
  customization?: ResumeCustomization | null;
  status?: ResumeStatus;
  isPublic?: boolean;
}

export interface CreateAnalysisPayload {
  resumeId?: string;
  resumeText?: string;
  jobDescriptionId?: string;
  jobDescription?: string;
  source?: "BUILDER" | "UPLOAD" | "URL";
  fileName?: string;
  fileMime?: string;
  sourceUrl?: string;
}

export interface AiAssistPayload {
  action: string;
  text: string;
  context?: string;
  targetRole?: string;
}

export const resumesApi = {
  scoringModel: () => apiGet<{ weights: Record<string, number>; total: number; note: string }>(endpoints.resumes.scoringModel),

  list: (params?: ResumeListParams) =>
    apiGetPaginated<Resume>(endpoints.resumes.list, { params: compactParams({ ...(params ?? {}) }) }),

  create: (payload: CreateResumePayload) => apiPost<Resume>(endpoints.resumes.list, payload),

  get: (resumeId: string) => apiGet<Resume>(endpoints.resumes.byId(resumeId)),

  update: (resumeId: string, payload: UpdateResumePayload) =>
    apiPatch<Resume>(endpoints.resumes.byId(resumeId), payload),

  remove: (resumeId: string) => apiDelete<unknown>(endpoints.resumes.byId(resumeId)),

  duplicate: (resumeId: string, title?: string) =>
    apiPost<Resume>(endpoints.resumes.duplicate(resumeId), { title }),

  versions: (resumeId: string) => apiGet<ResumeVersion[]>(endpoints.resumes.versions(resumeId)),

  snapshot: (resumeId: string, label?: string) =>
    apiPost<ResumeVersion>(endpoints.resumes.versions(resumeId), { label }),

  shared: (slug: string) => apiGet<Resume>(endpoints.resumes.shared(slug)),

  // Analyses
  analyses: (params?: { page?: number; limit?: number }) =>
    apiGetPaginated<ResumeAnalysis>(endpoints.resumes.analyses, { params: compactParams({ ...(params ?? {}) }) }),

  analyze: (payload: CreateAnalysisPayload) =>
    apiPost<ResumeAnalysis>(endpoints.resumes.analyze, payload, { timeout: 120_000 }),

  analysis: (analysisId: string) => apiGet<ResumeAnalysis>(endpoints.resumes.analysisById(analysisId)),

  deleteAnalysis: (analysisId: string) => apiDelete<unknown>(endpoints.resumes.analysisById(analysisId)),

  // Jobs
  jobs: () => apiGet<JobDescription[]>(endpoints.resumes.jobs),

  createJob: (payload: { title: string; company?: string; description: string; sourceUrl?: string }) =>
    apiPost<JobDescription>(endpoints.resumes.jobs, payload),

  updateJob: (jobId: string, payload: Partial<{ title: string; company: string | null; description: string; sourceUrl: string | null }>) =>
    apiPatch<JobDescription>(endpoints.resumes.jobById(jobId), payload),

  deleteJob: (jobId: string) => apiDelete<unknown>(endpoints.resumes.jobById(jobId)),

  // AI assist + URL intake
  assist: (payload: AiAssistPayload) =>
    apiPost<{ suggestion: string; provider: string }>(endpoints.resumes.assist, payload, { timeout: 90_000 }),

  fetchUrl: (url: string) =>
    apiPost<{ text: string; mime: string }>(endpoints.resumes.fetchUrl, { url }, { timeout: 60_000 }),
};

export default resumesApi;
