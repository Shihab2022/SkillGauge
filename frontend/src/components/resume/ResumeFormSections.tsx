"use client";

import type { ResumeContent } from "@/lib/types.resume";
import { Textarea, TextField, TextareaField } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2, ArrowUp, ArrowDown, Sparkles } from "lucide-react";

export const uid = () => Math.random().toString(36).slice(2, 9);

export interface SectionProps {
  content: ResumeContent;
  onChange: (next: ResumeContent) => void;
  onAssist: (action: string, text: string, apply: (suggestion: string) => void) => void;
}

export function PersonalSection({ content, onChange }: SectionProps) {
  const p = content.personal;
  const set = (k: keyof typeof p, v: string) => onChange({ ...content, personal: { ...p, [k]: v } });
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <TextField label="Full name" value={p.fullName} onChange={(e) => set("fullName", e.target.value)} />
      <TextField label="Professional title" value={p.title} onChange={(e) => set("title", e.target.value)} />
      <TextField label="Email" value={p.email} onChange={(e) => set("email", e.target.value)} />
      <TextField label="Phone" value={p.phone} onChange={(e) => set("phone", e.target.value)} />
      <TextField label="Location" value={p.location} onChange={(e) => set("location", e.target.value)} />
      <TextField label="LinkedIn" value={p.linkedin} onChange={(e) => set("linkedin", e.target.value)} />
      <TextField label="GitHub" value={p.github} onChange={(e) => set("github", e.target.value)} />
      <TextField label="Portfolio" value={p.portfolio} onChange={(e) => set("portfolio", e.target.value)} />
    </div>
  );
}

export function SummarySection({ content, onChange, onAssist }: SectionProps) {
  const value = content.summary;
  return (
    <div>
      <TextareaField
        label="Professional summary" value={value}
        onChange={(e) => onChange({ ...content, summary: e.target.value })}
        rows={4} maxLength={2000}
        hint={`${value.length}/2000 — aim for 30-80 words`}
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => onAssist("improve-summary", value, (s) => onChange({ ...content, summary: s }))}>
          <Sparkles className="size-3.5" /> Improve with AI
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onAssist("fix-grammar", value, (s) => onChange({ ...content, summary: s }))}>
          Fix grammar
        </Button>
      </div>
    </div>
  );
}

export function ExperienceSection({ content, onChange, onAssist }: SectionProps) {
  const list = content.experience;
  const setItem = (idx: number, patch: Partial<(typeof list)[number]>) => {
    const next = [...list];
    next[idx] = { ...next[idx], ...patch };
    onChange({ ...content, experience: next });
  };
  return (
    <div className="space-y-4">
      {list.map((e, i) => (
        <div key={e.id ?? i} className="rounded-lg border border-border p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">Position {i + 1}</p>
            <Button size="sm" variant="ghost" onClick={() => onChange({ ...content, experience: list.filter((_, j) => j !== i) })} aria-label="Remove">
              <Trash2 className="size-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField label="Company" value={e.company} onChange={(ev) => setItem(i, { company: ev.target.value })} />
            <TextField label="Job title" value={e.jobTitle} onChange={(ev) => setItem(i, { jobTitle: ev.target.value })} />
            <TextField label="Start date" value={e.startDate} onChange={(ev) => setItem(i, { startDate: ev.target.value })} />
            <TextField label="End date" value={e.endDate} onChange={(ev) => setItem(i, { endDate: ev.target.value })} disabled={e.current} />
          </div>
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={e.current} onChange={(ev) => setItem(i, { current: ev.target.checked })} />
            Currently work here
          </label>
          <p className="field-label mt-3">Achievements (one per line)</p>
          <Textarea value={e.bullets.join("\n")} onChange={(ev) => setItem(i, { bullets: ev.target.value.split("\n") })} rows={4} />
          {(e.bullets[0] ?? "").trim() ? (
            <Button size="sm" variant="outline" className="mt-2" onClick={() => onAssist("improve-bullet", e.bullets[0], (s) => {
              const next = [...e.bullets]; next[0] = s; setItem(i, { bullets: next });
            })}>
              <Sparkles className="size-3.5" /> Improve first bullet
            </Button>
          ) : null}
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={() => onChange({ ...content, experience: [...list, { id: uid(), company: "", jobTitle: "", startDate: "", endDate: "", current: false, location: "", bullets: [] }] })}>
        <Plus className="size-3.5" /> Add experience
      </Button>
    </div>
  );
}

export function EducationSection({ content, onChange }: SectionProps) {
  const list = content.education;
  const setEd = (i: number, patch: Partial<(typeof list)[number]>) => {
    const n = [...list]; n[i] = { ...n[i], ...patch }; onChange({ ...content, education: n });
  };
  return (
    <div className="space-y-4">
      {list.map((ed, i) => (
        <div key={ed.id ?? i} className="rounded-lg border border-border p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">Education {i + 1}</p>
            <Button size="sm" variant="ghost" onClick={() => onChange({ ...content, education: list.filter((_, j) => j !== i) })} aria-label="Remove">
              <Trash2 className="size-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField label="Institution" value={ed.institution} onChange={(ev) => setEd(i, { institution: ev.target.value })} />
            <TextField label="Degree" value={ed.degree} onChange={(ev) => setEd(i, { degree: ev.target.value })} />
            <TextField label="Field of study" value={ed.field} onChange={(ev) => setEd(i, { field: ev.target.value })} />
            <TextField label="Graduation date" value={ed.graduationDate} onChange={(ev) => setEd(i, { graduationDate: ev.target.value })} />
          </div>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={() => onChange({ ...content, education: [...list, { id: uid(), institution: "", degree: "", field: "", graduationDate: "", gpa: "" }] })}>
        <Plus className="size-3.5" /> Add education
      </Button>
    </div>
  );
}

export function SkillsSection({ content, onChange, onAssist }: SectionProps) {
  const groups = content.skillGroups;
  return (
    <div className="space-y-4">
      {groups.map((g, i) => (
        <div key={g.id ?? i} className="rounded-lg border border-border p-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex-1">
              <TextField label="Category" value={g.category} onChange={(ev) => { const n = [...groups]; n[i] = { ...n[i], category: ev.target.value }; onChange({ ...content, skillGroups: n }); }} />
            </div>
            <Button size="sm" variant="ghost" onClick={() => onChange({ ...content, skillGroups: groups.filter((_, j) => j !== i) })} aria-label="Remove">
              <Trash2 className="size-3.5" />
            </Button>
          </div>
          <TextareaField label="Skills (comma separated)" value={g.skills.join(", ")} rows={2}
            onChange={(ev) => { const n = [...groups]; n[i] = { ...n[i], skills: ev.target.value.split(",").map((s) => s.trim()).filter(Boolean) }; onChange({ ...content, skillGroups: n }); }} />
          <Button size="sm" variant="outline" className="mt-2" onClick={() => onAssist("suggest-skills", g.skills.join(", ") || content.personal.title, (s) => {
            const n = [...groups];
            n[i] = { ...n[i], skills: Array.from(new Set([...n[i].skills, ...s.split(",").map((x) => x.trim()).filter(Boolean)])) };
            onChange({ ...content, skillGroups: n });
          })}>
            <Sparkles className="size-3.5" /> Suggest skills
          </Button>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={() => onChange({ ...content, skillGroups: [...groups, { id: uid(), category: "", skills: [] }] })}>
        <Plus className="size-3.5" /> Add skill group
      </Button>
    </div>
  );
}

export function ProjectsSection({ content, onChange, onAssist }: SectionProps) {
  const list = content.projects;
  const setItem = (idx: number, patch: Partial<(typeof list)[number]>) => {
    const next = [...list];
    next[idx] = { ...next[idx]!, ...patch };
    onChange({ ...content, projects: next });
  };
  return (
    <div className="space-y-4">
      {list.length === 0 ? <p className="text-sm text-muted-foreground">No projects yet. Add one to showcase applied skills.</p> : null}
      {list.map((pr, i) => (
        <div key={pr.id ?? i} className="rounded-lg border border-border p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">Project {i + 1}</p>
            <Button size="sm" variant="ghost" onClick={() => onChange({ ...content, projects: list.filter((_, j) => j !== i) })} aria-label="Remove"><Trash2 className="size-3.5" /></Button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField label="Project name" value={pr.name} onChange={(ev) => setItem(i, { name: ev.target.value })} />
            <TextField label="Technologies (comma separated)" value={pr.technologies.join(", ")} onChange={(ev) => setItem(i, { technologies: ev.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
            <TextField label="Project URL" value={pr.url} onChange={(ev) => setItem(i, { url: ev.target.value })} />
            <TextField label="GitHub URL" value={pr.githubUrl} onChange={(ev) => setItem(i, { githubUrl: ev.target.value })} />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3">
            <TextareaField label="Description" value={pr.description} rows={3} maxLength={1200} hint={`${pr.description.length}/1200`} onChange={(ev) => setItem(i, { description: ev.target.value })} />
            <TextareaField label="Measurable outcomes" value={pr.outcomes} rows={2} maxLength={600} hint="e.g. 500 weekly users, 30% faster loads" onChange={(ev) => setItem(i, { outcomes: ev.target.value })} />
          </div>
          {pr.description.trim() ? (
            <Button size="sm" variant="outline" className="mt-2" onClick={() => onAssist("make-clearer", pr.description, (s) => setItem(i, { description: s }))}>
              <Sparkles className="size-3.5" /> Improve description
            </Button>
          ) : null}
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={() => onChange({ ...content, projects: [...list, { id: uid(), name: "", description: "", technologies: [], url: "", githubUrl: "", outcomes: "" }] })}>
        <Plus className="size-3.5" /> Add project
      </Button>
    </div>
  );
}

export function GenericSection({ content, onChange, field, title, singular }: SectionProps & { field: "certifications" | "awards" | "volunteer" | "publications"; title: string; singular: string }) {
  const list = content[field];
  const setItem = (idx: number, patch: Partial<(typeof list)[number]>) => {
    const n = [...list];
    n[idx] = { ...n[idx]!, ...patch };
    onChange({ ...content, [field]: n });
  };
  return (
    <div className="space-y-4">
      {list.length === 0 ? <p className="text-sm text-muted-foreground">No {title.toLowerCase()} yet.</p> : null}
      {list.map((it, i) => (
        <div key={it.id ?? i} className="rounded-lg border border-border p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">{singular} {i + 1}</p>
            <Button size="sm" variant="ghost" onClick={() => onChange({ ...content, [field]: list.filter((_, j) => j !== i) })} aria-label="Remove"><Trash2 className="size-3.5" /></Button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField label="Title" value={it.title} onChange={(ev) => setItem(i, { title: ev.target.value })} />
            <TextField label="Issuer / Organization" value={it.issuer} onChange={(ev) => setItem(i, { issuer: ev.target.value })} />
            <TextField label="Date" value={it.date} onChange={(ev) => setItem(i, { date: ev.target.value })} />
            <TextField label="URL (optional)" value={it.url} onChange={(ev) => setItem(i, { url: ev.target.value })} />
          </div>
          <div className="mt-3">
            <TextareaField label="Description (optional)" value={it.description} rows={2} maxLength={800} onChange={(ev) => setItem(i, { description: ev.target.value })} />
          </div>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={() => onChange({ ...content, [field]: [...list, { id: uid(), title: "", issuer: "", date: "", description: "", url: "" }] })}>
        <Plus className="size-3.5" /> Add {singular.toLowerCase()}
      </Button>
    </div>
  );
}

export const SECTION_LABELS: Record<string, string> = {
  summary: "Professional summary",
  experience: "Work experience",
  skills: "Skills",
  projects: "Projects",
  education: "Education",
  certifications: "Certifications",
  languages: "Languages",
  awards: "Awards",
  volunteer: "Volunteer",
  publications: "Publications",
};

export function SectionOrderControl({ content, onChange }: SectionProps) {
  const order = content.sectionOrder?.length ? content.sectionOrder : Object.keys(SECTION_LABELS);
  const move = (i: number, dir: -1 | 1) => {
    const n = [...order];
    const j = i + dir;
    if (j < 0 || j >= n.length) return;
    const [x] = n.splice(i, 1);
    n.splice(j, 0, x!);
    onChange({ ...content, sectionOrder: n });
  };
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Reorder how sections appear in the preview and PDF export.</p>
      {order.map((key, i) => (
        <div key={key} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
          <span className="font-medium">{SECTION_LABELS[key] ?? key}</span>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up"><ArrowUp className="size-3.5" /></Button>
            <Button size="sm" variant="ghost" disabled={i === order.length - 1} onClick={() => move(i, 1)} aria-label="Move down"><ArrowDown className="size-3.5" /></Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function LanguagesSection({ content, onChange }: SectionProps) {
  const list = content.languages;
  return (
    <div className="space-y-3">
      {list.map((l, i) => (
        <div key={i} className="flex items-end gap-2">
          <div className="flex-1"><TextField label={i === 0 ? "Language" : undefined} value={l.language} onChange={(ev) => { const n = [...list]; n[i] = { ...n[i]!, language: ev.target.value }; onChange({ ...content, languages: n }); }} placeholder="e.g. English" /></div>
          <div className="flex-1"><TextField label={i === 0 ? "Proficiency" : undefined} value={l.proficiency} onChange={(ev) => { const n = [...list]; n[i] = { ...n[i]!, proficiency: ev.target.value }; onChange({ ...content, languages: n }); }} placeholder="e.g. Fluent" /></div>
          <Button size="sm" variant="ghost" onClick={() => onChange({ ...content, languages: list.filter((_, j) => j !== i) })} aria-label="Remove"><Trash2 className="size-3.5" /></Button>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={() => onChange({ ...content, languages: [...list, { language: "", proficiency: "" }] })}>
        <Plus className="size-3.5" /> Add language
      </Button>
    </div>
  );
}
