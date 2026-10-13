import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume Builder & ATS Analyzer",
  description: "Build professional resumes, export A4 PDFs, and analyze ATS compatibility with AI.",
};

export default function ResumeBuilderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
