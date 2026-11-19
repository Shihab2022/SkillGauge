"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Building2, GraduationCap, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LANDING_AUDIENCES } from "@/lib/marketing";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  companies: Building2,
  institutes: GraduationCap,
  candidates: UserRound,
};

export function AudienceTabs() {
  const [active, setActive] = useState(LANDING_AUDIENCES[0]!.id);
  const audience = LANDING_AUDIENCES.find((item) => item.id === active) ?? LANDING_AUDIENCES[0]!;

  return (
    <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-card">
      {/* Switcher Tab Strip */}
      <div
        role="tablist"
        aria-label="Target Audience Switcher"
        className="flex flex-wrap gap-1.5 border-b border-border/70 bg-muted/30 p-2 sm:p-2.5"
      >
        {LANDING_AUDIENCES.map((item) => {
          const Icon = ICON_MAP[item.id] ?? UserRound;
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              role="tab"
              type="button"
              aria-selected={selected}
              onClick={() => setActive(item.id)}
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all",
                selected
                  ? "bg-card text-foreground shadow-sm border border-border/80"
                  : "text-muted-foreground hover:bg-card/50 hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  item.kind === "B2B"
                    ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20"
                    : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20",
                )}
              >
                {item.kind}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Body */}
      <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone={audience.kind === "B2B" ? "indigo" : "green"} size="sm">
              {audience.kind}
            </Badge>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {audience.kind === "B2B" ? "For Teams & Organisations" : "For Individual Developers"}
            </span>
          </div>

          <h3 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {audience.headline}
          </h3>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {audience.description}
          </p>

          <div className="mt-8">
            <Button asChild size="lg" className="shadow-sm">
              <Link href={audience.cta.href}>
                {audience.cta.label}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Feature List */}
        <div className="rounded-2xl border border-border/70 bg-muted/20 p-5 sm:p-6">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            What You Get
          </span>
          <ul className="mt-4 space-y-3">
            {audience.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3 text-xs sm:text-sm text-foreground">
                <span className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3.5" />
                </span>
                <span className="leading-relaxed text-muted-foreground">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AudienceTabs;
