import { ResumeShell } from "@/components/resume/ResumeShell";

export default function ResumeTemplatesLayout({ children }: { children: React.ReactNode }) {
  return <ResumeShell>{children}</ResumeShell>;
}