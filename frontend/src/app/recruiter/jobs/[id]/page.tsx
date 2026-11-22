"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Briefcase,
  ArrowLeft,
  ExternalLink,
  Copy,
  Users,
  Eye,
  Edit,
  MapPin,
  Clock,
  DollarSign,
  Sparkles,
  ClipboardList,
  Video,
  CheckCircle2,
  ListPlus,
  HelpCircle,
  Share2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useCompanyJobPosting } from "@/hooks/useJobs";
import { Button } from "@/components/ui/Button";
import {
  JOB_POSTING_STATUS_LABELS,
  JOB_WORKPLACE_TYPE_LABELS,
  JOB_EMPLOYMENT_TYPE_LABELS,
  JOB_SENIORITY_LABELS,
  JOB_APPLICATION_STATUS_LABELS,
  JOB_APPLICATION_STATUSES,
} from "@/lib/constants";

export default function RecruiterJobOverviewPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { data: job, isLoading, isError } = useCompanyJobPosting(id);
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/jobs/${job?.id || id}`;
    }
    return `/jobs/${job?.id || id}`;
  };

  const copyShareLink = () => {
    const url = getShareUrl();
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Public Ashby application link copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <p className="text-sm text-muted-foreground">Loading job details...</p>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="text-center py-16 bg-card border border-border rounded-2xl p-8 max-w-md mx-auto">
        <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <h2 className="text-lg font-bold text-foreground">Job Posting Not Found</h2>
        <p className="text-xs text-muted-foreground mt-1 mb-5">
          This position may have been deleted, archived, or you may not have access to it.
        </p>
        <Link href="/recruiter/jobs">
          <Button variant="primary" size="sm">
            Back to Job Openings
          </Button>
        </Link>
      </div>
    );
  }

  const appCount = job._count?.applications || 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Breadcrumb & Actions */}
      <div className="space-y-3">
        <Link
          href="/recruiter/jobs"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Job Openings
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {job.title}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  job.status === "PUBLISHED"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : job.status === "DRAFT"
                    ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                }`}
              >
                {JOB_POSTING_STATUS_LABELS[job.status] || job.status}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                {job.department}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {job.location} ({JOB_WORKPLACE_TYPE_LABELS[job.workplaceType] || job.workplaceType})
              </span>
              <span>•</span>
              <span>{JOB_EMPLOYMENT_TYPE_LABELS[job.employmentType] || job.employmentType}</span>
              <span>•</span>
              <span>{JOB_SENIORITY_LABELS[job.seniority] || job.seniority}</span>

              {job.salaryMin && job.salaryMax && (
                <>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {job.salaryCurrency} {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()} / {job.salaryInterval?.toLowerCase()}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/recruiter/jobs/${job.id}/applications`}>
              <Button variant="primary" size="sm" className="gap-1.5 shadow-sm">
                <Users className="w-4 h-4" />
                View Applicants ({appCount})
              </Button>
            </Link>

            <Link href={`/recruiter/jobs/${job.id}/edit`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Edit className="w-3.5 h-3.5" />
                Edit Job & Fields
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Prominent Public Ashby Application Link Box */}
      <div className="bg-gradient-to-r from-primary-50/60 via-card to-card dark:from-primary-950/30 dark:via-card dark:to-card border-2 border-primary-500/20 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Share2 className="w-4 h-4 text-primary-600" />
              Public Candidate Application Link (Ashby Style)
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Share this link anywhere (LinkedIn, your website, job boards). Anyone with this link can view your company job description and submit applications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/jobs/${job.id}`} target="_blank">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <ExternalLink className="w-3.5 h-3.5" />
                Open Live Page
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            readOnly
            value={getShareUrl()}
            className="flex-1 h-10 px-3.5 rounded-xl border border-border bg-background/80 font-mono text-xs text-foreground select-all focus:outline-none"
          />
          <Button
            variant={copied ? "success" : "primary"}
            size="md"
            onClick={copyShareLink}
            className="gap-1.5 text-xs font-semibold px-5 shrink-0"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Link Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy Application Link
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Analytics & Pipeline Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Views</span>
            <Eye className="w-4 h-4 text-primary-500" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">{job.viewCount || 0}</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Candidates who opened link</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Applications</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">{appCount}</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Submissions received</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Shortlisted</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">
            {(job.applicationBreakdown?.["SHORTLISTED"] || 0) + (job.applicationBreakdown?.["INTERVIEWING"] || 0)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Under evaluation</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Hired</span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">
            {job.applicationBreakdown?.["HIRED"] || 0}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Offers accepted</p>
        </div>
      </div>

      {/* Admin Controlled Application Input Fields */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <ListPlus className="w-4 h-4 text-primary-600" />
              Application Form & Input Fields (Controlled by Admin)
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              These are the input fields candidates must fill out when applying for this specific position. You can add, edit, or remove fields anytime.
            </p>
          </div>

          <Link href={`/recruiter/jobs/${job.id}/edit`}>
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <Edit className="w-3.5 h-3.5" /> Edit Input Fields
            </Button>
          </Link>
        </div>

        {/* Standard Core Fields */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Standard Core Fields (Included Automatically)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-lg border border-border/80 bg-muted/20 flex items-center justify-between">
              <span className="font-medium text-foreground">Full Name</span>
              <span className="text-[10px] font-bold text-rose-500 uppercase">Required</span>
            </div>
            <div className="p-2.5 rounded-lg border border-border/80 bg-muted/20 flex items-center justify-between">
              <span className="font-medium text-foreground">Email Address</span>
              <span className="text-[10px] font-bold text-rose-500 uppercase">Required</span>
            </div>
            <div className="p-2.5 rounded-lg border border-border/80 bg-muted/20 flex items-center justify-between">
              <span className="font-medium text-foreground">Resume / CV</span>
              <span className="text-[10px] font-bold text-rose-500 uppercase">Required</span>
            </div>
            <div className="p-2.5 rounded-lg border border-border/80 bg-muted/20 flex items-center justify-between">
              <span className="font-medium text-foreground">Phone Number</span>
              <span className="text-[10px] text-muted-foreground">Optional</span>
            </div>
            <div className="p-2.5 rounded-lg border border-border/80 bg-muted/20 flex items-center justify-between">
              <span className="font-medium text-foreground">Location</span>
              <span className="text-[10px] text-muted-foreground">Optional</span>
            </div>
            <div className="p-2.5 rounded-lg border border-border/80 bg-muted/20 flex items-center justify-between">
              <span className="font-medium text-foreground">LinkedIn URL</span>
              <span className="text-[10px] text-muted-foreground">Optional</span>
            </div>
            <div className="p-2.5 rounded-lg border border-border/80 bg-muted/20 flex items-center justify-between">
              <span className="font-medium text-foreground">GitHub URL</span>
              <span className="text-[10px] text-muted-foreground">Optional</span>
            </div>
            <div className="p-2.5 rounded-lg border border-border/80 bg-muted/20 flex items-center justify-between">
              <span className="font-medium text-foreground">Cover Letter</span>
              <span className="text-[10px] text-muted-foreground">Optional</span>
            </div>
          </div>
        </div>

        {/* Custom Input Fields Added by Admin */}
        <div className="space-y-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Custom Job-Specific Fields ({job.customQuestions?.length || 0})
            </span>
          </div>

          {!job.customQuestions || job.customQuestions.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
              No custom fields configured for this role yet. Click &quot;Edit Input Fields&quot; to add custom questions like Notice Period, Expected Salary, or Work Authorization.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {job.customQuestions.map((q, idx) => (
                <div
                  key={q.id || idx}
                  className="p-3.5 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        {idx + 1}. {q.question}
                      </span>
                      {q.required ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                          Mandatory *
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
                          Optional
                        </span>
                      )}
                    </div>
                    {q.options && q.options.length > 0 && (
                      <p className="text-[11px] text-muted-foreground">
                        Options: {q.options.join(", ")}
                      </p>
                    )}
                  </div>

                  <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-muted text-muted-foreground self-start sm:self-center">
                    Type: {q.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Linked Assessments & AI Interviews */}
      {(job.assessment || job.interview) && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            Connected SkillGauge Assessment Pipeline
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {job.assessment && (
              <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
                <div>
                  <span className="text-muted-foreground">Linked Coding Assessment:</span>
                  <p className="font-bold text-foreground text-sm mt-0.5">{job.assessment.title}</p>
                </div>
                <ClipboardList className="w-5 h-5 text-primary-600" />
              </div>
            )}
            {job.interview && (
              <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
                <div>
                  <span className="text-muted-foreground">Linked AI Video Interview:</span>
                  <p className="font-bold text-foreground text-sm mt-0.5">{job.interview.title}</p>
                </div>
                <Video className="w-5 h-5 text-purple-600" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Job Description Preview */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-foreground">
          Job Description Preview
        </h2>
        {job.overview && (
          <div className="p-3 bg-muted/30 rounded-xl text-xs sm:text-sm font-medium text-foreground border border-border/80">
            {job.overview}
          </div>
        )}
        <div className="whitespace-pre-line text-xs sm:text-sm text-foreground/90 leading-relaxed font-sans border-t border-border pt-4">
          {job.description}
        </div>
      </div>
    </div>
  );
}
