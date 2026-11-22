"use client";

import Link from "next/link";
import {
  Briefcase,
  Building2,
  Calendar,
  ExternalLink,
  MapPin,
  Clock,
  Loader2,
  Compass,
} from "lucide-react";
import { useCandidateApplications } from "@/hooks/useJobs";
import { Button } from "@/components/ui/Button";
import {
  JOB_APPLICATION_STATUS_LABELS,
  JOB_WORKPLACE_TYPE_LABELS,
} from "@/lib/constants";

export default function CandidateApplicationsPage() {
  const { data: applications, isLoading } = useCandidateApplications();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            My Job Applications
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track the status of your applications submitted to companies across SkillGauge.
          </p>
        </div>

        <Link href="/jobs">
          <Button variant="primary" size="sm" className="gap-1.5 text-xs">
            <Compass className="w-4 h-4" /> Browse Open Jobs
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-sm text-muted-foreground">Loading your applications...</p>
        </div>
      ) : !applications || applications.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl p-8 max-w-md mx-auto">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground">No applications submitted yet</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-5">
            Explore companies hiring on SkillGauge and apply directly with your profile and resume.
          </p>
          <Link href="/jobs">
            <Button variant="primary" size="sm">
              Explore Tech Openings
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const job = app.jobPosting;
            const company = job?.company;
            return (
              <div
                key={app.id}
                className="bg-card border border-border hover:border-border/80 rounded-xl p-5 shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  {company?.logo ? (
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-10 h-10 rounded-lg object-cover border border-border shrink-0 mt-0.5"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-bold flex items-center justify-center text-sm shrink-0 mt-0.5">
                      {company?.name ? company.name.charAt(0) : "C"}
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {company?.name || "Company"}
                      </span>
                      <span className="text-muted-foreground/40 text-xs">•</span>
                      <span className="text-xs text-muted-foreground">
                        {job?.department || "General"}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-foreground">
                      {job?.title || "Role Application"}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground pt-0.5">
                      {job?.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                          {job.workplaceType && ` (${JOB_WORKPLACE_TYPE_LABELS[job.workplaceType] || job.workplaceType})`}
                        </span>
                      )}
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Applied on{" "}
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      app.status === "HIRED"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        : app.status === "SHORTLISTED" || app.status === "INTERVIEWING"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                        : app.status === "OFFERED"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                        : app.status === "REJECTED"
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                        : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {JOB_APPLICATION_STATUS_LABELS[app.status] || app.status}
                  </span>

                  {job?.id && (
                    <Link href={`/jobs/${job.id}`} target="_blank">
                      <Button variant="outline" size="sm" className="text-xs gap-1">
                        View Role <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
