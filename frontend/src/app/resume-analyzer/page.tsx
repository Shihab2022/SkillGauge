"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Clock, FileText, Link2, ScanSearch, Sparkles, Upload } from "lucide-react";
import { Card, CardBody, CardHeader, PageHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TextareaField } from "@/components/ui/Input";
import { SelectField } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Primitives";
import { cn, formatDateTime } from "@/lib/utils";
import { getErrorMessage, resumesApi } from "@/lib/api";
import { useAnalyses, useAnalyzeResume, useJobs, useResumes } from "@/hooks/useResumes";

type SourceTab = "resume" | "text" | "file" | "url";

const SOURCE_TABS: { key: SourceTab; label: string; icon: React.ElementType }[] = [
  { key: "resume", label: "My resume", icon: FileText },
  { key: "text", label: "Paste text", icon: ScanSearch },
  { key: "file", label: "Upload .txt", icon: Upload },
  { key: "url", label: "Resume URL", icon: Link2 },
];

export default function ResumeAnalyzerPage() {
  const router = useRouter();

  const [sourceTab, setSourceTab] = useState<SourceTab>("resume");
  const [resumeId, setResumeId] = useState("");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);

  const [withJob, setWithJob] = useState(false);
  const [jobMode, setJobMode] = useState<"paste" | "saved">("paste");
  const [jobText, setJobText] = useState("");
  const [jobId, setJobId] = useState("");

  const resumesQuery = useResumes({ limit: 50 });
  const jobsQuery = useJobs();
  const analysesQuery = useAnalyses({ limit: 8 });
  const analyze = useAnalyzeResume();

  // Deep link from the dashboard: /resume-analyzer?resume=<id>
  useEffect(() => {
    const preset = new URLSearchParams(window.location.search).get("resume");
    if (preset) { setResumeId(preset); setSourceTab("resume"); }
  }, []);

  const resumes = resumesQuery.data?.data ?? [];
  const jobs = jobsQuery.data ?? [];
  const analyses = analysesQuery.data?.data ?? [];

  const resumeOptions = useMemo(
    () => resumes.map((r) => ({ value: r.id, label: `${r.title}${r.latestScore != null ? ` · last score ${r.latestScore}` : ""}` })),
    [resumes],
  );
  const jobOptions = useMemo(() => jobs.map((j) => ({ value: j.id, label: `${j.title}${j.company ? ` — ${j.company}` : ""}` })), [jobs]);

  const onPickFile = (file: File | null) => {
    if (!file) return;
    if (!/text\/|\.(txt|md)$/i.test(file.type || file.name)) {
      toast.error("Plain text only here — for PDFs paste the text or use the URL tab");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { setText(String(reader.result ?? "")); setFileName(file.name); };
    reader.readAsText(file);
  };

  const onFetchUrl = async () => {
    if (!/^https?:\/\//i.test(url.trim())) { toast.error("Enter a valid http(s) URL"); return; }
    setFetching(true);
    try {
      const r = await resumesApi.fetchUrl(url.trim());
      setText(r.text);
      setFileName(null);
      toast.success("Resume fetched — review the text below");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setFetching(false);
    }
  };

  const submit = () => {
    const payload: Parameters<typeof resumesApi.analyze>[0] = {};
    if (sourceTab === "resume") {
      if (!resumeId) { toast.error("Pick one of your resumes"); return; }
      payload.resumeId = resumeId;
      payload.source = "BUILDER";
    } else if (sourceTab === "text") {
      if (text.trim().length < 50) { toast.error("Resume text must be at least 50 characters"); return; }
      payload.resumeText = text.trim();
      payload.source = "UPLOAD";
    } else if (sourceTab === "file") {
      if (text.trim().length < 50) { toast.error("File text must be at least 50 characters"); return; }
      payload.resumeText = text.trim();
      payload.source = "UPLOAD";
      if (fileName) { payload.fileName = fileName; payload.fileMime = "text/plain"; }
    } else {
      if (!/^https?:\/\//i.test(url.trim())) { toast.error("Enter a valid resume URL"); return; }
      if (text.trim().length < 50) { toast.error("Fetch the URL first so we can read the resume text"); return; }
      payload.resumeText = text.trim();
      payload.sourceUrl = url.trim();
      payload.source = "URL";
      if (fileName) { payload.fileName = fileName; payload.fileMime = "text/html"; }
    }

    if (withJob) {
      if (jobMode === "saved") {
        if (!jobId) { toast.error("Pick a saved job description"); return; }
        payload.jobDescriptionId = jobId;
      } else {
        if (jobText.trim().length < 20) { toast.error("Job description must be at least 20 characters"); return; }
        payload.jobDescription = jobText.trim();
      }
    }

    analyze.mutate(payload, { onSuccess: (a) => router.push(`/resume-analyzer/${a.id}`) });
  };

  return (
    <>
      <PageHeader
        title="ATS resume analyzer"
        subtitle="Score any resume 0–100 against ATS parsing rules, keywords and job-description fit."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/resume-dashboard">My resumes</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* ------------- intake ------------- */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="What should we analyze?"
            icon={<ScanSearch className="size-4" />}
          />
          <CardBody className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {SOURCE_TABS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSourceTab(s.key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                    sourceTab === s.key
                      ? "border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300"
                      : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  <s.icon className="size-3.5" /> {s.label}
                </button>
              ))}
            </div>

            {sourceTab === "resume" ? (
              resumesQuery.isLoading ? (
                <Spinner />
              ) : resumeOptions.length ? (
                <SelectField
                  label="Resume"
                  value={resumeId}
                  onValueChange={setResumeId}
                  options={resumeOptions}
                  placeholder="Choose one of your resumes…"
                  hint="Analysis uses the builder content and updates the resume's latest score."
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  No resumes yet — <Link className="text-primary-600 underline" href="/resume-builder/new">create one</Link> first.
                </p>
              )
            ) : null}

            {sourceTab === "text" || sourceTab === "file" ? (
              <div className="space-y-2">
                {sourceTab === "file" ? (
                  <div>
                    <label className="field-label" htmlFor="resume-file">Upload (.txt / .md)</label>
                    <input
                      id="resume-file"
                      type="file"
                      accept=".txt,.md,text/plain,text/markdown"
                      onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                      className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100"
                    />
                    <p className="field-hint">PDF/DOCX: open them, copy the text and use the “Paste text” tab, or publish it and use “Resume URL”.</p>
                  </div>
                ) : null}
                <TextareaField
                  label={sourceTab === "text" ? "Resume text" : fileName ? `Extracted from ${fileName}` : "Resume text"}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={10}
                  maxLength={30000}
                  placeholder="Paste the full resume text…"
                  hint={`${text.length}/30000 characters · minimum 50`}
                />
              </div>
            ) : null}

            {sourceTab === "url" ? (
              <div className="space-y-3">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="field-label" htmlFor="resume-url">Public resume URL</label>
                    <input
                      id="resume-url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://…"
                      className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/25"
                    />
                  </div>
                  <Button variant="outline" onClick={() => void onFetchUrl()} loading={fetching} disabled={fetching}>
                    <Link2 className="size-4" /> Fetch
                  </Button>
                </div>
                <TextareaField
                  label="Fetched text (editable)"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={8}
                  maxLength={30000}
                  hint={`${text.length}/30000 — fetch fills this automatically`}
                />
              </div>
            ) : null}

            {/* ------------- optional job matching ------------- */}
            <div className="rounded-lg border border-border p-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={withJob} onChange={(e) => setWithJob(e.target.checked)} />
                Match against a job description
                <Badge tone="violet" size="sm"><Sparkles className="size-3" /> job fit</Badge>
              </label>
              {withJob ? (
                <div className="mt-3 space-y-3">
                  <div className="flex gap-2">
                    {(["paste", "saved"] as const).map((m) => (
                      <Button key={m} size="sm" variant={jobMode === m ? "subtle" : "outline"} onClick={() => setJobMode(m)}>
                        {m === "paste" ? "Paste description" : "Saved jobs"}
                      </Button>
                    ))}
                  </div>
                  {jobMode === "paste" ? (
                    <TextareaField
                      label="Job description"
                      value={jobText}
                      onChange={(e) => setJobText(e.target.value)}
                      rows={6}
                      maxLength={20000}
                      placeholder="Paste the responsibilities & requirements…"
                      hint={`${jobText.length}/20000 · minimum 20`}
                    />
                  ) : jobsQuery.isLoading ? (
                    <Spinner />
                  ) : jobOptions.length ? (
                    <SelectField
                      label="Saved job"
                      value={jobId}
                      onValueChange={setJobId}
                      options={jobOptions}
                      placeholder="Choose a saved job description…"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">No saved jobs yet — paste a description instead.</p>
                  )}
                </div>
              ) : null}
            </div>

            <div className="flex justify-end">
              <Button onClick={submit} loading={analyze.isPending} className="min-w-56">
                <ScanSearch className="size-4" />
                {analyze.isPending ? "Analyzing…" : "Analyze resume"}
              </Button>
            </div>
            {analyze.isError ? (
              <p className="text-sm text-destructive">{getErrorMessage(analyze.error)}</p>
            ) : null}
          </CardBody>
        </Card>

        {/* ------------- recent analyses ------------- */}
        <Card className="lg:col-span-1">
          <CardHeader title="Recent analyses" icon={<Clock className="size-4" />} />
          <CardBody className="space-y-3">
            {analysesQuery.isLoading ? (
              <Spinner />
            ) : !analyses.length ? (
              <p className="text-sm text-muted-foreground">Nothing analyzed yet — your reports will appear here.</p>
            ) : (
              analyses.map((a) => (
                <Link
                  key={a.id}
                  href={`/resume-analyzer/${a.id}`}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-muted"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {a.score != null ? `Score ${a.score}` : a.status === "FAILED" ? "Failed" : "Pending"}
                    </span>
                    <span className="block text-xs text-muted-foreground">{formatDateTime(a.createdAt)} · {a.source}</span>
                  </span>
                  <Badge tone={a.status === "FAILED" ? "red" : a.status === "PENDING" ? "amber" : (a.score ?? 0) >= 80 ? "green" : (a.score ?? 0) >= 60 ? "amber" : "red"} size="sm">
                    {a.status === "COMPLETED" ? "Ready" : a.status === "PENDING" ? "Running" : "Failed"}
                  </Badge>
                </Link>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
