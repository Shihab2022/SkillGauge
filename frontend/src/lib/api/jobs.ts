import { apiDelete, apiGet, apiGetPaginated, apiPatch, apiPost } from "@/lib/api";
import { compactParams } from "@/lib/utils";
import type {
  JobPosting,
  JobApplication,
  CreateJobPostingPayload,
  SubmitApplicationPayload,
  JobApplicationStatus,
} from "@/lib/types.jobs";
import { endpoints } from "./endpoints";

export interface JobListParams {
  search?: string;
  department?: string;
  workplaceType?: string;
  employmentType?: string;
  seniority?: string;
  companySlug?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const jobsApi = {
  // Public
  listPublic: (params?: JobListParams) =>
    apiGetPaginated<JobPosting>(endpoints.jobs.listPublic, {
      params: compactParams({ ...(params ?? {}) }),
    }),

  companyCareer: (companySlug: string) =>
    apiGet<{
      company: any;
      totalOpenings: number;
      departments: Record<string, JobPosting[]>;
      jobs: JobPosting[];
    }>(endpoints.jobs.companyCareer(companySlug)),

  publicJob: (idOrSlug: string, companySlug?: string) =>
    apiGet<JobPosting>(endpoints.jobs.publicJob(idOrSlug), {
      params: compactParams({ company: companySlug }),
    }),

  apply: (idOrSlug: string, payload: SubmitApplicationPayload) =>
    apiPost<{
      applicationId: string;
      jobTitle: string;
      companyName: string;
      message: string;
    }>(endpoints.jobs.apply(idOrSlug), payload),

  // Candidate
  candidateApplications: () =>
    apiGet<JobApplication[]>(endpoints.jobs.candidateApplications),

  // Recruiter
  recruiterMine: (params?: JobListParams) =>
    apiGetPaginated<JobPosting>(endpoints.jobs.recruiterMine, {
      params: compactParams({ ...(params ?? {}) }),
    }),

  recruiterCreate: (payload: CreateJobPostingPayload) =>
    apiPost<JobPosting>(endpoints.jobs.recruiterCreate, payload),

  recruiterById: (id: string) =>
    apiGet<JobPosting>(endpoints.jobs.recruiterById(id)),

  recruiterUpdate: (id: string, payload: Partial<CreateJobPostingPayload>) =>
    apiPatch<JobPosting>(endpoints.jobs.recruiterById(id), payload),

  recruiterDelete: (id: string) =>
    apiDelete<{ success: boolean; message: string }>(
      endpoints.jobs.recruiterById(id),
    ),

  recruiterApplications: (jobId: string, params?: { status?: string; search?: string; page?: number; limit?: number }) =>
    apiGetPaginated<JobApplication>(
      endpoints.jobs.recruiterApplications(jobId),
      { params: compactParams({ ...(params ?? {}) }) },
    ),

  recruiterAllApplications: (params?: { status?: string; search?: string; page?: number; limit?: number }) =>
    apiGetPaginated<JobApplication>(
      endpoints.jobs.recruiterAllApplications,
      { params: compactParams({ ...(params ?? {}) }) },
    ),

  recruiterApplication: (applicationId: string) =>
    apiGet<JobApplication>(endpoints.jobs.recruiterApplication(applicationId)),

  recruiterUpdateStatus: (
    applicationId: string,
    payload: { status?: JobApplicationStatus; notes?: string | null; rating?: number | null },
  ) =>
    apiPatch<JobApplication>(
      endpoints.jobs.recruiterUpdateStatus(applicationId),
      payload,
    ),

  recruiterInviteAssessment: (
    applicationId: string,
    payload: { assessmentId?: string },
  ) =>
    apiPost<{
      invitationId: string;
      token: string;
      assessmentTitle: string;
      message: string;
    }>(endpoints.jobs.recruiterInviteAssessment(applicationId), payload),

  recruiterInviteInterview: (
    applicationId: string,
    payload: { interviewId?: string },
  ) =>
    apiPost<{
      sessionId: string;
      sessionToken: string;
      interviewTitle: string;
      message: string;
    }>(endpoints.jobs.recruiterInviteInterview(applicationId), payload),
};
