"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Building2,
  MapPin,
  Briefcase,
  DollarSign,
  ArrowRight,
  Filter,
  Sparkles,
  Loader2,
  Clock,
  Compass,
} from "lucide-react";
import { usePublicJobs } from "@/hooks/useJobs";
import { Button } from "@/components/ui/Button";
import { BrandLogo } from "@/components/brand/Logo";
import {
  JOB_WORKPLACE_TYPE_LABELS,
  JOB_EMPLOYMENT_TYPE_LABELS,
} from "@/lib/constants";

export default function GlobalJobBoardPage() {
  const [search, setSearch] = useState("");
  const [workplaceType, setWorkplaceType] = useState<string>("");
  const [employmentType, setEmploymentType] = useState<string>("");
  const [department, setDepartment] = useState<string>("");

  const { data, isLoading } = usePublicJobs({
    search: search.trim() || undefined,
    workplaceType: workplaceType || undefined,
    employmentType: employmentType || undefined,
    department: department || undefined,
    limit: 50,
  });

  const jobs = data?.data || [];

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-foreground">
      {/* Top Navbar */}
      <header className="border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <BrandLogo size="sm" href="/" />

          <div className="flex items-center gap-3">
            <Link href="/candidate/dashboard">
              <Button variant="ghost" size="sm" className="text-xs">
                Candidate Portal
              </Button>
            </Link>
            <Link href="/recruiter/jobs/new">
              <Button variant="primary" size="sm" className="text-xs">
                Post a Job
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50/50 via-background to-background dark:from-primary-950/20 dark:via-background dark:to-background border-b border-border py-14 sm:py-20 text-center px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-900">
            <Sparkles className="w-3.5 h-3.5" /> Direct Company Hiring
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground text-balance">
            Find Your Next High-Impact Engineering Role
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Discover verified tech openings, explore transparent compensation ranges, and apply with your SkillGauge profile in seconds.
          </p>

          {/* Search Bar & Filters */}
          <div className="pt-6 max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center gap-2 bg-card p-2 rounded-2xl border border-border shadow-md">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Job title, keywords, or company..."
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>

              <select
                value={workplaceType}
                onChange={(e) => setWorkplaceType(e.target.value)}
                className="w-full sm:w-auto h-11 px-3 rounded-xl bg-muted/40 border border-border/80 text-xs text-foreground focus:outline-none"
              >
                <option value="">All Workplace Types</option>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ON_SITE">On-site</option>
              </select>

              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full sm:w-auto h-11 px-3 rounded-xl bg-muted/40 border border-border/80 text-xs text-foreground focus:outline-none"
              >
                <option value="">All Employment</option>
                <option value="FULL_TIME">Full-time</option>
                <option value="PART_TIME">Part-time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Jobs Listing */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Explore Active Positions
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Showing {jobs.length} open {jobs.length === 1 ? "role" : "roles"}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            <p className="text-sm text-muted-foreground">Fetching opportunities...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl p-8 max-w-lg mx-auto">
            <Compass className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-base font-semibold text-foreground">No matching positions found</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-5">
              Try refining your search terms or clearing the workplace filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setWorkplaceType("");
                setEmploymentType("");
                setDepartment("");
              }}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="group bg-card hover:bg-card/90 border border-border hover:border-primary-500/50 rounded-2xl p-5 sm:p-6 transition-all hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  {job.company.logo ? (
                    <img
                      src={job.company.logo}
                      alt={job.company.name}
                      className="w-12 h-12 rounded-xl object-cover border border-border shrink-0 mt-0.5"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-bold flex items-center justify-center text-lg shrink-0 mt-0.5">
                      {job.company.name.charAt(0)}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/careers/${job.company.slug}`}
                        className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {job.company.name}
                      </Link>
                      {job.overview && (
                        <>
                          <span className="text-muted-foreground/40 text-xs">•</span>
                          <span className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                            {job.overview}
                          </span>
                        </>
                      )}
                    </div>

                    <Link
                      href={`/jobs/${job.id}?company=${job.company.slug}`}
                      className="block text-lg font-bold text-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
                    >
                      {job.title}
                    </Link>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" />
                        {job.department}
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location} ({JOB_WORKPLACE_TYPE_LABELS[job.workplaceType] || job.workplaceType})
                      </span>
                      <span>•</span>
                      <span>{JOB_EMPLOYMENT_TYPE_LABELS[job.employmentType] || job.employmentType}</span>

                      {job.salaryMin && job.salaryMax && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            {job.salaryCurrency} {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Link href={`/jobs/${job.id}?company=${job.company.slug}`}>
                    <Button variant="primary" size="sm" className="gap-1.5 text-xs px-4">
                      Apply Now <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
