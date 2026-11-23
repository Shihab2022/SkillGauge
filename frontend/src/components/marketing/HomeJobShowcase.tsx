"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  ArrowRight,
  Sparkles,
  Building2,
  FileText,
  ListPlus,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { JobDescriptionRenderer } from "@/components/jobs/JobDescriptionRenderer";
import { usePublicJobs } from "@/hooks/useJobs";
import { cn } from "@/lib/utils";

interface DemoRole {
  id: string;
  title: string;
  companyName: string;
  department: string;
  location: string;
  workplaceType: string;
  employmentType: string;
  salaryString: string;
  equityBonus: string;
  description: string;
  customQuestions: Array<{
    id: string;
    question: string;
    type: string;
    required: boolean;
    options?: string[];
  }>;
}

const DEMO_ROLES: DemoRole[] = [
  {
    id: "demo-role-1",
    title: "Senior Full-Stack Engineer",
    companyName: "SkillGauge Platform",
    department: "Core Engineering",
    location: "Remote · Worldwide",
    workplaceType: "Remote",
    employmentType: "Full-time",
    salaryString: "$140,000 - $185,000 / year",
    equityBonus: "0.15% - 0.35% Equity + Health Stipend",
    description: `We are looking for a passionate Senior Full-Stack Engineer to architect mission-critical developer tools and real-time assessment sandboxes.

## About the Role
As a core engineer on our team, you will design and ship scalable web applications, real-time code execution runners, and deterministic ATS evaluation pipelines.

## What You'll Build
- Build responsive, accessible UI features using Next.js 14 and Tailwind CSS
- Architect high-throughput Node.js microservices with PostgreSQL and Prisma
- Optimize database queries, connection pooling, and Redis cache hit rates
- Write comprehensive integration test suites with strict coverage standards
- Collaborate directly with product designers and engineering leadership

## Qualifications & Skills
- **3+ years** of professional experience with TypeScript, React, and Node.js
- Strong proficiency in relational database architecture and query optimization
- Solid understanding of web security, CORS, authentication, and async workers
- High degree of software craftsmanship, clean code habits, and ownership
- No degree required — we evaluate practical skill, not resume prestige

## Benefits & Team Culture
- Competitive compensation with transparent salary bands and equity
- 100% remote-first culture with flexible working hours
- $2,000 annual home-office equipment budget + top-spec MacBook Pro
- Comprehensive global health, vision, and dental insurance
- Generous paid time off, mental health recharge days, and parental leave`,
    customQuestions: [
      {
        id: "q1",
        question: "What is your current notice period?",
        type: "select",
        required: true,
        options: ["Immediate / 0-15 days", "30 days", "60 days", "90 days"],
      },
      {
        id: "q2",
        question: "Expected annual compensation (USD):",
        type: "text",
        required: false,
      },
      {
        id: "q3",
        question: "Are you legally authorized to work in your country of residence?",
        type: "boolean",
        required: true,
      },
      {
        id: "q4",
        question: "Link to your GitHub profile or live project:",
        type: "url",
        required: false,
      },
    ],
  },
  {
    id: "demo-role-2",
    title: "Staff Backend Infrastructure Engineer",
    companyName: "CloudScale Systems",
    department: "Infrastructure",
    location: "San Francisco, CA / Remote",
    workplaceType: "Hybrid",
    employmentType: "Full-time",
    salaryString: "$170,000 - $225,000 / year",
    equityBonus: "0.25% - 0.50% Equity + 401(k) Match",
    description: `Join CloudScale Systems to design and scale distributed cloud execution runtimes that serve millions of daily requests.

## About the Role
You will spearhead our backend architecture, scaling our distributed container sandboxes, database clusters, and telemetry pipelines across global cloud regions.

## Core Responsibilities
- Architect zero-downtime distributed microservices in Go and TypeScript
- Scale PostgreSQL and Redis clusters to sub-millisecond query latencies
- Maintain infrastructure as code using Docker, Kubernetes, and Terraform
- Partner with security teams to enforce sandboxed container isolation

## Requirements
- **5+ years** engineering backend systems at high concurrency
- Deep familiarity with Linux kernel primitives, cgroups, and containerization
- Proven background with PostgreSQL performance tuning and query planning
- Passion for reliability, observability, and defensive systems design`,
    customQuestions: [
      {
        id: "q1",
        question: "How many years of experience do you have with Go/Kubernetes?",
        type: "number",
        required: true,
      },
      {
        id: "q2",
        question: "What is your earliest possible start date?",
        type: "text",
        required: true,
      },
      {
        id: "q3",
        question: "Work authorization status:",
        type: "select",
        required: true,
        options: ["Citizen / Permanent Resident", "Visa Holder (Transfer Required)", "Requires Sponsorship"],
      },
    ],
  },
  {
    id: "demo-role-3",
    title: "Lead Frontend Architect",
    companyName: "Veloce AI",
    department: "Design & Product",
    location: "New York, NY / Remote",
    workplaceType: "Remote",
    employmentType: "Full-time",
    salaryString: "$155,000 - $205,000 / year",
    equityBonus: "0.20% - 0.40% Equity + Health Stipend",
    description: `Veloce AI is redefining developer interfaces. We are looking for a Lead Frontend Architect to build our next-generation web client.

## Role Overview
You will set the architectural direction for our React/Next.js design system, Monaco code editor integrations, and streaming AI assistant experiences.

## Responsibilities
- Architect high-performance client state management and canvas renderers
- Build resilient WebSockets and streaming SSE pipelines for real-time AI feeds
- Champion web accessibility (WCAG 2.1 AA) and sub-100ms interaction latency
- Mentor frontend engineers and guide technology choices across teams

## Skills Needed
- Mastery of **TypeScript, Next.js, React 18+**, and CSS layout primitives
- Experience with web workers, WASM, and Monaco/ProseMirror editors
- Keen eye for typography, micro-interactions, and design engineering`,
    customQuestions: [
      {
        id: "q1",
        question: "Portfolio or live production app URL:",
        type: "url",
        required: true,
      },
      {
        id: "q2",
        question: "Expected salary range:",
        type: "text",
        required: false,
      },
      {
        id: "q3",
        question: "Years of modern frontend experience:",
        type: "number",
        required: true,
      },
    ],
  },
];

export function HomeJobShowcase() {
  const { data: publicJobsData } = usePublicJobs({ limit: 4 });
  const [selectedRoleIdx, setSelectedRoleIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<"description" | "fields">("description");

  // Fallback to rich demo role or use real jobs
  const liveJobs = publicJobsData?.data || [];
  const activeRole = DEMO_ROLES[selectedRoleIdx] ?? DEMO_ROLES[0]!;

  return (
    <div className="space-y-8">
      {/* Role Picker Pill Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1 shrink-0 flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-primary-500" />
          Featured Openings:
        </span>
        {DEMO_ROLES.map((role, idx) => (
          <button
            key={role.id}
            type="button"
            onClick={() => {
              setSelectedRoleIdx(idx);
              setActiveTab("description");
            }}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-2",
              selectedRoleIdx === idx
                ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                : "bg-card border-border text-muted-foreground hover:border-primary-500/40 hover:text-foreground",
            )}
          >
            <Briefcase className="size-3.5" />
            <span>{role.title}</span>
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                selectedRoleIdx === idx
                  ? "bg-white/20 text-white"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {role.companyName}
            </span>
          </button>
        ))}
      </div>

      {/* Main Ashby-Style Interactive Job Post Card */}
      <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-card">
        {/* Header Hero Area */}
        <div className="border-b border-border/70 bg-muted/20 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <span className="font-semibold text-primary-600 dark:text-primary-400">
                  {activeRole.companyName}
                </span>
                <span>•</span>
                <span>{activeRole.department}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="size-3" />
                  {activeRole.location} ({activeRole.workplaceType})
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {activeRole.title}
              </h3>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  <DollarSign className="size-3.5" />
                  {activeRole.salaryString}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                  <Sparkles className="size-3.5" />
                  {activeRole.equityBonus}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-muted text-muted-foreground border border-border">
                  <Clock className="size-3.5" />
                  {activeRole.employmentType}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
              <Button asChild variant="primary" size="md" className="gap-1.5 shadow-sm">
                <Link href="/jobs">
                  <span>Explore Jobs Board</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="md">
                <Link href="/recruiter/jobs/new">
                  <span>Post a Role</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Switcher Header (Feature Highlight: Job Description vs Job Fields) */}
        <div className="border-b border-border bg-background px-6 pt-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("description")}
              className={cn(
                "pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2",
                activeTab === "description"
                  ? "border-primary-600 text-primary-600 dark:text-primary-400"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <FileText className="size-4" />
              <span>Job Description</span>
              <span className="text-[10px] bg-muted px-1.5 py-0.2 rounded font-normal text-muted-foreground hidden sm:inline">
                Markdown / Bold / Bullets
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("fields")}
              className={cn(
                "pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2",
                activeTab === "fields"
                  ? "border-primary-600 text-primary-600 dark:text-primary-400"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <ListPlus className="size-4" />
              <span>Job Fields & Application Form</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300">
                {activeRole.customQuestions.length} custom fields
              </span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground pb-2">
            <span className="flex size-2 rounded-full bg-emerald-500" />
            <span>Ashby-grade Public Link Engine</span>
          </div>
        </div>

        {/* Tab 1: Rendered Job Description */}
        {activeTab === "description" && (
          <div className="p-6 sm:p-8 animate-fade-in space-y-6">
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/70 text-xs sm:text-sm text-foreground/90 flex items-start gap-2.5">
              <Sparkles className="size-4 text-primary-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">Ashby-Style Formatting Engine: </span>
                <span className="text-muted-foreground">
                  Headings starting with <code className="font-mono text-foreground font-semibold">##</code> are rendered as bold titles, lines starting with <code className="font-mono text-foreground font-semibold">-</code> render as bullet points, and text without titles flows naturally.
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-border/80 bg-background p-6 shadow-xs max-h-[480px] overflow-y-auto">
              <JobDescriptionRenderer content={activeRole.description} />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">
                Candidates can read requirements and switch to the application tab in one click.
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveTab("fields")}
                className="gap-1.5 text-xs px-5 shadow-sm"
              >
                <span>View Application Form</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Tab 2: Custom Job Fields & Application Form */}
        {activeTab === "fields" && (
          <div className="p-6 sm:p-8 animate-fade-in space-y-6">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <ListPlus className="size-4 text-primary-600" />
                Candidate Application Form & Custom Input Fields
              </h4>
              <p className="text-xs text-muted-foreground">
                Recruiters configure custom screening inputs (notice periods, salary expectations, work eligibility, links) alongside standard core fields.
              </p>
            </div>

            {/* Standard Core Fields */}
            <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Standard Candidate Inputs (Included Automatically)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-lg border border-border/80 bg-card flex items-center justify-between">
                  <span className="font-medium text-foreground">Full Name</span>
                  <span className="text-[9px] font-bold text-rose-500 uppercase">Required</span>
                </div>
                <div className="p-2.5 rounded-lg border border-border/80 bg-card flex items-center justify-between">
                  <span className="font-medium text-foreground">Email Address</span>
                  <span className="text-[9px] font-bold text-rose-500 uppercase">Required</span>
                </div>
                <div className="p-2.5 rounded-lg border border-border/80 bg-card flex items-center justify-between">
                  <span className="font-medium text-foreground">Resume / CV</span>
                  <span className="text-[9px] font-bold text-rose-500 uppercase">Required</span>
                </div>
                <div className="p-2.5 rounded-lg border border-border/80 bg-card flex items-center justify-between">
                  <span className="font-medium text-foreground">Phone & Links</span>
                  <span className="text-[9px] text-muted-foreground">Optional</span>
                </div>
              </div>
            </div>

            {/* Role-Specific Custom Questions */}
            <div className="space-y-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Role-Specific Screening Questions ({activeRole.customQuestions.length})
              </span>

              <div className="grid gap-3">
                {activeRole.customQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl border border-border bg-card space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">
                          {idx + 1}. {q.question}
                        </span>
                        {q.required ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                            Required *
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
                            Optional
                          </span>
                        )}
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-muted text-muted-foreground">
                        Type: {q.type}
                      </span>
                    </div>

                    {q.type === "select" && q.options && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                        {q.options.map((opt) => (
                          <span
                            key={opt}
                            className="px-2.5 py-1 rounded-lg border border-border bg-muted/40 text-[11px] text-muted-foreground"
                          >
                            • {opt}
                          </span>
                        ))}
                      </div>
                    )}

                    {q.type === "boolean" && (
                      <div className="flex items-center gap-3 pt-1">
                        <span className="px-3 py-1 rounded-lg border border-border bg-muted/40 text-[11px] font-medium text-foreground">
                          Yes
                        </span>
                        <span className="px-3 py-1 rounded-lg border border-border bg-muted/40 text-[11px] font-medium text-foreground">
                          No
                        </span>
                      </div>
                    )}

                    {(q.type === "text" || q.type === "number" || q.type === "url") && (
                      <div className="h-8 rounded-lg border border-border/80 bg-muted/30 px-3 flex items-center text-xs text-muted-foreground">
                        Candidate enters value...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">
                All responses attach directly to candidate profile in the ATS pipeline.
              </span>
              <Button asChild variant="primary" size="sm" className="gap-1.5 text-xs">
                <Link href="/jobs">
                  <span>Open Full Job Board</span>
                  <ExternalLink className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Banner linking to Jobs Board */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-primary-50/60 via-card to-card dark:from-primary-950/30 dark:via-card dark:to-card border border-primary-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm shrink-0">
            <Briefcase className="size-5" />
          </span>
          <div>
            <h4 className="text-sm font-bold text-foreground">
              Looking for your next engineering role or hiring engineers?
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Explore public career listings, apply directly with your ATS resume, or post a new position with custom screening questions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link href="/recruiter/jobs/new">
              Post a Role (Recruiter)
            </Link>
          </Button>
          <Button asChild variant="primary" size="sm" className="text-xs gap-1.5 shadow-sm">
            <Link href="/jobs">
              <span>View All Tech Jobs</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
