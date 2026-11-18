"use client";

import { useState } from "react";
import { Sparkles, Check, Plus, AlertCircle, ArrowRight, Loader2, Target, Link2, FileText, CheckCircle2 } from "lucide-react";
import { Modal, ModalContent, ModalHeader } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { TextareaField, TextField } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import type { ResumeContent } from "@/lib/types.resume";
import { useAssistAi } from "@/hooks/useResumes";
import { calculateJobMatch, extractTextFromResumeContent, JobMatchAnalysis } from "@/lib/skills-matcher";
import { resumesApi, getErrorMessage } from "@/lib/api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: ResumeContent;
  targetRole: string;
  onApplyContent: (next: ResumeContent) => void;
}

export function JobTailorModal({ open, onOpenChange, content, targetRole, onApplyContent }: Props) {
  const [jobInputMode, setJobInputMode] = useState<"text" | "url">("text");
  const [jobText, setJobText] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchAnalysis, setMatchAnalysis] = useState<JobMatchAnalysis | null>(null);

  const assist = useAssistAi();

  const handleFetchUrl = async () => {
    if (!jobUrl.trim() || !/^https?:\/\//i.test(jobUrl.trim())) {
      toast.error("Please enter a valid job posting URL (e.g., https://...)");
      return;
    }

    setIsFetchingUrl(true);
    try {
      const res = await resumesApi.fetchUrl(jobUrl.trim());
      if (!res.text || res.text.length < 40) {
        toast.error("Could not extract enough text from this URL. Try pasting the job description directly.");
        return;
      }
      setJobText(res.text);
      setJobInputMode("text");
      toast.success("Job description extracted from URL! Review or click Analyze below.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleAnalyze = () => {
    if (!jobText.trim() || jobText.trim().length < 30) {
      toast.error("Please provide a meaningful job description (at least 30 characters).");
      return;
    }

    setIsAnalyzing(true);

    const resumePlain = extractTextFromResumeContent(content);
    const analysis = calculateJobMatch(resumePlain, jobText);

    setTimeout(() => {
      setMatchAnalysis(analysis);
      setIsAnalyzing(false);
      toast.success(`Analysis ready: ${analysis.matchPercentage}% technical match found!`);
    }, 300);
  };

  const addMissingToSkills = (skillsToAdd: string[]) => {
    if (!skillsToAdd.length) return;
    const next = { ...content };
    const groups = [...(next.skillGroups || [])];

    if (!groups.length) {
      groups.push({
        id: Math.random().toString(36).slice(2, 9),
        category: "Required Job Technologies",
        skills: [],
      });
    }

    const firstGroup = { ...groups[0]! };
    const existing = new Set(firstGroup.skills.map((s) => s.toLowerCase()));

    const newlyAdded: string[] = [];
    skillsToAdd.forEach((sk) => {
      if (!existing.has(sk.toLowerCase())) {
        firstGroup.skills.push(sk);
        newlyAdded.push(sk);
      }
    });

    groups[0] = firstGroup;
    next.skillGroups = groups;
    onApplyContent(next);

    toast.success(`Added ${newlyAdded.length} missing skill(s) to "${firstGroup.category}"!`);

    // Update local analysis view
    if (matchAnalysis) {
      const updatedMissing = matchAnalysis.missingSkills.filter((s) => !skillsToAdd.includes(s));
      const updatedMatched = [...matchAnalysis.matchedSkills, ...newlyAdded];
      const newPct = matchAnalysis.requiredSkills.length > 0
        ? Math.round((updatedMatched.length / matchAnalysis.requiredSkills.length) * 100)
        : matchAnalysis.matchPercentage;

      setMatchAnalysis({
        ...matchAnalysis,
        matchPercentage: Math.min(100, newPct),
        missingSkills: updatedMissing,
        matchedSkills: updatedMatched,
      });
    }
  };

  const handleTailorSummary = () => {
    toast.loading("Generating job-tailored summary with AI...", { id: "tailor-summary" });
    assist.mutate(
      {
        action: "tailor-to-job",
        text: content.summary || "Full-Stack Software Engineer with proven experience.",
        context: `TARGET JOB DESCRIPTION:\n${jobText.slice(0, 3000)}`,
        targetRole,
      },
      {
        onSuccess: (data) => {
          toast.dismiss("tailor-summary");
          if (data?.suggestion) {
            onApplyContent({ ...content, summary: data.suggestion });
            toast.success("Professional summary tailored to this job description!");
          }
        },
        onError: () => {
          toast.dismiss("tailor-summary");
          toast.error("Could not tailor summary at this time.");
        },
      }
    );
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="xl">
        <ModalHeader>
          <span className="flex items-center gap-2 text-lg font-bold">
            <Target className="size-5 text-primary-600" /> Tailor Resume to Job Description
          </span>
          <span className="text-sm text-muted-foreground">
            Accurately detect required technologies, compare skills vs. your resume, and align keywords for applicant tracking systems.
          </span>
        </ModalHeader>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Left column: Input */}
          <div className="space-y-3">
            {/* Input tabs */}
            <div className="flex rounded-lg border border-border bg-muted/40 p-1">
              <button
                type="button"
                onClick={() => setJobInputMode("text")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  jobInputMode === "text"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="size-3.5" /> Paste Description
              </button>
              <button
                type="button"
                onClick={() => setJobInputMode("url")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  jobInputMode === "url"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Link2 className="size-3.5" /> Job Posting URL
              </button>
            </div>

            {jobInputMode === "url" ? (
              <div className="space-y-2 rounded-lg border border-border p-3 bg-card">
                <label className="field-label">Target Job URL (LinkedIn, Indeed, Greenhouse, etc.)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://company.com/jobs/senior-engineer"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-xs shadow-xs focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <Button
                    size="sm"
                    onClick={handleFetchUrl}
                    disabled={isFetchingUrl || !jobUrl.trim()}
                  >
                    {isFetchingUrl ? <Loader2 className="size-3.5 animate-spin" /> : "Fetch"}
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Our crawler extracts the clean text directly from the public posting URL.
                </p>
              </div>
            ) : null}

            <div>
              <TextareaField
                label="Job Description Text"
                placeholder="Paste the full job requirements, responsibilities, and technical stack here..."
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                rows={9}
                className="text-xs font-mono"
              />
              <div className="flex justify-between items-center text-[11px] text-muted-foreground mt-1">
                <span>{jobText.length} characters</span>
                {jobText.length > 50 && (
                  <span className="text-emerald-600 font-medium">Ready for skill extraction</span>
                )}
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !jobText.trim()}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Extracting Technologies &amp; Skills...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 size-4" /> Calculate Technical Match &amp; Gaps
                </>
              )}
            </Button>
          </div>

          {/* Right column: Match Analysis Results */}
          <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
            {matchAnalysis ? (
              <>
                {/* Score Header */}
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Technical Stack Match</p>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-2xl font-black text-foreground">{matchAnalysis.matchPercentage}%</span>
                      <span className="text-xs text-muted-foreground">({matchAnalysis.matchedSkills.length} of {matchAnalysis.requiredSkills.length} skills)</span>
                    </div>
                  </div>
                  <Badge
                    tone={
                      matchAnalysis.matchPercentage >= 75
                        ? "green"
                        : matchAnalysis.matchPercentage >= 50
                        ? "blue"
                        : "amber"
                    }
                    size="md"
                  >
                    {matchAnalysis.rating}
                  </Badge>
                </div>

                {/* Missing Technologies (Required by Job, missing from Resume) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <AlertCircle className="size-3.5" /> Missing Required Skills ({matchAnalysis.missingSkills.length})
                    </p>
                    {matchAnalysis.missingSkills.length > 0 && (
                      <button
                        type="button"
                        onClick={() => addMissingToSkills(matchAnalysis.missingSkills)}
                        className="text-xs font-semibold text-primary-600 hover:underline"
                      >
                        + Add all to resume
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto thin-scrollbar">
                    {matchAnalysis.missingSkills.length === 0 ? (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium py-1">
                        <CheckCircle2 className="size-4" /> Exceptional! All required technologies are covered in your resume.
                      </div>
                    ) : (
                      matchAnalysis.missingSkills.map((sk) => (
                        <button
                          key={sk}
                          type="button"
                          onClick={() => addMissingToSkills([sk])}
                          className="group inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 transition-colors"
                          title="Click to add this skill to your resume"
                        >
                          {sk} <Plus className="size-3 opacity-60 group-hover:opacity-100" />
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Matched Technologies */}
                <div>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1.5 flex items-center gap-1">
                    <Check className="size-3.5" /> Matched Technologies ({matchAnalysis.matchedSkills.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto thin-scrollbar">
                    {matchAnalysis.matchedSkills.length === 0 ? (
                      <p className="text-xs text-muted-foreground">None detected yet.</p>
                    ) : (
                      matchAnalysis.matchedSkills.map((sk) => (
                        <span
                          key={sk}
                          className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                        >
                          <Check className="size-3" /> {sk}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Recommendations */}
                {matchAnalysis.recommendations.length > 0 && (
                  <div className="rounded-lg bg-card border border-border p-2.5 text-xs space-y-1">
                    <p className="font-semibold text-foreground">Recommendations:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      {matchAnalysis.recommendations.slice(0, 2).map((rec, ri) => (
                        <li key={ri} className="flex gap-1.5">
                          <span className="text-primary-600 font-bold">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 1-Click Tailor Actions */}
                <div className="pt-2 border-t border-border space-y-2">
                  <p className="text-xs font-semibold text-foreground">AI Automation</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start text-xs"
                    onClick={handleTailorSummary}
                    disabled={assist.isPending}
                  >
                    <Sparkles className="mr-2 size-3.5 text-primary-600" />
                    Rewrite Professional Summary for this Job
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Target className="size-10 text-muted-foreground/40 mb-2" />
                <p className="text-sm font-semibold text-foreground">No Job Description Analyzed Yet</p>
                <p className="text-xs mt-1 max-w-xs">
                  Paste the job posting requirements or enter a URL on the left, then click Calculate to see your exact skill match and gaps.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
