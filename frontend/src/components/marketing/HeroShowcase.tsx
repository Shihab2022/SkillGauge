"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Camera,
  CheckCircle2,
  Code2,
  FileText,
  Mic,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Video,
} from "lucide-react";
import { CodePreviewPanel } from "@/components/marketing/CodePreviewPanel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type ShowcaseTab = "code" | "interview" | "resume";

export function HeroShowcase() {
  const [activeTab, setActiveTab] = useState<ShowcaseTab>("code");

  return (
    <div className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-pop backdrop-blur-xl transition-all">
      {/* Tab Switcher Header */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/50 p-2 sm:px-4">
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
              <div className="relative flex flex-col items-center justify-center p-6 border border-emerald-400/60 rounded-xl bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <div className="size-16 rounded-full bg-slate-800/90 border border-slate-700 flex items-center justify-center text-slate-300">
                  <Bot className="size-8 text-primary-400" />
                </div>
                <span className="mt-2 text-[10px] font-mono font-semibold text-emerald-400">
                  [Primary Face Verified · 99.8%]
                </span>
                <span className="text-[10px] text-slate-400">
                  Audio Speech Energy: Normal
                </span>
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
