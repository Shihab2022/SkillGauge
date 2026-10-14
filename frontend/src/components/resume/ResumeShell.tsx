import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";

/**
 * Public marketing chrome (header + footer) for the login-free resume suite.
 * Mirrors `ExamShell` — the resume builder, templates, analyzer and dashboard
 * are all reachable without an account.
 */
export function ResumeShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 pb-16">
        <div className="container py-8">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}