"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getErrorMessage, jobsApi, type JobListParams } from "@/lib/api";
import { qk } from "@/lib/query/keys";
import type {
  CreateJobPostingPayload,
  SubmitApplicationPayload,
  JobApplicationStatus,
} from "@/lib/types.jobs";

/* ------------------------------------------------------------- Public Queries */

export function usePublicJobs(params?: JobListParams) {
  return useQuery({
    queryKey: qk.jobs.listPublic(params),
    queryFn: () => jobsApi.listPublic(params),
    placeholderData: (previous) => previous,
  });
}

export function useCompanyCareer(companySlug: string | undefined) {
  return useQuery({
    queryKey: qk.jobs.companyCareer(companySlug ?? ""),
    queryFn: () => jobsApi.companyCareer(companySlug!),
    enabled: Boolean(companySlug),
  });
}

export function usePublicJob(
  idOrSlug: string | undefined,
  companySlug?: string,
) {
  return useQuery({
    queryKey: qk.jobs.publicJob(idOrSlug ?? "", companySlug),
    queryFn: () => jobsApi.publicJob(idOrSlug!, companySlug),
    enabled: Boolean(idOrSlug),
  });
}

export function useSubmitJobApplication(idOrSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitApplicationPayload) =>
      jobsApi.apply(idOrSlug, payload),
    onSuccess: (data) => {
      toast.success(data.message || "Application submitted successfully!");
      queryClient.invalidateQueries({
        queryKey: qk.jobs.candidateApplications,
      });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Failed to submit application");
    },
  });
}

/* ------------------------------------------------------------- Candidate Queries */

export function useCandidateApplications() {
  return useQuery({
    queryKey: qk.jobs.candidateApplications,
    queryFn: () => jobsApi.candidateApplications(),
  });
}

/* ------------------------------------------------------------- Recruiter Queries */

export function useCompanyJobPostings(params?: JobListParams) {
  return useQuery({
    queryKey: qk.jobs.recruiterMine(params),
    queryFn: () => jobsApi.recruiterMine(params),
    placeholderData: (previous) => previous,
  });
}

export function useCompanyJobPosting(id: string | undefined) {
  return useQuery({
    queryKey: qk.jobs.recruiterDetail(id ?? ""),
    queryFn: () => jobsApi.recruiterById(id!),
    enabled: Boolean(id),
  });
}

export function useJobApplications(
  jobId: string | undefined,
  params?: { status?: string; search?: string; page?: number; limit?: number },
) {
  return useQuery({
    queryKey: qk.jobs.recruiterApplications(jobId ?? "", params),
    queryFn: () => jobsApi.recruiterApplications(jobId!, params),
    enabled: Boolean(jobId),
    placeholderData: (previous) => previous,
  });
}

export function useAllCompanyApplications(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: qk.jobs.recruiterAllApplications(params),
    queryFn: () => jobsApi.recruiterAllApplications(params),
    placeholderData: (previous) => previous,
  });
}

export function useJobApplication(applicationId: string | undefined) {
  return useQuery({
    queryKey: qk.jobs.recruiterApplication(applicationId ?? ""),
    queryFn: () => jobsApi.recruiterApplication(applicationId!),
    enabled: Boolean(applicationId),
  });
}

/* ------------------------------------------------------------- Recruiter Mutations */

export function useCreateJobPosting() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: CreateJobPostingPayload) =>
      jobsApi.recruiterCreate(payload),
    onSuccess: (data) => {
      toast.success("Job posting created successfully!");
      queryClient.invalidateQueries({ queryKey: qk.jobs.all });
      router.push(`/recruiter/jobs/${data.id}`);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Failed to create job posting");
    },
  });
}

export function useUpdateJobPosting(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<CreateJobPostingPayload>) =>
      jobsApi.recruiterUpdate(id, payload),
    onSuccess: () => {
      toast.success("Job posting updated successfully!");
      queryClient.invalidateQueries({ queryKey: qk.jobs.all });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Failed to update job posting");
    },
  });
}

export function useDeleteJobPosting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => jobsApi.recruiterDelete(id),
    onSuccess: () => {
      toast.success("Job posting archived successfully");
      queryClient.invalidateQueries({ queryKey: qk.jobs.all });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Failed to archive job posting");
    },
  });
}

export function useUpdateApplicationStatus(applicationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      status?: JobApplicationStatus;
      notes?: string | null;
      rating?: number | null;
    }) => jobsApi.recruiterUpdateStatus(applicationId, payload),
    onSuccess: () => {
      toast.success("Application status updated");
      queryClient.invalidateQueries({ queryKey: qk.jobs.all });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Failed to update application status");
    },
  });
}

export function useInviteApplicantAssessment(applicationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { assessmentId?: string }) =>
      jobsApi.recruiterInviteAssessment(applicationId, payload),
    onSuccess: (data) => {
      toast.success(data.message || "Assessment invitation sent!");
      queryClient.invalidateQueries({ queryKey: qk.jobs.all });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Failed to send assessment invitation");
    },
  });
}

export function useInviteApplicantInterview(applicationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { interviewId?: string }) =>
      jobsApi.recruiterInviteInterview(applicationId, payload),
    onSuccess: (data) => {
      toast.success(data.message || "Video interview session generated!");
      queryClient.invalidateQueries({ queryKey: qk.jobs.all });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Failed to generate interview invitation");
    },
  });
}
