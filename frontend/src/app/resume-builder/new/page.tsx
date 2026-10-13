"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardBody, PageHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { resumesApi, getErrorMessage } from "@/lib/api";
import { ALL_TEMPLATES } from "@/lib/resume-templates";
import { emptyResumeContent, sampleResumeContent } from "@/lib/resume-templates";
import { cn } from "@/lib/utils";

export default function NewResumePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [targetRole, setTargetRole] = useState("Full-Stack Engineer");
  const [templateId, setTemplateId] = useState("ats-classic-01");
  const [withSample, setWithSample] = useState(false);
  const [pending, setPending] = useState(false);

  const create = async () => {
    if (!title.trim()) {
      toast.error("Give your resume a title first");
      return;
    }
    setPending(true);
    try {
      const resume = await resumesApi.create({
        title: title.trim(),
        targetRole: targetRole.trim() || undefined,
        templateId,
        content: withSample ? (sampleResumeContent() as never) : (emptyResumeContent() as never),
      });
      toast.success("Resume created");
      router.push(`/resume-builder/${resume.id}/edit`);
    } catch (e) {
      toast.error(getErrorMessage(e));
      setPending(false);
    }
  };

  return (
    <>
      <PageHeader title="Create a resume" description="Name it, pick a starting template, optionally preload sample content." />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardBody className="space-y-4 p-5">
            <div>
              <label className="field-label" htmlFor="resume-title">Resume title</label>
              <Input id="resume-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Full-Stack Engineer Resume" />
            </div>
            <div>
              <label className="field-label" htmlFor="target-role">Target role</label>
              <Input id="target-role" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. Frontend Engineer" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={withSample} onChange={(e) => setWithSample(e.target.checked)} />
              Start with sample content (for preview only)
            </label>
            <Button onClick={create} loading={pending} className="w-full">Create & open editor</Button>
          </CardBody>
        </Card>
        <Card className="lg:col-span-2">
          <CardBody className="p-5">
            <p className="mb-3 font-semibold">Starting template</p>
            <div className="grid max-h-[520px] grid-cols-2 gap-3 overflow-y-auto thin-scrollbar md:grid-cols-3">
              {ALL_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplateId(t.id)}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-colors",
                    templateId === t.id ? "border-primary-600 bg-primary-50 dark:bg-primary-950/40" : "border-border hover:bg-muted",
                  )}
                >
                  <span className="mb-2 block h-20 rounded bg-gradient-to-br from-slate-100 to-slate-200 p-2 dark:from-slate-800 dark:to-slate-900">
                    <span className="block h-2 w-2/3 rounded" style={{ background: t.accent }} />
                    <span className="mt-1 block h-1.5 w-full rounded bg-slate-300 dark:bg-slate-700" />
                    <span className="mt-1 block h-1.5 w-5/6 rounded bg-slate-300 dark:bg-slate-700" />
                    <span className="mt-1 block h-1.5 w-4/6 rounded bg-slate-300 dark:bg-slate-700" />
                  </span>
                  <span className="block text-sm font-medium">{t.name}</span>
                  <span className="block text-xs text-muted-foreground">{t.atsSafe ? "ATS-safe" : "Creative"}</span>
                </button>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
