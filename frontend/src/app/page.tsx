import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Bot,
  Building2,
  CheckCircle2,
  Code2,
  Cpu,
  Eye,
  FileText,
  Lock,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Terminal,
  Timer,
  Trophy,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AudienceTabs } from "@/components/marketing/AudienceTabs";
import { BentoFeatureShowcase } from "@/components/marketing/BentoFeatureShowcase";
import { FaqSection } from "@/components/marketing/FaqSection";
import { HeroShowcase } from "@/components/marketing/HeroShowcase";
import { SectionHeading } from "@/components/marketing/SectionHeading";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";
import {
  ANTI_CHEAT_LABELS,
  APP_DESCRIPTION,
  APP_NAME,
} from "@/lib/constants";
import {
  LANDING_STATS,
  LANDING_TRACKS,
} from "@/lib/marketing";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: `${APP_NAME} — Developer Assessment, Practice & AI Interview Platform`,
  description: APP_DESCRIPTION,
  openGraph: {
    title: `${APP_NAME} — Developer Assessment, Practice & AI Interview Platform`,
    description: APP_DESCRIPTION,
    type: "website",
  },
};

const QUICK_LAUNCH_ITEMS = [
  {
    title: "Practice Arena",
    badge: "1,000+ Tasks",
    desc: "DSA, SQL & Full-Stack",
    href: "/practice",
    icon: Code2,
  },
  {
    title: "Online Compiler",
    badge: "10 Runtimes",
    desc: "Pyodide WASM & SQLite",
    href: "/playground",
    icon: Terminal,
  },
  {
    title: "ATS Resume Builder",
    badge: "Guest Mode",
    desc: "20+ ATS-Safe Templates",
    href: "/resume-builder",
    icon: FileText,
  },
  {
    title: "Resume Analyzer",
    badge: "0-100 Score",
    desc: "JD Keyword Gap Analysis",
    href: "/resume-analyzer",
    icon: ScanSearch,
  },
  {
    title: "Tech Certifications",
    badge: "Proctored",
    desc: "React, Node, Python & SQL",
    href: "/exams",
    icon: Award,
  },
  {
    title: "AI Video Interviews",
    badge: "Enterprise",
    desc: "Multi-Sensor Proctoring",
    href: "/recruiter/interviews",
    icon: Video,
  },
  {
    title: "Competitions",
    badge: "Live Ranks",
    desc: "Timed Hackathons & Cups",
    href: "/competitions",
    icon: Trophy,
  },
];

const ANTI_CHEAT_LAYERS = [
  {
    title: "Server-Authoritative Clock",
    desc: "Attempt duration is measured strictly by database timestamps. Zero client-side manipulation possible; attempts auto-submit on expiration.",
    icon: Timer,
    badge: "100% Reliable",
  },
  {
    title: "Browser Focus & Blur Telemetry",
    desc: "Captures tab switching, window defocus, blur events, and fullscreen exits in an immutable attempt event stream.",
    icon: Eye,
    badge: "Active Sensing",
  },
  {
    title: "Clipboard & Copy-Paste Guard",
    desc: "Monitors and intercepts unauthorized clipboard paste events, developer shortcut usage, and external script injection.",
    icon: Lock,
    badge: "Interception",
  },
  {
    title: "Multi-Session & Proxy Prevention",
    desc: "Detects concurrent logins from distinct IPs, browser signatures, or geo-locations in real-time, locking proxy test-takers.",
    icon: ShieldCheck,
    badge: "Session Lock",
  },
  {
    title: "AI Vision & Voice Proctoring",
    desc: "Detects multiple faces, missing candidate, mobile phone usage, secondary voices, and screen distraction during interviews.",
    icon: Bot,
    badge: "Computer Vision",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary-500/20">
      <SiteHeader />

      <main id="top" className="flex-1">
        {/* =========================================================================
            HERO SECTION
            ========================================================================= */}
        <section className="relative overflow-hidden border-b border-border">
          {/* Subtle Modern Glow Backgrounds */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 grid-bg bg-grid opacity-35 mask-fade-x"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-48 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-primary-600/20 via-violet-500/15 to-sky-400/20 blur-3xl"
          />

          <div className="container relative py-12 lg:py-20">
            <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
              <div className="animate-fade-up">
                {/* Modern Pill Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-3.5 py-1 text-xs font-medium text-primary-700 dark:text-primary-300 shadow-sm backdrop-blur-md">
                  <span className="flex size-2 rounded-full bg-primary-500 animate-pulse" />
                  <span className="font-semibold">v1.4 Live:</span>
                  <span>AI Video Interviews &amp; ATS Resume Suite</span>
                  <ArrowRight className="size-3" />
                </div>

                <h1 className="mt-6 text-3xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.35rem]">
                  Developer assessment, practice &amp;{" "}
                  <span className="gradient-text">career intelligence.</span>
                </h1>

                <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  One unified engine. Companies evaluate technical talent with proctored assessments
                  and AI video interviews. Individual engineers practice across 1,000+ problems,
                  build ATS resumes, and certify real skills.
                </p>

                {/* Main Action CTAs */}
                <div className="mt-8 flex flex-wrap items-center gap-3.5">
                  <Button asChild size="lg" className="shadow-pop">
                    <Link href="/practice">
                      <Code2 className="size-4" />
                      Start Practicing Free
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>

                  <Button asChild size="lg" variant="outline" className="border-border">
                    <Link href="/resume-builder">
                      <FileText className="size-4" />
                      Build ATS Resume
                      <Badge tone="green" size="sm" className="ml-1.5 py-0 px-1 text-[10px]">
                        Guest Mode
                      </Badge>
                    </Link>
                  </Button>

                  <Button asChild size="lg" variant="ghost">
                    <Link href="/register/company">
                      <Building2 className="size-4" />
                      For Companies &amp; Teams
                    </Link>
                  </Button>
                </div>

                {/* Key Quality Guarantees */}
                <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    <span>Free for individual developers</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    <span>Zero local installation</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    <span>Server-authoritative proctoring</span>
                  </li>
                </ul>
              </div>

              {/* Right Column: Interactive Multi-Mode Hero Showcase */}
              <div className="relative animate-fade-up animation-delay-200">
                <HeroShowcase />
              </div>
            </div>
          </div>

          {/* =========================================================================
              QUICK LAUNCH DOCK
              ========================================================================= */}
          <div className="border-t border-border bg-card/60 backdrop-blur-md">
            <div className="container py-4">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-muted-foreground pr-2 border-r border-border hidden sm:inline">
                  Quick Access:
                </span>
                {QUICK_LAUNCH_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="group flex shrink-0 items-center gap-2.5 rounded-xl border border-border/70 bg-card px-3 py-2 text-xs transition-all hover:-translate-y-0.5 hover:border-primary-500/50 hover:shadow-card"
                    >
                      <span className="flex size-7 items-center justify-center rounded-lg bg-muted text-foreground group-hover:bg-primary-500/10 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        <Icon className="size-3.5" />
                      </span>
                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {item.title}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            [{item.badge}]
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* =========================================================================
              STATS METRIC STRIP
              ========================================================================= */}
          <div className="border-t border-border bg-muted/30">
            <div className="container grid grid-cols-2 gap-6 py-8 sm:grid-cols-3 lg:grid-cols-5">
              {LANDING_STATS.map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span className="font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {stat.value}
                  </span>
                  <span className="mt-1 text-xs font-semibold text-foreground sm:text-sm">
                    {stat.label}
                  </span>
                  <span className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                    {stat.hint}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            BENTO GRID FEATURE SHOWCASE (Redesigned & Human-Crafted)
            ========================================================================= */}
        <section id="features" className="scroll-mt-20 border-b border-border py-16 lg:py-24">
          <div className="container">
            <SectionHeading
              eyebrow="Engineered Capabilities"
              title="The Full-Stack Developer Assessment Platform"
              description="From LeetCode-caliber algorithmic drills to multi-sensor AI video interviews and deterministic ATS resumes — built on a unified assessment engine."
            />

            <div className="mt-14">
              <BentoFeatureShowcase />
            </div>
          </div>
        </section>

        {/* =========================================================================
            PROCTORING & INTEGRITY ARCHITECTURE
            ========================================================================= */}
        <section id="proctoring" className="scroll-mt-20 border-b border-border bg-muted/40 py-16 lg:py-24">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
              <div>
                <SectionHeading
                  align="left"
                  eyebrow="Anti-Cheating Architecture"
                  title="Zero Compromise on Assessment Integrity"
                  description="When a candidate passes on SkillGauge, you can trust the verdict. Five independent defense layers ensure results reflect genuine technical ability."
                />

                <div className="mt-8 space-y-3.5">
                  {ANTI_CHEAT_LAYERS.map((layer) => {
                    const LayerIcon = layer.icon;
                    return (
                      <div
                        key={layer.title}
                        className="flex items-start gap-4 rounded-2xl border border-border/80 bg-card p-4 transition-all hover:border-primary-500/30 shadow-sm"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400">
                          <LayerIcon className="size-4" />
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-foreground">
                              {layer.title}
                            </h4>
                            <Badge tone="gray" size="sm" className="text-[10px]">
                              {layer.badge}
                            </Badge>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            {layer.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button asChild>
                    <Link href="/register/company">
                      Deploy Proctored Assessments
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/exams">
                      Test-Drive a Proctored Exam
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Visual Telemetry Console Simulation */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-pop">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      Live Proctoring Telemetry Stream
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Session #SG-9104 · Candidate ID: 4f2a19
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    Active Session
                  </span>
                </div>

                {/* Score Meters */}
                <div className="mt-5 space-y-3">
                  {[
                    { label: "Integrity Confidence", value: 99.8, tone: "bg-emerald-500" },
                    { label: "Active Window Focus", value: 98.4, tone: "bg-emerald-500" },
                    { label: "Hardware & Audio Isolation", value: 100, tone: "bg-emerald-500" },
                  ].map((meter) => (
                    <div key={meter.label}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{meter.label}</span>
                        <span className="font-mono text-muted-foreground">{meter.value}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${meter.tone}`}
                          style={{ width: `${meter.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Real Terminal Event Log */}
                <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-3.5 font-mono text-[11px] text-slate-300 space-y-1.5">
                  <div className="text-slate-500 pb-1 border-b border-white/10 text-[10px] uppercase font-sans font-semibold">
                    Live Attempt Events
                  </div>
                  <p className="text-slate-400"><span className="text-emerald-400">[14:22:01]</span> Server clock synchronized (0ms drift)</p>
                  <p className="text-slate-400"><span className="text-emerald-400">[14:23:45]</span> Question 1 solved · 4/4 test cases passed (18ms)</p>
                  <p className="text-slate-400"><span className="text-emerald-400">[14:26:10]</span> Video Proctoring: Primary Face verified (30fps)</p>
                  <p className="text-slate-400"><span className="text-emerald-400">[14:28:12]</span> Screen focus: 100% active · Zero blur events</p>
                  <p className="text-emerald-400 font-bold">[14:31:05] Submission verified · Score integrity: 99.8%</p>
                </div>

                {/* Captured Telemetry Badges */}
                <div className="mt-5 border-t border-border pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Sensors Monitored in Real-Time
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {Object.values(ANTI_CHEAT_LABELS).map((label) => (
                      <span
                        key={label}
                        className="rounded-lg border border-border bg-muted/60 px-2.5 py-1 text-[11px] font-mono text-muted-foreground"
                      >
                        ✓ {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SUPPORTED STACKS
            ========================================================================= */}
        <section className="border-b border-border py-16 lg:py-20">
          <div className="container">
            <SectionHeading
              eyebrow="Supported Ecosystem"
              title="Assessment Across the Modern Technology Stack"
              description="Take certification exams or practice problems across all major layers of modern engineering."
            />

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {LANDING_TRACKS.map((track) => (
                <div
                  key={track.category}
                  className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary-500/40 hover:shadow-card"
                >
                  <h3 className="text-sm font-bold text-foreground">{track.category}</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{track.description}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {track.items.map((item) => (
                      <Badge key={item} tone="gray" size="sm">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Button asChild variant="outline">
                <Link href="/exams">
                  View All Certification Exams
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
              <Button asChild>
                <Link href="/practice">
                  Browse 1,000+ Problems
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* =========================================================================
            AUDIENCE SPLIT
            ========================================================================= */}
        <section id="solutions" className="scroll-mt-20 border-b border-border bg-muted/40 py-16 lg:py-24">
          <div className="container">
            <SectionHeading
              eyebrow="Tailored Solutions"
              title="Engineered for Both Sides of the Technical Table"
              description="Whether you are an individual engineer proving capability or a high-growth company hiring at scale, SkillGauge is built for you."
            />

            <div className="mt-12">
              <AudienceTabs />
            </div>
          </div>
        </section>

        {/* =========================================================================
            FAQ
            ========================================================================= */}
        <section id="faq" className="scroll-mt-20 border-b border-border py-16 lg:py-24">
          <div className="container">
            <SectionHeading
              eyebrow="Frequently Asked Questions"
              title="Everything You Need to Know"
              description="Clear answers on how assessments, proctoring, AI interviews, and our ATS resume suite operate."
            />
            <div className="mt-12">
              <FaqSection />
            </div>
          </div>
        </section>

        {/* =========================================================================
            FINAL CTA
            ========================================================================= */}
        <section className="py-16 lg:py-24 bg-gradient-to-b from-background to-muted/50">
          <div className="container">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary-600 via-primary-700 to-violet-800 px-6 py-14 sm:px-12 lg:py-16 text-white shadow-glow">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 grid-bg bg-grid opacity-15"
              />

              <div className="relative max-w-3xl mx-auto text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                  <Sparkles className="size-3.5" />
                  Ready to experience SkillGauge?
                </span>

                <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                  Start Practicing, Certifying or Hiring Today
                </h2>

                <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/85">
                  Sign up free as an individual developer to practice 1,000+ problems, build an ATS
                  resume, and sit certification exams — or launch an enterprise workspace to run
                  proctored tests and AI video interviews for your engineering candidates.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-3.5">
                  <Button asChild size="lg" variant="secondary" className="shadow-lg">
                    <Link href="/register">
                      Create Free Developer Account
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  >
                    <Link href="/register/company">
                      Create Company Workspace
                    </Link>
                  </Button>

                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-white/20 bg-black/20 text-white hover:bg-black/40 hover:text-white"
                  >
                    <Link href="/resume-builder">
                      Try Resume Builder (No Login)
                    </Link>
                  </Button>
                </div>

                <p className="mt-6 text-xs text-white/70">
                  Free forever for individual learners · Companies pay per candidate with zero per-seat subscription lock-in.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
