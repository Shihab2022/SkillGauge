"use client";

import type { ResumeContent, ResumeCustomization } from "@/lib/types.resume";
import { getTemplate, templateStyle, DEFAULT_SECTION_ORDER } from "@/lib/resume-templates";
import { normalizeImageUrl, normalizeLinkUrl, formatDisplayUrl } from "@/lib/url-utils";
import { ExternalLink, Github, Globe, Mail, MapPin, Phone, Linkedin, Award, Briefcase, GraduationCap, Code } from "lucide-react";
import { useState } from "react";

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
            padding: "3px 10px",
            borderRadius: "4px",
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            display: "inline-block",
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
        <a href={`mailto:${pp.email.trim()}`} className="hover:underline">
          {pp.email.trim()}
        </a>
      </span>
    );
  }
  if (pp.phone) {
    items.push(
      <span key="phone" className="inline-flex items-center gap-1">
        <Phone className="size-3 shrink-0 opacity-70" />
        <a href={`tel:${pp.phone.replace(/[^0-9+]/g, "")}`} className="hover:underline">
          {pp.phone.trim()}
        </a>
      </span>
    );
  }
  if (pp.location) {
    items.push(
      <span key="loc" className="inline-flex items-center gap-1">
        <MapPin className="size-3 shrink-0 opacity-70" />
        <span>{pp.location.trim()}</span>
      </span>
    );
  }
  if (pp.linkedin) {
    const clean = formatDisplayUrl(pp.linkedin).replace(/^linkedin\.com\/in\//i, "");
    items.push(
      <span key="linkedin" className="inline-flex items-center gap-1">
        <Linkedin className="size-3 shrink-0 opacity-70" />
        <a
          href={normalizeLinkUrl(pp.linkedin)}
          target="_blank"
          rel="noreferrer"
          className="hover:underline font-medium"
          title={normalizeLinkUrl(pp.linkedin)}
        >
          {clean || "LinkedIn"}
        </a>
      </span>
    );
  }
  if (pp.github) {
    const clean = formatDisplayUrl(pp.github).replace(/^github\.com\//i, "");
    items.push(
      <span key="github" className="inline-flex items-center gap-1">
        <Github className="size-3 shrink-0 opacity-70" />
        <a
          href={normalizeLinkUrl(pp.github)}
          target="_blank"
          rel="noreferrer"
          className="hover:underline font-medium"
          title={normalizeLinkUrl(pp.github)}
        >
          {clean || "GitHub"}
        </a>
      </span>
    );
  }
  if (pp.portfolio) {
    const clean = formatDisplayUrl(pp.portfolio);
    items.push(
      <span key="portfolio" className="inline-flex items-center gap-1">
        <Globe className="size-3 shrink-0 opacity-70" />
        <a
          href={normalizeLinkUrl(pp.portfolio)}
          target="_blank"
          rel="noreferrer"
          className="hover:underline font-medium"
          title={normalizeLinkUrl(pp.portfolio)}
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
  const rawPhoto = customization?.photoUrl;
  const photoUrl = normalizeImageUrl(rawPhoto);
  const photoShape = customization?.photoShape ?? "circle";
  const [imageError, setImageError] = useState(false);

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
            <p className="resume-p leading-relaxed">{summary}</p>
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
                className={`resume-item ${
                  isCards ? "rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-3 shadow-xs mb-3" : "mb-3"
                }`}
              >
                <div className="resume-row flex items-baseline justify-between gap-2">
                  <strong className="text-foreground text-[13px]">{e.jobTitle}</strong>
                  <span className="text-xs text-muted-foreground font-medium shrink-0">
                    {e.startDate}
                    {e.startDate || e.endDate ? " – " : ""}
                    {e.current ? "Present" : e.endDate}
                  </span>
                </div>
                <div className="resume-row resume-sub text-xs text-muted-foreground mt-0.5">
                  <span className="font-semibold text-foreground/80">
                    {e.company}
                    {e.location ? ` • ${e.location}` : ""}
                  </span>
                </div>
                <ul className="resume-list mt-1.5 space-y-1">
                  {e.bullets.filter(Boolean).map((b, j) => (
                    <li key={j} className="text-xs text-foreground/90 leading-relaxed">
                      {b}
                    </li>
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
            <div className="space-y-2">
              {content.skillGroups.map((g, i) => (
                <div key={g.id ?? i} className="resume-p text-xs leading-relaxed">
                  <strong className="text-foreground mr-1.5">{g.category}:</strong>
                  <div className="inline-flex flex-wrap gap-1 align-baseline">
                    {g.skills.map((s, si) => (
                      <span
                        key={si}
                        className="inline-block rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
              const liveUrl = normalizeLinkUrl(pr.url);
              const gitUrl = normalizeLinkUrl(pr.githubUrl);

              return (
                <div
                  key={pr.id ?? i}
                  className={`resume-item ${
                    isCards ? "rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-3 shadow-xs mb-3" : "mb-3"
                  }`}
                >
                  <div className="resume-row flex flex-wrap items-baseline justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {pr.icon && <span className="text-sm shrink-0">{pr.icon}</span>}
                      <strong className="text-foreground text-[13px]">{pr.name}</strong>

                      {/* Working, Clickable Links with high visibility for PDF & Print */}
                      {liveUrl && (
                        <a
                          href={liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-600 hover:text-primary-700 hover:underline bg-primary-50 dark:bg-primary-950/60 px-2 py-0.5 rounded border border-primary-200 dark:border-primary-800"
                          title={`Live Link: ${liveUrl}`}
                        >
                          <ExternalLink className="size-2.5 shrink-0" /> Live Demo ↗
                        </a>
                      )}
                      {gitUrl && (
                        <a
                          href={gitUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-foreground hover:underline bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700"
                          title={`Repository: ${gitUrl}`}
                        >
                          <Github className="size-2.5 shrink-0" /> GitHub ↗
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
                    <div className="mt-1 flex flex-wrap gap-1">
                      {pr.technologies.map((tech, ti) => (
                        <span
                          key={ti}
                          className="inline-block rounded bg-muted/60 px-1.5 py-0.2 text-[10px] font-medium text-muted-foreground border border-border/50"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {pr.description ? (
                    pr.descriptionType === "bullets" ? (
                      <ul className="resume-list mt-1.5 space-y-0.5">
                        {pr.description
                          .split("\n")
                          .map((l) => l.trim())
                          .filter(Boolean)
                          .map((line, li) => (
                            <li key={li} className="text-xs text-foreground/90 leading-relaxed">
                              {line.replace(/^[•\-\*]\s*/, "")}
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <p className="resume-p text-xs text-foreground/90 mt-1 leading-relaxed">{pr.description}</p>
                    )
                  ) : null}

                  {techPos === "bottom" && pr.technologies.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-1">
                      <span className="text-[11px] font-bold text-foreground">Tech:</span>
                      {pr.technologies.map((tech, ti) => (
                        <span
                          key={ti}
                          className="inline-block rounded bg-muted/60 px-1.5 py-0.2 text-[10px] font-medium text-muted-foreground border border-border/50"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {pr.outcomes ? (
                    <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/60">
                      <span>⚡ Impact:</span>
                      <span>{pr.outcomes}</span>
                    </div>
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
                className={`resume-item ${
                  isCards ? "rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-3 shadow-xs mb-3" : "mb-2"
                }`}
              >
                <div className="resume-row flex items-baseline justify-between gap-2">
                  <strong className="text-foreground text-[13px]">{ed.institution}</strong>
                  <span className="text-xs text-muted-foreground font-medium shrink-0">
                    {ed.graduationDate}
                    {ed.gpa ? ` • GPA ${ed.gpa}` : ""}
                  </span>
                </div>
                <p className="resume-p text-xs text-foreground/80 mt-0.5">
                  {[ed.degree, ed.field].filter(Boolean).join(" in ")}
                </p>
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
            <div className="flex flex-wrap gap-2 text-xs">
              {content.languages.map((l, li) => (
                <span
                  key={li}
                  className="inline-flex items-center gap-1 rounded bg-muted/60 px-2 py-0.5 border border-border/60"
                >
                  <strong className="text-foreground">{l.language}</strong>
                  {l.proficiency && <span className="text-muted-foreground">({l.proficiency})</span>}
                </span>
              ))}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  const isPhotoLayout = Boolean(photoUrl || t.layout === "photo");

  return (
    <div
      className={`resume-doc layout-${t.layout}${forPrint ? " for-print" : ""}`}
      style={templateStyle(t, customization)}
    >
      <header className={`resume-header ${isPhotoLayout ? "flex items-center gap-4" : ""}`}>
        {isPhotoLayout && (
          <div className="shrink-0">
            {photoUrl && !imageError ? (
              <img
                src={photoUrl}
                alt={p.fullName || "Profile"}
                crossOrigin="anonymous"
                onError={() => setImageError(true)}
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
                className={`size-20 bg-muted/60 border-2 border-dashed flex items-center justify-center text-xs font-semibold text-muted-foreground ${
                  photoShape === "circle" ? "rounded-full" : photoShape === "square" ? "rounded-none" : "rounded-xl"
                }`}
                style={{ borderColor: "var(--accent)" }}
              >
                {p.fullName ? p.fullName.charAt(0).toUpperCase() : "Photo"}
              </div>
            )}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h1 className="tracking-tight">{p.fullName || "Your Name"}</h1>
          {p.title ? <p className="resume-title">{p.title}</p> : null}
          <ContactLine content={content} />
        </div>
      </header>

      {/* Render sections in the configured custom order */}
      <div className="resume-body-content">
        {order.map(renderSection)}
      </div>
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
      {items.map((it, i) => {
        const itemUrl = normalizeLinkUrl(it.url);

        return (
          <div
            key={it.id ?? i}
            className={`resume-item ${
              isCards ? "rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-3 shadow-xs mb-3" : "mb-2"
            }`}
          >
            <div className="resume-row flex items-baseline justify-between gap-2">
              <strong className="text-foreground text-[13px]">{it.title}</strong>
              <span className="text-xs text-muted-foreground font-medium shrink-0">
                {[it.issuer, it.date].filter(Boolean).join(" • ")}
              </span>
            </div>
            {it.description ? <p className="resume-p text-xs text-foreground/80 mt-0.5">{it.description}</p> : null}
            {itemUrl ? (
              <p className="resume-p resume-sub mt-0.5">
                <a
                  href={itemUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline font-medium"
                  title={itemUrl}
                >
                  <ExternalLink className="size-2.5" /> {formatDisplayUrl(it.url) || "View Credential"} ↗
                </a>
              </p>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}

export default ResumePreview;
