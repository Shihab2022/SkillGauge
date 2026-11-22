"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Users,
  Search,
  ExternalLink,
  Copy,
  ArrowLeft,
  FileText,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ClipboardList,
  Video,
  ChevronRight,
  Eye,
  Star,
  Edit,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useCompanyJobPosting,
  useJobApplications,
  useUpdateApplicationStatus,
  useInviteApplicantAssessment,
  useInviteApplicantInterview,
} from "@/hooks/useJobs";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal, ModalContent, ModalHeader, ModalTitle } from "@/components/ui/Modal";
import {
  JOB_APPLICATION_STATUS_LABELS,
  JOB_APPLICATION_STATUSES,
} from "@/lib/constants";
import type { JobApplication, JobApplicationStatus } from "@/lib/types.jobs";

export default function JobApplicationsATSPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: job, isLoading: jobLoading } = useCompanyJobPosting(id);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const { data: applicationsData, isLoading: appsLoading } = useJobApplications(
    id,
    {
      status: statusFilter !== "ALL" ? statusFilter : undefined,
      search: search.trim() || undefined,
      limit: 100,
    },
  );

  const updateStatusMutation = useUpdateApplicationStatus(id);
  const inviteAssessmentMutation = useInviteApplicantAssessment(id);
  const inviteInterviewMutation = useInviteApplicantInterview(id);

  // Detail Modal State
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [recruiterNotes, setRecruiterNotes] = useState("");

  const copyShareLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/jobs/${id}`;
      navigator.clipboard.writeText(url);
      toast.success("Public Ashby application link copied to clipboard!");
    }
  };

  const handleStatusChange = (appId: string, newStatus: JobApplicationStatus) => {
    updateStatusMutation.mutate(
      { status: newStatus },
      {
        onSuccess: () => {
          if (selectedApp && selectedApp.id === appId) {
            setSelectedApp({ ...selectedApp, status: newStatus });
          }
        },
      },
    );
  };

  const handleSaveNotes = (appId: string) => {
    updateStatusMutation.mutate(
      { notes: recruiterNotes },
      {
        onSuccess: () => {
          toast.success("Recruiter notes saved");
          if (selectedApp && selectedApp.id === appId) {
            setSelectedApp({ ...selectedApp, notes: recruiterNotes });
          }
        },
      },
    );
  };

  const handleInviteAssessment = (appId: string) => {
    inviteAssessmentMutation.mutate(
      {},
      {
        onSuccess: (data) => {
          toast.success(data.message || "Candidate invited to assessment!");
        },
      },
    );
  };

  const handleInviteInterview = (appId: string) => {
    inviteInterviewMutation.mutate(
      {},
      {
        onSuccess: (data) => {
          toast.success(data.message || "Candidate invited to AI interview!");
        },
      },
    );
  };

  const applications = applicationsData?.data || [];

  if (jobLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <p className="text-sm text-muted-foreground">Loading ATS dashboard...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold">Job opening not found</h2>
        <Link href="/recruiter/jobs" className="mt-4 inline-block">
          <Button variant="outline">Back to Job Openings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Job Banner */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/recruiter/jobs"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Job Openings
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {job.title}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                {job.department}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {job.location} • {job.workplaceType} • Created {new Date(job.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={copyShareLink}
              className="text-xs gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" /> Copy Ashby Link
            </Button>

            <Link href={`/jobs/${job.id}`} target="_blank">
              <Button variant="outline" size="sm" className="text-xs gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" /> Live Page
              </Button>
            </Link>

            <Link href={`/recruiter/jobs/${job.id}/edit`}>
              <Button variant="ghost" size="sm" className="text-xs gap-1.5">
                <Edit className="w-3.5 h-3.5" /> Edit
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Pipeline Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 thin-scrollbar">
        <button
          onClick={() => setStatusFilter("ALL")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            statusFilter === "ALL"
              ? "bg-foreground text-background font-semibold"
              : "bg-card border border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          All Applicants ({job._count?.applications || applications.length})
        </button>

        {JOB_APPLICATION_STATUSES.map((st) => {
          const count = job.applicationBreakdown?.[st] || 0;
          return (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? "bg-foreground text-background font-semibold"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {JOB_APPLICATION_STATUS_LABELS[st]} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search applicants by name, email, or company..."
          className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Applicants List / Table */}
      {appsLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-sm text-muted-foreground">Loading applicants...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl p-8 max-w-md mx-auto">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground">No applications found</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Share your Ashby-style application link to start receiving candidates.
          </p>
          <Button variant="primary" size="sm" onClick={copyShareLink}>
            <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Shareable Link
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-card border border-border hover:border-border/80 rounded-xl p-5 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Applicant Summary */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-foreground">
                    {app.fullName}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      app.status === "HIRED"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : app.status === "SHORTLISTED" || app.status === "INTERVIEWING"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                        : app.status === "REJECTED"
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {JOB_APPLICATION_STATUS_LABELS[app.status] || app.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> {app.email}
                  </span>

                  {app.phone && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> {app.phone}
                      </span>
                    </>
                  )}

                  {app.location && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {app.location}
                      </span>
                    </>
                  )}

                  {(app.currentTitle || app.currentCompany) && (
                    <>
                      <span>•</span>
                      <span>
                        {app.currentTitle} {app.currentCompany && `@ ${app.currentCompany}`}
                      </span>
                    </>
                  )}

                  <span>•</span>
                  <span>Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Status Controls & Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-border">
                {/* Status Dropdown */}
                <select
                  value={app.status}
                  onChange={(e) =>
                    handleStatusChange(app.id, e.target.value as JobApplicationStatus)
                  }
                  className="h-8 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground focus:outline-none"
                >
                  {JOB_APPLICATION_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {JOB_APPLICATION_STATUS_LABELS[st]}
                    </option>
                  ))}
                </select>

                {/* Resume Download / View */}
                {app.resumeData ? (
                  <a
                    href={app.resumeData}
                    download={app.resumeFileName || "resume.pdf"}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs text-foreground transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-primary-600" /> Resume
                  </a>
                ) : app.resumeFileName ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-muted/40 text-xs text-muted-foreground">
                    <FileText className="w-3.5 h-3.5" /> {app.resumeFileName}
                  </span>
                ) : null}

                {/* View Details Modal Button */}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedApp(app);
                    setRecruiterNotes(app.notes || "");
                  }}
                  className="text-xs gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Applicant Detail Modal */}
      {selectedApp && (
        <Modal
          open={Boolean(selectedApp)}
          onOpenChange={(open) => {
            if (!open) setSelectedApp(null);
          }}
        >
          <ModalContent size="lg" className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <ModalHeader>
              <ModalTitle>Application: {selectedApp.fullName}</ModalTitle>
            </ModalHeader>
            <div className="space-y-6 pt-2">
            {/* Candidate Summary */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-muted/30 p-4 rounded-xl border border-border">
              <div>
                <span className="text-muted-foreground">Email:</span>
                <p className="font-medium text-foreground mt-0.5">{selectedApp.email}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>
                <p className="font-medium text-foreground mt-0.5">{selectedApp.phone || "—"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Location:</span>
                <p className="font-medium text-foreground mt-0.5">{selectedApp.location || "—"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Current Role:</span>
                <p className="font-medium text-foreground mt-0.5">
                  {selectedApp.currentTitle || "—"} {selectedApp.currentCompany && `at ${selectedApp.currentCompany}`}
                </p>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {selectedApp.linkedinUrl && (
                <a
                  href={selectedApp.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary-600 hover:underline"
                >
                  LinkedIn <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {selectedApp.githubUrl && (
                <a
                  href={selectedApp.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary-600 hover:underline"
                >
                  GitHub <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {selectedApp.portfolioUrl && (
                <a
                  href={selectedApp.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary-600 hover:underline"
                >
                  Portfolio <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {selectedApp.resumeData && (
                <a
                  href={selectedApp.resumeData}
                  download={selectedApp.resumeFileName || "resume.pdf"}
                  className="inline-flex items-center gap-1 font-semibold text-emerald-600 hover:underline"
                >
                  Download Resume ({selectedApp.resumeFileName || "PDF"}) <Download className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Screening Questions & Answers */}
            {selectedApp.answers && selectedApp.answers.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-border">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Custom Questions & Responses ({selectedApp.answers.length})
                </h4>
                <div className="space-y-2.5">
                  {selectedApp.answers.map((ans, i) => {
                    const ansStr = ans.answer ? String(ans.answer).trim() : "";
                    const isUrl = ansStr.startsWith("http://") || ansStr.startsWith("https://");
                    const isFileData = ansStr.startsWith("data:");

                    return (
                      <div key={i} className="bg-card p-3 rounded-lg border border-border text-xs space-y-1">
                        <p className="font-semibold text-foreground">{ans.question}</p>
                        <div className="text-muted-foreground bg-muted/40 p-2 rounded">
                          {!ansStr ? (
                            <span className="italic text-muted-foreground/60">No answer provided</span>
                          ) : isUrl ? (
                            <a
                              href={ansStr}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary-600 hover:underline inline-flex items-center gap-1 font-medium break-all"
                            >
                              {ansStr} <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ) : isFileData ? (
                            <a
                              href={ansStr}
                              download={`attachment_${i + 1}`}
                              className="text-primary-600 hover:underline inline-flex items-center gap-1 font-medium"
                            >
                              <Download className="w-3.5 h-3.5" /> Download Attached File
                            </a>
                          ) : (
                            <span className="whitespace-pre-line text-foreground/90 font-medium">
                              {ansStr}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cover Letter */}
            {selectedApp.coverLetter && (
              <div className="space-y-2 pt-3 border-t border-border">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Cover Letter / Note
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line bg-muted/30 p-3 rounded-lg border border-border">
                  {selectedApp.coverLetter}
                </p>
              </div>
            )}

            {/* Superpower Actions: Invite to Assessment or Video Interview */}
            <div className="space-y-3 pt-3 border-t border-border">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" /> SkillGauge Assessment Actions
              </h4>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleInviteAssessment(selectedApp.id)}
                  loading={inviteAssessmentMutation.isPending}
                  className="gap-1.5 text-xs"
                >
                  <ClipboardList className="w-3.5 h-3.5 text-primary-600" />
                  Invite to Assessment
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleInviteInterview(selectedApp.id)}
                  loading={inviteInterviewMutation.isPending}
                  className="gap-1.5 text-xs"
                >
                  <Video className="w-3.5 h-3.5 text-purple-600" />
                  Invite to AI Video Interview
                </Button>
              </div>
            </div>

            {/* Recruiter Notes */}
            <div className="space-y-2 pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Internal Recruiter Notes
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSaveNotes(selectedApp.id)}
                  className="text-xs text-primary-600 h-7"
                >
                  Save Notes
                </Button>
              </div>
              <textarea
                rows={3}
                value={recruiterNotes}
                onChange={(e) => setRecruiterNotes(e.target.value)}
                placeholder="Add confidential notes about this candidate..."
                className="w-full p-2.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            </div>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}
