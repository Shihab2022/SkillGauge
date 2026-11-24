"use client";

import { CheckCircle2, Star } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  org: string;
  avatarText: string;
  avatarColor: string;
  highlightMetric: string;
  quote: string;
  tag: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Elena Rostova",
    role: "Senior Full-Stack Engineer",
    org: "FinTech Scale-Up",
    avatarText: "ER",
    avatarColor: "bg-indigo-500",
    highlightMetric: "94/100 ATS Score · Hired in 12 Days",
    quote:
      "The deterministic ATS analyzer pinpointed the exact Redis and PostgreSQL keywords missing from my resume for a Senior React role. Running test cases directly in the browser practice arena kept me sharp for the live rounds.",
    tag: "Individual Developer",
  },
  {
    name: "Marcus Vance",
    role: "VP of Engineering",
    org: "Enterprise SaaS (250+ Engineers)",
    avatarText: "MV",
    avatarColor: "bg-emerald-500",
    highlightMetric: "78% Screening Time Saved",
    quote:
      "SkillGauge eliminated the friction of coordinating first-round live screens. The asynchronous AI video interviews combined with tamper-proof proctoring telemetry give our hiring managers genuine confidence before final team loops.",
    tag: "Engineering Leader",
  },
  {
    name: "Priya Sharma",
    role: "Lead Technical Recruiter",
    org: "Global Talent Network",
    avatarText: "PS",
    avatarColor: "bg-violet-500",
    highlightMetric: "1,200+ Candidates Evaluated",
    quote:
      "Having Ashby ATS job posts directly connected to real technical assessments transformed our funnel. Candidates love that there are zero bloated installations and we love that our pass rates correlate 100% with real-world job performance.",
    tag: "Tech Recruiter",
  },
  {
    name: "Tariq Al-Mansoor",
    role: "Software Engineering Graduate",
    org: "Now Software Engineer @ CloudCore",
    avatarText: "TA",
    avatarColor: "bg-sky-500",
    highlightMetric: "React & Python Certifications Passed",
    quote:
      "Practicing algorithms with instant WebAssembly Python execution and real SQLite tables taught me how to write production-grade queries. The official certificate on my profile immediately set me apart from other applicants.",
    tag: "Certified Developer",
  },
];

export function TestimonialSection() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {TESTIMONIALS.map((t) => (
        <div
          key={t.name}
          className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-500/40 hover:shadow-pop"
        >
          <div>
            {/* Top Stars & Tag */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-0.5 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-3.5 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <span className="rounded-full bg-muted/80 px-2.5 py-0.5 text-[10px] font-mono text-muted-foreground border border-border/60">
                {t.tag}
              </span>
            </div>

            {/* Impact Metric Badge */}
            <div className="mt-3.5">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
                <span className="truncate">{t.highlightMetric}</span>
              </span>
            </div>

            {/* Quote */}
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              &ldquo;{t.quote}&rdquo;
            </p>
          </div>

          {/* Author Block */}
          <div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-4">
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white shadow-sm ${t.avatarColor}`}
            >
              {t.avatarText}
            </span>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-foreground truncate">{t.name}</h4>
              <p className="text-[11px] text-muted-foreground truncate">{t.role}</p>
              <p className="text-[10px] font-mono text-primary-600 dark:text-primary-400 truncate">
                {t.org}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TestimonialSection;
