"use client";

import Link from "next/link";
import { FileText, LayoutTemplate, ScanSearch, Briefcase, Sparkles, Download } from "lucide-react";
import { Card, CardBody, PageHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useResumes, useAnalyses } from "@/hooks/useResumes";

const FEATURES = [
  { icon: FileText, title: "Guided builder", text: "Personal info, experience, education, skills, projects and more with autosave." },
  { icon: LayoutTemplate, title: "20 templates", text: "Classic, modern, minimalist, executive, technical and ATS-safe layouts." },
  { icon: Download, title: "A4 PDF export", text: "Print-ready 210 x 297 mm PDFs with selectable text." },
  { icon: ScanSearch, title: "AI ATS analysis", text: "0-100 score, keyword gaps, section feedback and action plan." },
  { icon: Briefcase, title: "Job matching", text: "Compare your resume against any job description." },
  { icon: Sparkles, title: "AI assistant", text: "Improve bullets and summaries with accept/reject review." },
];

export default function ResumeBuilderHome() {
  const { data: resumes } = useResumes({ limit: 5 });
  const { data: analyses } = useAnalyses({ limit: 5 });

  return (
    <>
      <PageHeader
        title="AI Resume Builder & ATS Analyzer"
        description="Create professional resumes, export A4 PDFs, and optimize for applicant tracking systems."
      />
      <div className="mb-6 flex flex-wrap gap-3">
        <Button asChild><Link href="/resume-builder/new">Create resume</Link></Button>
        <Button asChild variant="outline"><Link href="/resume-templates">Browse templates</Link></Button>
        <Button asChild variant="outline"><Link href="/resume-analyzer">Analyze resume</Link></Button>
        <Button asChild variant="ghost"><Link href="/resume-dashboard">My dashboard</Link></Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardBody className="p-5">
            <p className="mb-2 font-semibold">Recent resumes</p>
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
            <p className="mb-2 font-semibold">Recent analyses</p>
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
