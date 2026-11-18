"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Target,
  Sparkles,
  Upload,
  Link2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
  ArrowRight,
  Briefcase,
  Layers,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TextareaField } from "@/components/ui/Input";
import { toast } from "sonner";
import { resumesApi, getErrorMessage } from "@/lib/api";
import { useResumes } from "@/hooks/useResumes";
import {
  calculateJobMatch,
  extractTextFromResumeContent,
  JobMatchAnalysis,
} from "@/lib/skills-matcher";
import type { Resume } from "@/lib/types.resume";

export function ResumeJobTailorHero() {
  const router = useRouter();

  // Resume source selection
  const [resumeMode, setResumeMode] = useState<"upload" | "saved" | "paste">("upload");
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [isExtractingFile, setIsExtractingFile] = useState(false);

  // Job source selection
  const [jobMode, setJobMode] = useState<"url" | "paste">("url");
  const [jobUrl, setJobUrl] = useState("");
  const [jobText, setJobText] = useState("");
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);

  // Analysis result
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<JobMatchAnalysis | null>(null);
  const [isCreatingResume, setIsCreatingResume] = useState(false);

  // Query user's existing resumes
  const resumesQuery = useResumes({ limit: 50 });
  const existingResumes = resumesQuery.data?.data || [];

  const handleSelectResume = (id: string) => {
    setSelectedResumeId(id);
    const found = existingResumes.find((r) => r.id === id);
    if (found?.content) {
      const text = extractTextFromResumeContent(found.content);
      setResumeText(text);
      setResumeFileName(found.title);
      toast.success(`Loaded "${found.title}" for matching!`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name;
    const type = file.type || "";
    const isText = /text\/|\.(txt|md)$/i.test(type || name);
    const isPdf = /application\/pdf/i.test(type) || /\.pdf$/i.test(name);
    const isImage = /^image\//i.test(type) || /\.(png|jpe?g|webp)$/i.test(name);

    if (!isText && !isPdf && !isImage) {
      toast.error("Please upload a PDF (.pdf), Text (.txt, .md), or Image (.jpg, .png) file.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error("File is too large (maximum 15MB).");
      return;
    }

    setResumeFileName(name);

    if (isText) {
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result || "");
        setResumeText(text);
        toast.success(`Loaded ${name} (${text.length} characters)`);
      };
      reader.readAsText(file);
      return;
    }

    // For PDF and images: call backend extraction endpoint
    setIsExtractingFile(true);
    const reader = new FileReader();
    reader.onerror = () => {
      setIsExtractingFile(false);
      toast.error("Failed to read file.");
    };
    reader.onload = async () => {
      try {
        const raw = String(reader.result || "");
        const base64Data = raw.includes(",") ? raw.split(",")[1]! : raw;
        const res = await resumesApi.extractFile({
          fileBase64: base64Data,
          fileName: name,
          fileMime: type || (isPdf ? "application/pdf" : "image/jpeg"),
        });
        setResumeText(res.text);
        toast.success(`Successfully extracted text from ${name}!`);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setIsExtractingFile(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFetchJobUrl = async () => {
    if (!jobUrl.trim() || !/^https?:\/\//i.test(jobUrl.trim())) {
      toast.error("Please enter a valid job URL starting with http:// or https://");
      return;
    }

    setIsFetchingUrl(true);
    try {
      const res = await resumesApi.fetchUrl(jobUrl.trim());
      if (!res.text || res.text.length < 40) {
        toast.error("Could not extract enough text from this job URL. Please paste the job description text.");
        return;
      }
      setJobText(res.text);
      setJobMode("paste");
      toast.success("Job description extracted successfully! Review or click Analyze below.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleRunAnalysis = () => {
    if (!resumeText.trim() || resumeText.trim().length < 30) {
      toast.error("Please upload or paste your resume text (at least 30 characters).");
      return;
    }
    if (!jobText.trim() || jobText.trim().length < 30) {
      toast.error("Please provide the job description or fetch from a job URL.");
      return;
    }

    setIsAnalyzing(true);
    setTimeout(() => {
      const result = calculateJobMatch(resumeText, jobText);
      setAnalysis(result);
      setIsAnalyzing(false);
      toast.success(`Job match complete: ${result.matchPercentage}% technical alignment!`);
    }, 400);
  };

  const handleAddSkillToResumeText = (skill: string) => {
    setResumeText((prev) => `${prev}\n• Proficient in ${skill}`);
    if (analysis) {
      const updatedMissing = analysis.missingSkills.filter((s) => s !== skill);
      const updatedMatched = [...analysis.matchedSkills, skill];
      const newPct = analysis.requiredSkills.length > 0
        ? Math.round((updatedMatched.length / analysis.requiredSkills.length) * 100)
        : analysis.matchPercentage;

      setAnalysis({
        ...analysis,
        matchPercentage: Math.min(100, newPct),
        missingSkills: updatedMissing,
        matchedSkills: updatedMatched,
      });
      toast.success(`Added ${skill} to your tailored resume!`);
    }
  };

  const handleOpenInBuilder = async () => {
    // If user picked an existing saved resume, route directly to its editor
    if (selectedResumeId) {
      router.push(`/resume-builder/${selectedResumeId}/edit`);
      return;
    }

    // Otherwise, create a new resume prefilled with the extracted skills
    setIsCreatingResume(true);
    try {
      const newResume = await resumesApi.create({
        title: resumeFileName ? `Tailored - ${resumeFileName.replace(/\.[^/.]+$/, "")}` : "Job-Tailored Resume",
        targetRole: analysis?.experienceDetails?.detectedSeniorityInJob
          ? `${analysis.experienceDetails.detectedSeniorityInJob} Engineer`
          : "Software Engineer",
      });
      toast.success("Created new resume workspace!");
      router.push(`/resume-builder/${newResume.id}/edit`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsCreatingResume(false);
    }
  };

  return (
    <Card className="mb-10 overflow-hidden border-2 border-primary-500/20 shadow-xl bg-gradient-to-b from-card to-background">
      <CardBody className="p-6 sm:p-8">
        {/* Header Banner */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 dark:bg-primary-950 px-3 py-1 text-xs font-bold text-primary-800 dark:text-primary-300 border border-primary-300 dark:border-primary-800">
                <Target className="size-3.5" /> Main Feature
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                <Sparkles className="size-3" /> AI Tailor to Job
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Tailor Resume to Job Description
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">
              Upload your resume and provide a target job posting or URL. We accurately detect required technologies,
              measure your exact match %, and tell you exactly which skills to add.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAnalysis(null);
                setResumeText("");
                setJobText("");
                setResumeFileName(null);
                setJobUrl("");
              }}
              className="text-xs"
            >
              Reset Inputs
            </Button>
          </div>
        </div>

        {/* Two-Column Intake Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ---------------- Column 1: Your Resume ---------------- */}
          <div className="space-y-3 rounded-xl border border-border bg-card/60 p-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <FileText className="size-4 text-primary-600" /> Step 1: Your Resume
              </label>
              {resumeText && (
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  ✓ Resume Loaded ({resumeText.length} chars)
                </span>
              )}
            </div>

            {/* Resume Mode Tabs */}
            <div className="flex rounded-lg border border-border bg-muted/40 p-1">
              <button
                type="button"
                onClick={() => setResumeMode("upload")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  resumeMode === "upload" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Upload className="size-3.5" /> Upload File
              </button>
              <button
                type="button"
                onClick={() => setResumeMode("saved")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  resumeMode === "saved" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Briefcase className="size-3.5" /> My Resumes ({existingResumes.length})
              </button>
              <button
                type="button"
                onClick={() => setResumeMode("paste")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  resumeMode === "paste" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="size-3.5" /> Paste Text
              </button>
            </div>

            {/* Mode 1: Upload */}
            {resumeMode === "upload" && (
              <div className="space-y-2">
                <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 hover:border-primary-500 hover:bg-muted/30 transition-colors cursor-pointer text-center">
                  <Upload className="size-8 text-muted-foreground mb-2" />
                  <span className="text-xs font-semibold text-foreground">
                    {resumeFileName ? resumeFileName : "Click to select or drop Resume file"}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    Supports PDF, DOCX, TXT, or Image scans (up to 15MB)
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.txt,.md,.doc,.docx,image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {isExtractingFile && (
                  <div className="flex items-center justify-center gap-2 text-xs text-primary-600 font-medium py-1">
                    <Loader2 className="size-3.5 animate-spin" /> Extracting resume text &amp; formatting...
                  </div>
                )}
              </div>
            )}

            {/* Mode 2: Saved Resume Picker */}
            {resumeMode === "saved" && (
              <div className="space-y-2">
                {existingResumes.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                    No resumes saved yet. Upload a file or paste your resume text to get started!
                  </div>
                ) : (
                  <div>
                    <label className="field-label">Select from your saved resumes:</label>
                    <select
                      value={selectedResumeId}
                      onChange={(e) => handleSelectResume(e.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs shadow-xs focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="">-- Choose a resume --</option>
                      {existingResumes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.title} {r.latestScore ? `(Score: ${r.latestScore})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Mode 3: Paste Text */}
            {resumeMode === "paste" && (
              <TextareaField
                placeholder="Paste your current resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={6}
                className="text-xs font-mono"
              />
            )}
          </div>

          {/* ---------------- Column 2: Target Job ---------------- */}
          <div className="space-y-3 rounded-xl border border-border bg-card/60 p-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Briefcase className="size-4 text-primary-600" /> Step 2: Target Job
              </label>
              {jobText && (
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  ✓ Job Details Ready ({jobText.length} chars)
                </span>
              )}
            </div>

            {/* Job Mode Tabs */}
            <div className="flex rounded-lg border border-border bg-muted/40 p-1">
              <button
                type="button"
                onClick={() => setJobMode("url")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  jobMode === "url" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Link2 className="size-3.5" /> Job Posting URL
              </button>
              <button
                type="button"
                onClick={() => setJobMode("paste")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  jobMode === "paste" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="size-3.5" /> Paste Description
              </button>
            </div>

            {/* Job URL Input */}
            {jobMode === "url" ? (
              <div className="space-y-2 rounded-lg border border-border p-3 bg-muted/20">
                <label className="field-label">Job Posting URL (LinkedIn, Indeed, Company Careers):</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://www.linkedin.com/jobs/view/..."
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-xs shadow-xs focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <Button
                    size="sm"
                    onClick={handleFetchJobUrl}
                    disabled={isFetchingUrl || !jobUrl.trim()}
                  >
                    {isFetchingUrl ? <Loader2 className="size-3.5 animate-spin" /> : "Fetch Text"}
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Our crawler extracts clean text from public job descriptions automatically.
                </p>
              </div>
            ) : null}

            <div>
              <TextareaField
                placeholder="Paste the job requirements, responsibilities, and required qualifications..."
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                rows={jobMode === "url" ? 4 : 6}
                className="text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            Strictly extracts verified technologies and technical proficiencies (React, Node, AWS, PostgreSQL, Docker, etc.)
          </div>

          <Button
            size="lg"
            onClick={handleRunAnalysis}
            disabled={isAnalyzing || !resumeText.trim() || !jobText.trim()}
            className="w-full sm:w-auto px-8 bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-md"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Detecting Technologies &amp; Matching...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 size-4" /> Calculate Match &amp; Skills Gap
              </>
            )}
          </Button>
        </div>

        {/* ---------------- Results Section ---------------- */}
        {analysis && (
          <div className="mt-8 pt-6 border-t border-border space-y-6 animate-in fade-in duration-300">
            {/* Top Score Dashboard */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative flex items-center justify-center">
                  <div
                    className={`size-20 rounded-full flex flex-col items-center justify-center text-white font-black text-2xl shadow-md ${
                      analysis.matchPercentage >= 75
                        ? "bg-emerald-600"
                        : analysis.matchPercentage >= 50
                        ? "bg-blue-600"
                        : "bg-amber-600"
                    }`}
                  >
                    <span>{analysis.matchPercentage}%</span>
                    <span className="text-[10px] font-normal uppercase opacity-90">Match</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <Badge
                      tone={
                        analysis.matchPercentage >= 75
                          ? "green"
                          : analysis.matchPercentage >= 50
                          ? "blue"
                          : "amber"
                      }
                      size="md"
                    >
                      {analysis.rating}
                    </Badge>
                    {analysis.experienceDetails?.detectedSeniorityInJob && (
                      <Badge tone="violet" size="md">
                        {analysis.experienceDetails.detectedSeniorityInJob.toUpperCase()} LEVEL
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg font-bold text-foreground mt-1">
                    {analysis.matchedSkills.length} of {analysis.requiredSkills.length} Technical Skills Matched
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {analysis.missingSkills.length > 0
                      ? `${analysis.missingSkills.length} critical skills missing from your resume for this position.`
                      : "Outstanding! All detected job technologies are present in your resume."}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <Button
                  onClick={handleOpenInBuilder}
                  loading={isCreatingResume}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-semibold"
                >
                  <ArrowRight className="size-4 mr-1.5" /> Open in Resume Builder
                </Button>
              </div>
            </div>

            {/* Skills Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Card 1: Missing Required Skills */}
              <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                    <AlertCircle className="size-4" /> Missing Required Skills ({analysis.missingSkills.length})
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  The job requires these technologies, but they were not detected in your resume. Click to add them:
                </p>

                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto thin-scrollbar">
                  {analysis.missingSkills.length === 0 ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold py-2">
                      <CheckCircle2 className="size-4" /> Perfect alignment — no missing skills!
                    </div>
                  ) : (
                    analysis.missingSkills.map((sk) => (
                      <button
                        key={sk}
                        type="button"
                        onClick={() => handleAddSkillToResumeText(sk)}
                        className="group inline-flex items-center gap-1 rounded-md border border-rose-300 dark:border-rose-800 bg-background px-2.5 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors shadow-2xs"
                        title="Click to add this skill to your resume"
                      >
                        {sk} <Plus className="size-3 opacity-60 group-hover:opacity-100" />
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Card 2: Matched Skills */}
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="size-4" /> Matched Technologies ({analysis.matchedSkills.length})
                </p>
                <p className="text-xs text-muted-foreground">
                  These verified skills were found in both the job posting and your resume:
                </p>

                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto thin-scrollbar">
                  {analysis.matchedSkills.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2">No matching technologies detected yet.</p>
                  ) : (
                    analysis.matchedSkills.map((sk) => (
                      <span
                        key={sk}
                        className="inline-flex items-center gap-1 rounded-md border border-emerald-300 dark:border-emerald-800 bg-background px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 shadow-2xs"
                      >
                        <CheckCircle2 className="size-3" /> {sk}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Card 3: Bonus / Extra Skills */}
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="size-4 text-primary-600" /> Bonus Resume Skills ({analysis.bonusSkills.length})
                </p>
                <p className="text-xs text-muted-foreground">
                  Additional technologies present in your resume that demonstrate technical depth:
                </p>

                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto thin-scrollbar">
                  {analysis.bonusSkills.slice(0, 15).map((sk) => (
                    <span
                      key={sk}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs text-foreground font-medium"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations & Action Plan */}
            <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-3">
              <p className="text-sm font-bold text-foreground flex items-center gap-2">
                <Layers className="size-4 text-primary-600" /> Tailored Recommendations for this Role
              </p>
              <ul className="space-y-2 text-xs">
                {analysis.recommendations.map((rec, ri) => (
                  <li key={ri} className="flex items-start gap-2 text-foreground/90 leading-relaxed">
                    <span className="text-primary-600 font-bold mt-0.5">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
export default ResumeJobTailorHero;
