"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  ListPlus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { CustomQuestion } from "@/lib/types.jobs";

interface CustomFieldBuilderProps {
  questions: CustomQuestion[];
  onChange: (questions: CustomQuestion[]) => void;
}

const PRESETS = [
  {
    label: "Notice Period",
    question: "What is your current notice period?",
    type: "select" as const,
    required: true,
    options: ["Immediate / 0-15 days", "30 days", "60 days", "90 days"],
    placeholder: "Select your notice period",
  },
  {
    label: "Expected Salary",
    question: "What is your expected salary / compensation?",
    type: "text" as const,
    required: false,
    placeholder: "e.g. $140,000 / year or market rate",
  },
  {
    label: "Work Authorization",
    question: "Are you authorized to work in the country of this role without sponsorship?",
    type: "boolean" as const,
    required: true,
  },
  {
    label: "Years of Experience",
    question: "How many years of professional experience do you have in this domain?",
    type: "number" as const,
    required: true,
    placeholder: "e.g. 4",
  },
  {
    label: "Portfolio / Work Link",
    question: "Link to your portfolio, live project, or design case study",
    type: "url" as const,
    required: false,
    placeholder: "https://",
  },
];

export function CustomFieldBuilder({ questions, onChange }: CustomFieldBuilderProps) {
  const addQuestion = (type: CustomQuestion["type"] = "text") => {
    onChange([
      ...questions,
      {
        id: `field_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        question: "",
        type,
        required: false,
        placeholder: "",
        options: type === "select" ? ["Option 1", "Option 2"] : undefined,
      },
    ]);
  };

  const addPreset = (preset: (typeof PRESETS)[0]) => {
    onChange([
      ...questions,
      {
        id: `field_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        question: preset.question,
        type: preset.type,
        required: preset.required,
        options: preset.options ? [...preset.options] : undefined,
        placeholder: preset.placeholder || "",
      },
    ]);
  };

  const updateQuestion = (index: number, updates: Partial<CustomQuestion>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index]!, ...updates };
    onChange(updated);
  };

  const removeQuestion = (index: number) => {
    onChange(questions.filter((_, i) => i !== index));
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;
    const updated = [...questions];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved!);
    onChange(updated);
  };

  // Option management for 'select' type
  const addOption = (questionIndex: number) => {
    const q = questions[questionIndex];
    const currentOptions = q?.options || [];
    updateQuestion(questionIndex, {
      options: [...currentOptions, `Option ${currentOptions.length + 1}`],
    });
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const q = questions[questionIndex];
    const currentOptions = [...(q?.options || [])];
    currentOptions[optionIndex] = value;
    updateQuestion(questionIndex, { options: currentOptions });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const q = questions[questionIndex];
    const currentOptions = (q?.options || []).filter((_, i) => i !== optionIndex);
    updateQuestion(questionIndex, { options: currentOptions });
  };

  return (
    <div className="space-y-4">
      {/* Quick Add Presets Bar */}
      <div className="space-y-2 bg-muted/20 p-4 rounded-xl border border-border">
        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary-600" /> Quick Add Common Field Templates:
        </span>
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => addPreset(p)}
              className="px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3 text-primary-600" /> {p.label}
            </button>
          ))}
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => addQuestion("text")}
            className="text-xs h-7 gap-1 ml-auto"
          >
            <Plus className="w-3 h-3" /> Custom Input Field
          </Button>
        </div>
      </div>

      {/* Fields List */}
      {questions.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-border rounded-xl p-6 bg-card">
          <ListPlus className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-xs font-medium text-foreground">No custom input fields added yet</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 mb-3">
            Click one of the quick templates above or add a custom field to screen candidates.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addQuestion("text")}
            className="text-xs gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Field
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div
              key={q.id || idx}
              className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-muted font-bold text-xs flex items-center justify-center text-foreground shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-foreground">Input Field</span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={idx === 0}
                    onClick={() => moveQuestion(idx, "up")}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={idx === questions.length - 1}
                    onClick={() => moveQuestion(idx, "down")}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(idx)}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Field Label / Question Input */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-[11px] font-semibold text-foreground">
                    Field Label / Question <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={q.question}
                    onChange={(e) => updateQuestion(idx, { question: e.target.value })}
                    placeholder="e.g. What is your current notice period?"
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-foreground">
                    Input Type
                  </label>
                  <select
                    value={q.type}
                    onChange={(e) => {
                      const newType = e.target.value as CustomQuestion["type"];
                      updateQuestion(idx, {
                        type: newType,
                        options: newType === "select" ? q.options || ["Option 1", "Option 2"] : undefined,
                      });
                    }}
                    className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="text">Short Text</option>
                    <option value="textarea">Long Textarea</option>
                    <option value="select">Dropdown / Choices</option>
                    <option value="boolean">Yes / No Radio</option>
                    <option value="number">Numeric</option>
                    <option value="url">Website / URL</option>
                    <option value="file">File Upload</option>
                  </select>
                </div>
              </div>

              {/* Options Builder for 'select' type */}
              {q.type === "select" && (
                <div className="p-3 bg-muted/20 rounded-lg border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      Dropdown Options:
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => addOption(idx)}
                      className="text-[11px] h-6 px-2 text-primary-600 gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Choice
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(q.options || []).map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => updateOption(idx, optIdx, e.target.value)}
                          placeholder={`Option ${optIdx + 1}`}
                          className="flex-1 h-8 px-2.5 rounded border border-border bg-background text-xs text-foreground"
                        />
                        {(q.options || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeOption(idx, optIdx)}
                            className="text-muted-foreground hover:text-rose-600 p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Field Controls Bar: Required Toggle & Placeholder */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-border/60">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                    <input
                      type="checkbox"
                      checked={Boolean(q.required)}
                      onChange={(e) => updateQuestion(idx, { required: e.target.checked })}
                      className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500"
                    />
                    <span>Required Field (Mandatory)</span>
                  </label>
                </div>

                <div className="flex items-center gap-2 flex-1 max-w-xs">
                  <input
                    type="text"
                    value={q.placeholder || ""}
                    onChange={(e) => updateQuestion(idx, { placeholder: e.target.value })}
                    placeholder="Custom placeholder..."
                    className="w-full h-7 px-2.5 rounded border border-border/80 bg-background text-[11px] text-foreground placeholder:text-muted-foreground/70"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
