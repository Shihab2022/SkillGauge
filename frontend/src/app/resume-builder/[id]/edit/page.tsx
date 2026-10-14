"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Check, Download, History, Loader2, ScanSearch, Sparkles } from "lucide-react";
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

type SectionKey =
  | "personal" | "summary" | "experience" | "education" | "skills" | "projects"
  | "certifications" | "languages" | "awards" | "volunteer" | "publications" | "order";

const SECTION_TABS: { key: SectionKey; label: string }[] = [
  { key: "personal", label: "Personal info" },
  { key: "summary", label: "Summary" },
  { key: "experience", label: "Experience" },
  { key: "education", label: "Education" },
  { key: "skills", label: "Skills" },
  { key: "projects", label: "Projects" },
  { key: "certifications", label: "Certifications" },
  { key: "languages", label: "Languages" },
  { key: "awards", label: "Awards" },
  { key: "volunteer", label: "Volunteer" },
  { key: "publications", label: "Publications" },
  { key: "order", label: "Section order" },
];

type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

interface AssistRequest {
  action: string;
  text: string;
  apply: (suggestion: string) => void;
}

const ASSIST_TITLES: Record<string, string> = {
  "improve-summary": "Improve summary",
  "fix-grammar": "Fix grammar",
  "improve-bullets": "Improve bullets",
  suggest: "AI suggestion",
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
    (next: ResumeContent) => { setContent(next); stage({ content: next }); },
    [stage],
  );

  // ---- AI assist modal ----
  const [assistReq, setAssistReq] = useState<AssistRequest | null>(null);
  const [suggestion, setSuggestion] = useState("");
  const assist = useAssistAi();
  const onAssist = useCallback(
    (action: string, text: string, apply: (s: string) => void) => {
      if (!text.trim()) { toast.error("Add some text first"); return; }
      setAssistReq({ action, text, apply });
      setSuggestion("");
      assist.mutate({ action, text, context: targetRole || undefined }, { onSuccess: (r) => setSuggestion(r.suggestion) });
    },
    [assist, targetRole],
  );

  const closeAssist = () => { setAssistReq(null); setSuggestion(""); };

  // ---- actions ----
  const analyze = useAnalyzeResume();
  const snapshot = useSnapshotVersion(resumeId);
  const runAnalyze = () => {
    analyze.mutate({ resumeId, source: "BUILDER" }, { onSuccess: (a) => router.push(`/resume-analyzer/${a.id}`) });
  };

  const template = useMemo(() => getTemplate(templateId), [templateId]);

  if (resumeQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Spinner />
        <p className="mt-3 text-sm text-muted-foreground">Loading resume…</p>
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
        <Link href="/resume-dashboard" className="mt-2 inline-block text-sm underline">Back to my resumes</Link>
      </Alert>
    );
  }

  const sectionProps = { content, onChange: onChangeContent, onAssist };

  const renderSectionForm = () => {
    switch (tab) {
      case "personal":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="resume-doc-title">Resume title (internal)</label>
                <Input id="resume-doc-title" value={title} onChange={(e) => { setTitle(e.target.value); stage({ title: e.target.value }); }} />
              </div>
              <div>
                <label className="field-label" htmlFor="resume-target-role">Target role (used by AI)</label>
                <Input id="resume-target-role" value={targetRole} onChange={(e) => { setTargetRole(e.target.value); stage({ targetRole: e.target.value }); }} placeholder="e.g. Frontend Engineer" />
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
        return <GenericSection {...sectionProps} field="certifications" title="Certifications" singular="Certification" />;
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
        <p className="mb-2 text-sm font-semibold">Template — {template.name}</p>
        <div className="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto thin-scrollbar md:grid-cols-3">
          {ALL_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => { setTemplateId(t.id); stage({ templateId: t.id }); }}
              className={cn(
                "rounded-lg border p-2 text-left text-xs transition-colors",
                templateId === t.id ? "border-primary-600 bg-primary-50 dark:bg-primary-950/40" : "border-border hover:bg-muted",
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="accent-color">Accent color</label>
          <div className="flex items-center gap-2">
            <input
              id="accent-color"
              type="color"
              value={customization.accentColor ?? template.accent}
              onChange={(e) => { const next = { ...customization, accentColor: e.target.value }; setCustomization(next); stage({ customization: next }); }}
              className="h-10 w-14 cursor-pointer rounded-lg border border-input bg-card p-1"
            />
            <Button size="sm" variant="ghost" onClick={() => { const next = { ...customization, accentColor: undefined }; setCustomization(next); stage({ customization: next }); }}>
              Reset to template
            </Button>
          </div>
        </div>
        <div>
          <label className="field-label">Font size</label>
          <div className="flex gap-2">
            {(["small", "medium", "large"] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={customization.fontSize === s ? "subtle" : "outline"}
                onClick={() => { const next = { ...customization, fontSize: s }; setCustomization(next); stage({ customization: next }); }}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <label className="field-label">Spacing</label>
          <div className="flex gap-2">
            {(["compact", "normal", "relaxed"] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={customization.spacing === s ? "subtle" : "outline"}
                onClick={() => { const next = { ...customization, spacing: s }; setCustomization(next); stage({ customization: next }); }}
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
        title={title || "Untitled resume"}
        subtitle={
          <span className="flex items-center gap-2">
            <Badge tone={saveState === "error" ? "red" : saveState === "saved" || saveState === "idle" ? "green" : "amber"} size="sm">
              {saveLabel[saveState]}
            </Badge>
            <span className="hidden sm:inline">Editing {template.name} · {template.category}</span>
          </span>
        }
        actions={
          <>
            <Button asChild variant="ghost" size="sm">
              <Link href="/resume-dashboard"><ArrowLeft className="size-4" /> Back</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => snapshot.mutate(`Manual snapshot ${new Date().toLocaleString()}`)} loading={snapshot.isPending}>
              <History className="size-4" /> Snapshot
            </Button>
            <Button variant="outline" size="sm" onClick={runAnalyze} loading={analyze.isPending}>
              <ScanSearch className="size-4" /> Run ATS analysis
            </Button>
            <Button size="sm" onClick={() => printResume()}>
              <Download className="size-4" /> Export A4 PDF
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* ---------------- editor panel ---------------- */}
        <Card>
          <CardBody className="p-0">
            <div className="flex border-b border-border">
              {(["content", "design"] as const).map((dt) => (
                <button
                  key={dt}
                  type="button"
                  onClick={() => setDesignTab(dt)}
                  className={cn(
                    "flex-1 px-4 py-3 text-sm font-medium capitalize transition-colors",
                    designTab === dt ? "border-b-2 border-primary-600 text-primary-700 dark:text-primary-300" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {dt === "content" ? "Content" : "Design"}
                </button>
              ))}
            </div>

            {designTab === "content" ? (
              <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-[11rem_1fr]">
                <nav className="flex flex-row flex-wrap gap-1.5 lg:flex-col lg:self-start">
                  {SECTION_TABS.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setTab(s.key)}
                      className={cn(
                        "rounded-lg px-3 py-2 text-left text-sm transition-colors",
                        tab === s.key
                          ? "bg-primary-50 font-semibold text-primary-700 dark:bg-primary-950/40 dark:text-primary-300"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </nav>
                <div className="min-w-0">{renderSectionForm()}</div>
              </div>
            ) : (
              <div className="p-5">{designPanel}</div>
            )}
          </CardBody>
        </Card>

        {/* ---------------- live preview ---------------- */}
        <div className="space-y-4 xl:sticky xl:top-4 xl:self-start">
          <Card>
            <CardHeader
              title="Live preview"
              subtitle={`A4 · ${template.name}${template.atsSafe ? " · ATS-safe" : ""}`}
              action={
                <Badge tone={template.atsSafe ? "green" : "amber"} size="sm">{template.atsSafe ? "ATS-safe" : "Creative"}</Badge>
              }
            />
            <CardBody className="p-3">
              <div className="resume-preview-frame rounded-lg border border-border bg-slate-100 p-2 dark:bg-slate-900" style={{ zoom: 0.72 }}>
                <ResumePreview content={content} templateId={templateId} customization={customization} />
              </div>
            </CardBody>
          </Card>
          <p className="text-xs text-muted-foreground">
            Autosave is on — changes persist ~1s after you stop typing. “Export A4 PDF” opens the print
            dialog with the document pre-sized to 210 × 297 mm; choose “Save as PDF”.
          </p>
        </div>
      </div>

      {/* ---------------- AI assist review ---------------- */}
      <Modal open={Boolean(assistReq)} onOpenChange={(open) => { if (!open) closeAssist(); }}>
        <ModalContent size="lg">
          <ModalHeader>
            <span className="flex items-center gap-2 text-lg font-semibold">
              <Sparkles className="size-4 text-primary-600" /> {ASSIST_TITLES[assistReq?.action ?? "suggest"] ?? "AI suggestion"}
            </span>
            <span className="text-sm text-muted-foreground">Review the suggestion, then accept or discard it.</span>
          </ModalHeader>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="field-label">Current text</p>
              <div className="max-h-64 overflow-y-auto thin-scrollbar rounded-lg border border-border bg-muted/50 p-3 text-sm whitespace-pre-wrap">
                {assistReq?.text}
              </div>
            </div>
            <div>
              <p className="field-label">AI suggestion</p>
              {assist.isPending ? (
                <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border">
                  <Loader2 className="size-5 animate-spin text-primary-600" />
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
                  aria-label="AI suggestion"
                />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={closeAssist}>Reject</Button>
            <Button
              disabled={!suggestion.trim() || assist.isPending}
              onClick={() => { assistReq?.apply(suggestion.trim()); closeAssist(); }}
            >
              <Check className="size-4" /> Accept & apply
            </Button>
          </div>
        </ModalContent>
      </Modal>

      {/* ---------------- print-only document (A4 PDF) ---------------- */}
      <PrintPortal>
        <ResumePreview content={content} templateId={templateId} customization={customization} forPrint />
      </PrintPortal>
    </>
  );
}

