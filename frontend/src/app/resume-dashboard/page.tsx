"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Copy, FileText, LayoutTemplate, Pencil, Plus, ScanSearch, Search, Trash2 } from "lucide-react";
import { Card, CardBody, PageHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Primitives";
import { cn, formatDateTime } from "@/lib/utils";
import { getTemplate } from "@/lib/resume-templates";
import type { ResumeStatus } from "@/lib/types.resume";
import { useAnalyses, useDeleteResume, useDuplicateResume, useResumes } from "@/hooks/useResumes";

const STATUS_FILTERS: { key: ResumeStatus | "ALL"; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "DRAFT", label: "Drafts" },
  { key: "PUBLISHED", label: "Published" },
  { key: "ARCHIVED", label: "Archived" },
];

const STATUS_TONE: Record<ResumeStatus, "gray" | "green" | "slate"> = {
  DRAFT: "gray",
  PUBLISHED: "green",
  ARCHIVED: "slate",
};

export default function ResumeDashboardPage() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [status, setStatus] = useState<ResumeStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const params = useMemo(
    () => ({ page, limit: 12, ...(debouncedQ ? { q: debouncedQ } : {}), ...(status !== "ALL" ? { status } : {}) }),
    [page, debouncedQ, status],
  );
  const resumesQuery = useResumes(params);
  const analysesQuery = useAnalyses({ limit: 5 });
  const duplicate = useDuplicateResume();
  const remove = useDeleteResume();

  const resumes = resumesQuery.data?.data ?? [];
  const meta = resumesQuery.data?.meta;
  const analyses = analysesQuery.data?.data ?? [];

  const search = (value: string) => {
    setQ(value);
    setPage(1);
    window.clearTimeout((search as unknown as { t?: number }).t);
    (search as unknown as { t?: number }).t = window.setTimeout(() => setDebouncedQ(value), 350);
  };

  const onDelete = (id: string, title: string) => {
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return;
    remove.mutate(id);
  };

  const onDuplicate = (id: string) => duplicate.mutate({ id });

  return (
    <>
      <PageHeader
        title="Resume dashboard"
        subtitle="Every resume and analysis in one place — edit, duplicate, score or export."
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/resume-templates"><LayoutTemplate className="size-4" /> Templates</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/resume-analyzer"><ScanSearch className="size-4" /> Analyze</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/resume-builder/new"><Plus className="size-4" /> New resume</Link>
            </Button>
          </>
        }
      />

      {/* ------------- filters ------------- */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => search(e.target.value)} placeholder="Search resumes…" className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => { setStatus(f.key); setPage(1); }}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium",
                status === f.key ? "border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300" : "border-border text-muted-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ------------- resumes grid ------------- */}
      {resumesQuery.isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : !resumes.length ? (
        <Card>
          <CardBody className="py-14 text-center">
            <FileText className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="font-semibold">No resumes yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Start from a template — it takes about a minute.</p>
            <Button asChild className="mt-4"><Link href="/resume-builder/new">Create your first resume</Link></Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {resumes.map((r) => {
            const t = getTemplate(r.templateId);
            return (
              <Card key={r.id}>
                <CardBody className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{r.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {r.targetRole ?? "No target role"} · {t.name}
                      </p>
                    </div>
                    <Badge tone={STATUS_TONE[r.status]} size="sm">{r.status}</Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Badge tone={r.latestScore == null ? "gray" : r.latestScore >= 80 ? "green" : r.latestScore >= 60 ? "amber" : "red"} size="sm">
                      {r.latestScore == null ? "Not analyzed" : `Score ${r.latestScore}`}
                    </Badge>
                    {r.lastAnalyzedAt ? (
                      <span className="text-xs text-muted-foreground">analyzed {formatDateTime(r.lastAnalyzedAt)}</span>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/resume-builder/${r.id}/edit`}><Pencil className="size-3.5" /> Edit</Link>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onDuplicate(r.id)} loading={duplicate.isPending && duplicate.variables?.id === r.id}>
                      <Copy className="size-3.5" /> Duplicate
                    </Button>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/resume-analyzer?resume=${r.id}`}><ScanSearch className="size-3.5" /> Analyze</Link>
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onDelete(r.id, r.title)} loading={remove.isPending && remove.variables === r.id}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {meta && meta.totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Page {meta.page} of {meta.totalPages} · {meta.total} resumes</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button size="sm" variant="outline" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      ) : null}

      {/* ------------- recent analyses ------------- */}
      {analyses.length ? (
        <Card className="mt-6">
          <CardBody className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold">Recent analyses</p>
              <Link className="text-sm text-primary-600 hover:underline" href="/resume-analyzer">View all</Link>
            </div>
            <ul className="divide-y divide-border">
              {analyses.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="flex items-center gap-2">
                    <Badge tone={a.status === "FAILED" ? "red" : a.status === "PENDING" ? "amber" : (a.score ?? 0) >= 80 ? "green" : (a.score ?? 0) >= 60 ? "amber" : "red"} size="sm">
                      {a.score != null ? `${a.score}/100` : a.status}
                    </Badge>
                    <span className="text-muted-foreground">{formatDateTime(a.createdAt)} · {a.source}</span>
                  </span>
                  <Link className="text-primary-600 hover:underline" href={`/resume-analyzer/${a.id}`}>Open report</Link>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      ) : null}
    </>
  );
}
