"use client";

import Link from "next/link";
import { useAdminAssessments, useUpdateAssessmentAiProctoring } from "@/hooks/useAdmin";
import { Card, CardBody, PageHeader } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Primitives";
import { formatDateTime } from "@/lib/utils";
import { ShieldCheck, Video, VideoOff } from "lucide-react";
import type { Assessment } from "@/lib/types";

export default function AdminAssessmentsPage() {
  const { data, isLoading } = useAdminAssessments({ limit: 100 });
  const updateAiProctoring = useUpdateAssessmentAiProctoring();
  const assessments = data?.data ?? [];

  const handleToggleAi = (assessment: Assessment) => {
    const config = (assessment.questionConfig as Record<string, unknown>) ?? {};
    const currentlyEnabled = Boolean(config.aiProctoringEnabled);
    updateAiProctoring.mutate({
      id: assessment.id,
      aiProctoringEnabled: !currentlyEnabled,
    });
  };

  return (
    <>
      <PageHeader
        title="Assessments & Exams"
        subtitle="Manage assessments across all companies and control AI proctoring policies"
      />

      <div className="mb-4 rounded-xl border border-primary-200 bg-primary-50/50 p-4 text-sm text-primary-950 dark:border-primary-900/40 dark:bg-primary-950/20 dark:text-primary-200">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary-600 dark:text-primary-400" />
          <div className="space-y-1">
            <p className="font-semibold text-foreground">
              Admin Policy Control: AI Video & Voice Proctoring
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Admins can enforce AI video/voice proctoring (camera, face tracking, phone detection, and audio monitoring)
              on any assessment. When enabled, candidate attempts require live webcam/mic telemetry.
              <strong> Free public exams (/exams) remain strictly free and unmonitored.</strong>
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <Spinner className="mx-auto my-10" />
          ) : assessments.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No assessments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Assessment</th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Company</th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-2 text-center font-medium text-muted-foreground">AI Proctoring</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">Problems</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">Invitations</th>
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((a: Assessment) => {
                    const config = (a.questionConfig as Record<string, unknown>) ?? {};
                    const isAiEnabled = Boolean(config.aiProctoringEnabled);
                    const isPending =
                      updateAiProctoring.isPending &&
                      updateAiProctoring.variables?.id === a.id;

                    return (
                      <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium text-foreground">{a.title}</td>
                        <td className="px-4 py-3 text-muted-foreground">{a.company?.name ?? "—"}</td>
                        <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            size="sm"
                            variant={isAiEnabled ? "subtle" : "outline"}
                            disabled={isPending}
                            onClick={() => handleToggleAi(a)}
                            className={
                              isAiEnabled
                                ? "h-7 border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : "h-7 text-xs text-muted-foreground"
                            }
                          >
                            {isPending ? (
                              <Spinner className="mr-1.5 size-3" />
                            ) : isAiEnabled ? (
                              <Video className="mr-1.5 size-3.5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <VideoOff className="mr-1.5 size-3.5 text-muted-foreground" />
                            )}
                            {isAiEnabled ? "AI Enabled" : "Disabled"}
                          </Button>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">{a._count?.problems ?? 0}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{a._count?.invitations ?? 0}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {a.createdAt ? formatDateTime(a.createdAt) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
      <p className="mt-3 text-xs text-muted-foreground">
        Manage individual assessments from your{" "}
        <Link href="/recruiter/assessments" className="text-primary-600 hover:underline">
          recruiter view
        </Link>
        .
      </p>
    </>
  );
}
