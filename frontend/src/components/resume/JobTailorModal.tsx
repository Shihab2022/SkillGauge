"use client";

import { useState } from "react";
import { Sparkles, Check, Plus, AlertCircle, ArrowRight, Loader2, Target } from "lucide-react";
import { Modal, ModalContent, ModalHeader } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { TextareaField, TextField } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import type { ResumeContent } from "@/lib/types.resume";
import { useAssistAi } from "@/hooks/useResumes";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: ResumeContent;
  targetRole: string;
  onApplyContent: (next: ResumeContent) => void;
}

export function JobTailorModal({ open, onOpenChange, content, targetRole, onApplyContent }: Props) {
  const [jobText, setJobText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState<{
    score: number;
    foundKeywords: string[];
    missingKeywords: string[];
    suggestions: string[];
  } | null>(null);

  const assist = useAssistAi();

  const handleAnalyze = () => {
    if (!jobText.trim() || jobText.trim().length < 30) {
      toast.error("Please paste a meaningful job description (at least 30 characters).");
      return;
    }

    setIsAnalyzing(true);

    // Build plain text representation of the current resume
    const resumeText = [
      content.personal.fullName,
      content.personal.title,
      content.summary,
      ...content.experience.map((e) => `${e.jobTitle} ${e.company} ${e.bullets.join(" ")}`),
      ...content.skillGroups.map((g) => `${g.category}: ${g.skills.join(", ")}`),
      ...content.projects.map((p) => `${p.name} ${p.description} ${p.technologies.join(" ")}`),
    ].join(" ").toLowerCase();

    // Extract keywords from the job description
    const stopWords = new Set([
      "about", "above", "after", "again", "against", "all", "and", "any", "are", "because",
      "been", "before", "being", "below", "between", "both", "but", "by", "can", "cannot",
      "could", "did", "does", "doing", "down", "during", "each", "few", "for", "from",
      "further", "had", "has", "have", "having", "her", "here", "hers", "herself", "him",
      "himself", "his", "how", "into", "its", "itself", "more", "most", "must", "nor",
      "not", "off", "once", "only", "other", "ought", "our", "ours", "ourselves", "out",
      "over", "own", "same", "she", "should", "some", "such", "than", "that", "the",
      "their", "theirs", "them", "themselves", "then", "there", "these", "they", "this",
      "those", "through", "too", "under", "until", "very", "was", "were", "what", "when",
      "where", "which", "while", "who", "whom", "why", "with", "would", "you", "your",
      "yours", "yourself", "yourselves", "will", "experience", "role", "years", "looking",
      "requirements", "responsibilities", "skills", "team", "work", "candidate", "company"
    ]);

    const words = jobText
      .toLowerCase()
      .replace(/[^a-z0-9+#.\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

    // Frequency map
    const freq: Record<string, number> = {};
    words.forEach((w) => {
      freq[w] = (freq[w] || 0) + 1;
    });

    // Top extracted keywords
    const topKeywords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 18)
      .map(([k]) => k);

    const found: string[] = [];
    const missing: string[] = [];

    topKeywords.forEach((kw) => {
      if (resumeText.includes(kw)) {
        found.push(kw);
      } else {
        missing.push(kw);
      }
    });

    const matchScore = Math.round((found.length / Math.max(1, topKeywords.length)) * 100);

    setTimeout(() => {
      setMatchResult({
        score: matchScore,
        foundKeywords: found,
        missingKeywords: missing,
        suggestions: [
          `Your resume matches ${matchScore}% of the core keywords in this job description.`,
          missing.length > 0
            ? `Consider adding key missing terms like "${missing.slice(0, 4).join('", "')}" into your Skills or Experience sections.`
            : "Great keyword coverage! Align your achievement bullets with the primary responsibilities listed.",
        ],
      });
      setIsAnalyzing(false);
    }, 400);
  };

  const addMissingToSkills = (keywordsToAdd: string[]) => {
    if (!keywordsToAdd.length) return;
    const next = { ...content };
    const groups = [...(next.skillGroups || [])];

    if (!groups.length) {
      groups.push({
        id: Math.random().toString(36).slice(2, 9),
        category: "Required Job Skills",
        skills: [],
      });
    }

    const firstGroup = { ...groups[0]! };
    const existing = new Set(firstGroup.skills.map((s) => s.toLowerCase()));

    const newlyAdded: string[] = [];
    keywordsToAdd.forEach((kw) => {
      if (!existing.has(kw.toLowerCase())) {
        const capitalized = kw.charAt(0).toUpperCase() + kw.slice(1);
        firstGroup.skills.push(capitalized);
        newlyAdded.push(capitalized);
      }
    });

    groups[0] = firstGroup;
    next.skillGroups = groups;
    onApplyContent(next);

    toast.success(`Added ${newlyAdded.length} missing skill(s) to "${firstGroup.category}"!`);

    // Update local missing list
    if (matchResult) {
      setMatchResult({
        ...matchResult,
        missingKeywords: matchResult.missingKeywords.filter((k) => !keywordsToAdd.includes(k)),
        foundKeywords: [...matchResult.foundKeywords, ...keywordsToAdd],
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
            <Target className="size-5 text-primary-600" /> AI Job Description Tailoring & Matcher
          </span>
          <span className="text-sm text-muted-foreground">
            Paste any job posting to analyze keyword match %, extract gaps, and automatically tailor your resume.
          </span>
        </ModalHeader>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Left column: Input */}
          <div className="space-y-3">
            <TextareaField
              label="Job Description / Requirements"
              placeholder="Paste job posting text here (responsibilities, required qualifications, tech stack)..."
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              rows={10}
              className="text-xs font-mono"
            />
            <Button
              className="w-full"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !jobText.trim()}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Analyzing Keyword Overlap...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 size-4" /> Calculate Job Match & Keyword Gaps
                </>
              )}
            </Button>
          </div>

          {/* Right column: Match Analysis Results */}
          <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-4">
            {matchResult ? (
              <>
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">ATS Job Match</p>
                    <p className="text-2xl font-black text-foreground">{matchResult.score}%</p>
                  </div>
                  <Badge tone={matchResult.score >= 70 ? "green" : matchResult.score >= 50 ? "amber" : "red"} size="md">
                    {matchResult.score >= 75 ? "Strong Fit" : matchResult.score >= 50 ? "Moderate Match" : "Low Alignment"}
                  </Badge>
                </div>

                {/* Missing Keywords */}
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                      Missing Keywords ({matchResult.missingKeywords.length})
                    </p>
                    {matchResult.missingKeywords.length > 0 && (
                      <button
                        type="button"
                        onClick={() => addMissingToSkills(matchResult.missingKeywords)}
                        className="text-xs font-medium text-primary-600 hover:underline"
                      >
                        + Add all to skills
                      </button>
                    )}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto thin-scrollbar">
                    {matchResult.missingKeywords.length === 0 ? (
                      <p className="text-xs text-muted-foreground">None! All top keywords are present in your resume.</p>
                    ) : (
                      matchResult.missingKeywords.map((kw) => (
                        <button
                          key={kw}
                          type="button"
                          onClick={() => addMissingToSkills([kw])}
                          className="group inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
                        >
                          {kw} <Plus className="size-3 opacity-60 group-hover:opacity-100" />
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Matching Keywords */}
                <div>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Matching Keywords in Resume ({matchResult.foundKeywords.length})
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5 max-h-20 overflow-y-auto thin-scrollbar">
                    {matchResult.foundKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                      >
                        <Check className="size-3" /> {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quick 1-Click Tailor Actions */}
                <div className="pt-2 border-t border-border space-y-2">
                  <p className="text-xs font-semibold text-foreground">1-Click AI Tailoring Actions</p>
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
                <p className="text-sm font-medium text-foreground">No Job Description Analyzed Yet</p>
                <p className="text-xs mt-1 max-w-xs">
                  Paste the job posting requirements on the left and click "Calculate Job Match" to see your keyword overlap and missing terms.
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
