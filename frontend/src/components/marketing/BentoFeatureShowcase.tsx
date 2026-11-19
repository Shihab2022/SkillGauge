"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Camera,
  CheckCircle2,
  Clock,
  Code2,
  Cpu,
  FileText,
  Flame,
  Globe2,
  Lock,
  Mic,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Terminal,
  Timer,
  Trophy,
  Users,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export function BentoFeatureShowcase() {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-12">
      {/* =========================================================================
          CARD 1: Proctored AI Video Interviews (Spans 7 cols on lg)
          ========================================================================= */}
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-primary-500/[0.03] p-6 lg:col-span-7 lg:p-8 shadow-card transition-all duration-300 hover:border-primary-500/40 hover:shadow-pop">
        {/* Glow backdrop */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-violet-500/10 blur-3xl transition-opacity group-hover:opacity-100" />

        <div>
          {/* Top metadata */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
              <Video className="size-3.5" />
              Asynchronous Screening · AI Telemetry
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
              <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
              Real-Time Sensing
            </span>
          </div>

          <h3 className="mt-5 text-xl font-bold tracking-tight text-foreground sm:text-2xl group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            Proctored AI Video Interviews
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-xl">
            Screen candidates asynchronously with in-browser webcam recordings. Automated AI
            evaluates technical transcripts against structured rubrics while computer vision detects
            unauthorized devices, multiple faces, and secondary voices.
          </p>

          {/* Realistic Micro-UI: Virtual Video Interview Room */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-border/70 bg-slate-950 p-4 text-white shadow-inner">
            {/* Monitor Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 font-mono font-medium text-rose-400">
                  <span className="size-2 rounded-full bg-rose-500 animate-ping" />
                  REC 04:12
                </span>
                <span className="text-slate-500">|</span>
                <span className="font-medium text-slate-300 truncate max-w-[280px]">
                  Q2: "Explain caching strategies with Redis & PostgreSQL"
                </span>
              </div>
              <span className="rounded bg-violet-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-violet-300 border border-violet-500/30">
                AI PROCTOR ACTIVE
              </span>
            </div>

            {/* Virtual Viewport with Visual Bounding Box */}
            <div className="relative my-3 flex h-36 sm:h-44 w-full flex-col items-center justify-center rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800">
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded bg-black/60 px-2 py-0.5 text-[10px] font-mono text-emerald-400 backdrop-blur-sm">
                <Camera className="size-3" />
                <span>1080p WebCam · 30fps</span>
              </div>

              {/* Face Box */}
              <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border border-emerald-400/50 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <div className="size-11 sm:size-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                  <Bot className="size-6 text-primary-400" />
                </div>
                <span className="mt-1.5 text-[10px] font-mono font-bold text-emerald-400">
                  [Candidate Verified · 99.8%]
                </span>
              </div>

              {/* Telemetry Sensor Badges */}
              <div className="absolute bottom-2 inset-x-2 flex flex-wrap items-center justify-between gap-1 rounded-lg bg-slate-900/90 border border-white/5 px-2.5 py-1.5 text-[10px] font-mono text-slate-300 backdrop-blur-md">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="size-3 text-emerald-400" />
                  1 Face Clean
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="size-3 text-emerald-400" />
                  No Phone
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <Mic className="size-3 text-emerald-400" />
                  1 Voice
                </span>
                <span className="text-slate-400 hidden sm:inline">Screen: 100% Focus</span>
              </div>
            </div>

            {/* AI Rubric Recommendation Banner */}
            <div className="rounded-xl border border-primary-500/30 bg-primary-950/40 p-2.5 sm:p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-primary-300">
                  <Sparkles className="size-3.5 text-primary-400" />
                  AI Verdict: STRONG HIRE (94/100)
                </span>
                <span className="text-[10px] font-mono text-slate-400">GPT-4o Rubric</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-300 leading-snug">
                Articulated cache-aside patterns, cache invalidation race conditions, and connection pooling with high technical precision.
              </p>
            </div>
          </div>
        </div>

        {/* Link Footer */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
          <span className="text-xs text-muted-foreground">
            Zero third-party desktop apps needed · Runs in any modern browser
          </span>
          <Link
            href="/recruiter/interviews"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 transition-colors hover:underline"
          >
            Explore AI Interview Platform
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* =========================================================================
          CARD 2: Deterministic ATS Resume Suite (Spans 5 cols on lg)
          ========================================================================= */}
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-blue-500/[0.03] p-6 lg:col-span-5 lg:p-8 shadow-card transition-all duration-300 hover:border-blue-500/40 hover:shadow-pop">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-blue-500/10 blur-3xl transition-opacity group-hover:opacity-100" />

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
              <FileText className="size-3.5" />
              Career Suite · Guest Mode
            </span>
            <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              No Sign-in Required
            </span>
          </div>

          <h3 className="mt-5 text-xl font-bold tracking-tight text-foreground sm:text-2xl group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            ATS Resume Analyzer &amp; Builder
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Score resumes 0–100 with a 6-pillar deterministic rubric, identify missing job description
            keywords, and export print-ready A4 PDFs from 20+ ATS-optimized templates.
          </p>

          {/* Realistic Micro-UI: ATS Score Gauge & Keywords */}
          <div className="mt-6 rounded-2xl border border-border/80 bg-muted/40 p-4">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Target Job Position
                </span>
                <p className="text-xs font-bold text-foreground">
                  Senior Full-Stack Engineer
                </p>
              </div>
              <div className="flex items-baseline gap-1 rounded-xl bg-emerald-500/15 border border-emerald-500/20 px-3 py-1 text-emerald-600 dark:text-emerald-400">
                <span className="text-2xl font-black">94</span>
                <span className="text-xs font-semibold">/100</span>
              </div>
            </div>

            {/* 4 Pillars */}
            <div className="mt-3.5 space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-[11px] font-medium text-foreground">
                  <span>ATS Formatting &amp; Parseability</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">100%</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500 w-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-medium text-foreground">
                  <span>Quantified Work Impact</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">92%</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500 w-[92%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-medium text-foreground">
                  <span>Job Keyword Match</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">89%</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500 w-[89%]" />
                </div>
              </div>
            </div>

            {/* Keyword Chips */}
            <div className="mt-3.5 border-t border-border/70 pt-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Job Description Keyword Gap
              </span>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {["TypeScript", "React 18", "PostgreSQL", "Docker"].map((kw) => (
                  <span
                    key={kw}
                    className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  >
                    ✓ {kw}
                  </span>
                ))}
                {["+ Redis Cache", "+ Kafka"].map((kw) => (
                  <span
                    key={kw}
                    className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-mono font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Link Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-4">
          <Link
            href="/resume-analyzer"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Score Your Resume
          </Link>
          <Link
            href="/resume-builder"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
          >
            Open Visual Builder
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* =========================================================================
          CARD 3: 1,000+ Problem Practice Arena (Spans 4 cols on lg)
          ========================================================================= */}
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-card p-6 lg:col-span-4 shadow-card transition-all duration-300 hover:border-emerald-500/40 hover:shadow-pop">
        <div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <Code2 className="size-3.5" />
              1,000+ Practice Bank
            </span>
            <span className="font-mono text-xs font-bold text-foreground">LeetCode Caliber</span>
          </div>

          <h3 className="mt-4 text-lg font-bold tracking-tight text-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            Developer Practice Arena
          </h3>
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
            Solve problems judged by real test runners with visible debug cases and strict hidden test suites.
          </p>

          {/* Micro-UI: Problem List Snippet */}
          <div className="mt-4 space-y-2 rounded-xl border border-border/70 bg-muted/30 p-2.5 text-xs">
            {[
              { id: "1", title: "Two Sum", diff: "Easy", tone: "text-emerald-600 dark:text-emerald-400", acc: "94.2%" },
              { id: "42", title: "Trapping Rain Water", diff: "Hard", tone: "text-rose-600 dark:text-rose-400", acc: "41.8%" },
              { id: "146", title: "LRU Cache Design", diff: "Med", tone: "text-amber-600 dark:text-amber-400", acc: "68.5%" },
            ].map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg bg-card px-2.5 py-1.5 border border-border/60 text-[11px]"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-mono text-muted-foreground">#{p.id}</span>
                  <span className="font-semibold text-foreground truncate">{p.title}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn("font-bold", p.tone)}>{p.diff}</span>
                  <span className="text-muted-foreground text-[10px]">{p.acc}</span>
                </div>
              </div>
            ))}

            <div className="pt-1 flex items-center justify-between text-[10px] text-muted-foreground px-1 font-mono">
              <span>Verdict: All hidden tests passed</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Passed</span>
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-border/70 pt-3">
          <Link
            href="/practice"
            className="inline-flex w-full items-center justify-between text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
          >
            <span>Start Solving Challenges</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* =========================================================================
          CARD 4: 10-Language Online Compiler (Spans 4 cols on lg)
          ========================================================================= */}
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-card p-6 lg:col-span-4 shadow-card transition-all duration-300 hover:border-indigo-500/40 hover:shadow-pop">
        <div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              <Terminal className="size-3.5" />
              In-Browser REPL
            </span>
            <span className="font-mono text-xs text-muted-foreground">WASM + Worker</span>
          </div>

          <h3 className="mt-4 text-lg font-bold tracking-tight text-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            10-Language Online Compiler
          </h3>
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
            Python via Pyodide WASM, client SQLite WASM with data tables, Web Worker JS/TS, and live HTML/React previews.
          </p>

          {/* Micro-UI: Interactive Console Tab View */}
          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300 font-mono">
            <div className="flex items-center gap-1.5 border-b border-white/10 pb-2 text-[10px]">
              <span className="rounded bg-white/10 px-2 py-0.5 text-white">Python 3.12 (WASM)</span>
              <span className="text-slate-500">SQLite</span>
              <span className="text-slate-500">TypeScript</span>
            </div>
            <div className="pt-2 text-[11px] leading-relaxed">
              <p className="text-slate-400">&gt; import pyodide</p>
              <p className="text-slate-400">&gt; print(&quot;Engine: WebAssembly (CPython)&quot;)</p>
              <p className="text-emerald-400 mt-1 font-bold">Engine: WebAssembly · 0ms</p>
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-border/70 pt-3">
          <Link
            href="/playground"
            className="inline-flex w-full items-center justify-between text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
          >
            <span>Open Online Compiler</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* =========================================================================
          CARD 5: Standardized Technology Exams (Spans 4 cols on lg)
          ========================================================================= */}
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-card p-6 lg:col-span-4 shadow-card transition-all duration-300 hover:border-amber-500/40 hover:shadow-pop">
        <div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
              <Timer className="size-3.5" />
              Verifiable Scorecards
            </span>
            <span className="font-mono text-xs text-muted-foreground">Server Timer</span>
          </div>

          <h3 className="mt-4 text-lg font-bold tracking-tight text-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            Technology Certification Exams
          </h3>
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
            Timed certification papers across React, Node, Python, and SQL with randomized questions and tamper-proof timers.
          </p>

          {/* Micro-UI: Digital Certificate Badge */}
          <div className="mt-4 rounded-xl border border-border/80 bg-muted/40 p-3 text-xs">
            <div className="flex items-center justify-between border-b border-border/70 pb-2">
              <span className="font-bold text-foreground">React &amp; Next.js Exam</span>
              <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                PASSED
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Certified Score:</span>
              <span className="font-mono font-bold text-foreground">96% (Top 4%)</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Clock Integrity:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">0ms Drift</span>
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-border/70 pt-3">
          <Link
            href="/exams"
            className="inline-flex w-full items-center justify-between text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
          >
            <span>Take Certification Exam</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* =========================================================================
          CARD 6: Recruiter Candidate Pipeline (Spans 6 cols on lg)
          ========================================================================= */}
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-card p-6 lg:col-span-6 shadow-card transition-all duration-300 hover:border-sky-500/40 hover:shadow-pop">
        <div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300">
              <Users className="size-3.5" />
              Recruiter &amp; Team Workspaces
            </span>
            <span className="font-mono text-xs text-muted-foreground">ATS Kanban</span>
          </div>

          <h3 className="mt-4 text-lg font-bold tracking-tight text-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            Candidate Pipeline &amp; Assessments
          </h3>
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
            Create multi-format assessments, send secure single-use email links, collaborate with recruiter notes, and export CSV reports.
          </p>

          {/* Micro-UI: Kanban Stage Tracker */}
          <div className="mt-4 rounded-xl border border-border/80 bg-muted/40 p-3 text-xs">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Candidate Pipeline Stage Progression
            </span>
            <div className="mt-2 grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono">
              <div className="rounded bg-card p-1.5 border border-border/60">
                <span className="block font-bold text-foreground">32</span>
                <span className="text-muted-foreground">Invited</span>
              </div>
              <div className="rounded bg-card p-1.5 border border-border/60">
                <span className="block font-bold text-foreground">18</span>
                <span className="text-muted-foreground">Finished</span>
              </div>
              <div className="rounded bg-primary-500/15 p-1.5 border border-primary-500/30 text-primary-600 dark:text-primary-400">
                <span className="block font-bold">6</span>
                <span>Shortlist</span>
              </div>
              <div className="rounded bg-emerald-500/15 p-1.5 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                <span className="block font-bold">2</span>
                <span>Hired</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-border/70 pt-3">
          <Link
            href="/register/company"
            className="inline-flex w-full items-center justify-between text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
          >
            <span>Create Company Workspace</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* =========================================================================
          CARD 7: Live Hackathons & Competitions (Spans 6 cols on lg)
          ========================================================================= */}
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-card p-6 lg:col-span-6 shadow-card transition-all duration-300 hover:border-rose-500/40 hover:shadow-pop">
        <div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-700 dark:text-rose-300">
              <Trophy className="size-3.5" />
              Synchronized Contests
            </span>
            <span className="flex items-center gap-1 font-mono text-[11px] text-rose-500 font-bold">
              <Flame className="size-3" />
              Live Leaderboard
            </span>
          </div>

          <h3 className="mt-4 text-lg font-bold tracking-tight text-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            Live Coding Competitions &amp; Hackathons
          </h3>
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
            Host time-boxed programming tournaments with automated grading, penalty time tracking, and synchronized standings.
          </p>

          {/* Micro-UI: Live Leaderboard Podium */}
          <div className="mt-4 rounded-xl border border-border/80 bg-muted/40 p-3 text-xs space-y-1.5">
            {[
              { rank: "1", name: "Ayesha R.", solved: "7/7", score: "980 pts", time: "18m 22s", medal: "🥇" },
              { rank: "2", name: "Tanvir H.", solved: "7/7", score: "980 pts", time: "21m 04s", medal: "🥈" },
              { rank: "3", name: "Rezaul I.", solved: "6/7", score: "840 pts", time: "19m 50s", medal: "🥉" },
            ].map((entry) => (
              <div
                key={entry.rank}
                className="flex items-center justify-between rounded-lg bg-card px-2.5 py-1.5 border border-border/60 text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <span>{entry.medal}</span>
                  <span className="font-semibold text-foreground">{entry.name}</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[10px]">
                  <span className="text-muted-foreground">{entry.solved} solved</span>
                  <span className="font-bold text-foreground">{entry.score}</span>
                  <span className="text-muted-foreground hidden sm:inline">{entry.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 border-t border-border/70 pt-3">
          <Link
            href="/competitions"
            className="inline-flex w-full items-center justify-between text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
          >
            <span>View Live Competitions</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default BentoFeatureShowcase;
