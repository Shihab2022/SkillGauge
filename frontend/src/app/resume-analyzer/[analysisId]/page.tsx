"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft, CircleAlert, KeyRound, ListChecks, ScanSearch, Sparkles, Trash2, TrendingUp,
} from "lucide-react";
import { Card, CardBody, CardHeader, PageHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert, Spinner } from "@/components/ui/Primitives";
import { cn, formatDateTime } from "@/lib/utils";
import { getErrorMessage, resumesApi } from "@/lib/api";
import { useAnalysis, resumeKeys } from "@/hooks/useResumes";
import { useQueryClient } from "@tanstack/react-query";

function scoreTone(score: number) {
  if (score >= 80) return { ring: "text-emerald-600", chip: "green" as const };
  if (score >= 60) return { ring: "text-amber-600", chip: "amber" as const };
  return { ring: "text-rose-600", chip: "red" as const };
}

function BulletList({ items, tone = "default" }: { items: string[]; tone?: "default" | "red" | "green" }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">None — looks good.</p>;
  return (
    <ul className="space-y-1.5 text-sm">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", tone === "red" ? "bg-rose-500" : tone === "green" ? "bg-emerald-500" : "bg-slate-400")} />
          <span className="text-foreground">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function AnalysisReportPage() {
  const params = useParams<{ analysisId: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const analysisId = params.analysisId;

  const query = useAnalysis(analysisId);
  const analysis = query.data;
  const report = analysis?.report;

  const remove = async () => {
    if (!window.confirm("Delete this analysis report?")) return;
    try {
      await resumesApi.deleteAnalysis(analysisId);
      qc.invalidateQueries({ queryKey: resumeKeys.analyses() });
      toast.success("Analysis deleted");
      router.push("/resume-analyzer");
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  if (query.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Spinner />
        <p className="mt-3 text-sm text-muted-foreground">Loading report…</p>
      </div>
    );
  }

  if (query.isError || !analysis) {
    return (
      <Alert variant="destructive" className="mx-auto mt-16 max-w-lg">
        <span className="font-semibold">Report not found</span>
        <span className="block text-sm opacity-90">{query.isError ? getErrorMessage(query.error) : "This analysis does not exist."}</span>
        <Link href="/resume-analyzer" className="mt-2 inline-block text-sm underline">Back to analyzer</Link>
      </Alert>
    );
  }

  if (analysis.status === "FAILED") {
    return (
      <div className="mx-auto max-w-2xl">
        <Alert variant="destructive">
          <span className="font-semibold">Analysis failed</span>
          <span className="block text-sm opacity-90">{analysis.error ?? "The AI service is unavailable right now."}</span>
        </Alert>
        <div className="mt-4 flex gap-2">
          <Button asChild variant="outline" size="sm"><Link href="/resume-analyzer">Try again</Link></Button>
          <Button asChild variant="ghost" size="sm"><Link href="/resume-dashboard">My resumes</Link></Button>
        </div>
      </div>
    );
  }

  if (analysis.status === "PENDING" || !report) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Spinner />
        <p className="mt-3 text-sm text-muted-foreground">Analysis still running — refresh in a moment.</p>
        <Button asChild variant="ghost" size="sm" className="mt-4"><Link href="/resume-analyzer">Back to analyzer</Link></Button>
      </div>
    );
  }

  const overall = report.overallScore;
  const tone = scoreTone(overall);
  const jm = report.jobMatch;

  return (
    <>
      <PageHeader
        title="ATS analysis report"
        subtitle={`${analysis.source} · ${formatDateTime(analysis.createdAt)}`}
        actions={
          <>
            <Button asChild variant="ghost" size="sm"><Link href="/resume-analyzer"><ArrowLeft className="size-4" /> New analysis</Link></Button>
            <Button variant="outline" size="sm" onClick={() => void remove()}>
              <Trash2 className="size-4" /> Delete
            </Button>
          </>
        }
      />

      {/* ------------- score hero ------------- */}
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardBody className="flex flex-col items-center justify-center py-8">
            <span className={cn("text-5xl font-extrabold tabular-nums", tone.ring)}>{overall}</span>
            <span className="mt-1 text-sm font-medium text-muted-foreground">/ 100 overall ATS score</span>
            <span className="mt-3 flex gap-2">
              <Badge tone={tone.chip} size="sm">{overall >= 80 ? "Strong" : overall >= 60 ? "Needs work" : "At risk"}</Badge>
              <Badge tone="gray" size="sm">{report.provider === "openai" ? "AI" : "Deterministic"}</Badge>
            </span>
            {analysis.resumeId ? (
              <Link className="mt-4 text-sm text-primary-600 hover:underline" href={`/resume-builder/${analysis.resumeId}/edit`}>
                Open resume in builder
              </Link>
            ) : null}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Category breakdown" icon={<TrendingUp className="size-4" />} />
          <CardBody className="space-y-4">
            {report.categoryScores.map((c) => (
              <div key={c.key}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{c.label}</span>
                  <span className="tabular-nums text-muted-foreground">{c.score} / {c.max}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", (c.score / c.max) >= 0.8 ? "bg-emerald-500" : (c.score / c.max) >= 0.5 ? "bg-amber-500" : "bg-rose-500")}
                    style={{ width: `${Math.max(2, Math.round((c.score / c.max) * 100))}%` }}
                  />
                </div>
                {c.deductions.length ? (
                  <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                    {c.deductions.map((d, i) => <li key={i}>• {d}</li>)}
                  </ul>
                ) : null}
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      {/* ------------- ATS + content feedback ------------- */}
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="ATS parsing & structure" icon={<ScanSearch className="size-4" />} />
          <CardBody className="space-y-4 text-sm">
            <div>
              <p className="field-label">Extraction</p>
              <p>{report.ats.extraction}</p>
            </div>
            <div>
              <p className="field-label">Contact info checks</p>
              <BulletList items={report.ats.contact} tone={report.ats.contact.length ? "default" : "default"} />
            </div>
            <div>
              <p className="field-label">Detected section headings</p>
              <div className="flex flex-wrap gap-1.5">
                {report.ats.headings.length ? report.ats.headings.map((h, i) => (
                  <Badge key={i} tone="blue" size="sm">{h}</Badge>
                )) : <span className="text-muted-foreground">No headings detected</span>}
              </div>
            </div>
            <div>
              <p className="field-label">Risks</p>
              <BulletList items={report.ats.risks} tone={report.ats.risks.length ? "red" : "default"} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Content feedback" icon={<CircleAlert className="size-4" />} />
          <CardBody className="space-y-4 text-sm">
            <div>
              <p className="field-label">Summary</p>
              <BulletList items={report.content.summary} />
            </div>
            <div>
              <p className="field-label">Experience</p>
              <BulletList items={report.content.experience} />
            </div>
            <div>
              <p className="field-label">Skills</p>
              <BulletList items={report.content.skills} />
            </div>
            <div>
              <p className="field-label">Language & tone</p>
              <BulletList items={report.content.language} />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* ------------- keywords + action plan ------------- */}
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Keyword coverage" icon={<KeyRound className="size-4" />} />
          <CardBody className="space-y-4 text-sm">
            <div>
              <p className="field-label">Present</p>
              <div className="flex flex-wrap gap-1.5">
                {report.keywords.present.length ? report.keywords.present.map((k, i) => (
                  <Badge key={i} tone="green" size="sm">{k}</Badge>
                )) : <span className="text-muted-foreground">No target keywords detected</span>}
              </div>
            </div>
            <div>
              <p className="field-label">Notes & gaps</p>
              <BulletList items={report.keywords.notes} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Action plan" icon={<ListChecks className="size-4" />} />
          <CardBody className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="field-label flex items-center gap-1.5"><span className="size-2 rounded-full bg-rose-500" /> Critical</p>
              <BulletList items={report.actionPlan.critical} tone="red" />
            </div>
            <div>
              <p className="field-label flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber-500" /> High impact</p>
              <BulletList items={report.actionPlan.highImpact} />
            </div>
            <div>
              <p className="field-label flex items-center gap-1.5"><span className="size-2 rounded-full bg-slate-400" /> Optional</p>
              <BulletList items={report.actionPlan.optional} />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* ------------- job match ------------- */}
      {jm ? (
        <Card className="mb-4">
          <CardHeader
            title="Job description match"
            icon={<Sparkles className="size-4" />}
            action={<Badge tone="violet" size="sm">fit {jm.score}%</Badge>}
          />
          <CardBody className="grid grid-cols-1 gap-5 text-sm lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="field-label">Matched skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {jm.matchedSkills.length ? jm.matchedSkills.map((s, i) => <Badge key={i} tone="green" size="sm">{s}</Badge>) : <span className="text-muted-foreground">None matched</span>}
                </div>
              </div>
              <div>
                <p className="field-label">Missing skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {jm.missingSkills.length ? jm.missingSkills.map((s, i) => <Badge key={i} tone="red" size="sm">{s}</Badge>) : <span className="text-muted-foreground">Nothing missing</span>}
                </div>
              </div>
              <div>
                <p className="field-label">Experience the JD asks for (found in resume)</p>
                <BulletList items={jm.demonstratedExperience} tone="green" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="field-label">Bullet improvements</p>
                <BulletList items={jm.bulletImprovements} />
              </div>
              <div>
                <p className="field-label">Emphasise these</p>
                <BulletList items={jm.emphasis} />
              </div>
              <div>
                <p className="field-label">Application checklist</p>
                <BulletList items={jm.checklist} />
              </div>
            </div>
          </CardBody>
        </Card>
      ) : (
        <p className="mb-4 text-sm text-muted-foreground">
          No job description was attached — run a new analysis with one to see match scoring.
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button asChild variant="outline" size="sm"><Link href="/resume-analyzer">New analysis</Link></Button>
        {analysis.resumeId ? (
          <Button asChild size="sm"><Link href={`/resume-builder/${analysis.resumeId}/edit`}>Apply fixes in builder</Link></Button>
        ) : null}
      </div>
    </>
  );
}
