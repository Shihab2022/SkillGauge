"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardBody, PageHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ALL_TEMPLATES, TEMPLATE_CATEGORY_LIST } from "@/lib/resume-templates";
import { cn } from "@/lib/utils";

export default function TemplateGalleryPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");

  const list = useMemo(() => {
    return ALL_TEMPLATES.filter((t) => {
      if (cat !== "All" && t.category !== cat) return false;
      if (q && !`${t.name} ${t.description}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, cat]);

  return (
    <>
      <PageHeader title="Resume templates" subtitle="20 layouts across 10 categories. Pick one when creating a resume; switch anytime without losing content." />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search templates..." className="sm:max-w-xs" />
        <div className="flex flex-wrap gap-2">
          {["All", ...TEMPLATE_CATEGORY_LIST].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium",
                cat === c ? "border-primary-600 bg-primary-50 text-primary-700" : "border-border text-muted-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((t) => (
          <Card key={t.id}>
            <CardBody className="p-4">
              <div className="mb-3 h-44 rounded-lg border border-border bg-white p-4 dark:bg-slate-950" style={{ fontFamily: t.font === "serif" ? "Georgia, serif" : undefined }}>
                <div className="h-3 w-1/2 rounded-sm" style={{ background: t.accent }} />
                <div className="mt-1 text-[10px] font-bold text-slate-800 dark:text-slate-200">Jane Cooper</div>
                <div className="mt-2 h-1.5 w-full rounded bg-slate-200 dark:bg-slate-800" />
                <div className="mt-1 h-1.5 w-11/12 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="mt-2 h-1.5 w-1/3 rounded" style={{ background: `${t.accent}55` }} />
                <div className="mt-1 h-1.5 w-full rounded bg-slate-200 dark:bg-slate-800" />
                <div className="mt-1 h-1.5 w-10/12 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{t.name}</p>
                <Badge tone={t.atsSafe ? "green" : "amber"} size="sm">{t.atsSafe ? "ATS-safe" : "Creative"}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
              {!t.atsSafe && t.atsNote ? <p className="mt-1 text-xs text-amber-600">{t.atsNote}</p> : null}
              <Button asChild size="sm" variant="outline" className="mt-3 w-full">
                <Link href={`/resume-builder/new?template=${t.id}`}>Use this template</Link>
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>
      {!list.length ? <p className="mt-6 text-center text-sm text-muted-foreground">No templates match your filters.</p> : null}
    </>
  );
}
