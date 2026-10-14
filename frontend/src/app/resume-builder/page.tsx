"use client";

import Link from "next/link";
import {
  FileText, LayoutTemplate, ScanSearch, Briefcase, Sparkles, Download,
  ArrowRight, Pencil, BarChart3,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useResumes, useAnalyses } from "@/hooks/useResumes";
import { useCurrentUser } from "@/store/auth";

const FEATURES = [
  { icon: FileText, title: "Guided builder", text: "Personal info, experience, education, skills, projects and more with autosave." },
  { icon: LayoutTemplate, title: "20 templates", text: "Classic, modern, minimalist, executive, technical and ATS-safe layouts." },
  { icon: Download, title: "A4 PDF export", text: "Print-ready 210 x 297 mm PDFs with selectable text." },
  { icon: ScanSearch, title: "AI ATS analysis", text: "0-100 score, keyword gaps, section feedback and action plan." },
  { icon: Briefcase, title: "Job matching", text: "Compare your resume against any job description." },
  { icon: Sparkles, title: "AI assistant", text: "Improve bullets and summaries with accept/reject review." },
];

/** The four individual tools this hub routes into. */
const TOOLS = [
  {
    href: "/resume-builder/new",
    icon: Pencil,
    title: "Build a resume",
    text: "Start from a template and fill in sections with live A4 preview and autosave.",
    cta: "Open builder",
  },
  {
    href: "/resume-templates",
    icon: LayoutTemplate,
    title: "Browse templates",
    text: "20 layouts across 10 categories — every one switches without losing content.",
    cta: "View gallery",
  },
  {
    href: "/resume-analyzer",
    icon: ScanSearch,
    title: "ATS analyzer",
    text: "Score any resume 0–100, spot keyword gaps and match it to a job description.",
    cta: "Analyze now",
  },
  {
    href: "/resume-dashboard",
    icon: BarChart3,
    title: "My dashboard",
    text: "Every resume and analysis in one place — edit, duplicate, re-score or export.",
    cta: "Open dashboard",
  },
];

export default function ResumeBuilderHome() {
  const user = useCurrentUser();
  const { data: resumes } = useResumes({ limit: 5 });
  const { data: analyses } = useAnalyses({ limit: 5 });

  return (
    <>
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          AI Resume Builder &amp; ATS Analyzer
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Create professional resumes, export A4 PDFs and optimize for applicant tracking systems —
          completely free, no account required. Your work is saved privately in this browser.
        </p>
        {!user ? (
          <div className="mt-5">
            <Badge tone="green" size="md">
              <Sparkles className="size-3" /> Works without login
            </Badge>
          </div>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg"><Link href="/resume-builder/new">Create resume</Link></Button>
          <Button asChild size="lg" variant="outline"><Link href="/resume-templates">Browse templates</Link></Button>
          <Button asChild size="lg" variant="outline"><Link href="/resume-analyzer">Analyze resume</Link></Button>
        </div>
      </div>

      {/* -------- individual tools -------- */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TOOLS.map((tool) => (
          <Card key={tool.href} className="group transition-shadow hover:shadow-pop">
            <CardBody className="flex h-full flex-col p-5">
              <tool.icon className="mb-3 size-6 text-primary-600" />
              <p className="font-semibold text-foreground">{tool.title}</p>
              <p className="mb-4 mt-1 flex-1 text-sm text-muted-foreground">{tool.text}</p>
              <Link
                href={tool.href}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:underline"
              >
                {tool.cta} <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </CardBody>
          </Card>
        ))}
      </div>
      {/* -------- capability details -------- */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <Card key={f.title}>
            <CardBody className="p-5">
              <f.icon className="mb-2 size-5 text-primary-600" />
              <p className="font-semibold text-foreground">{f.title}</p>
              <p className="text-sm text-muted-foreground">{f.text}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* -------- recent activity (this browser / your account) -------- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardBody className="p-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold">Recent resumes</p>
              <Link className="text-sm text-primary-600 hover:underline" href="/resume-dashboard">View all</Link>
            </div>
            {!resumes?.data?.length ? (
              <p className="text-sm text-muted-foreground">No resumes yet — create your first one.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {resumes.data.map((r) => (
                  <li key={r.id} className="flex items-center justify-between">
                    <span className="font-medium">{r.title}</span>
                    <Link className="text-primary-600 hover:underline" href={`/resume-builder/${r.id}/edit`}>Edit</Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold">Recent analyses</p>
              <Link className="text-sm text-primary-600 hover:underline" href="/resume-analyzer">Analyze another</Link>
            </div>
            {!analyses?.data?.length ? (
              <p className="text-sm text-muted-foreground">No analyses yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {analyses.data.map((a) => (
                  <li key={a.id} className="flex items-center justify-between">
                    <span>Score: <strong>{a.score ?? "—"}</strong></span>
                    <Link className="text-primary-600 hover:underline" href={`/resume-analyzer/${a.id}`}>View</Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}

