"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { resumesApi, getErrorMessage } from "@/lib/api";
import type { CreateAnalysisPayload, CreateResumePayload, UpdateResumePayload } from "@/lib/api/resumes";
import { qk } from "@/lib/query/keys";

export const resumeKeys = {
  all: ["resumes"] as const,
  list: (params?: unknown) => ["resumes", "list", params ?? {}] as const,
  detail: (id: string) => ["resumes", "detail", id] as const,
  versions: (id: string) => ["resumes", "versions", id] as const,
  analyses: (params?: unknown) => ["resumes", "analyses", params ?? {}] as const,
  analysis: (id: string) => ["resumes", "analysis", id] as const,
  jobs: ["resumes", "jobs"] as const,
};

export function useResumes(params?: { page?: number; limit?: number; q?: string; status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" }) {
  return useQuery({
    queryKey: resumeKeys.list(params),
    queryFn: () => resumesApi.list(params),
  });
}

export function useResume(id: string) {
  return useQuery({
    queryKey: resumeKeys.detail(id),
    queryFn: () => resumesApi.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateResumePayload) => resumesApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resumeKeys.all });
      toast.success("Resume created");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUpdateResume(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateResumePayload) => resumesApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resumeKeys.detail(id) });
      qc.invalidateQueries({ queryKey: resumeKeys.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDeleteResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resumesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resumeKeys.all });
      toast.success("Resume deleted");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDuplicateResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title?: string }) => resumesApi.duplicate(id, title),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resumeKeys.all });
      toast.success("Resume duplicated");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useResumeVersions(id: string) {
  return useQuery({
    queryKey: resumeKeys.versions(id),
    queryFn: () => resumesApi.versions(id),
    enabled: Boolean(id),
  });
}

export function useSnapshotVersion(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (label?: string) => resumesApi.snapshot(id, label),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resumeKeys.versions(id) });
      toast.success("Version snapshot saved");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useAnalyzeResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAnalysisPayload) => resumesApi.analyze(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: resumeKeys.analyses() }),
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useAnalyses(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: resumeKeys.analyses(params),
    queryFn: () => resumesApi.analyses(params),
  });
}

export function useAnalysis(id: string) {
  return useQuery({
    queryKey: resumeKeys.analysis(id),
    queryFn: () => resumesApi.analysis(id),
    enabled: Boolean(id),
  });
}

export function useJobs() {
  return useQuery({ queryKey: resumeKeys.jobs, queryFn: () => resumesApi.jobs() });
}

export function useAssistAi() {
  return useMutation({
    mutationFn: (payload: { action: string; text: string; context?: string; targetRole?: string }) =>
      resumesApi.assist(payload),
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export { qk };
