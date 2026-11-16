"use client";

import type { ResumeContent, ResumeCustomization } from "@/lib/types.resume";
import { getTemplate, templateStyle, DEFAULT_SECTION_ORDER } from "@/lib/resume-templates";
import { ExternalLink, Github, Globe, Mail, MapPin, Phone, Linkedin } from "lucide-react";

interface Props {
  content: ResumeContent;
  templateId: string;
  customization?: ResumeCustomization | null;
  forPrint?: boolean;
}

function SectionTitle({
  children,
  layout,
  customization,
}: {
  children: React.ReactNode;
  layout: string;
  customization?: ResumeCustomization | null;
}) {
  const lineStyle = customization?.lineStyle ?? (layout === "borderless" ? "none" : "solid");
  const thickness = customization?.lineThickness === "thick" ? "2.5px" : customization?.lineThickness === "thin" ? "1px" : "1.5px";
  const headerStyle = customization?.headerStyle ?? (layout === "executive" ? "left-bar" : layout === "ruled" ? "underlined" : "underlined");

  if (layout === "borderless" || lineStyle === "none") {
    return (
      <h2
        className="resume-h"
        style={{
          border: "none",
          paddingBottom: "2px",
          color: "var(--accent)",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          fontSize: "13px",
          fontWeight: 700,
        }}
      >
        {children}
      </h2>
    );
  }

  if (headerStyle === "left-bar" || layout === "executive") {
    return (
      <h2
        className="resume-h resume-h-exec"
        style={{
          borderBottom: `${thickness} ${lineStyle} var(--accent)`,
        }}
      >
        <span className="resume-h-exec-bar" style={{ background: "var(--accent)" }} />
        {children}
      </h2>
    );
  }

  if (headerStyle === "badge") {
    return (
      <h2 className="resume-h" style={{ border: "none", margin: "12px 0 6px 0" }}>
        <span
          style={{
            background: "var(--accent)",
            color: "#ffffff",
            padding: "2px 8px",
            borderRadius: "4px",
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {children}
        </span>
      </h2>
    );
  }

  if (headerStyle === "top-bottom") {
    return (
      <h2
        className="resume-h"
        style={{
          borderTop: `${thickness} ${lineStyle} var(--accent)`,
          borderBottom: `${thickness} ${lineStyle} var(--accent)`,
          color: "var(--accent)",
          padding: "3px 0",
        }}
      >
        {children}
      </h2>
    );
  }

  if (layout === "ruled" || headerStyle === "underlined") {
    return (
      <h2 className="resume-h resume-h-ruled">
        <span
          style={{
            borderBottom: `${thickness} ${lineStyle} var(--accent)`,
            color: "var(--accent)",
          }}
        >
          {children}
        </span>
      </h2>
    );
  }

  return (
    <h2
      className="resume-h"
      style={{
        borderBottom: `${thickness} ${lineStyle} var(--accent)`,
        color: "var(--accent)",
      }}
    >
      {children}
    </h2>
  );
}

const DEFAULT_SECTION_TITLES: Record<string, string> = {
  summary: "Professional Summary",
  experience: "Work Experience",
  skills: "Technical Skills",
  projects: "Applied Projects",
  education: "Education",
  certifications: "Certifications & Credentials",
  languages: "Languages",
  awards: "Awards & Honors",
  volunteer: "Volunteer Experience",
  publications: "Publications",
};

function ContactLine({ content }: { content: ResumeContent }) {
  const pp = content.personal;
  const items: React.ReactNode[] = [];

  if (pp.email) {
    items.push(
      <span key="email" className="inline-flex items-center gap-1">
        <Mail className="size-3 shrink-0 opacity-70" />
        <a href={`mailto:${pp.email}`} className="hover:underline">
          {pp.email}
        </a>
      </span>
    );
  }
  if (pp.phone) {
    items.push(
      <span key="phone" className="inline-flex items-center gap-1">
        <Phone className="size-3 shrink-0 opacity-70" />
        <span>{pp.phone}</span>
      </span>
    );
  }
  if (pp.location) {
    items.push(
      <span key="loc" className="inline-flex items-center gap-1">
        <MapPin className="size-3 shrink-0 opacity-70" />
        <span>{pp.location}</span>
      </span>
    );
  }
  if (pp.linkedin) {
    const clean = pp.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, "");
    items.push(
      <span key="linkedin" className="inline-flex items-center gap-1">
        <Linkedin className="size-3 shrink-0 opacity-70" />
        <a
          href={pp.linkedin.startsWith("http") ? pp.linkedin : `https://${pp.linkedin}`}
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
        >
          {clean || "LinkedIn"}
        </a>
      </span>
    );
  }
  if (pp.github) {
    const clean = pp.github.replace(/^https?:\/\/(www\.)?github\.com\//i, "");
    items.push(
      <span key="github" className="inline-flex items-center gap-1">
        <Github className="size-3 shrink-0 opacity-70" />
        <a
          href={pp.github.startsWith("http") ? pp.github : `https://${pp.github}`}
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
        >
          {clean || "GitHub"}
        </a>
      </span>
    );
  }
  if (pp.portfolio) {
    const clean = pp.portfolio.replace(/^https?:\/\/(www\.)?/i, "");
    items.push(
      <span key="portfolio" className="inline-flex items-center gap-1">
        <Globe className="size-3 shrink-0 opacity-70" />
        <a
          href={pp.portfolio.startsWith("http") ? pp.portfolio : `https://${pp.portfolio}`}
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
        >
          {clean || "Portfolio"}
        </a>
      </span>
    );
  }

  if (!items.length) return null;

  return (
    <div className="resume-contact flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs">
      {items.map((node, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          {node}
          {i < items.length - 1 && <span className="opacity-40">•</span>}
        </span>
      ))}
    </div>
  );
}

export function ResumePreview({ content, templateId, customization, forPrint }: Props) {
  const t = getTemplate(templateId);
  const order = (content.sectionOrder?.length ? content.sectionOrder : DEFAULT_SECTION_ORDER).filter(Boolean);
  const summary = content.summary || content.personal.summary;
  const p = content.personal;
  const titles = customization?.sectionTitles ?? {};
  const isCards = t.layout === "cards" || customization?.showBorders;
  const photoUrl = customization?.photoUrl;
  const photoShape = customization?.photoShape ?? "circle";

  const getTitle = (key: string) => titles[key] || DEFAULT_SECTION_TITLES[key] || key;

  const renderSection = (key: string) => {
    switch (key) {
      case "summary":
        if (!summary) return null;
        return (
          <section key={key} style={{ marginBottom: "var(--section-gap, 14px)" }}>
            <SectionTitle layout={t.layout} customization={customization}>
              {getTitle(key)}
            </SectionTitle>
            <p className="resume-p">{summary}</p>
          </section>
        );

      case "experience":
        if (!content.experience.length) return null;
        return (
          <section key={key} style={{ marginBottom: "var(--section-gap, 14px)" }}>
            <SectionTitle layout={t.layout} customization={customization}>
              {getTitle(key)}
            </SectionTitle>
            {content.experience.map((e, i) => (
              <div
                key={e.id ?? i}
                className={`resume-item ${isCards ? "rounded-lg border border-border/80 bg-background/50 p-3 shadow-xs mb-3" : ""}`}
              >
                <div className="resume-row">
                  <strong>{e.jobTitle}</strong>
                  <span>
                    {e.startDate}
                    {e.startDate || e.endDate ? " – " : ""}
                    {e.current ? "Present" : e.endDate}
                  </span>
                </div>
                <div className="resume-row resume-sub">
                  <span>
                    {e.company}
                    {e.location ? ` • ${e.location}` : ""}
                  </span>
                </div>
                <ul className="resume-list">
                  {e.bullets.filter(Boolean).map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        );

      case "skills":
        if (!content.skillGroups.length) return null;
        return (
          <section key={key} style={{ marginBottom: "var(--section-gap, 14px)" }}>
            <SectionTitle layout={t.layout} customization={customization}>
              {getTitle(key)}
            </SectionTitle>
            {content.skillGroups.map((g, i) => (
              <p key={g.id ?? i} className="resume-p">
                <strong>{g.category}: </strong>
                {g.skills.join(", ")}
              </p>
            ))}
          </section>
        );

      case "projects":
        if (!content.projects.length) return null;
        return (
          <section key={key} style={{ marginBottom: "var(--section-gap, 14px)" }}>
            <SectionTitle layout={t.layout} customization={customization}>
              {getTitle(key)}
            </SectionTitle>
            {content.projects.map((pr, i) => {
              const techPos = pr.techPosition ?? "inline";
              return (
                <div
                  key={pr.id ?? i}
                  className={`resume-item ${isCards ? "rounded-lg border border-border/80 bg-background/50 p-3 shadow-xs mb-3" : ""}`}
                >
                  <div className="resume-row flex items-baseline justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {pr.icon && <span className="text-sm shrink-0">{pr.icon}</span>}
                      <strong>{pr.name}</strong>
                      {pr.url && (
                        <a
                          href={pr.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-0.5 text-xs text-primary-600 hover:underline font-medium"
                          title="Live Project URL"
                        >
                          <ExternalLink className="size-2.5" /> Live
                        </a>
                      )}
                      {pr.githubUrl && (
                        <a
                          href={pr.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground hover:underline"
                          title="Source Code"
                        >
                          <Github className="size-2.5" /> Code
                        </a>
                      )}
                    </div>

                    {techPos === "right" && pr.technologies.length > 0 && (
                      <span className="text-xs text-muted-foreground text-right shrink-0">
                        {pr.technologies.join(" • ")}
                      </span>
                    )}
                  </div>

                  {techPos === "inline" && pr.technologies.length > 0 && (
                    <p className="resume-sub text-xs text-muted-foreground" style={{ marginTop: "1px" }}>
                      {pr.technologies.join(" • ")}
                    </p>
                  )}

                  {pr.description ? (
                    pr.descriptionType === "bullets" ? (
                      <ul className="resume-list">
                        {pr.description
                          .split("\n")
                          .map((l) => l.trim())
                          .filter(Boolean)
                          .map((line, li) => (
                            <li key={li}>{line.replace(/^[•\-\*]\s*/, "")}</li>
                          ))}
                      </ul>
                    ) : (
                      <p className="resume-p">{pr.description}</p>
                    )
                  ) : null}

                  {techPos === "bottom" && pr.technologies.length > 0 && (
                    <p className="resume-p resume-sub text-xs" style={{ marginTop: "2px" }}>
                      <strong>Technologies: </strong>
                      {pr.technologies.join(", ")}
                    </p>
                  )}

                  {pr.outcomes ? (
                    <p className="resume-p text-xs italic opacity-90 mt-0.5">{pr.outcomes}</p>
                  ) : null}
                </div>
              );
            })}
          </section>
        );

      case "education":
        if (!content.education.length) return null;
        return (
          <section key={key} style={{ marginBottom: "var(--section-gap, 14px)" }}>
            <SectionTitle layout={t.layout} customization={customization}>
              {getTitle(key)}
            </SectionTitle>
            {content.education.map((ed, i) => (
              <div
                key={ed.id ?? i}
                className={`resume-item ${isCards ? "rounded-lg border border-border/80 bg-background/50 p-3 shadow-xs mb-3" : ""}`}
              >
                <div className="resume-row">
                  <strong>{ed.institution}</strong>
                  <span>
                    {ed.graduationDate}
                    {ed.gpa ? ` • GPA ${ed.gpa}` : ""}
                  </span>
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
        return renderGeneric(
          content,
          key as "certifications" | "awards" | "volunteer" | "publications",
          getTitle(key),
          t.layout,
          customization,
          isCards
        );

      case "languages":
        if (!content.languages.length) return null;
        return (
          <section key={key} style={{ marginBottom: "var(--section-gap, 14px)" }}>
            <SectionTitle layout={t.layout} customization={customization}>
              {getTitle(key)}
            </SectionTitle>
            <p className="resume-p">
              {content.languages
                .map((l) => `${l.language}${l.proficiency ? ` (${l.proficiency})` : ""}`)
                .join("  •  ")}
            </p>
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
      <header className={`resume-header ${photoUrl || t.layout === "photo" ? "flex items-center gap-4" : ""}`}>
        {(photoUrl || t.layout === "photo") && (
          <div className="shrink-0">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={p.fullName || "Profile"}
                className={`size-20 object-cover border-2 shadow-sm ${
                  photoShape === "circle"
                    ? "rounded-full"
                    : photoShape === "square"
                    ? "rounded-none"
                    : "rounded-xl"
                }`}
                style={{ borderColor: "var(--accent)" }}
              />
            ) : (
              <div
                className={`size-20 bg-muted/60 border-2 border-dashed flex items-center justify-center text-xs text-muted-foreground ${
                  photoShape === "circle" ? "rounded-full" : "rounded-xl"
                }`}
                style={{ borderColor: "var(--accent)" }}
              >
                Photo
              </div>
            )}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h1>{p.fullName || "Your Name"}</h1>
          {p.title ? <p className="resume-title">{p.title}</p> : null}
          <ContactLine content={content} />
        </div>
      </header>

      {order.map(renderSection)}
    </div>
  );
}

function renderGeneric(
  content: ResumeContent,
  key: "certifications" | "awards" | "volunteer" | "publications",
  label: string,
  layout: string,
  customization?: ResumeCustomization | null,
  isCards?: boolean
) {
  const items = content[key];
  if (!items.length) return null;
  return (
    <section key={key} style={{ marginBottom: "var(--section-gap, 14px)" }}>
      <SectionTitle layout={layout} customization={customization}>
        {label}
      </SectionTitle>
      {items.map((it, i) => (
        <div
          key={it.id ?? i}
          className={`resume-item ${isCards ? "rounded-lg border border-border/80 bg-background/50 p-3 shadow-xs mb-3" : ""}`}
        >
          <div className="resume-row">
            <strong>{it.title}</strong>
            <span>{[it.issuer, it.date].filter(Boolean).join(" • ")}</span>
          </div>
          {it.description ? <p className="resume-p">{it.description}</p> : null}
          {it.url ? (
            <p className="resume-p resume-sub">
              <a href={it.url} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">
                {it.url}
              </a>
            </p>
          ) : null}
        </div>
      ))}
    </section>
  );
}

export default ResumePreview;
