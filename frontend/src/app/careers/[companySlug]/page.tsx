"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Briefcase,
  DollarSign,
  Globe,
  ExternalLink,
  Search,
  Users,
  ChevronRight,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useCompanyCareer } from "@/hooks/useJobs";
import { Button } from "@/components/ui/Button";
import {
  JOB_WORKPLACE_TYPE_LABELS,
  JOB_EMPLOYMENT_TYPE_LABELS,
} from "@/lib/constants";

export default function CompanyCareerPage() {
  const params = useParams();
  const companySlug = params.companySlug as string;

  const { data, isLoading, isError } = useCompanyCareer(companySlug);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-sm text-muted-foreground">Loading career openings...</p>
        </div>
      </div>
    );
  }

  if (isError || !data || !data.company) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-card p-8 rounded-2xl border border-border shadow-sm">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground">Company Not Found</h2>
          <p className="text-sm text-muted-foreground mt-2 mb-6">
            The company careers page you are looking for does not exist or has no active listings.
          </p>
          <Link href="/jobs">
            <Button variant="primary" className="w-full">
              Explore All Jobs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { company, jobs } = data;
  const departments = Array.from(new Set(jobs.map((j) => j.department || "General")));

  // Filter jobs by search and department
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      !search.trim() ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.location.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === "ALL" || (job.department || "General") === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Group filtered jobs by department
  const groupedJobs: Record<string, typeof jobs> = {};
  for (const job of filteredJobs) {
    const dept = job.department || "General";
    if (!groupedJobs[dept]) groupedJobs[dept] = [];
    groupedJobs[dept].push(job);
  }

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-foreground">
      {/* Top Bar */}
      <header className="border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href={`/careers/${company.slug}`}
            className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
          >
            {company.logo ? (
              <img
                src={company.logo}
                alt={company.name}
                className="w-8 h-8 rounded-lg object-cover border border-border"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-bold flex items-center justify-center text-sm">
                {company.name.charAt(0)}
              </div>
            )}
            <span className="font-bold text-base tracking-tight">{company.name} Careers</span>
          </Link>

          <div className="flex items-center gap-3">
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                Company Website
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            )}
            <Link href="/jobs">
              <Button variant="outline" size="sm" className="text-xs">
                All Platform Jobs
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="bg-background border-b border-border/80 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-4">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-border shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-bold flex items-center justify-center text-2xl shadow-sm">
                  {company.name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  {company.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground mt-1">
                  {company.industry && <span>{company.industry}</span>}
                  {company.location && (
                    <>
                      <span>•</span>
                      <span>{company.location}</span>
                    </>
                  )}
                  {company.size && (
                    <>
                      <span>•</span>
                      <span>{company.size} employees</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {company.description && (
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mt-4">
                {company.description}
              </p>
            )}

            <div className="flex items-center gap-2 mt-6">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-900">
                {jobs.length} Open {jobs.length === 1 ? "Position" : "Positions"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Positions List Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        {/* Search & Department Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          {/* Department Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 thin-scrollbar">
            <button
              onClick={() => setSelectedDept("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedDept === "ALL"
                  ? "bg-foreground text-background font-semibold"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              All Departments ({jobs.length})
            </button>
            {departments.map((dept) => {
              const count = jobs.filter((j) => (j.department || "General") === dept).length;
              return (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedDept === dept
                      ? "bg-foreground text-background font-semibold"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {dept} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by role or location..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Roles List */}
        {Object.keys(groupedJobs).length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl p-8">
            <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-base font-semibold text-foreground">No openings match your criteria</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Try adjusting your search query or selecting a different department.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setSelectedDept("ALL");
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(groupedJobs).map(([dept, deptJobs]) => (
              <div key={dept} className="space-y-3">
                <div className="flex items-center gap-2 border-b border-border/80 pb-2">
                  <h2 className="text-base font-bold text-foreground tracking-tight">
                    {dept}
                  </h2>
                  <span className="text-xs text-muted-foreground font-medium">
                    ({deptJobs.length})
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {deptJobs.map((job) => (
                    <Link
                      key={job.id}
                      href={`/jobs/${job.id}?company=${company.slug}`}
                      className="group bg-card hover:bg-card/90 border border-border hover:border-primary-500/50 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:shadow-sm"
                    >
                      <div className="space-y-1.5">
                        <h3 className="text-base font-semibold text-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
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
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                          Apply <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
