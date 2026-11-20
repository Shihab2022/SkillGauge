"use client";

import {
  CheckCircle2,
  Clock,
  Download,
  Lightbulb,
  Mail,
  Printer,
  ShieldAlert,
  Sparkles,
  Trophy,
  UserCheck,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle, Progress } from "@/components/ui/Primitives";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { INTERVIEW_DECISION_LABELS } from "@/lib/constants";
import type { InterviewSessionResult } from "@/lib/types";

interface Props {
  result: InterviewSessionResult | null;
  loading: boolean;
  /** Set when proctoring ended the session (requirements 8-10). */
  terminatedReason?: string | null;
}

/**
 * The candidate's end screen: suspended (0 marks), the AI result when the
 * organisation shares scores, or a neutral "submitted" state.
 */
export function InterviewFinished({ result, loading, terminatedReason }: Props) {
  const terminated = Boolean(result?.terminated || terminatedReason);

  if (loading && !result) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardBody className="flex flex-col items-center gap-4 py-14 text-center">
          <div className="relative flex items-center justify-center">
            <span className="size-12 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
            <Sparkles className="absolute size-5 text-primary-600" />
          </div>
          <div>
            <p className="font-semibold text-lg text-foreground">Evaluating your interview…</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Our AI engine is transcribing responses, analyzing technical keyword coverage, and
              generating the evaluation report.
            </p>
          </div>
          <div className="w-full max-w-sm">
            <Progress value={85} className="h-2" />
          </div>
        </CardBody>
      </Card>
    );
  }

  if (terminated) {
    return (
      <Card className="mx-auto max-w-xl border-rose-200 dark:border-rose-900 shadow-md">
        <CardHeader
          icon={<ShieldAlert className="size-5 text-rose-600" />}
          title="Interview Terminated & Suspended"
          subtitle="Proctoring policy detected a critical violation"
        />
        <CardBody className="space-y-4">
          <Alert variant="destructive">
            <AlertTitle>Suspended with 0 marks</AlertTitle>
            <AlertDescription>
              {terminatedReason ??
                result?.terminationReason ??
                "A proctoring policy violation was detected by the real-time proctoring telemetry engine."}
            </AlertDescription>
          </Alert>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your camera and microphone streams along with captured evidence frames were archived
            and forwarded to the hiring organisation. If you believe this termination was triggered
            by a false positive or technical error, please reach out to your recruiter.
          </p>
        </CardBody>
      </Card>
    );
  }

  if (!result || result.status === "PROCESSING") {
    return (
      <Card className="mx-auto max-w-xl">
        <CardBody className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="size-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          <p className="text-base font-semibold text-foreground">Reviewing your answers…</p>
          <p className="text-xs text-muted-foreground">This usually takes just a few seconds.</p>
        </CardBody>
      </Card>
    );
  }

  const visible = result.scoreVisible;
  const decision = result.decision ? INTERVIEW_DECISION_LABELS[result.decision] : null;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Card className="overflow-hidden border-border/80 shadow-md">
        <CardHeader
          icon={<CheckCircle2 className="size-5 text-emerald-600" />}
          title="Interview Successfully Submitted"
          subtitle={`Thank you, ${result.candidateName}. Your responses are securely submitted.`}
          action={
            <div className="flex items-center gap-2">
              {decision && (
                <Badge tone={result.decision === "NO_HIRE" ? "red" : "green"}>{decision}</Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="hidden sm:inline-flex text-xs print:hidden"
              >
                <Printer className="size-3.5" />
                Print Receipt
              </Button>
            </div>
          }
        />
        <CardBody className="space-y-6">
          {/* Score metrics */}
          {visible && typeof result.percentage === "number" && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
                <Trophy className="mx-auto mb-1.5 size-5 text-primary-600" />
                <p className="text-2xl font-bold text-foreground">
                  {result.totalScore}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{result.maxScore}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Total Marks</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-foreground">{result.percentage}%</p>
                <Progress value={result.percentage} className="mt-2.5 h-1.5" />
                <p className="mt-2 text-xs text-muted-foreground">Overall Score</p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
                <ShieldAlert className="mx-auto mb-1.5 size-5 text-emerald-600" />
                <p className="text-2xl font-bold text-foreground">
                  {result.integrityScore}
                  <span className="text-sm font-normal text-muted-foreground">/100</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Integrity Rating</p>
              </div>
            </div>
          )}

          {!visible && (
            <Alert variant="info" className="border-sky-200 dark:border-sky-800">
              <AlertTitle>Score Release Setting</AlertTitle>
              <AlertDescription>
                The hiring team has configured this interview to process scores internally. You
                will receive direct feedback from the recruiter regarding next steps.
              </AlertDescription>
            </Alert>
          )}

          {/* AI Executive Summary */}
          {visible && result.summary && (
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="size-3.5 text-primary-600" />
                AI Executive Summary
              </h4>
              <p className="text-sm leading-relaxed text-foreground">{result.summary}</p>
            </div>
          )}

          {/* Strengths & Improvements */}
          {visible && (result.strengths.length > 0 || result.improvements.length > 0) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {result.strengths.length > 0 && (
                <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/40 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                  <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="size-3.5" /> Key Strengths
                  </h4>
                  <ul className="space-y-1.5 text-xs text-emerald-950 dark:text-emerald-100">
                    {result.strengths.map((item) => (
                      <li key={item} className="flex items-start gap-1.5">
                        <span className="mt-1 size-1 rounded-full bg-emerald-600 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.improvements.length > 0 && (
                <div className="rounded-xl border border-sky-200/60 bg-sky-50/40 p-4 dark:border-sky-900/50 dark:bg-sky-950/20">
                  <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                    <Lightbulb className="size-3.5" /> Areas to Polish
                  </h4>
                  <ul className="space-y-1.5 text-xs text-sky-950 dark:text-sky-100">
                    {result.improvements.map((item) => (
                      <li key={item} className="flex items-start gap-1.5">
                        <span className="mt-1 size-1 rounded-full bg-sky-600 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Next Steps Card */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Mail className="size-3.5" /> What Happens Next?
            </h4>
            <div className="text-xs text-muted-foreground leading-relaxed space-y-1">
              <p>• Your technical responses and proctoring metrics have been recorded in the recruiter portal.</p>
              <p>• The hiring committee reviews the comprehensive AI dossier alongside human evaluator notes.</p>
              <p>• You will receive an email update directly from the hiring team with subsequent recruitment steps.</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default InterviewFinished;
