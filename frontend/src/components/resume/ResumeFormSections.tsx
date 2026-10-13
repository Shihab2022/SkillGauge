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
