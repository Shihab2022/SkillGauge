"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Lightbulb,
  Maximize2,
  Mic,
  Printer,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  Video,
  X,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Progress,
  Skeleton,
} from "@/components/ui/Primitives";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, DescriptionList, PageHeader } from "@/components/ui/Card";
import { useInterviewSessionReport, useReReviewSession } from "@/hooks/useInterviews";
import {
  INTERVIEW_DECISION_LABELS,
  INTERVIEW_VIOLATION_LABELS,
  INTERVIEW_VERDICT_LABELS,
} from "@/lib/constants";
import { cn, formatDateTime, formatPercent } from "@/lib/utils";

/** Badge tone per proctoring severity. */
const SEVERITY_TONE: Record<string, "gray" | "amber" | "red"> = {
  LOW: "gray",
  MEDIUM: "amber",
  HIGH: "amber",
  CRITICAL: "red",
};

export default function InterviewSessionReportPage() {
  const params = useParams<{ id: string; sessionId: string }>();
  const interviewId = params?.id ?? "";
  const sessionId = params?.sessionId ?? "";

  const report = useInterviewSessionReport(interviewId, sessionId);
  const reReview = useReReviewSession(interviewId, sessionId);

  // Active tab state
  const [activeTab, setActiveTab] = useState<"overview" | "answers" | "proctoring" | "notes">("overview");
  // Proctoring filter
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  // Lightbox for snapshot inspection
  const [zoomedSnapshot, setZoomedSnapshot] = useState<{ src: string; title: string } | null>(null);
  // Copy state
  const [copied, setCopied] = useState(false);
  // Recruiter notes
  const [recruiterNotes, setRecruiterNotes] = useState("");

  const analytics = useMemo(() => {
    if (!report.data) return null;
    const { answers, session } = report.data;

    let totalWords = 0;
    let totalKeywords = 0;
    let hitKeywords = 0;
    let totalSeconds = 0;

    answers.forEach((ans) => {
      const words = ans.transcript ? ans.transcript.trim().split(/\s+/).filter(Boolean).length : 0;
      totalWords += words;
      totalKeywords += (ans.keywordHits?.length ?? 0) + (ans.missingKeywords?.length ?? 0);
      hitKeywords += ans.keywordHits?.length ?? 0;
      totalSeconds += ans.timeSpentSeconds ?? 0;
    });

    const keywordMatchPct = totalKeywords > 0 ? Math.round((hitKeywords / totalKeywords) * 100) : 0;
    const avgWpm = totalSeconds > 0 ? Math.round((totalWords / (totalSeconds / 60))) : 0;

    return {
      totalWords,
      keywordMatchPct,
      avgWpm,
      totalSeconds,
    };
  }, [report.data]);

  if (report.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (report.isError || !report.data) {
    return (
      <Card>
        <CardBody className="py-10 text-center text-sm text-muted-foreground">
          This report could not be loaded.
        </CardBody>
      </Card>
    );
  }

  const { session, answers, violations, interview } = report.data;
  const terminated = session.status === "TERMINATED";

  const filteredViolations = violations.filter((v) => {
    if (severityFilter === "ALL") return true;
    return v.severity === severityFilter;
  });

  const handleCopySummary = () => {
    const text = [
      `Candidate: ${session.candidateName} (${session.candidateEmail})`,
      `Interview: ${interview.title} (${interview.technology.toUpperCase()})`,
      `Overall Score: ${session.totalScore}/${session.maxScore} (${formatPercent(session.percentage)}) - ${session.passesInterview ? "PASSED" : "FAILED"}`,
      `Decision: ${session.decision ? INTERVIEW_DECISION_LABELS[session.decision] : "Pending"}`,
      `Integrity Score: ${session.integrityScore}/100 (${session.violationCount} infractions)`,
      `Status: ${session.status}`,
      `\nAI Summary:\n${session.aiSummary || "None"}`,
      `\nStrengths:\n${session.aiStrengths?.map((s) => `- ${s}`).join("\n") || "None"}`,
      `\nAreas to Improve:\n${session.aiImprovements?.map((i) => `- ${i}`).join("\n") || "None"}`,
    ].join("\n");

    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <PageHeader
        title={session.candidateName}
        subtitle={`${interview.title} · ${interview.technology.toUpperCase()} · ${session.candidateEmail}`}
        breadcrumbs={
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/recruiter/interviews/${interviewId}`}>
              <ArrowLeft className="size-4" />
              Back to interview
            </Link>
          </Button>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={session.status} />
            {session.decision && (
              <Badge tone={session.decision === "NO_HIRE" ? "red" : "green"}>
                {INTERVIEW_DECISION_LABELS[session.decision]}
              </Badge>
            )}
            <Badge tone="slate">
              <Sparkles className="size-3" />
              {session.reviewProvider === "openai" ? "LLM Review" : "Rubric Engine"}
            </Badge>

            <Button
              size="sm"
              variant="outline"
              onClick={handleCopySummary}
              title="Copy dossier summary to clipboard"
            >
              {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
              {copied ? "Copied" : "Copy Dossier"}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => window.print()}
              className="hidden sm:inline-flex"
            >
              <Printer className="size-4" />
              Print
            </Button>

            <Button
              size="sm"
              variant="outline"
              loading={reReview.isPending}
              disabled={terminated || session.status === "IN_PROGRESS"}
              onClick={() => reReview.mutate()}
            >
              <RefreshCw className="size-4" />
              Re-run AI Review
            </Button>
          </div>
        }
      />

      {terminated && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle className="flex items-center gap-2 font-semibold">
            <ShieldAlert className="size-4" />
            Interview Terminated by Proctoring Telemetry — 0 Marks
          </AlertTitle>
          <AlertDescription>{session.terminationReason}</AlertDescription>
        </Alert>
      )}

      {/* Top Metric Strip */}
      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Score & Marks
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {formatPercent(session.percentage)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({session.totalScore}/{session.maxScore})
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Pass mark {interview.passScore}% ·{" "}
            <span className={session.passesInterview ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold"}>
              {session.passesInterview ? "Passed" : "Did Not Pass"}
            </span>
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Integrity Score
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{session.integrityScore}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {session.violationCount} proctoring signal{session.violationCount === 1 ? "" : "s"} logged
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Concept Keyword Hit Rate
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{analytics?.keywordMatchPct}%</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Based on expected technology rubrics
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Speech Output
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{analytics?.totalWords}</span>
            <span className="text-xs text-muted-foreground">spoken words</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Avg {analytics?.avgWpm} WPM speaking pace
          </p>
        </div>
      </div>

      {/* Modern Tab Bar */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={cn(
            "rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors",
            activeTab === "overview"
              ? "bg-primary-600 text-white shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          Executive Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("answers")}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors",
            activeTab === "answers"
              ? "bg-primary-600 text-white shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          Questions & Answers ({answers.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("proctoring")}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors",
            activeTab === "proctoring"
              ? "bg-primary-600 text-white shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          Proctoring & Snapshots ({violations.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("notes")}
          className={cn(
            "rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors",
            activeTab === "notes"
              ? "bg-primary-600 text-white shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          Recruiter Notes & Action
        </button>
      </div>

      {/* ------------------------------------------------ Tab: Overview */}
      {activeTab === "overview" && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader
              title="AI Assessment Dossier"
              subtitle="Comprehensive evaluation generated from candidate video & speech telemetry"
            />
            <CardBody className="space-y-5">
              {session.aiSummary && (
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Sparkles className="size-3.5 text-primary-600" />
                    Executive Summary
                  </h4>
                  <p className="text-sm leading-relaxed text-foreground">{session.aiSummary}</p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/40 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                  <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="size-3.5" /> Candidate Strengths
                  </h4>
                  <ul className="space-y-1.5 text-xs text-emerald-950 dark:text-emerald-100">
                    {session.aiStrengths.length ? (
                      session.aiStrengths.map((item) => (
                        <li key={item} className="flex items-start gap-1.5">
                          <span className="mt-1 size-1 rounded-full bg-emerald-600 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li>No specific strengths recorded.</li>
                    )}
                  </ul>
                </div>

                <div className="rounded-xl border border-sky-200/60 bg-sky-50/40 p-4 dark:border-sky-900/50 dark:bg-sky-950/20">
                  <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                    <Lightbulb className="size-3.5" /> Areas to Improve
                  </h4>
                  <ul className="space-y-1.5 text-xs text-sky-950 dark:text-sky-100">
                    {session.aiImprovements.length ? (
                      session.aiImprovements.map((item) => (
                        <li key={item} className="flex items-start gap-1.5">
                          <span className="mt-1 size-1 rounded-full bg-sky-600 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li>None flagged</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Session Metadata */}
          <Card className="shadow-sm">
            <CardHeader title="Session & Environment Telemetry" />
            <CardBody>
              <DescriptionList
                columns={1}
                items={[
                  { label: "Started", value: formatDateTime(session.startedAt) },
                  { label: "Submitted", value: formatDateTime(session.submittedAt) },
                  { label: "Reviewed", value: formatDateTime(session.reviewedAt) },
                  { label: "IP Address", value: session.ipAddress ?? "—" },
                  {
                    label: "Device OS / Platform",
                    value: (
                      <span className="break-words text-xs">
                        {(session.deviceInfo as { platform?: string } | null)?.platform ?? "unknown"}
                      </span>
                    ),
                  },
                  {
                    label: "Screen Resolution",
                    value: (
                      <span className="break-words text-xs">
                        {(session.deviceInfo as { screen?: string } | null)?.screen ?? "—"}
                      </span>
                    ),
                  },
                  {
                    label: "Browser Engine",
                    value: (
                      <span className="break-words text-xs text-muted-foreground">
                        {session.userAgent ? session.userAgent.slice(0, 45) + "..." : "—"}
                      </span>
                    ),
                  },
                ]}
              />
            </CardBody>
          </Card>
        </div>
      )}

      {/* ------------------------------------------------ Tab: Answers */}
      {activeTab === "answers" && (
        <div className="space-y-4">
          {answers.map((answer) => (
            <Card key={answer.id} className="shadow-sm overflow-hidden">
              <CardBody className="space-y-4 p-5">
                {/* Answer header bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-muted-foreground">
                      Q{answer.order}
                    </span>
                    {answer.topic && (
                      <Badge tone="gray" size="sm">
                        {answer.topic}
                      </Badge>
                    )}
                    <Badge tone={answer.score && answer.score > 0 ? "green" : "red"} size="sm">
                      {answer.score ?? 0}/{answer.maxScore} marks
                    </Badge>
                    {answer.aiFeedback && (
                      <Badge tone="indigo" size="sm">
                        {INTERVIEW_VERDICT_LABELS[
                          (answer as { aiReview?: { verdict?: string } | null }).aiReview?.verdict ?? ""
                        ] ?? "Graded"}
                      </Badge>
                    )}
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      {answer.timeSpentSeconds ?? 0}s spent of {answer.timeSeconds ?? interview.questionTimeSeconds}s
                    </span>
                    {answer.hintsUsed > 0 && (
                      <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                        <Lightbulb className="size-3" />
                        {answer.hintsUsed} hint{answer.hintsUsed > 1 ? "s" : ""} used
                      </span>
                    )}
                  </div>
                  <StatusBadge status={answer.status} size="sm" />
                </div>

                {/* Prompt */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{answer.prompt}</h3>
                </div>

                {/* Video recording or snapshot gallery */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    {answer.recordingUrl ? (
                      <video
                        controls
                        src={answer.recordingUrl}
                        className="w-full rounded-xl border border-border bg-black aspect-video object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center text-xs text-muted-foreground">
                        <Video className="mb-2 size-6 text-muted-foreground/60" />
                        <span>Video clip not retained (exceeded size limit or expired)</span>
                        <span className="mt-1 font-mono text-[11px]">
                          Duration: {answer.recordingSeconds ?? 0}s recorded
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Evidence Snapshots for this question */}
                  <div>
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Camera Evidence Snapshots ({answer.snapshots?.length ?? 0})
                    </span>
                    {answer.snapshots && answer.snapshots.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {answer.snapshots.map((frame, frameIndex) => (
                          <div
                            key={`${answer.id}-${frameIndex}`}
                            onClick={() =>
                              setZoomedSnapshot({
                                src: frame,
                                title: `Question ${answer.order} - Evidence Snapshot ${frameIndex + 1}`,
                              })
                            }
                            className="group relative cursor-pointer overflow-hidden rounded-lg border border-border"
                          >
                            <img
                              src={frame}
                              alt={`Answer ${answer.order} evidence ${frameIndex + 1}`}
                              className="h-24 w-36 object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                              <Maximize2 className="size-4 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No snapshot frames captured.</p>
                    )}
                  </div>
                </div>

                {/* Transcript */}
                <div className="rounded-xl border border-border bg-muted/30 p-3.5">
                  <div className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Mic className="size-3.5 text-primary-600" /> Spoken Answer Transcript
                    </span>
                    <span className="font-mono text-[11px] font-normal">
                      {answer.transcript?.trim().split(/\s+/).filter(Boolean).length ?? 0} words
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-foreground">
                    {answer.transcript?.trim() || (
                      <span className="italic text-muted-foreground">No spoken answer was detected.</span>
                    )}
                  </p>
                </div>

                {/* AI Feedback */}
                {answer.aiFeedback && (
                  <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3.5 text-xs text-sky-950 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-200">
                    <span className="font-semibold">AI Examiner Feedback:</span> {answer.aiFeedback}
                  </div>
                )}

                {/* Keyword Pills */}
                {(answer.keywordHits.length > 0 || answer.missingKeywords.length > 0) && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Technical Concept Coverage
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {answer.keywordHits.map((keyword) => (
                        <Badge key={`hit-${keyword}`} tone="green" size="sm">
                          ✓ {keyword}
                        </Badge>
                      ))}
                      {answer.missingKeywords.map((keyword) => (
                        <Badge key={`miss-${keyword}`} tone="gray" size="sm" className="opacity-75">
                          ✗ {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expected Model Answer & Hints Drawer */}
                <details className="rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
                  <summary className="cursor-pointer font-medium text-foreground hover:text-primary-600">
                    View Benchmark Model Answer &amp; Hints
                  </summary>
                  <div className="mt-2.5 space-y-2 border-t border-border pt-2">
                    <p>
                      <strong className="text-foreground">Provided Hints:</strong>{" "}
                      {answer.hints.join(" · ") || "None"}
                    </p>
                    <p>
                      <strong className="text-foreground">Benchmark Model Answer:</strong>{" "}
                      {answer.modelAnswer ?? "None provided"}
                    </p>
                    {answer.hintsRevealed.length > 0 && (
                      <p className="text-amber-700 dark:text-amber-300">
                        <strong>Hints Revealed by Candidate:</strong>{" "}
                        {answer.hintsRevealed.join(" · ")}
                      </p>
                    )}
                  </div>
                </details>
              </CardBody>
            </Card>
          ))}

          {answers.length === 0 && (
            <Card>
              <CardBody className="py-10 text-center text-sm text-muted-foreground">
                No answers were submitted for this interview.
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {/* ------------------------------------------------ Tab: Proctoring & Evidence */}
      {activeTab === "proctoring" && (
        <div className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader
              icon={<ShieldAlert className="size-4 text-amber-600" />}
              title={`Proctoring Telemetry Timeline (${violations.length})`}
              subtitle="Chronological list of anomalous browser signals and camera snapshots"
              action={
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-muted-foreground">Filter:</span>
                  {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSeverityFilter(level)}
                      className={cn(
                        "rounded px-2 py-0.5 text-[11px] font-medium transition-colors",
                        severityFilter === level
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              }
            />
            <CardBody className="space-y-3">
              {filteredViolations.map((violation) => (
                <div
                  key={violation.id}
                  className="flex items-start gap-4 rounded-xl border border-border p-3.5 transition-colors hover:bg-muted/10"
                >
                  {violation.snapshot ? (
                    <div
                      onClick={() =>
                        setZoomedSnapshot({
                          src: violation.snapshot!,
                          title: `${violation.severity} Infraction: ${INTERVIEW_VIOLATION_LABELS[violation.type] ?? violation.type}`,
                        })
                      }
                      className="group relative h-20 w-32 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-border bg-black"
                    >
                      <img
                        src={violation.snapshot}
                        alt="Violation snapshot frame"
                        className="size-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <Maximize2 className="size-4 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-20 w-32 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-[10px] text-muted-foreground">
                      No Frame
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={SEVERITY_TONE[violation.severity] ?? "gray"} size="sm">
                        {violation.severity}
                      </Badge>
                      <span className="text-sm font-semibold text-foreground">
                        {INTERVIEW_VIOLATION_LABELS[violation.type] ?? violation.type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(violation.occurredAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {violation.description}
                    </p>
                  </div>
                </div>
              ))}

              {filteredViolations.length === 0 && (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No infractions found for the selected filter.
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* ------------------------------------------------ Tab: Notes & Evaluation */}
      {activeTab === "notes" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader
              title="Internal Recruiter Notes"
              subtitle="Add observations or notes for the hiring team"
            />
            <CardBody className="space-y-4">
              <textarea
                value={recruiterNotes}
                onChange={(e) => setRecruiterNotes(e.target.value)}
                placeholder="e.g. Candidate demonstrated clear system design reasoning in Q2. Spoke confidently. Recommendation to advance to team cultural fit round..."
                className="w-full resize-y rounded-xl border border-border bg-card p-3 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary-500"
                rows={8}
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  Notes are stored with this interview session
                </span>
                <Button size="sm">Save Notes</Button>
              </div>
            </CardBody>
          </Card>

          <Card className="shadow-sm">
            <CardHeader
              title="Hiring Recommendation Action"
              subtitle="Quick sharing and next steps"
            />
            <CardBody className="space-y-4 text-xs">
              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                <span className="font-semibold text-foreground">Recommended Decision</span>
                <p className="text-muted-foreground leading-relaxed">
                  Based on candidate score ({formatPercent(session.percentage)}), integrity rating (
                  {session.integrityScore}/100), and answer quality, the AI system categorized this
                  candidate as:
                </p>
                <div className="pt-1">
                  <Badge
                    tone={session.decision === "NO_HIRE" ? "red" : "green"}
                    size="md"
                    className="text-xs font-bold"
                  >
                    {session.decision ? INTERVIEW_DECISION_LABELS[session.decision] : "PENDING"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full" onClick={handleCopySummary}>
                  <Copy className="size-3.5" />
                  Copy Markdown Evaluation Dossier
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.print()}
                >
                  <Printer className="size-3.5" />
                  Print / Save Dossier to PDF
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Snapshot Lightbox Modal */}
      {zoomedSnapshot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setZoomedSnapshot(null)}
        >
          <div
            className="relative max-w-3xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 text-white">
              <span className="text-xs font-semibold">{zoomedSnapshot.title}</span>
              <button
                type="button"
                onClick={() => setZoomedSnapshot(null)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="p-2">
              <img
                src={zoomedSnapshot.src}
                alt={zoomedSnapshot.title}
                className="max-h-[75vh] w-full rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
