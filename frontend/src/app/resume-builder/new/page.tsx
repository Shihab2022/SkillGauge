"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardBody, PageHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { resumesApi, getErrorMessage } from "@/lib/api";
import { ALL_TEMPLATES, emptyResumeContent, sampleResumeContent } from "@/lib/resume-templates";
import { ROLE_PRESETS } from "@/lib/resume-presets";
import { cn } from "@/lib/utils";
import { Sparkles, Zap, FileText, Upload } from "lucide-react";
import type { ResumeContent } from "@/lib/types.resume";

export default function NewResumePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [targetRole, setTargetRole] = useState("Full-Stack Engineer");
  const [templateId, setTemplateId] = useState("ats-classic-01");
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>("full-stack");
  const [pending, setPending] = useState(false);

  // Deep link from the template gallery: /resume-builder/new?template=<id>
  useEffect(() => {
    const preset = new URLSearchParams(window.location.search).get("template");
    if (preset && ALL_TEMPLATES.some((t) => t.id === preset)) setTemplateId(preset);
  }, []);

  const handleSelectPreset = (presetId: string | null) => {
    setSelectedPresetId(presetId);
    if (presetId) {
      const found = ROLE_PRESETS.find((p) => p.id === presetId);
      if (found) {
        setTargetRole(found.role);
        if (!title || title.includes("Resume")) {
          setTitle(`${found.name} Resume`);
        }
      }
    }
  };

  const create = async () => {
    const finalTitle = title.trim() || `${targetRole || "Software Engineer"} Resume`;
    setPending(true);
    try {
      let initialContent: ResumeContent = emptyResumeContent();

      if (selectedPresetId) {
        const found = ROLE_PRESETS.find((p) => p.id === selectedPresetId);
        if (found) {
          initialContent = {
            ...initialContent,
            personal: {
              ...initialContent.personal,
              title: found.role,
            },
            summary: found.summary,
            skillGroups: found.skillGroups.map((g) => ({
              id: Math.random().toString(36).slice(2, 9),
              category: g.category,
              skills: [...g.skills],
            })),
            experience: found.sampleExperience.map((e) => ({
              id: Math.random().toString(36).slice(2, 9),
              ...e,
            })),
          };
        }
      }

      const resume = await resumesApi.create({
        title: finalTitle,
        targetRole: targetRole.trim() || undefined,
        templateId,
        content: initialContent as never,
      });

      toast.success("Resume created with blueprint!");
      router.push(`/resume-builder/${resume.id}/edit`);
    } catch (e) {
      toast.error(getErrorMessage(e));
      setPending(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Create a New Resume"
        subtitle="Choose your starting role blueprint, pick an ATS-optimized template, and launch the AI editor."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Configuration & Blueprints */}
        <div className="space-y-4 lg:col-span-1">
          <Card className="shadow-sm">
            <CardBody className="space-y-4 p-5">
              <div>
                <label className="field-label" htmlFor="resume-title">
                  Resume Title
                </label>
                <Input
                  id="resume-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Resume - 2026"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="target-role">
                  Target Career Role
                </label>
                <Input
                  id="target-role"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Full-Stack Engineer"
                />
              </div>

              {/* Blueprint Selector */}
              <div>
                <label className="field-label flex items-center justify-between">
                  <span>Starting Blueprint</span>
                  <span className="text-[11px] text-muted-foreground">Preloaded Content</span>
                </label>
                <div className="space-y-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleSelectPreset(null)}
                    className={cn(
                      "w-full rounded-lg border p-2.5 text-left text-xs font-medium transition-colors flex items-center gap-2",
                      selectedPresetId === null
                        ? "border-primary-600 bg-primary-50 text-primary-900 dark:bg-primary-950/40 dark:text-primary-300"
                        : "border-border text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <FileText className="size-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="font-semibold text-foreground">Blank Canvas</p>
                      <p className="text-[11px] text-muted-foreground">Start with empty sections</p>
                    </div>
                  </button>

                  {ROLE_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p.id)}
                      className={cn(
                        "w-full rounded-lg border p-2.5 text-left text-xs font-medium transition-colors flex items-center gap-2",
                        selectedPresetId === p.id
                          ? "border-primary-600 bg-primary-50 text-primary-900 dark:bg-primary-950/40 dark:text-primary-300"
                          : "border-border text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <Zap className="size-4 shrink-0 text-amber-500" />
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{p.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{p.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={create} loading={pending} className="w-full">
                <Sparkles className="size-4 mr-1.5" /> Create & Launch Editor
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Template Gallery */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardBody className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-foreground">Select ATS-Friendly Template</p>
                <span className="text-xs text-muted-foreground">
                  You can change templates and styling anytime inside the editor
                </span>
              </div>

              <div className="grid max-h-[560px] grid-cols-2 gap-3 overflow-y-auto thin-scrollbar md:grid-cols-3">
                {ALL_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplateId(t.id)}
                    className={cn(
                      "rounded-lg border p-3 text-left transition-colors",
                      templateId === t.id
                        ? "border-primary-600 bg-primary-50 dark:bg-primary-950/40"
                        : "border-border hover:bg-muted"
                    )}
                  >
                    <span className="mb-2 block h-20 rounded bg-gradient-to-br from-slate-100 to-slate-200 p-2 dark:from-slate-800 dark:to-slate-900">
                      <span className="block h-2 w-2/3 rounded" style={{ background: t.accent }} />
                      <span className="mt-1 block h-1.5 w-full rounded bg-slate-300 dark:bg-slate-700" />
                      <span className="mt-1 block h-1.5 w-5/6 rounded bg-slate-300 dark:bg-slate-700" />
                      <span className="mt-1 block h-1.5 w-4/6 rounded bg-slate-300 dark:bg-slate-700" />
                    </span>
                    <span className="block text-sm font-medium text-foreground">{t.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {t.atsSafe ? "ATS-Safe" : "Creative Layout"}
                    </span>
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
