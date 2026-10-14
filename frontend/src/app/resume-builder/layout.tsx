import type { Metadata } from "next";
import { ResumeShell } from "@/components/resume/ResumeShell";

export const metadata: Metadata = {
  title: "Resume Builder & ATS Analyzer",
  description: "Build professional resumes, export A4 PDFs, and analyze ATS compatibility with AI — no login required.",
};

export default function ResumeBuilderLayout({ children }: { children: React.ReactNode }) {
  return <ResumeShell>{children}</ResumeShell>;
}
