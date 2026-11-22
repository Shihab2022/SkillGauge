"use client";

import { useState, useRef, useId } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Share2,
  CheckCircle2,
  ArrowLeft,
  Upload,
  FileText,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Globe,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { usePublicJob, useSubmitJobApplication } from "@/hooks/useJobs";
import { useResumes } from "@/hooks/useResumes";
import { useCurrentUser } from "@/store/auth";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  JOB_WORKPLACE_TYPE_LABELS,
  JOB_EMPLOYMENT_TYPE_LABELS,
  JOB_SENIORITY_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function AshbyJobDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const idOrSlug = params.id as string;
  const companyQuery = searchParams.get("company") ?? undefined;

  const { data: job, isLoading, isError } = usePublicJob(idOrSlug, companyQuery);
  const user = useCurrentUser();
  const { data: candidateResumes } = useResumes();

  const applyMutation = useSubmitJobApplication(job?.id || idOrSlug);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  // Resume File State
  const [resumeFile, setResumeFile] = useState<{
    name: string;
    size: number;
    base64: string;
  } | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");

  // Custom Questions Answers State
  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setResumeFile({
        name: file.name,
        size: file.size,
        base64,
      });
      setSelectedResumeId(""); // clear selected resume builder option
    };
    reader.readAsDataURL(file);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Job posting link copied to clipboard!");
    }
  };

  const scrollToApply = () => {
    const el = document.getElementById("apply-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim()) {
      toast.error("Please provide your name and email address");
      return;
    }

    // Prepare answers payload
    const answersPayload = (job?.customQuestions || []).map((q) => ({
      questionId: q.id,
      question: q.question,
      answer: customAnswers[q.id] ?? "",
    }));

    // Verify required questions
    for (const q of job?.customQuestions || []) {
      if (q.required && (!customAnswers[q.id] || customAnswers[q.id].toString().trim() === "")) {
        toast.error(`Please answer: "${q.question}"`);
        return;
      }
    }

    applyMutation.mutate(
      {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        location: location.trim() || null,
        currentCompany: currentCompany.trim() || null,
        currentTitle: currentTitle.trim() || null,
        linkedinUrl: linkedinUrl.trim() || null,
        githubUrl: githubUrl.trim() || null,
        portfolioUrl: portfolioUrl.trim() || null,
        resumeUrl: null,
        resumeFileName: resumeFile?.name || null,
        resumeData: resumeFile?.base64 || null,
        resumeSourceId: selectedResumeId || null,
        coverLetter: coverLetter.trim() || null,
        answers: answersPayload,
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-sm text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-card p-8 rounded-2xl border border-border shadow-sm">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground">Position Not Found</h2>
          <p className="text-sm text-muted-foreground mt-2 mb-6">
            This job posting may have been filled, archived, or is no longer accepting applications.
          </p>
          <Link href="/jobs">
            <Button variant="primary" className="w-full">
              Explore Open Roles
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Format salary
  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return null;
    const curr = job.salaryCurrency || "USD";
    const interval = job.salaryInterval ? ` / ${job.salaryInterval.toLowerCase()}` : "";
    if (job.salaryMin && job.salaryMax) {
      return `${curr} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}${interval}`;
    }
    if (job.salaryMin) {
      return `From ${curr} ${job.salaryMin.toLocaleString()}${interval}`;
    }
    return `Up to ${curr} ${job.salaryMax?.toLocaleString()}${interval}`;
  };

  const salaryString = formatSalary();

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-foreground selection:bg-primary-100 selection:text-primary-900">
      {/* Top Bar (Ashby Style) */}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/careers/${job.company.slug}`}
              className="flex items-center gap-2.5 text-foreground hover:opacity-85 transition-opacity"
            >
              {job.company.logo ? (
                <img
                  src={job.company.logo}
                  alt={job.company.name}
                  className="w-8 h-8 rounded-lg object-cover border border-border"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-bold flex items-center justify-center text-sm">
                  {job.company.name.charAt(0)}
                </div>
              )}
              <span className="font-semibold text-sm sm:text-base tracking-tight">
                {job.company.name}
              </span>
            </Link>

            <span className="text-muted-foreground/40 hidden sm:inline">•</span>

            <Link
              href={`/careers/${job.company.slug}`}
              className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              All Openings
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-1.5 text-xs text-muted-foreground"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            {!submitted && (
              <Button
                variant="primary"
                size="sm"
                onClick={scrollToApply}
                className="text-xs px-4"
              >
                Apply Now
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {submitted ? (
          /* Confirmation State */
          <div className="bg-card border border-border rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Application Submitted!
            </h1>
            <p className="text-base text-muted-foreground mt-3 max-w-lg mx-auto">
              Thank you for applying to{" "}
              <span className="font-semibold text-foreground">
                {job.company.name}
              </span>{" "}
              for the role of{" "}
              <span className="font-semibold text-foreground">
                {job.title}
              </span>
              .
            </p>

            <div className="my-8 p-5 bg-muted/40 rounded-xl text-left border border-border text-sm space-y-2">
              <div className="font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-600" /> What happens next?
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                The hiring team at {job.company.name} has been notified and will review your profile. You will receive email updates regarding the status of your application.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href={`/careers/${job.company.slug}`}>
                <Button variant="outline">
                  More Roles at {job.company.name}
                </Button>
              </Link>
              <Link href="/jobs">
                <Button variant="primary">
                  Explore Tech Jobs
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {/* Job Header Hero */}
            <div className="mb-10 pb-8 border-b border-border/70">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <Link
                  href="/jobs"
                  className="hover:text-foreground transition-colors"
                >
                  Careers
                </Link>
                <ChevronRight className="w-3 h-3" />
                <Link
                  href={`/careers/${job.company.slug}`}
                  className="hover:text-foreground transition-colors"
                >
                  {job.company.name}
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground font-medium truncate">
                  {job.department}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground text-balance">
                {job.title}
              </h1>

              {/* Badges / Metadata row */}
              <div className="flex flex-wrap items-center gap-2.5 mt-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-card border border-border text-foreground">
                  <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                  {job.department}
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-card border border-border text-foreground">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  {job.location} ({JOB_WORKPLACE_TYPE_LABELS[job.workplaceType] || job.workplaceType})
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-card border border-border text-foreground">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  {JOB_EMPLOYMENT_TYPE_LABELS[job.employmentType] || job.employmentType}
                </span>

                {salaryString && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <DollarSign className="w-3.5 h-3.5" />
                    {salaryString}
                  </span>
                )}

                {job.equityBonus && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    <Sparkles className="w-3.5 h-3.5" />
                    {job.equityBonus}
                  </span>
                )}
              </div>

              {/* Primary Apply Action Button */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={scrollToApply}
                  className="px-8 shadow-sm"
                >
                  Apply for this position
                </Button>
                {job.company.website && (
                  <a
                    href={job.company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Visit {job.company.name} website
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Description Body */}
            <div className="prose prose-slate dark:prose-invert max-w-none text-foreground/90 leading-relaxed space-y-6">
              {job.overview && (
                <div className="text-base text-foreground font-normal leading-relaxed bg-muted/30 p-4 rounded-xl border border-border/60">
                  {job.overview}
                </div>
              )}

              {/* Render the formatted description */}
              <div className="whitespace-pre-line text-sm sm:text-base leading-relaxed">
                {job.description}
              </div>

              {job.requirements && (
                <div className="mt-8 pt-6 border-t border-border/60">
                  <h3 className="text-lg font-bold text-foreground mb-3">
                    Key Requirements & Qualifications
                  </h3>
                  <div className="whitespace-pre-line text-sm sm:text-base text-muted-foreground">
                    {job.requirements}
                  </div>
                </div>
              )}
            </div>

            {/* Application Section (Ashby Styled Form) */}
            <div
              id="apply-section"
              className="mt-14 pt-10 border-t border-border scroll-mt-20"
            >
              <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-sm">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-foreground">
                    Apply for this Job
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Fill out the form below to apply directly to {job.company.name}.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Personal Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1.5">
                          Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Jane Doe"
                          className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1.5">
                          Email Address <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="jane@example.com"
                          className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1.5">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1.5">
                          Current Location (City, Country)
                        </label>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="San Francisco, CA"
                          className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1.5">
                          Current Company
                        </label>
                        <input
                          type="text"
                          value={currentCompany}
                          onChange={(e) => setCurrentCompany(e.target.value)}
                          placeholder="Acme Corp"
                          className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1.5">
                          Current Title
                        </label>
                        <input
                          type="text"
                          value={currentTitle}
                          onChange={(e) => setCurrentTitle(e.target.value)}
                          placeholder="Software Engineer"
                          className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Profile & Online Presence */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Profiles & Links
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1.5">
                          LinkedIn Profile URL
                        </label>
                        <input
                          type="url"
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          placeholder="https://linkedin.com/in/username"
                          className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1.5">
                          GitHub Profile URL
                        </label>
                        <input
                          type="url"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          placeholder="https://github.com/username"
                          className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-foreground mb-1.5">
                          Portfolio / Personal Website
                        </label>
                        <input
                          type="url"
                          value={portfolioUrl}
                          onChange={(e) => setPortfolioUrl(e.target.value)}
                          placeholder="https://yourportfolio.dev"
                          className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Resume / CV Upload */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Resume / CV <span className="text-rose-500">*</span>
                      </h3>
                      {candidateResumes?.data && candidateResumes.data.length > 0 && (
                        <span className="text-xs text-primary-600 dark:text-primary-400">
                          SkillGauge Resumes available
                        </span>
                      )}
                    </div>

                    {/* SkillGauge Resume selector option if logged in */}
                    {candidateResumes?.data && candidateResumes.data.length > 0 && (
                      <div className="mb-3 p-3 bg-muted/40 rounded-xl border border-border">
                        <label className="block text-xs font-medium text-foreground mb-1.5">
                          Select from your SkillGauge Resumes:
                        </label>
                        <select
                          value={selectedResumeId}
                          onChange={(e) => {
                            setSelectedResumeId(e.target.value);
                            if (e.target.value) {
                              setResumeFile(null); // clear file upload
                            }
                          }}
                          className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="">-- Or upload a PDF/DOCX file below --</option>
                          {candidateResumes.data.map((r: any) => (
                            <option key={r.id} value={r.id}>
                              {r.title} (Updated {new Date(r.updatedAt).toLocaleDateString()})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Drag & Drop File Zone */}
                    {!selectedResumeId && (
                      <div>
                        {resumeFile ? (
                          <div className="flex items-center justify-between p-4 bg-primary-50/50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-900 rounded-xl">
                            <div className="flex items-center gap-3">
                              <FileText className="w-6 h-6 text-primary-600" />
                              <div>
                                <p className="text-sm font-medium text-foreground truncate max-w-xs sm:max-w-md">
                                  {resumeFile.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {(resumeFile.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setResumeFile(null);
                                if (fileInputRef.current) fileInputRef.current.value = "";
                              }}
                              className="text-muted-foreground hover:text-rose-600"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-border hover:border-primary-500/60 rounded-xl p-8 text-center cursor-pointer transition-colors bg-muted/10 hover:bg-muted/20"
                          >
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm font-medium text-foreground">
                              Click to upload or drag & drop your resume
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              PDF or DOCX up to 10MB
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Custom Screening Questions (Configured by Recruiter) */}
                  {job.customQuestions && job.customQuestions.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-border">
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                          Additional Information
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Specific questions requested by the hiring team for this role.
                        </p>
                      </div>

                      <div className="space-y-4">
                        {job.customQuestions.map((q) => (
                          <div key={q.id} className="space-y-1.5">
                            <label className="block text-xs font-semibold text-foreground">
                              {q.question}{" "}
                              {q.required && <span className="text-rose-500">*</span>}
                            </label>
                            {q.description && (
                              <p className="text-[11px] text-muted-foreground">
                                {q.description}
                              </p>
                            )}

                            {q.type === "textarea" ? (
                              <textarea
                                rows={3}
                                required={q.required}
                                value={customAnswers[q.id] || ""}
                                onChange={(e) =>
                                  setCustomAnswers({
                                    ...customAnswers,
                                    [q.id]: e.target.value,
                                  })
                                }
                                placeholder={q.placeholder || "Your detailed answer..."}
                                className="w-full p-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                            ) : q.type === "select" && q.options ? (
                              <select
                                required={q.required}
                                value={customAnswers[q.id] || ""}
                                onChange={(e) =>
                                  setCustomAnswers({
                                    ...customAnswers,
                                    [q.id]: e.target.value,
                                  })
                                }
                                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                              >
                                <option value="">Select an option</option>
                                {q.options.map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            ) : q.type === "boolean" ? (
                              <div className="flex items-center gap-4 pt-1">
                                <label className="inline-flex items-center gap-2 text-sm text-foreground cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`q_${q.id}`}
                                    value="Yes"
                                    checked={customAnswers[q.id] === "Yes"}
                                    onChange={() =>
                                      setCustomAnswers({
                                        ...customAnswers,
                                        [q.id]: "Yes",
                                      })
                                    }
                                    className="text-primary-600 focus:ring-primary-500"
                                  />
                                  Yes
                                </label>
                                <label className="inline-flex items-center gap-2 text-sm text-foreground cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`q_${q.id}`}
                                    value="No"
                                    checked={customAnswers[q.id] === "No"}
                                    onChange={() =>
                                      setCustomAnswers({
                                        ...customAnswers,
                                        [q.id]: "No",
                                      })
                                    }
                                    className="text-primary-600 focus:ring-primary-500"
                                  />
                                  No
                                </label>
                              </div>
                            ) : q.type === "file" ? (
                              <div>
                                {customAnswers[q.id] ? (
                                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 text-xs">
                                    <span className="font-medium text-foreground truncate max-w-xs">
                                      {typeof customAnswers[q.id] === "string" && customAnswers[q.id].startsWith("data:")
                                        ? "File attached"
                                        : customAnswers[q.id]}
                                    </span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        setCustomAnswers({
                                          ...customAnswers,
                                          [q.id]: "",
                                        })
                                      }
                                      className="text-xs text-rose-500 hover:text-rose-600 h-6 px-2"
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                ) : (
                                  <input
                                    type="file"
                                    required={q.required}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const r = new FileReader();
                                        r.onload = () => {
                                          setCustomAnswers({
                                            ...customAnswers,
                                            [q.id]: r.result as string,
                                          });
                                        };
                                        r.readAsDataURL(file);
                                      }
                                    }}
                                    className="w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                                  />
                                )}
                              </div>
                            ) : (
                              <input
                                type={q.type === "number" ? "number" : q.type === "url" ? "url" : "text"}
                                required={q.required}
                                value={customAnswers[q.id] || ""}
                                onChange={(e) =>
                                  setCustomAnswers({
                                    ...customAnswers,
                                    [q.id]: e.target.value,
                                  })
                                }
                                placeholder={
                                  q.placeholder ||
                                  (q.type === "url"
                                    ? "https://..."
                                    : q.type === "number"
                                    ? "e.g. 5"
                                    : "Your answer...")
                                }
                                className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cover Letter / Note */}
                  <div className="space-y-2 pt-4 border-t border-border">
                    <label className="block text-xs font-medium text-foreground">
                      Cover Letter or Note to Hiring Team (Optional)
                    </label>
                    <textarea
                      rows={4}
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Share anything else relevant to your application or why you are excited about this position..."
                      className="w-full p-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      loading={applyMutation.isPending}
                      className="w-full text-base font-semibold py-3 shadow-md"
                    >
                      Submit Application
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-3">
                      By submitting your application, your information will be shared directly with {job.company.name}.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
