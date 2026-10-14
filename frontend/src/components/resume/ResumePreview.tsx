"use client";

import type { ResumeContent, ResumeCustomization } from "@/lib/types.resume";
import { getTemplate, templateStyle, DEFAULT_SECTION_ORDER } from "@/lib/resume-templates";

interface Props {
  content: ResumeContent;
  templateId: string;
  customization?: ResumeCustomization | null;
  forPrint?: boolean;
}

function SectionTitle({ children, layout }: { children: React.ReactNode; layout: string }) {
  if (layout === "ruled") {
    return (
      <h2 className="resume-h resume-h-ruled">
        <span style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>{children}</span>
      </h2>
    );
  }
  if (layout === "executive") {
    return (
      <h2 className="resume-h resume-h-exec" style={{ borderColor: "var(--accent)" }}>
        <span className="resume-h-exec-bar" style={{ background: "var(--accent)" }} />
        {children}
      </h2>
    );
  }
  return (
    <h2 className="resume-h" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
      {children}
    </h2>
  );
}

const GENERIC_LABELS: Record<string, string> = {
  certifications: "Certifications & Courses",
  awards: "Awards & Achievements",
  volunteer: "Volunteer Experience",
  publications: "Publications",
};

function ContactLine({ content }: { content: ResumeContent }) {
  const pp = content.personal;
  const bits = [pp.email, pp.phone, pp.location, pp.linkedin, pp.github, pp.portfolio].filter(Boolean);
  return <p className="resume-contact">{bits.join("  •  ")}</p>;
}

export function ResumePreview({ content, templateId, customization, forPrint }: Props) {
  const t = getTemplate(templateId);
  const order = (content.sectionOrder?.length ? content.sectionOrder : DEFAULT_SECTION_ORDER).filter(Boolean);
  const summary = content.summary || content.personal.summary;
  const p = content.personal;

  const renderSection = (key: string) => {
    switch (key) {
      case "summary":
        if (!summary) return null;
        return (
          <section key={key}>
            <SectionTitle layout={t.layout}>Professional Summary</SectionTitle>
            <p className="resume-p">{summary}</p>
          </section>
        );
      case "experience":
        if (!content.experience.length) return null;
        return (
          <section key={key}>
            <SectionTitle layout={t.layout}>Work Experience</SectionTitle>
            {content.experience.map((e, i) => (
              <div key={e.id ?? i} className="resume-item">
                <div className="resume-row">
                  <strong>{e.jobTitle}</strong>
                  <span>{e.startDate}{e.startDate || e.endDate ? " – " : ""}{e.current ? "Present" : e.endDate}</span>
                </div>
                <div className="resume-row resume-sub">
                  <span>{e.company}{e.location ? ` • ${e.location}` : ""}</span>
                </div>
                <ul className="resume-list">
                  {e.bullets.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                </ul>
              </div>
            ))}
          </section>
        );
      case "skills":
        if (!content.skillGroups.length) return null;
        return (
          <section key={key}>
            <SectionTitle layout={t.layout}>Skills</SectionTitle>
            {content.skillGroups.map((g, i) => (
              <p key={g.id ?? i} className="resume-p">
                <strong>{g.category}: </strong>{g.skills.join(", ")}
              </p>
            ))}
          </section>
        );
      case "projects":
        if (!content.projects.length) return null;
        return (
          <section key={key}>
            <SectionTitle layout={t.layout}>Projects</SectionTitle>
            {content.projects.map((pr, i) => (
              <div key={pr.id ?? i} className="resume-item">
                <div className="resume-row">
                  <strong>{pr.name}</strong>
                  <span>{pr.technologies.join(" • ")}</span>
                </div>
                {pr.description ? <p className="resume-p">{pr.description}</p> : null}
                {pr.outcomes ? <p className="resume-p"><em>{pr.outcomes}</em></p> : null}
              </div>
            ))}
          </section>
        );
      case "education":
        if (!content.education.length) return null;
        return (
          <section key={key}>
            <SectionTitle layout={t.layout}>Education</SectionTitle>
            {content.education.map((ed, i) => (
              <div key={ed.id ?? i} className="resume-item">
                <div className="resume-row">
                  <strong>{ed.institution}</strong>
                  <span>{ed.graduationDate}{ed.gpa ? ` • GPA ${ed.gpa}` : ""}</span>
                </div>
                <p className="resume-p">{[ed.degree, ed.field].filter(Boolean).join(" in ")}</p>
              </div>
            ))}
          </section>
        );
      case "certifications":
      case "awards":
      case "volunteer":
      case "publications":
        return renderGeneric(content, key as "certifications" | "awards" | "volunteer" | "publications", GENERIC_LABELS[key]!, t.layout);
      case "languages":
        if (!content.languages.length) return null;
        return (
          <section key={key}>
            <SectionTitle layout={t.layout}>Languages</SectionTitle>
            <p className="resume-p">{content.languages.map((l) => `${l.language}${l.proficiency ? ` (${l.proficiency})` : ""}`).join("  •  ")}</p>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`resume-doc layout-${t.layout}${forPrint ? " for-print" : ""}`}
      style={templateStyle(t, customization)}
    >
      <header className="resume-header">
        <h1>{p.fullName || "Your Name"}</h1>
        {p.title ? <p className="resume-title">{p.title}</p> : null}
        <ContactLine content={content} />
      </header>
      {order.map(renderSection)}
    </div>
  );
}

function renderGeneric(content: ResumeContent, key: "certifications" | "awards" | "volunteer" | "publications", label: string, layout: string) {
  const items = content[key];
  if (!items.length) return null;
  return (
    <section key={key}>
      <SectionTitle layout={layout}>{label}</SectionTitle>
      {items.map((it, i) => (
        <div key={it.id ?? i} className="resume-item">
          <div className="resume-row">
            <strong>{it.title}</strong>
            <span>{[it.issuer, it.date].filter(Boolean).join(" • ")}</span>
          </div>
          {it.description ? <p className="resume-p">{it.description}</p> : null}
          {it.url ? <p className="resume-p resume-sub">{it.url}</p> : null}
        </div>
      ))}
    </section>
  );
}

export default ResumePreview;
