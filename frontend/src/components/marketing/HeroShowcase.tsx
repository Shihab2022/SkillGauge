"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Briefcase,
  Camera,
  CheckCircle2,
  Code2,
  DollarSign,
  FileText,
  ListPlus,
  MapPin,
  Mic,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Video,
} from "lucide-react";
import { CodePreviewPanel } from "@/components/marketing/CodePreviewPanel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { JobDescriptionRenderer } from "@/components/jobs/JobDescriptionRenderer";
import { cn } from "@/lib/utils";

type ShowcaseTab = "code" | "jobs" | "interview" | "resume";

export function HeroShowcase() {
  const [activeTab, setActiveTab] = useState<ShowcaseTab>("code");
  const [jobInnerTab, setJobInnerTab] = useState<"desc" | "fields">("desc");

  return (
    <div className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-border/80 bg-card/95 shadow-pop backdrop-blur-xl transition-all">
      {/* Modern Window Chrome Bar */}
      <div className="flex items-center justify-between border-b border-border/70 bg-muted/60 px-4 py-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-rose-500/80" />
            <span className="size-2.5 rounded-full bg-amber-500/80" />
            <span className="size-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="ml-1 text-[11px] font-mono text-muted-foreground hidden sm:inline">
            SkillGauge Interactive Engine · v1.4
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span>Live Runtime</span>
        </div>
      </div>

      {/* Tab Switcher Header */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 p-2 sm:px-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              activeTab === "code"
                ? "bg-primary-600 text-white shadow-sm"
                : "text-muted-foreground hover:bg-card hover:text-foreground",
            )}
          >
            <Code2 className="size-3.5" />
            <span>Code Sandbox</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("jobs")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              activeTab === "jobs"
                ? "bg-primary-600 text-white shadow-sm"
                : "text-muted-foreground hover:bg-card hover:text-foreground",
            )}
          >
            <Briefcase className="size-3.5" />
            <span>Job Openings</span>
            <span className="rounded bg-emerald-500/15 px-1 py-0.2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              Ashby
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("interview")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              activeTab === "interview"
                ? "bg-primary-600 text-white shadow-sm"
                : "text-muted-foreground hover:bg-card hover:text-foreground",
            )}
          >
            <Video className="size-3.5" />
            <span>AI Video Interview</span>
            <span className="size-1.5 rounded-full bg-rose-400 animate-pulse" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("resume")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              activeTab === "resume"
                ? "bg-primary-600 text-white shadow-sm"
                : "text-muted-foreground hover:bg-card hover:text-foreground",
            )}
          >
            <FileText className="size-3.5" />
            <span>ATS Resume Suite</span>
            <span className="rounded bg-emerald-500/15 px-1 py-0.2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              0-100
            </span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span>Live Engine</span>
        </div>
      </div>

      {/* Tab 1: Code Sandbox */}
      {activeTab === "code" && (
        <div className="animate-fade-in p-2 sm:p-3">
          <CodePreviewPanel compact />
          <div className="mt-3 flex items-center justify-between px-2 text-xs text-muted-foreground">
            <span>Try running code in 10 supported runtimes</span>
            <Link
              href="/playground"
              className="inline-flex items-center gap-1 font-medium text-primary-600 hover:underline dark:text-primary-400"
            >
              Open Full Compiler
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Tab: Ashby ATS Job Post Showcase */}
      {activeTab === "jobs" && (
        <div className="animate-fade-in p-4 space-y-3.5">
          {/* Header Card */}
          <div className="rounded-xl border border-border bg-muted/30 p-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-3">
              <div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="font-semibold text-primary-600 dark:text-primary-400">SkillGauge Core</span>
                  <span>•</span>
                  <span>Engineering</span>
                  <span>•</span>
                  <span>Remote (Worldwide)</span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-foreground mt-0.5">
                  Senior Full-Stack Engineer
                </h4>
              </div>
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                <DollarSign className="size-3" />
                $140k - $185k / yr
              </span>
            </div>

            {/* Inner Tabs: Job Description vs Application Form */}
            <div className="flex items-center gap-2 pt-2.5 pb-2">
              <button
                type="button"
                onClick={() => setJobInnerTab("desc")}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5",
                  jobInnerTab === "desc"
                    ? "bg-primary-600 text-white shadow-xs"
                    : "text-muted-foreground hover:bg-card hover:text-foreground"
                )}
              >
                <FileText className="size-3" />
                <span>Job Description</span>
              </button>
              <button
                type="button"
                onClick={() => setJobInnerTab("fields")}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5",
                  jobInnerTab === "fields"
                    ? "bg-primary-600 text-white shadow-xs"
                    : "text-muted-foreground hover:bg-card hover:text-foreground"
                )}
              >
                <ListPlus className="size-3" />
                <span>Application Fields</span>
                <span className="text-[10px] bg-muted px-1 rounded">3 custom</span>
              </button>
            </div>

            {jobInnerTab === "desc" ? (
              <div className="rounded-lg border border-border/80 bg-background p-3.5 text-xs max-h-[190px] overflow-y-auto space-y-2">
                <JobDescriptionRenderer
                  content={`## About the Role
Design and ship scalable web applications and real-time code sandboxes.

## Responsibilities
- Architect high-throughput Next.js & Node.js features
- Optimize database queries and caching latency
- Participate in technical architecture reviews

## Requirements
- **3+ years** of modern full-stack development experience
- Proficiency in **TypeScript, React, PostgreSQL**
- No title required — we evaluate practical engineering capability`}
                />
              </div>
            ) : (
              <div className="rounded-lg border border-border/80 bg-background p-3.5 text-xs max-h-[190px] overflow-y-auto space-y-2">
                <div className="space-y-1.5">
                  <div className="p-2 rounded border border-border/80 bg-muted/20 flex items-center justify-between text-[11px]">
                    <span className="font-medium text-foreground">1. Notice Period:</span>
                    <span className="text-muted-foreground">Select: Immediate, 30, 60 days</span>
                  </div>
                  <div className="p-2 rounded border border-border/80 bg-muted/20 flex items-center justify-between text-[11px]">
                    <span className="font-medium text-foreground">2. Expected Salary:</span>
                    <span className="text-muted-foreground">e.g. $150,000 / year</span>
                  </div>
                  <div className="p-2 rounded border border-border/80 bg-muted/20 flex items-center justify-between text-[11px]">
                    <span className="font-medium text-foreground">3. Work Authorization:</span>
                    <span className="text-emerald-600 font-semibold">Yes / No required</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-muted-foreground">
              Ashby ATS: live public links with formatted descriptions & custom fields
            </span>
            <Button asChild size="sm">
              <Link href="/jobs">
                Explore Tech Jobs
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Tab 2: AI Video Interview Simulation */}
      {activeTab === "interview" && (
        <div className="animate-fade-in p-4 space-y-4">
          {/* Virtual Video Feed */}
          <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-4 text-white">
            <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-rose-400 font-mono font-medium">
                  <span className="size-2 rounded-full bg-rose-500 animate-ping" />
                  REC 03:45
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-300 font-medium truncate">
                  Q2: "Explain caching strategies with Redis & PostgreSQL"
                </span>
              </div>
              <Badge tone="indigo" size="sm">
                AI Proctored
              </Badge>
            </div>

            {/* Video Viewport Mockup */}
            <div className="relative my-4 flex h-48 sm:h-52 w-full flex-col items-center justify-center rounded-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80">
              <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-1 text-[10px] font-mono text-emerald-400 backdrop-blur-sm">
                <Camera className="size-3 text-emerald-400" />
                <span>1080p WebCam · 30fps</span>
              </div>

              {/* Face Tracking Bounding Box */}
              <div className="relative flex flex-col items-center justify-center p-4 sm:p-5 border border-emerald-400/60 rounded-2xl bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <div className="relative size-14 rounded-full bg-slate-800 border-2 border-emerald-400/60 flex items-center justify-center text-slate-300">
                  <span className="font-bold text-sm text-slate-200">AC</span>
                  <span className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                </div>
                <span className="mt-2 text-[10px] font-mono font-bold text-emerald-400">
                  [Alex Chen · Primary Face Verified]
                </span>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                  <span>Audio:</span>
                  <div className="flex items-center gap-0.5 h-3">
                    <span className="w-0.5 rounded-full bg-emerald-400 soundwave-1" />
                    <span className="w-0.5 rounded-full bg-emerald-400 soundwave-2" />
                    <span className="w-0.5 rounded-full bg-emerald-400 soundwave-3" />
                    <span className="w-0.5 rounded-full bg-emerald-400 soundwave-4" />
                    <span className="w-0.5 rounded-full bg-emerald-400 soundwave-5" />
                  </div>
                </div>
              </div>

              {/* Floating AI Proctoring Telemetry Badges */}
              <div className="absolute bottom-2.5 inset-x-2.5 flex flex-wrap items-center justify-between gap-1.5 rounded-lg bg-slate-900/90 border border-white/5 p-2 text-[10px] font-mono text-slate-300 backdrop-blur-md">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="size-3 text-emerald-400" />
                  1 Face (Clean)
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="size-3 text-emerald-400" />
                  Phone: Not Detected
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <Mic className="size-3 text-emerald-400" />
                  Voice: 1 Speaker
                </span>
                <span className="text-slate-400 hidden sm:inline">
                  Tab Blur: 0
                </span>
              </div>
            </div>

            {/* AI Automated Evaluation Output */}
            <div className="rounded-lg border border-primary-500/30 bg-primary-950/40 p-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-primary-300 font-semibold">
                  <Sparkles className="size-3.5 text-primary-400" />
                  <span>AI Rubric Verdict: STRONG HIRE (94/100)</span>
                </div>
                <span className="text-[11px] text-slate-400">GPT-4o Rubric</span>
              </div>
              <p className="mt-1 text-slate-300 text-[11px] leading-relaxed">
                Candidate accurately contrasted cache-aside with write-through patterns, correctly highlighted cache invalidation pitfalls, and articulated database failover mechanisms.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-muted-foreground">
              Automated asynchronous interviews for high-volume hiring
            </span>
            <Button asChild size="sm">
              <Link href="/register/company">
                Explore AI Interviews
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Tab 3: ATS Resume Suite Simulation */}
      {activeTab === "resume" && (
        <div className="animate-fade-in p-4 space-y-4">
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                  Deterministic ATS Analyzer
                </span>
                <h4 className="text-sm font-bold text-foreground">
                  Senior Full Stack Engineer (React + Node.js)
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-baseline gap-1 rounded-xl bg-emerald-500/10 px-3 py-1.5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="text-2xl font-black">94</span>
                  <span className="text-xs font-semibold">/100</span>
                </div>
              </div>
            </div>

            {/* 6-Pillar Metric Bars */}
            <div className="mt-3.5 grid gap-2.5 sm:grid-cols-2 text-xs">
              <div>
                <div className="flex justify-between text-[11px] font-medium text-foreground">
                  <span>ATS Readability & Layout</span>
                  <span className="text-emerald-600 font-bold">100%</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500 w-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-medium text-foreground">
                  <span>Quantified Work Impact</span>
                  <span className="text-emerald-600 font-bold">92%</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500 w-[92%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-medium text-foreground">
                  <span>Job Keyword Match</span>
                  <span className="text-emerald-600 font-bold">88%</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500 w-[88%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-medium text-foreground">
                  <span>Technical Skills Coverage</span>
                  <span className="text-emerald-600 font-bold">95%</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500 w-[95%]" />
                </div>
              </div>
            </div>

            {/* Keyword Match Insights */}
            <div className="mt-4 rounded-lg bg-card p-3 border border-border">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                Keyword Gap Analysis
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["TypeScript", "React 18", "Node.js", "PostgreSQL", "Docker", "REST API"].map((kw) => (
                  <Badge key={kw} tone="green" size="sm">
                    ✓ {kw}
                  </Badge>
                ))}
                {["Redis Cache", "Kubernetes"].map((kw) => (
                  <Badge key={kw} tone="amber" size="sm">
                    + Missing: {kw}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <span className="text-xs text-muted-foreground">
              Instant Guest Mode · Zero login required to build or score
            </span>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/resume-analyzer">
                  <ScanSearch className="size-3.5" />
                  Score Resume
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/resume-builder">
                  Build Resume
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HeroShowcase;
