"use client";

import { useState } from "react";
import type { ResumeContent } from "@/lib/types.resume";
import { Textarea, TextField, TextareaField } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Zap,
  Check,
  ChevronDown,
  ChevronUp,
  ListOrdered,
  Layers,
  Wand2,
} from "lucide-react";
import { ACTION_VERBS_BY_CATEGORY } from "@/lib/resume-presets";
import { toast } from "sonner";

export const uid = () => Math.random().toString(36).slice(2, 9);

export interface SectionProps {
  content: ResumeContent;
  onChange: (next: ResumeContent) => void;
  onAssist: (action: string, text: string, apply: (suggestion: string) => void) => void;
  targetRole?: string;
}

/* ------------------------------------------------------------- Personal */

export function PersonalSection({ content, onChange }: SectionProps) {
  const p = content.personal;
  const set = (k: keyof typeof p, v: string) =>
    onChange({ ...content, personal: { ...p, [k]: v } });

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/80 bg-card p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
          Contact & Identification
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextField
            label="Full name *"
            value={p.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            placeholder="e.g. Alex Morgan"
          />
          <TextField
            label="Professional title *"
            value={p.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Senior Full-Stack Engineer"
          />
          <TextField
            label="Email *"
            type="email"
            value={p.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="alex@example.com"
          />
          <TextField
            label="Phone *"
            type="tel"
            value={p.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+1 (555) 019-2834"
          />
          <TextField
            label="Location (City, Country)"
            value={p.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="e.g. San Francisco, CA (or Remote)"
          />
          <TextField
            label="LinkedIn Profile"
            value={p.linkedin}
            onChange={(e) => set("linkedin", e.target.value)}
            placeholder="linkedin.com/in/alexmorgan"
          />
          <TextField
            label="GitHub Profile"
            value={p.github}
            onChange={(e) => set("github", e.target.value)}
            placeholder="github.com/alexmorgan"
          />
          <TextField
            label="Portfolio / Website"
            value={p.portfolio}
            onChange={(e) => set("portfolio", e.target.value)}
            placeholder="alexmorgan.dev"
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- Summary */

export function SummarySection({ content, onChange, onAssist, targetRole }: SectionProps) {
  const value = content.summary;
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  const isOptimal = words >= 30 && words <= 85;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="field-label">Executive Professional Summary</span>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded ${
            isOptimal
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
              : words < 30
              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {words} words {isOptimal ? "(Optimal: 30-85)" : words < 30 ? "(Aim for 30+ words)" : "(A bit long)"}
        </span>
      </div>

      <TextareaField
        value={value}
        onChange={(e) => onChange({ ...content, summary: e.target.value })}
        rows={5}
        maxLength={2000}
        placeholder="e.g. Results-driven Full-Stack Engineer with 5+ years of experience building high-throughput microservices and responsive web applications..."
      />

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            onAssist("generate-summary-variations", value || content.personal.title, (s) => {
              // If options are generated, pick the first or let user choose
              const clean = s.replace(/### Option \d.*?\n/g, "").trim();
              const firstOption = clean.split("\n\n")[0] || clean;
              onChange({ ...content, summary: firstOption });
            })
          }
        >
          <Wand2 className="size-3.5 text-primary-600" /> Generate 3 Tone Variations with AI
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onAssist("improve-summary", value, (s) => onChange({ ...content, summary: s }))}
        >
          <Sparkles className="size-3.5" /> Polish with AI
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onAssist("fix-grammar", value, (s) => onChange({ ...content, summary: s }))}
        >
          Fix grammar
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- Experience */

export function ExperienceSection({ content, onChange, onAssist, targetRole }: SectionProps) {
  const list = content.experience;
  const [showVerbsForIndex, setShowVerbsForIndex] = useState<number | null>(null);

  const setItem = (idx: number, patch: Partial<(typeof list)[number]>) => {
    const next = [...list];
    next[idx] = { ...next[idx]!, ...patch };
    onChange({ ...content, experience: next });
  };

  const addBullet = (expIndex: number) => {
    const currentBullets = [...(list[expIndex]?.bullets || [])];
    currentBullets.push("");
    setItem(expIndex, { bullets: currentBullets });
  };

  const updateBullet = (expIndex: number, bulletIndex: number, text: string) => {
    const currentBullets = [...(list[expIndex]?.bullets || [])];
    currentBullets[bulletIndex] = text;
    setItem(expIndex, { bullets: currentBullets });
  };

  const deleteBullet = (expIndex: number, bulletIndex: number) => {
    const currentBullets = (list[expIndex]?.bullets || []).filter((_, j) => j !== bulletIndex);
    setItem(expIndex, { bullets: currentBullets });
  };

  const moveBullet = (expIndex: number, bulletIndex: number, dir: -1 | 1) => {
    const currentBullets = [...(list[expIndex]?.bullets || [])];
    const targetIndex = bulletIndex + dir;
    if (targetIndex < 0 || targetIndex >= currentBullets.length) return;
    const [moved] = currentBullets.splice(bulletIndex, 1);
    currentBullets.splice(targetIndex, 0, moved!);
    setItem(expIndex, { bullets: currentBullets });
  };

  const handleGenerateRoleBullets = (expIndex: number) => {
    const item = list[expIndex];
    if (!item) return;
    const role = item.jobTitle || targetRole || "Software Engineer";
    const company = item.company || "Technology Company";

    toast.loading("Generating 3 accomplishment bullets with AI...", { id: "generate-bullets" });
    onAssist("generate-role-bullets", `${role} at ${company}`, (suggestion) => {
      toast.dismiss("generate-bullets");
      const lines = suggestion.split("\n").map((l) => l.replace(/^[•\-\*\d\.\s]+/, "").trim()).filter(Boolean);
      const updatedBullets = [...item.bullets.filter(Boolean), ...lines];
      setItem(expIndex, { bullets: updatedBullets });
      toast.success("Generated 3 role bullets!");
    });
  };

  return (
    <div className="space-y-6">
      {list.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-muted-foreground">
          <p className="text-sm font-medium">No experience added yet.</p>
          <p className="text-xs mt-1">Add your previous job positions and accomplishment bullets.</p>
        </div>
      ) : null}

      {list.map((e, i) => (
        <div key={e.id ?? i} className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <span className="text-sm font-bold text-foreground flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                {i + 1}
              </span>
              {e.jobTitle || "Job Position"} {e.company ? `at ${e.company}` : ""}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onChange({ ...content, experience: list.filter((_, j) => j !== i) })}
              className="text-muted-foreground hover:text-destructive"
              aria-label="Remove"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField
              label="Company / Organization *"
              value={e.company}
              onChange={(ev) => setItem(i, { company: ev.target.value })}
              placeholder="e.g. Google, TechCorp"
            />
            <TextField
              label="Job Title *"
              value={e.jobTitle}
              onChange={(ev) => setItem(i, { jobTitle: ev.target.value })}
              placeholder="e.g. Senior Frontend Engineer"
            />
            <TextField
              label="Start Date"
              value={e.startDate}
              onChange={(ev) => setItem(i, { startDate: ev.target.value })}
              placeholder="e.g. Jan 2022"
            />
            <TextField
              label="End Date"
              value={e.endDate}
              onChange={(ev) => setItem(i, { endDate: ev.target.value })}
              disabled={e.current}
              placeholder={e.current ? "Present" : "e.g. Dec 2023"}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={e.current}
                onChange={(ev) => setItem(i, { current: ev.target.checked })}
                className="rounded border-border"
              />
              Currently work here
            </label>
            <TextField
              label="Location (optional)"
              value={e.location}
              onChange={(ev) => setItem(i, { location: ev.target.value })}
              placeholder="e.g. New York, NY (Hybrid)"
              className="w-48 text-xs"
            />
          </div>

          {/* ---------------- Individual Achievement Bullets ---------------- */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Key Accomplishments & Bullets ({e.bullets.length})
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowVerbsForIndex(showVerbsForIndex === i ? null : i)}
                  className="text-xs h-7"
                >
                  Action Verbs {showVerbsForIndex === i ? <ChevronUp className="size-3 ml-1" /> : <ChevronDown className="size-3 ml-1" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGenerateRoleBullets(i)}
                  className="text-xs h-7 text-primary-600 border-primary-200 dark:border-primary-800"
                >
                  <Sparkles className="size-3 mr-1" /> AI Generate 3 Bullets
                </Button>
              </div>
            </div>

            {/* Action Verbs Quick Tray */}
            {showVerbsForIndex === i && (
              <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-2 text-xs">
                <p className="font-semibold text-foreground">Click any power verb to copy / insert:</p>
                <div className="flex flex-wrap gap-1.5">
                  {ACTION_VERBS_BY_CATEGORY.flatMap((c) => c.verbs).map((verb) => (
                    <button
                      key={verb}
                      type="button"
                      onClick={() => {
                        addBullet(i);
                        const nextBullets = [...e.bullets, `${verb} `];
                        setItem(i, { bullets: nextBullets });
                        toast.success(`Started new bullet with "${verb}"`);
                      }}
                      className="rounded bg-card px-2 py-0.5 border border-border text-foreground hover:bg-primary-50 hover:text-primary-700 dark:hover:bg-primary-950 transition-colors"
                    >
                      {verb}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bullet Row Items */}
            <div className="space-y-2">
              {e.bullets.map((bullet, bulletIdx) => (
                <div
                  key={bulletIdx}
                  className="group flex items-start gap-2 rounded-lg border border-border/70 bg-background/50 p-2 transition-colors hover:border-border"
                >
                  <span className="mt-2 size-1.5 rounded-full bg-primary-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <textarea
                      value={bullet}
                      onChange={(ev) => updateBullet(i, bulletIdx, ev.target.value)}
                      onKeyDown={(ev) => {
                        if (ev.key === "Enter" && !ev.shiftKey) {
                          ev.preventDefault();
                          addBullet(i);
                        }
                      }}
                      rows={2}
                      className="w-full resize-none bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/60"
                      placeholder="Accomplished [X] as measured by [Y], by doing [Z] (e.g. Reduced query latency by 40% with Redis...)"
                    />
                    {bullet.trim() && (
                      <div className="flex items-center gap-1.5 pt-1 text-xs">
                        <button
                          type="button"
                          onClick={() =>
                            onAssist("xyz-bullet", bullet, (s) => updateBullet(i, bulletIdx, s))
                          }
                          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950 font-medium transition-colors"
                          title="Google XYZ formula polish"
                        >
                          <Zap className="size-3" /> XYZ Polish
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onAssist("improve-bullet", bullet, (s) => updateBullet(i, bulletIdx, s))
                          }
                          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Sparkles className="size-3" /> Power Verb
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-0.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      disabled={bulletIdx === 0}
                      onClick={() => moveBullet(i, bulletIdx, -1)}
                      className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20"
                      aria-label="Move up"
                    >
                      <ArrowUp className="size-3" />
                    </button>
                    <button
                      type="button"
                      disabled={bulletIdx === e.bullets.length - 1}
                      onClick={() => moveBullet(i, bulletIdx, 1)}
                      className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20"
                      aria-label="Move down"
                    >
                      <ArrowDown className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteBullet(i, bulletIdx)}
                      className="p-1 text-muted-foreground hover:text-destructive"
                      aria-label="Delete bullet"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => addBullet(i)}
              className="w-full text-xs border-dashed"
            >
              <Plus className="size-3.5 mr-1" /> Add Achievement Bullet (Enter)
            </Button>
          </div>
        </div>
      ))}

      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          onChange({
            ...content,
            experience: [
              ...list,
              {
                id: uid(),
                company: "",
                jobTitle: "",
                startDate: "",
                endDate: "",
                current: false,
                location: "",
                bullets: [""],
              },
            ],
          })
        }
        className="w-full py-2"
      >
        <Plus className="size-4 mr-1.5" /> Add Another Experience Position
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------- Skills */

export function SkillsSection({ content, onChange, onAssist, targetRole }: SectionProps) {
  const groups = content.skillGroups;

  const quickRoleSkillPills = [
    "React", "TypeScript", "Next.js", "Node.js", "PostgreSQL", "Docker",
    "Tailwind CSS", "Redis", "AWS", "GraphQL", "Python", "Kubernetes", "Git", "Jest"
  ];

  const addSkillToGroup = (groupIndex: number, skillName: string) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;
    const n = [...groups];
    const group = { ...n[groupIndex]! };
    if (!group.skills.includes(trimmed)) {
      group.skills = [...group.skills, trimmed];
      n[groupIndex] = group;
      onChange({ ...content, skillGroups: n });
    }
  };

  const removeSkillFromGroup = (groupIndex: number, skillIndex: number) => {
    const n = [...groups];
    const group = { ...n[groupIndex]! };
    group.skills = group.skills.filter((_, idx) => idx !== skillIndex);
    n[groupIndex] = group;
    onChange({ ...content, skillGroups: n });
  };

  return (
    <div className="space-y-5">
      {/* Quick Skill Recommendation Tray */}
      <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2 text-xs">
        <p className="font-semibold text-foreground flex items-center justify-between">
          <span>Popular Technical Skills</span>
          <span className="text-muted-foreground font-normal">Click to add to first group</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {quickRoleSkillPills.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => addSkillToGroup(0, skill)}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors"
            >
              <Plus className="size-3 text-muted-foreground" /> {skill}
            </button>
          ))}
        </div>
      </div>

      {groups.map((g, i) => (
        <div key={g.id ?? i} className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <TextField
              label="Skill Category Name"
              value={g.category}
              onChange={(ev) => {
                const n = [...groups];
                n[i] = { ...n[i]!, category: ev.target.value };
                onChange({ ...content, skillGroups: n });
              }}
              placeholder="e.g. Frontend, Backend, Cloud & DevOps, Languages"
              className="max-w-xs"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onChange({ ...content, skillGroups: groups.filter((_, j) => j !== i) })}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          {/* Interactive Skill Pills */}
          <div>
            <p className="field-label">Skills in this category ({g.skills.length})</p>
            <div className="flex flex-wrap gap-1.5 min-h-10 p-2 rounded-lg border border-border bg-background">
              {g.skills.map((skill, skillIdx) => (
                <span
                  key={skillIdx}
                  className="inline-flex items-center gap-1.5 rounded-md border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-800 dark:border-primary-900 dark:bg-primary-950 dark:text-primary-300"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkillFromGroup(i, skillIdx)}
                    className="text-primary-600 hover:text-destructive"
                    aria-label={`Remove ${skill}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="+ Type skill and press Enter..."
                className="flex-1 min-w-32 bg-transparent text-xs text-foreground focus:outline-none placeholder:text-muted-foreground/60 px-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    const val = e.currentTarget.value.trim().replace(/^,/, "");
                    if (val) {
                      addSkillToGroup(i, val);
                      e.currentTarget.value = "";
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                onAssist("suggest-skills", g.skills.join(", ") || targetRole || g.category, (s) => {
                  const items = s.split(",").map((x) => x.trim()).filter(Boolean);
                  const merged = Array.from(new Set([...g.skills, ...items]));
                  const n = [...groups];
                  n[i] = { ...n[i]!, skills: merged };
                  onChange({ ...content, skillGroups: n });
                  toast.success(`Added suggested skills to ${g.category}`);
                })
              }
              className="text-xs"
            >
              <Sparkles className="size-3.5 mr-1 text-primary-600" /> AI Suggest Skills for {g.category || "Role"}
            </Button>
          </div>
        </div>
      ))}

      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          onChange({
            ...content,
            skillGroups: [...groups, { id: uid(), category: "New Category", skills: [] }],
          })
        }
        className="w-full"
      >
        <Plus className="size-4 mr-1" /> Add Another Skill Category
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------- Education */

export function EducationSection({ content, onChange }: SectionProps) {
  const list = content.education;
  const setEd = (i: number, patch: Partial<(typeof list)[number]>) => {
    const n = [...list];
    n[i] = { ...n[i]!, ...patch };
    onChange({ ...content, education: n });
  };

  return (
    <div className="space-y-4">
      {list.map((ed, i) => (
        <div key={ed.id ?? i} className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-sm font-bold text-foreground">
              {ed.degree || "Degree"} {ed.institution ? `at ${ed.institution}` : ""}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onChange({ ...content, education: list.filter((_, j) => j !== i) })}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField
              label="Institution *"
              value={ed.institution}
              onChange={(ev) => setEd(i, { institution: ev.target.value })}
              placeholder="e.g. Stanford University"
            />
            <TextField
              label="Degree *"
              value={ed.degree}
              onChange={(ev) => setEd(i, { degree: ev.target.value })}
              placeholder="e.g. Bachelor of Science"
            />
            <TextField
              label="Field of study"
              value={ed.field}
              onChange={(ev) => setEd(i, { field: ev.target.value })}
              placeholder="e.g. Computer Science"
            />
            <TextField
              label="Graduation date"
              value={ed.graduationDate}
              onChange={(ev) => setEd(i, { graduationDate: ev.target.value })}
              placeholder="e.g. May 2021"
            />
          </div>
        </div>
      ))}
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          onChange({
            ...content,
            education: [
              ...list,
              { id: uid(), institution: "", degree: "", field: "", graduationDate: "", gpa: "" },
            ],
          })
        }
        className="w-full"
      >
        <Plus className="size-4 mr-1" /> Add Education
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------- Projects */

export function ProjectsSection({ content, onChange, onAssist }: SectionProps) {
  const list = content.projects;
  const setItem = (idx: number, patch: Partial<(typeof list)[number]>) => {
    const next = [...list];
    next[idx] = { ...next[idx]!, ...patch };
    onChange({ ...content, projects: next });
  };

  return (
    <div className="space-y-5">
      {list.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-muted-foreground">
          <p className="text-sm font-medium">No projects added yet.</p>
          <p className="text-xs mt-1">Showcase applied systems, open source contributions, or SaaS applications.</p>
        </div>
      ) : null}

      {list.map((pr, i) => (
        <div key={pr.id ?? i} className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-sm font-bold text-foreground">{pr.name || "Project " + (i + 1)}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onChange({ ...content, projects: list.filter((_, j) => j !== i) })}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField
              label="Project name *"
              value={pr.name}
              onChange={(ev) => setItem(i, { name: ev.target.value })}
              placeholder="e.g. Distributed Task Orchestrator"
            />
            <TextField
              label="Technologies used (comma separated)"
              value={pr.technologies.join(", ")}
              onChange={(ev) =>
                setItem(i, {
                  technologies: ev.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                })
              }
              placeholder="e.g. React, Node.js, Redis, Docker"
            />
            <TextField
              label="Live URL"
              value={pr.url}
              onChange={(ev) => setItem(i, { url: ev.target.value })}
              placeholder="https://myproject.com"
            />
            <TextField
              label="GitHub Repository"
              value={pr.githubUrl}
              onChange={(ev) => setItem(i, { githubUrl: ev.target.value })}
              placeholder="https://github.com/user/project"
            />
          </div>

          <div className="space-y-3">
            <TextareaField
              label="Description & Architecture"
              value={pr.description}
              rows={3}
              maxLength={1200}
              placeholder="Describe what the project does, key architecture patterns, and technical challenges overcome..."
              onChange={(ev) => setItem(i, { description: ev.target.value })}
            />
            <TextareaField
              label="Measurable outcomes & impact (metrics)"
              value={pr.outcomes}
              rows={2}
              maxLength={600}
              placeholder="e.g. 5,000+ monthly active users, sustained 2,000 RPS at 40ms response latency..."
              onChange={(ev) => setItem(i, { outcomes: ev.target.value })}
            />
          </div>

          <div className="flex gap-2 pt-1">
            {pr.description.trim() && (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  onAssist("make-clearer", pr.description, (s) => setItem(i, { description: s }))
                }
              >
                <Sparkles className="size-3.5 mr-1" /> Polish Description
              </Button>
            )}
          </div>
        </div>
      ))}

      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          onChange({
            ...content,
            projects: [
              ...list,
              {
                id: uid(),
                name: "",
                description: "",
                technologies: [],
                url: "",
                githubUrl: "",
                outcomes: "",
              },
            ],
          })
        }
        className="w-full"
      >
        <Plus className="size-4 mr-1" /> Add Applied Project
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------- Generic Sections */

export function GenericSection({
  content,
  onChange,
  field,
  title,
  singular,
}: SectionProps & {
  field: "certifications" | "awards" | "volunteer" | "publications";
  title: string;
  singular: string;
}) {
  const list = content[field];
  const setItem = (idx: number, patch: Partial<(typeof list)[number]>) => {
    const n = [...list];
    n[idx] = { ...n[idx]!, ...patch };
    onChange({ ...content, [field]: n });
  };

  return (
    <div className="space-y-4">
      {list.length === 0 ? <p className="text-sm text-muted-foreground">No {title.toLowerCase()} added yet.</p> : null}
      {list.map((it, i) => (
        <div key={it.id ?? i} className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-sm font-bold text-foreground">
              {it.title || `${singular} ${i + 1}`}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onChange({ ...content, [field]: list.filter((_, j) => j !== i) })}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField
              label="Title *"
              value={it.title}
              onChange={(ev) => setItem(i, { title: ev.target.value })}
              placeholder={`e.g. ${singular} Title`}
            />
            <TextField
              label="Issuer / Organization"
              value={it.issuer}
              onChange={(ev) => setItem(i, { issuer: ev.target.value })}
              placeholder="e.g. AWS, Coursera, Organization"
            />
            <TextField
              label="Date"
              value={it.date}
              onChange={(ev) => setItem(i, { date: ev.target.value })}
              placeholder="e.g. Oct 2023"
            />
            <TextField
              label="Credential URL"
              value={it.url}
              onChange={(ev) => setItem(i, { url: ev.target.value })}
              placeholder="https://..."
            />
          </div>
        </div>
      ))}
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          onChange({
            ...content,
            [field]: [...list, { id: uid(), title: "", issuer: "", date: "", description: "", url: "" }],
          })
        }
        className="w-full"
      >
        <Plus className="size-4 mr-1" /> Add {singular}
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
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Drag or reorder how sections appear in the preview and PDF export. Top sections get the most recruiter focus.
      </p>
      <div className="space-y-1.5">
        {order.map((key, i) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm"
          >
            <span className="font-semibold text-foreground flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                {i + 1}
              </span>
              {SECTION_LABELS[key] ?? key}
            </span>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                disabled={i === 0}
                onClick={() => move(i, -1)}
                className="h-7 w-7 p-0"
                aria-label="Move up"
              >
                <ArrowUp className="size-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={i === order.length - 1}
                onClick={() => move(i, 1)}
                className="h-7 w-7 p-0"
                aria-label="Move down"
              >
                <ArrowDown className="size-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LanguagesSection({ content, onChange }: SectionProps) {
  const list = content.languages;
  return (
    <div className="space-y-3">
      {list.map((l, i) => (
        <div key={i} className="flex items-end gap-2">
          <div className="flex-1">
            <TextField
              label={i === 0 ? "Language" : undefined}
              value={l.language}
              onChange={(ev) => {
                const n = [...list];
                n[i] = { ...n[i]!, language: ev.target.value };
                onChange({ ...content, languages: n });
              }}
              placeholder="e.g. English"
            />
          </div>
          <div className="flex-1">
            <TextField
              label={i === 0 ? "Proficiency" : undefined}
              value={l.proficiency}
              onChange={(ev) => {
                const n = [...list];
                n[i] = { ...n[i]!, proficiency: ev.target.value };
                onChange({ ...content, languages: n });
              }}
              placeholder="e.g. Fluent, Native, Professional"
            />
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onChange({ ...content, languages: list.filter((_, j) => j !== i) })}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        size="sm"
        variant="outline"
        onClick={() => onChange({ ...content, languages: [...list, { language: "", proficiency: "" }] })}
        className="w-full"
      >
        <Plus className="size-3.5 mr-1" /> Add Language
      </Button>
    </div>
  );
}
