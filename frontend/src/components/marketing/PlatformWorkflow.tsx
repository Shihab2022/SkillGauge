"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Briefcase,
  Building2,
  CheckCircle2,
  Code2,
  FileText,
  Layers,
  ShieldCheck,
  Sparkles,
  Terminal,
  UserRound,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type WorkflowRole = "developer" | "company";

interface WorkflowStep {
  number: string;
  title: string;
  summary: string;
  bullets: string[];
  ctaLabel: string;
  ctaHref: string;
  badge: string;
  icon: React.ElementType;
}

const DEVELOPER_STEPS: WorkflowStep[] = [
  {
    number: "01",
    title: "Master 1,000+ Algorithmic & SQL Challenges",
    summary:
      "Drill LeetCode-caliber tasks across algorithms, data structures, React, Node.js, and SQL with automated test execution.",
    bullets: [
      "Dual test cases: visible debug examples + hidden test suites",
      "Monaco editor with multi-language execution and memory stats",
      "Filters for difficulty (Easy, Medium, Hard) and key tags",
    ],
    ctaLabel: "Open Practice Arena",
    ctaHref: "/practice",
    badge: "Practice Arena",
    icon: Code2,
  },
  {
    number: "02",
    title: "Instant In-Browser Code Sandboxes",
    summary:
      "Prototype and run code across 10 runtimes directly in your browser without configuring local dev environments or Docker containers.",
    bullets: [
      "Client-side Python 3.12 via Pyodide WebAssembly",
      "In-memory SQLite with table visualizer and query execution",
      "Web Worker isolated JavaScript & TypeScript execution",
    ],
    ctaLabel: "Launch Online Compiler",
    ctaHref: "/playground",
    badge: "10 Runtimes",
    icon: Terminal,
  },
  {
    number: "03",
    title: "Deterministic 0–100 ATS Resume Suite",
    summary:
      "Build ATS-parseable resumes from 20+ templates and score your resume against real Job Descriptions with zero sign-in required.",
    bullets: [
      "6-pillar deterministic scoring rubric: Layout, Impact, Keywords & Grammar",
      "Instant Job Description gap analysis highlighting missing skills",
      "Print-ready A4 PDF export with pixel-perfect typography",
    ],
    ctaLabel: "Build Free Resume",
    ctaHref: "/resume-builder",
    badge: "Guest Mode",
    icon: FileText,
  },
  {
    number: "04",
    title: "Apply to Verified Jobs & Sit Proctored Exams",
    summary:
      "Take tamper-proof certification exams to prove your engineering credentials or apply directly to verified Ashby ATS job openings.",
    bullets: [
      "Official certificates for React, Node, Python, and SQL",
      "Direct Ashby ATS application forms with transparent salary bands",
      "Synchronized hackathons and timed coding competitions",
    ],
    ctaLabel: "Explore Open Roles",
    ctaHref: "/jobs",
    badge: "Direct Hiring",
    icon: Briefcase,
  },
];

const COMPANY_STEPS: WorkflowStep[] = [
  {
    number: "01",
    title: "Assemble Tailored Technical Assessments",
    summary:
      "Create high-signal assessments tailored to specific engineering roles using our 1,000+ question bank or your team's custom problem sets.",
    bullets: [
      "Coding problems, SQL challenges, multiple choice & system architecture",
      "Configurable pass marks, custom tags, and automated score weighting",
      "Single-use secure invitation tokens dispatched via automated email",
    ],
    ctaLabel: "Explore Assessments",
    ctaHref: "/register/company",
    badge: "Authoring",
    icon: Layers,
  },
  {
    number: "02",
    title: "Enforce Server-Authoritative Anti-Cheat",
    summary:
      "Ensure score integrity with database-level clocks, browser telemetry, copy-paste guards, and concurrent multi-session locks.",
    bullets: [
      "Server timestamps guarantee zero client clock manipulation",
      "Active tab defocus, window blur, and fullscreen exit telemetry",
      "Automated attempt auto-submit upon timer expiration",
    ],
    ctaLabel: "View Proctoring Tech",
    ctaHref: "#proctoring",
    badge: "Zero Drift",
    icon: ShieldCheck,
  },
  {
    number: "03",
    title: "Run Asynchronous Proctored AI Video Interviews",
    summary:
      "Screen candidates asynchronously with in-browser webcam recording while computer vision monitors unauthorized phones, multiple faces, and secondary voices.",
    bullets: [
      "Zero-install browser recording room with dynamic timers and progressive hints",
      "Real-time infraction detection with automated timestamped snapshots",
      "Evaluation against structured rubrics powered by modern AI",
    ],
    ctaLabel: "AI Video Screening",
    ctaHref: "/register/company",
    badge: "Computer Vision",
    icon: Video,
  },
  {
    number: "04",
    title: "Fast-Track Top Candidates with Actionable Reports",
    summary:
      "Review automated candidate scorecards, read AI evaluation summaries, collaborate with hiring team notes, and export CSV pipeline reports.",
    bullets: [
      "Deterministic score breakdown with STRONG_HIRE to NO_HIRE verdict",
      "Visual evidence log with captured webcam snapshots",
      "Candidate pipeline kanban with one-click status transitions",
    ],
    ctaLabel: "Create Team Workspace",
    ctaHref: "/register/company",
    badge: "Decision Engine",
    icon: Bot,
  },
];

export function PlatformWorkflow() {
  const [role, setRole] = useState<WorkflowRole>("developer");
  const [activeStep, setActiveStep] = useState(0);

  const steps = role === "developer" ? DEVELOPER_STEPS : COMPANY_STEPS;
  const current = steps[activeStep] ?? steps[0]!;

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-pop">
      {/* Role Switcher Tab Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1 text-xs font-semibold text-primary-700 dark:text-primary-300">
            <Sparkles className="size-3" />
            End-to-End Execution Pipeline
          </span>
          <h3 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            How SkillGauge Works
          </h3>
        </div>

        {/* Pill Toggle for Developer vs Company */}
        <div className="inline-flex items-center rounded-2xl border border-border bg-muted/60 p-1.5 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setRole("developer");
              setActiveStep(0);
            }}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all",
              role === "developer"
                ? "bg-card text-foreground shadow-sm border border-border/80"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <UserRound className="size-4 text-primary-500" />
            <span>For Developers</span>
            <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              Free
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRole("company");
              setActiveStep(0);
            }}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all",
              role === "company"
                ? "bg-card text-foreground shadow-sm border border-border/80"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Building2 className="size-4 text-primary-500" />
            <span>For Teams &amp; Recruiters</span>
            <span className="rounded-full bg-indigo-500/15 px-1.5 py-0.2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              B2B
            </span>
          </button>
        </div>
      </div>

      {/* Main Grid: Steps List on Left, Interactive Live Preview on Right */}
      <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-center">
        {/* Step Selector List (5 cols) */}
        <div className="space-y-3 lg:col-span-5">
          {steps.map((step, idx) => {
            const isSelected = activeStep === idx;
            const StepIcon = step.icon;
            return (
              <button
                key={step.number}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={cn(
                  "group relative flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-all duration-200",
                  isSelected
                    ? "border-primary-500/50 bg-primary-500/[0.04] shadow-sm"
                    : "border-border/70 bg-card hover:border-primary-500/30 hover:bg-muted/30",
                )}
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold transition-colors",
                    isSelected
                      ? "bg-primary-600 text-white shadow-sm"
                      : "bg-muted text-muted-foreground group-hover:bg-primary-500/10 group-hover:text-primary-600",
                  )}
                >
                  {step.number}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={cn(
                        "text-sm font-bold truncate transition-colors",
                        isSelected
                          ? "text-primary-600 dark:text-primary-400"
                          : "text-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400",
                      )}
                    >
                      {step.title}
                    </h4>
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                      {step.badge}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                    {step.summary}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Step Detail + Interactive Preview Card (7 cols) */}
        <div className="lg:col-span-7">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary-500/[0.03] p-6 sm:p-8 shadow-card">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-4">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400">
                  <current.icon className="size-4" />
                </span>
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-primary-600 dark:text-primary-400">
                  Step {current.number} · {current.badge}
                </span>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-mono text-muted-foreground">
                {role === "developer" ? "Individual Path" : "Enterprise Workflow"}
              </span>
            </div>

            <h3 className="mt-4 text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              {current.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {current.summary}
            </p>

            {/* Bullets */}
            <ul className="mt-5 space-y-2.5">
              {current.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2.5 text-xs text-foreground">
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-3" />
                  </span>
                  <span className="text-muted-foreground leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>

            {/* Contextual Interactive Micro-UI Preview */}
            <div className="mt-6 rounded-2xl border border-border/80 bg-muted/40 p-4 shadow-inner">
              {role === "developer" && activeStep === 0 && (
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-muted-foreground border-b border-border/60 pb-2">
                    <span className="flex items-center gap-1.5 text-foreground font-bold">
                      <Code2 className="size-3.5 text-emerald-500" />
                      TwoSum.ts · Problem #1
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      All 4 Hidden Tests Passed
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    <span className="text-emerald-500">✓ Test 1:</span> target=9, nums=[2,7,11,15] → output: [0,1] (0.8ms)
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    <span className="text-emerald-500">✓ Test 2:</span> target=6, nums=[3,2,4] → output: [1,2] (0.6ms)
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    <span className="text-emerald-500">✓ Test 3 (Large Scale):</span> 100,000 items → Passed in 14ms
                  </p>
                </div>
              )}

              {role === "developer" && activeStep === 1 && (
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-muted-foreground border-b border-border/60 pb-2">
                    <span className="flex items-center gap-1.5 text-foreground font-bold">
                      <Terminal className="size-3.5 text-primary-500" />
                      Pyodide 0.26 WebAssembly (C-Python 3.12)
                    </span>
                    <span className="text-emerald-500 font-bold">Zero Local Setup</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">&gt;&gt;&gt; import sqlite3, pandas as pd</p>
                  <p className="text-slate-400 text-[11px]">&gt;&gt;&gt; conn = sqlite3.connect(&quot;:memory:&quot;)</p>
                  <p className="text-emerald-400 text-[11px] font-bold">&gt;&gt;&gt; Query executed: 1,420 rows loaded in 4ms</p>
                </div>
              )}

              {role === "developer" && activeStep === 2 && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="font-bold text-foreground">ATS Evaluation: Senior React Engineer</span>
                    <span className="rounded-lg bg-emerald-500/15 px-2.5 py-0.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      Score: 94 / 100
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex justify-between p-1.5 rounded bg-card border border-border/60">
                      <span className="text-muted-foreground">ATS Layout Format:</span>
                      <span className="font-bold text-emerald-600">100% (Pass)</span>
                    </div>
                    <div className="flex justify-between p-1.5 rounded bg-card border border-border/60">
                      <span className="text-muted-foreground">JD Keywords:</span>
                      <span className="font-bold text-emerald-600">89% Match</span>
                    </div>
                  </div>
                </div>
              )}

              {role === "developer" && activeStep === 3 && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="font-bold text-foreground">Verified Ashby ATS Opening</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">$140k - $185k / yr</span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    Senior Full-Stack Engineer · SkillGauge Core Platform · Remote Worldwide
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="rounded bg-primary-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-primary-600">TypeScript</span>
                    <span className="rounded bg-primary-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-primary-600">React 18</span>
                    <span className="rounded bg-primary-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-primary-600">PostgreSQL</span>
                  </div>
                </div>
              )}

              {role === "company" && activeStep === 0 && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="font-bold text-foreground">Assessment: Full-Stack Hiring Battery</span>
                    <span className="text-muted-foreground text-[11px] font-mono">3 Tasks · 60 Mins</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-muted-foreground">
                    <p>• Task 1: Algorithmic Optimization (DSA Medium) · 40 pts</p>
                    <p>• Task 2: PostgreSQL Index &amp; Aggregation Query · 30 pts</p>
                    <p>• Task 3: Asynchronous AI Video Question (Caching) · 30 pts</p>
                  </div>
                </div>
              )}

              {role === "company" && activeStep === 1 && (
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <ShieldCheck className="size-3.5 text-emerald-500" />
                      Session #SG-9104 Proctor Stream
                    </span>
                    <span className="text-emerald-500 font-bold">100% Reliable</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">[Clock] Server time synched · Local override rejected</p>
                  <p className="text-slate-400 text-[11px]">[Focus] Screen 100% active · Blur events: 0</p>
                  <p className="text-emerald-400 text-[11px] font-bold">[Verdict] Anti-cheat confidence: 99.8% verified</p>
                </div>
              )}

              {role === "company" && activeStep === 2 && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <Video className="size-3.5 text-rose-500" />
                      Candidate Video Assessment Room
                    </span>
                    <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400">
                      Live Telemetry
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                    <div className="rounded bg-card p-1.5 border border-border/60">
                      <span className="block text-emerald-600 font-bold">1 Face</span>
                      <span className="text-muted-foreground">Primary Clean</span>
                    </div>
                    <div className="rounded bg-card p-1.5 border border-border/60">
                      <span className="block text-emerald-600 font-bold">Zero Phone</span>
                      <span className="text-muted-foreground">Hardware Clean</span>
                    </div>
                    <div className="rounded bg-card p-1.5 border border-border/60">
                      <span className="block text-emerald-600 font-bold">1 Voice</span>
                      <span className="text-muted-foreground">Audio Isolated</span>
                    </div>
                  </div>
                </div>
              )}

              {role === "company" && activeStep === 3 && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="font-bold text-foreground">Candidate Scorecard: Alex Chen</span>
                    <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      STRONG HIRE · 94%
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    All test cases passed in 18ms. Outstanding communication on distributed caching trade-offs during video screening. Zero cheating flags.
                  </p>
                </div>
              )}
            </div>

            {/* CTA row */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-5">
              <Button asChild size="md" className="shadow-sm">
                <Link href={current.ctaHref}>
                  {current.ctaLabel}
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveStep((prev) => (prev > 0 ? prev - 1 : steps.length - 1))}
                >
                  Prev
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : 0))}
                >
                  Next Step
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlatformWorkflow;
