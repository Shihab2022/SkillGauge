"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  Download,
  History,
  Loader2,
  ScanSearch,
  Sparkles,
  Target,
  Copy,
  Zap,
  ZoomIn,
  ZoomOut,
  Maximize2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Card, CardBody, CardHeader, PageHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, TextareaField } from "@/components/ui/Input";
import { Modal, ModalContent, ModalHeader } from "@/components/ui/Modal";
import { Alert, Spinner } from "@/components/ui/Primitives";
import { cn } from "@/lib/utils";
import { getErrorMessage, resumesApi } from "@/lib/api";
import { ALL_TEMPLATES, getTemplate } from "@/lib/resume-templates";
import type { Resume, ResumeContent, ResumeCustomization } from "@/lib/types.resume";
import { useAssistAi, useAnalyzeResume, useResume, useSnapshotVersion } from "@/hooks/useResumes";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { PrintPortal, printResume } from "@/components/resume/ResumePrint";
import {
  EducationSection,
  ExperienceSection,
  GenericSection,
  LanguagesSection,
  PersonalSection,
  ProjectsSection,
  SectionOrderControl,
  SkillsSection,
  SummarySection,
} from "@/components/resume/ResumeFormSections";
import { calculateLiveAtsScore } from "@/lib/liveAtsScorer";
import { ROLE_PRESETS, resumeToPlainText } from "@/lib/resume-presets";
import { JobTailorModal } from "@/components/resume/JobTailorModal";

type SectionKey =
  | "personal"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "languages"
  | "awards"
  | "volunteer"
  | "publications"
  | "order";

const SECTION_TABS: { key: SectionKey; label: string; icon?: string }[] = [
  { key: "personal", label: "Personal info" },
  { key: "summary", label: "Executive summary" },
  { key: "experience", label: "Work experience" },
  { key: "skills", label: "Technical skills" },
  { key: "projects", label: "Applied projects" },
  { key: "education", label: "Education" },
  { key: "certifications", label: "Certifications" },
  { key: "languages", label: "Languages" },
  { key: "awards", label: "Awards & honors" },
  { key: "volunteer", label: "Volunteer work" },
  { key: "publications", label: "Publications" },
  { key: "order", label: "Section ordering" },
];

type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

interface AssistRequest {
  action: string;
  text: string;
  apply: (suggestion: string) => void;
}

const ASSIST_TITLES: Record<string, string> = {
  "improve-summary": "AI Polish: Professional Summary",
  "generate-summary-variations": "AI 3-Tone Summary Variations",
  "generate-role-bullets": "AI Role Accomplishment Bullets",
  "xyz-bullet": "Google XYZ Formula Metric Polish",
  "improve-bullet": "Action Verb & Impact Polish",
  "fix-grammar": "Fix Grammar & Tone",
  "suggest-skills": "AI Industry Skill Recommendations",
  "make-clearer": "Clarity & Readability Enhancement",
  "tailor-to-job": "Tailor to Job Description",
};

interface StagedPayload {
  title: string;
  targetRole: string;
  content: ResumeContent;
  templateId: string;
  customization: ResumeCustomization;
}

export default function EditResumePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const resumeId = params.id;

  const resumeQuery = useResume(resumeId);
  const resume: Resume | undefined = resumeQuery.data;

  const [content, setContent] = useState<ResumeContent | null>(null);
  const [templateId, setTemplateId] = useState("ats-classic-01");
  const [customization, setCustomization] = useState<ResumeCustomization>({});
  const [title, setTitle] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [tab, setTab] = useState<SectionKey>("personal");
  const [designTab, setDesignTab] = useState<"content" | "design">("content");
  const [saveState, setSaveState] = useState<SaveState>("idle");

  // Modals & Drawers
  const [tailorModalOpen, setTailorModalOpen] = useState(false);
  const [atsModalOpen, setAtsModalOpen] = useState(false);
  const [presetModalOpen, setPresetModalOpen] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(0.72);

  const hydratedFor = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const payloadRef = useRef<StagedPayload | null>(null);

  // Hydrate local editor state once per resume load.
  useEffect(() => {
    if (!resume || hydratedFor.current === resume.id) return;
    hydratedFor.current = resume.id;
    setContent(resume.content);
    setTemplateId(resume.templateId);
    setCustomization(resume.customization ?? {});
    setTitle(resume.title);
    setTargetRole(resume.targetRole ?? "");
    setSaveState("idle");
  }, [resume]);

  const flush = useCallback(async () => {
    const payload = payloadRef.current;
    if (!payload) return;
    payloadRef.current = null;
    setSaveState("saving");
    try {
      await resumesApi.update(resumeId, payload);
      setSaveState("saved");
    } catch (e) {
      setSaveState("error");
      toast.error(getErrorMessage(e));
    }
  }, [resumeId]);

  /** Stage a change and debounce the PATCH (1.2s after the last keystroke). */
  const stage = useCallback(
    (patch: Partial<StagedPayload>) => {
      setSaveState("dirty");
      payloadRef.current = {
        title: patch.title ?? title,
        targetRole: patch.targetRole ?? targetRole,
        content: patch.content ?? content!,
        templateId: patch.templateId ?? templateId,
        customization: patch.customization ?? customization,
      };
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), 1200);
    },
    [title, targetRole, content, templateId, customization, flush],
  );

  // Best-effort flush when leaving the editor.
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
      const pending = payloadRef.current;
      if (pending) void resumesApi.update(resumeId, pending).catch(() => undefined);
    };
  }, [resumeId]);

  const onChangeContent = useCallback(
    (next: ResumeContent) => {
      setContent(next);
      stage({ content: next });
    },
    [stage],
  );

  // Real-time Live ATS Score calculation
  const atsResult = useMemo(() => calculateLiveAtsScore(content), [content]);

  // ---- AI assist modal ----
  const [assistReq, setAssistReq] = useState<AssistRequest | null>(null);
  const [suggestion, setSuggestion] = useState("");
  const assist = useAssistAi();

  const onAssist = useCallback(
    (action: string, text: string, apply: (s: string) => void) => {
      setAssistReq({ action, text, apply });
      setSuggestion("");
      assist.mutate(
        { action, text: text || targetRole || "Software Engineer", context: targetRole || undefined, targetRole },
        { onSuccess: (r) => setSuggestion(r.suggestion) }
      );
    },
    [assist, targetRole],
  );

  const closeAssist = () => {
    setAssistReq(null);
    setSuggestion("");
  };

  // ---- Actions ----
  const analyze = useAnalyzeResume();
  const snapshot = useSnapshotVersion(resumeId);

  const runAnalyze = () => {
    analyze.mutate(
      { resumeId, source: "BUILDER" },
      { onSuccess: (a) => router.push(`/resume-analyzer/${a.id}`) }
    );
  };

  const handleCopyPlainText = () => {
    if (!content) return;
    const plain = resumeToPlainText(content);
    navigator.clipboard.writeText(plain);
    toast.success("Resume copied to clipboard in clean ATS plain text!");
  };

  const handleExportJson = () => {
    if (!content) return;
    const blob = new Blob([JSON.stringify({ title, targetRole, templateId, customization, content }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "-") || "resume"}-backup.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Resume exported as JSON backup!");
  };

  const handleApplyPreset = (preset: (typeof ROLE_PRESETS)[0]) => {
    if (!content) return;
    const next: ResumeContent = {
      ...content,
      personal: {
        ...content.personal,
        title: preset.role,
      },
      summary: preset.summary,
      skillGroups: preset.skillGroups.map((g) => ({
        id: Math.random().toString(36).slice(2, 9),
        category: g.category,
        skills: [...g.skills],
      })),
      experience: preset.sampleExperience.map((e) => ({
        id: Math.random().toString(36).slice(2, 9),
        ...e,
      })),
    };

    setTargetRole(preset.role);
    onChangeContent(next);
    setPresetModalOpen(false);
    toast.success(`Loaded "${preset.name}" role starter!`);
  };

  const template = useMemo(() => getTemplate(templateId), [templateId]);

  if (resumeQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Spinner />
        <p className="mt-3 text-sm text-muted-foreground">Loading interactive resume builder…</p>
      </div>
    );
  }

  if (resumeQuery.isError || !resume || !content) {
    return (
      <Alert variant="destructive" className="mx-auto mt-16 max-w-lg">
        <span className="font-semibold">Could not open this resume</span>
        <span className="block text-sm opacity-90">
          {resumeQuery.isError ? getErrorMessage(resumeQuery.error) : "Resume not found."}
        </span>
        <Link href="/resume-dashboard" className="mt-2 inline-block text-sm underline">
          Back to my resumes
        </Link>
      </Alert>
    );
  }

  const sectionProps = { content, onChange: onChangeContent, onAssist, targetRole };

  const renderSectionForm = () => {
    switch (tab) {
      case "personal":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="resume-doc-title">
                  Document Title (internal reference)
                </label>
                <Input
                  id="resume-doc-title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    stage({ title: e.target.value });
                  }}
                  placeholder="e.g. Senior Frontend Resume - 2026"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="resume-target-role">
                  Target Role (used by AI assistants)
                </label>
                <Input
                  id="resume-target-role"
                  value={targetRole}
                  onChange={(e) => {
                    setTargetRole(e.target.value);
                    stage({ targetRole: e.target.value });
                  }}
                  placeholder="e.g. Senior Frontend Engineer"
                />
              </div>
            </div>
            <PersonalSection {...sectionProps} />
          </div>
        );
      case "summary":
        return <SummarySection {...sectionProps} />;
      case "experience":
        return <ExperienceSection {...sectionProps} />;
      case "education":
        return <EducationSection {...sectionProps} />;
      case "skills":
        return <SkillsSection {...sectionProps} />;
      case "projects":
        return <ProjectsSection {...sectionProps} />;
      case "certifications":
        return (
          <GenericSection
            {...sectionProps}
            field="certifications"
            title="Certifications"
            singular="Certification"
          />
        );
      case "awards":
        return <GenericSection {...sectionProps} field="awards" title="Awards" singular="Award" />;
      case "volunteer":
        return <GenericSection {...sectionProps} field="volunteer" title="Volunteer" singular="Volunteer role" />;
      case "publications":
        return <GenericSection {...sectionProps} field="publications" title="Publications" singular="Publication" />;
      case "languages":
        return <LanguagesSection {...sectionProps} />;
      case "order":
        return <SectionOrderControl {...sectionProps} />;
      default:
        return null;
    }
  };

  const saveLabel: Record<SaveState, string> = {
    idle: "All changes saved",
    dirty: "Unsaved changes…",
    saving: "Saving…",
    saved: "Saved",
    error: "Save failed — retrying on next change",
  };

  const designPanel = (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-semibold">Select ATS-Optimized Template — {template.name}</p>
        <div className="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto thin-scrollbar md:grid-cols-3">
          {ALL_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTemplateId(t.id);
                stage({ templateId: t.id });
              }}
              className={cn(
                "rounded-lg border p-2 text-left text-xs transition-colors",
                templateId === t.id
                  ? "border-primary-600 bg-primary-50 dark:bg-primary-950/40"
                  : "border-border hover:bg-muted"
              )}
            >
              <span className="mb-1.5 block h-10 rounded bg-gradient-to-br from-slate-100 to-slate-200 p-1.5 dark:from-slate-800 dark:to-slate-900">
                <span className="block h-1.5 w-1/2 rounded-sm" style={{ background: t.accent }} />
                <span className="mt-1 block h-1 w-full rounded bg-slate-300 dark:bg-slate-700" />
                <span className="mt-0.5 block h-1 w-2/3 rounded bg-slate-300 dark:bg-slate-700" />
              </span>
              <span className="block font-medium">{t.name}</span>
              <span className="block text-muted-foreground">{t.category}</span>
            </button>
          ))}
        </div>
        {!template.atsSafe && template.atsNote ? (
          <p className="mt-2 text-xs text-amber-600">{template.atsNote}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="field-label" htmlFor="accent-color">
            Accent color
          </label>
          <div className="flex items-center gap-2">
            <input
              id="accent-color"
              type="color"
              value={customization.accentColor ?? template.accent}
              onChange={(e) => {
                const next = { ...customization, accentColor: e.target.value };
                setCustomization(next);
                stage({ customization: next });
              }}
              className="h-10 w-14 cursor-pointer rounded-lg border border-input bg-card p-1"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const next = { ...customization, accentColor: undefined };
                setCustomization(next);
                stage({ customization: next });
              }}
            >
              Reset
            </Button>
          </div>
        </div>
        <div>
          <label className="field-label">Font size</label>
          <div className="flex gap-1.5">
            {(["small", "medium", "large"] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={customization.fontSize === s ? "subtle" : "outline"}
                onClick={() => {
                  const next = { ...customization, fontSize: s };
                  setCustomization(next);
                  stage({ customization: next });
                }}
                className="capitalize"
              >
                {s}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <label className="field-label">Spacing density</label>
          <div className="flex gap-1.5">
            {(["compact", "normal", "relaxed"] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={customization.spacing === s ? "subtle" : "outline"}
                onClick={() => {
                  const next = { ...customization, spacing: s };
                  setCustomization(next);
                  stage({ customization: next });
                }}
                className="capitalize"
              >
                {s}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <PageHeader
        title={title || "Untitled Resume"}
        subtitle={
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge
              tone={
                saveState === "error"
                  ? "red"
                  : saveState === "saved" || saveState === "idle"
                  ? "green"
                  : "amber"
              }
              size="sm"
            >
              {saveLabel[saveState]}
            </Badge>

            {/* Live ATS Score Badge */}
            <button
              type="button"
              onClick={() => setAtsModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-2.5 py-0.5 text-xs font-semibold hover:border-primary-500 hover:bg-muted transition-colors cursor-pointer"
              title="Click to view full ATS score breakdown"
            >
              <span
                className={`size-2 rounded-full ${
                  atsResult.tone === "green"
                    ? "bg-emerald-500"
                    : atsResult.tone === "blue"
                    ? "bg-blue-500"
                    : atsResult.tone === "amber"
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
              />
              <span className="font-bold text-foreground">ATS Score: {atsResult.score}/100</span>
              <span className="text-muted-foreground hidden sm:inline">· {atsResult.rating}</span>
            </button>

            <span className="hidden lg:inline text-xs text-muted-foreground">
              {template.name} ({template.layout})
            </span>
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/resume-dashboard">
                <ArrowLeft className="size-4 mr-1" /> My Resumes
              </Link>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setTailorModalOpen(true)}
              className="text-primary-600 border-primary-200 dark:border-primary-800"
            >
              <Target className="size-4 mr-1.5" /> Tailor to Job
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPresetModalOpen(true)}
            >
              <Zap className="size-4 mr-1.5 text-amber-500" /> Role Starters
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyPlainText}
              title="Copy as plain text for ATS application forms"
            >
              <Copy className="size-4 mr-1.5" /> Copy Text
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => snapshot.mutate(`Manual snapshot ${new Date().toLocaleTimeString()}`)}
              loading={snapshot.isPending}
            >
              <History className="size-4 mr-1" /> Snapshot
            </Button>

            <Button size="sm" onClick={() => printResume()}>
              <Download className="size-4 mr-1.5" /> Export PDF
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* ---------------- Editor Left Panel ---------------- */}
        <Card className="shadow-sm">
          <CardBody className="p-0">
            {/* Top Navigation switch */}
            <div className="flex border-b border-border bg-muted/20">
              <button
                type="button"
                onClick={() => setDesignTab("content")}
                className={cn(
                  "flex-1 px-4 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2",
                  designTab === "content"
                    ? "border-b-2 border-primary-600 text-primary-700 dark:text-primary-300 bg-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <FileText className="size-4" /> Content & Sections
              </button>
              <button
                type="button"
                onClick={() => setDesignTab("design")}
                className={cn(
                  "flex-1 px-4 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2",
                  designTab === "design"
                    ? "border-b-2 border-primary-600 text-primary-700 dark:text-primary-300 bg-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Layers className="size-4" /> Templates & Styling
              </button>
            </div>

            {designTab === "content" ? (
              <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-[12rem_1fr]">
                {/* Section Tabs Sidebar */}
                <nav className="flex flex-row flex-wrap gap-1 lg:flex-col lg:self-start">
                  {SECTION_TABS.map((s) => {
                    const isTabActive = tab === s.key;
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setTab(s.key)}
                        className={cn(
                          "rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors flex items-center justify-between w-full",
                          isTabActive
                            ? "bg-primary-50 font-bold text-primary-700 dark:bg-primary-950/40 dark:text-primary-300"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <span>{s.label}</span>
                        {isTabActive && <ChevronRight className="size-3 text-primary-600 hidden lg:inline" />}
                      </button>
                    );
                  })}
                </nav>

                {/* Active Section Form */}
                <div className="min-w-0">{renderSectionForm()}</div>
              </div>
            ) : (
              <div className="p-5">{designPanel}</div>
            )}
          </CardBody>
        </Card>

        {/* ---------------- Live Preview Right Panel ---------------- */}
        <div className="space-y-3 xl:sticky xl:top-4 xl:self-start">
          <Card className="shadow-sm">
            <CardHeader
              title="A4 Live Preview"
              subtitle={`${template.name} · ${template.atsSafe ? "ATS-Safe" : "Creative Layout"}`}
              action={
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center rounded-lg border border-border bg-card p-0.5">
                    <button
                      type="button"
                      onClick={() => setPreviewZoom((z) => Math.max(0.5, z - 0.1))}
                      className="p-1 text-muted-foreground hover:text-foreground"
                      title="Zoom Out"
                    >
                      <ZoomOut className="size-3.5" />
                    </button>
                    <span className="px-1.5 text-xs font-mono font-medium text-foreground">
                      {Math.round(previewZoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewZoom((z) => Math.min(1.1, z + 0.1))}
                      className="p-1 text-muted-foreground hover:text-foreground"
                      title="Zoom In"
                    >
                      <ZoomIn className="size-3.5" />
                    </button>
                  </div>
                  <Badge tone={template.atsSafe ? "green" : "amber"} size="sm">
                    {template.atsSafe ? "ATS-Safe" : "Creative"}
                  </Badge>
                </div>
              }
            />
            <CardBody className="p-3">
              <div
                className="resume-preview-frame rounded-lg border border-border bg-slate-100 p-2 dark:bg-slate-900 overflow-x-auto"
                style={{ zoom: previewZoom }}
              >
                <ResumePreview content={content} templateId={templateId} customization={customization} />
              </div>
            </CardBody>
          </Card>

          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>Autosave active · Instant debounced cloud sync</span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleExportJson}
                className="hover:underline flex items-center gap-1"
              >
                <Download className="size-3" /> Backup JSON
              </button>
              <button
                type="button"
                onClick={handleCopyPlainText}
                className="hover:underline flex items-center gap-1"
              >
                <Copy className="size-3" /> Copy Plain Text
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- Real-time ATS Breakdown Modal ---------------- */}
      <Modal open={atsModalOpen} onOpenChange={setAtsModalOpen}>
        <ModalContent size="lg">
          <ModalHeader>
            <span className="flex items-center gap-2 text-lg font-bold">
              <CheckCircle2 className="size-5 text-emerald-600" /> Real-Time ATS Readiness Breakdown
            </span>
            <span className="text-sm text-muted-foreground">
              Live algorithmic review based on recruiter parsing rules and ATS compliance standards.
            </span>
          </ModalHeader>

          <div className="space-y-4">
            {/* Header Score Overview */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Overall ATS Score</p>
                <p className="text-3xl font-black text-foreground">{atsResult.score}/100</p>
              </div>
              <div className="text-right">
                <Badge tone={atsResult.tone} size="md">
                  {atsResult.rating}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {atsResult.stats.metricsCount} metric bullets · {atsResult.stats.skillsCount} skills
                </p>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2 max-h-80 overflow-y-auto thin-scrollbar">
              {atsResult.checks.map((check) => (
                <div
                  key={check.id}
                  className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 text-sm shadow-sm"
                >
                  {check.passed ? (
                    <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="size-5 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold ${check.passed ? "text-foreground" : "text-amber-700 dark:text-amber-300"}`}>
                      {check.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{check.tip}</p>
                  </div>
                  {!check.passed && (
                    <button
                      type="button"
                      onClick={() => {
                        setTab(check.sectionKey as SectionKey);
                        setAtsModalOpen(false);
                      }}
                      className="text-xs font-semibold text-primary-600 hover:underline shrink-0"
                    >
                      Fix now →
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <Button onClick={() => setAtsModalOpen(false)}>Done</Button>
            </div>
          </div>
        </ModalContent>
      </Modal>

      {/* ---------------- Role Starters Preset Modal ---------------- */}
      <Modal open={presetModalOpen} onOpenChange={setPresetModalOpen}>
        <ModalContent size="lg">
          <ModalHeader>
            <span className="flex items-center gap-2 text-lg font-bold">
              <Zap className="size-5 text-amber-500" /> One-Click Role Starters & Blueprints
            </span>
            <span className="text-sm text-muted-foreground">
              Select your role to preload proven summaries, XYZ accomplishment bullets, and categorized skills.
            </span>
          </ModalHeader>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-h-96 overflow-y-auto thin-scrollbar p-1">
            {ROLE_PRESETS.map((preset) => (
              <div
                key={preset.id}
                className="rounded-xl border border-border bg-card p-4 hover:border-primary-500 transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  <p className="font-bold text-foreground">{preset.name}</p>
                  <p className="text-xs text-primary-600 font-medium mt-0.5">{preset.role}</p>
                  <p className="text-xs text-muted-foreground line-clamp-3 mt-2">{preset.summary}</p>
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {preset.skillGroups.flatMap((g) => g.skills).slice(0, 5).map((s) => (
                      <span key={s} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {s}
                      </span>
                    ))}
                    <span className="text-[10px] text-muted-foreground">+{preset.skillGroups.flatMap((g) => g.skills).length - 5} more</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleApplyPreset(preset)}
                  className="mt-4 w-full"
                >
                  Load this starter
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2 border-t border-border">
            <Button variant="ghost" onClick={() => setPresetModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </ModalContent>
      </Modal>

      {/* ---------------- Job Tailoring Modal ---------------- */}
      <JobTailorModal
        open={tailorModalOpen}
        onOpenChange={setTailorModalOpen}
        content={content}
        targetRole={targetRole || "Software Engineer"}
        onApplyContent={onChangeContent}
      />

      {/* ---------------- AI Assist Review Modal ---------------- */}
      <Modal open={Boolean(assistReq)} onOpenChange={(open) => { if (!open) closeAssist(); }}>
        <ModalContent size="lg">
          <ModalHeader>
            <span className="flex items-center gap-2 text-lg font-bold">
              <Sparkles className="size-5 text-primary-600" /> {ASSIST_TITLES[assistReq?.action ?? ""] ?? "AI Copilot Polish"}
            </span>
            <span className="text-sm text-muted-foreground">Review the suggestion and apply it with one click.</span>
          </ModalHeader>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="field-label">Original Content</p>
              <div className="max-h-64 overflow-y-auto thin-scrollbar rounded-lg border border-border bg-muted/40 p-3 text-xs whitespace-pre-wrap font-mono text-muted-foreground">
                {assistReq?.text || "None"}
              </div>
            </div>
            <div>
              <p className="field-label">AI Enhanced Result</p>
              {assist.isPending ? (
                <div className="flex h-36 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20">
                  <div className="text-center">
                    <Loader2 className="size-6 animate-spin text-primary-600 mx-auto" />
                    <p className="text-xs text-muted-foreground mt-2">Generating ATS-optimized content...</p>
                  </div>
                </div>
              ) : assist.isError ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {getErrorMessage(assist.error)}
                </div>
              ) : (
                <TextareaField
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  rows={8}
                  className="text-xs font-mono"
                  aria-label="AI suggestion"
                />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="ghost" onClick={closeAssist}>
              Discard
            </Button>
            <Button
              disabled={!suggestion.trim() || assist.isPending}
              onClick={() => {
                assistReq?.apply(suggestion.trim());
                closeAssist();
                toast.success("Applied AI enhancement to your resume!");
              }}
            >
              <Check className="size-4 mr-1.5" /> Accept & Apply to Resume
            </Button>
          </div>
        </ModalContent>
      </Modal>

      {/* ---------------- Print Portal for A4 PDF Generation ---------------- */}
      <PrintPortal>
        <ResumePreview content={content} templateId={templateId} customization={customization} forPrint />
      </PrintPortal>
    </>
  );
}
