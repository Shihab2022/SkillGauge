"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  Search,
  ExternalLink,
  Copy,
  Users,
  CheckCircle2,
  Clock,
  MoreVertical,
  Archive,
  Eye,
  Filter,
  DollarSign,
  MapPin,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useCompanyJobPostings, useDeleteJobPosting } from "@/hooks/useJobs";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  JOB_POSTING_STATUS_LABELS,
  JOB_WORKPLACE_TYPE_LABELS,
  JOB_EMPLOYMENT_TYPE_LABELS,
} from "@/lib/constants";
import type { JobPostingStatus } from "@/lib/types.jobs";

export default function RecruiterJobsListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const { data, isLoading } = useCompanyJobPostings({
    search: search.trim() || undefined,
    status: statusFilter !== "ALL" ? (statusFilter as JobPostingStatus) : undefined,
    limit: 50,
  });

  const deletePostingMutation = useDeleteJobPosting();

  const jobs = data?.data || [];

  const copyJobLink = (jobId: string, slug: string) => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/jobs/${jobId}`;
      navigator.clipboard.writeText(url);
      toast.success("Public Ashby application link copied to clipboard!");
    }
  };

  const handleArchive = (jobId: string, title: string) => {
    if (confirm(`Are you sure you want to archive "${title}"? It will no longer appear on public job boards.`)) {
      deletePostingMutation.mutate(jobId);
    }
  };

  // Stats calculation
  const totalOpenings = jobs.length;
  const publishedOpenings = jobs.filter((j) => j.status === "PUBLISHED").length;
  const totalApplicants = jobs.reduce((sum, j) => sum + (j._count?.applications || 0), 0);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Job Openings & ATS
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Publish branded job descriptions, share Ashby-style application links, and manage candidates.
          </p>
        </div>

        <Link href="/recruiter/jobs/new">
          <Button variant="primary" className="gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Post New Job
          </Button>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Openings</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">{publishedOpenings}</div>
          <p className="text-xs text-muted-foreground mt-1">Accepting applications right now</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Positions</span>
            <Briefcase className="w-4 h-4 text-primary-500" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">{totalOpenings}</div>
          <p className="text-xs text-muted-foreground mt-1">Across all departments</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Applications</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">{totalApplicants}</div>
          <p className="text-xs text-muted-foreground mt-1">Received through your links</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by position title or department..."
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-background text-xs text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-lg bg-background text-xs text-foreground border border-border focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-sm text-muted-foreground">Loading job postings...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl p-8 max-w-md mx-auto">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground">No job postings found</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-5">
            Post your first job opening to start receiving candidates and screening applications.
          </p>
          <Link href="/recruiter/jobs/new">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-1.5" /> Create Job Posting
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const appCount = job._count?.applications || 0;
            return (
              <div
                key={job.id}
                className="bg-card border border-border hover:border-border/80 rounded-xl p-5 transition-shadow shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <Link
                      href={`/recruiter/jobs/${job.id}`}
                      className="text-base font-bold text-foreground hover:text-primary-600 transition-colors"
                    >
                      {job.title}
                    </Link>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
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
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      {job.department}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.location} ({JOB_WORKPLACE_TYPE_LABELS[job.workplaceType] || job.workplaceType})
                    </span>
                    <span>•</span>
                    <span>{JOB_EMPLOYMENT_TYPE_LABELS[job.employmentType] || job.employmentType}</span>

                    {job.salaryMin && job.salaryMax && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {job.salaryCurrency} {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()}
                        </span>
                      </>
                    )}

                    <span>•</span>
                    <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-border">
                  {/* Applications count badge / button */}
                  <Link href={`/recruiter/jobs/${job.id}/applications`}>
                    <Button
                      variant={appCount > 0 ? "subtle" : "outline"}
                      size="sm"
                      className="gap-1.5 text-xs font-semibold"
                    >
                      <Users className="w-3.5 h-3.5" />
                      {appCount} {appCount === 1 ? "Applicant" : "Applicants"}
                    </Button>
                  </Link>

                  {/* Share Link button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyJobLink(job.id, job.slug)}
                    title="Copy Ashby share link"
                    className="gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Share Link
                  </Button>

                  {/* View Live Page */}
                  <Link href={`/jobs/${job.id}`} target="_blank">
                    <Button
                      variant="outline"
                      size="sm"
                      title="View live public application page"
                      className="gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Live Page
                    </Button>
                  </Link>

                  {/* Edit Job */}
                  <Link href={`/recruiter/jobs/${job.id}/edit`}>
                    <Button variant="ghost" size="sm" className="text-xs">
                      Edit
                    </Button>
                  </Link>

                  {/* Archive */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleArchive(job.id, job.title)}
                    className="text-muted-foreground hover:text-rose-600 text-xs px-2"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
