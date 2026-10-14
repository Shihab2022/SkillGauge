import type { Metadata } from "next";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Resume Builder & ATS Analyzer",
  description: "Build professional resumes, export A4 PDFs, and analyze ATS compatibility with AI.",
};

export default function ResumeBuilderLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard>
      <AppShell>{children}</AppShell>
    </RoleGuard>
  );
}
