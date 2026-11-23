"use client";

import React, { useState, useRef } from "react";
import {
  Bold,
  Heading2,
  List,
  Eye,
  Edit3,
  Sparkles,
  RotateCcw,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { JobDescriptionRenderer } from "./JobDescriptionRenderer";
import { cn } from "@/lib/utils";

interface JobDescriptionEditorProps {
  value: string;
  onChange: (value: string) => void;
  overview?: string;
  onOverviewChange?: (value: string) => void;
  onLoadTemplate?: () => void;
  className?: string;
}

export function JobDescriptionEditor({
  value,
  onChange,
  overview,
  onOverviewChange,
  onLoadTemplate,
  className,
}: JobDescriptionEditorProps) {
  const [mode, setMode] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper to insert or wrap markdown syntax
  const insertFormatting = (prefix: string, suffix: string = "", placeholder: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let replacement = "";
    if (selectedText) {
      replacement = `${prefix}${selectedText}${suffix}`;
    } else {
      replacement = `${prefix}${placeholder}${suffix}`;
    }

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + (selectedText ? selectedText.length : placeholder.length);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleInsertHeading = () => {
    insertFormatting("\n## ", "\n", "Section Title");
  };

  const handleInsertBold = () => {
    insertFormatting("**", "**", "bold text");
  };

  const handleInsertBullet = () => {
    insertFormatting("\n- ", "\n", "Bullet point item");
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Optional Role Overview field */}
      {overview !== undefined && onOverviewChange && (
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Role Overview / Elevator Pitch{" "}
            <span className="text-muted-foreground font-normal">(Optional one-liner summary)</span>
          </label>
          <input
            type="text"
            value={overview}
            onChange={(e) => onOverviewChange(e.target.value)}
            placeholder="e.g. Join our core platform team to build real-time voice infrastructure at global scale."
            className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      )}

      {/* Editor Main Card */}
      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-xs">
        {/* Toolbar Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-muted/40 border-b border-border">
          {/* Formatting Actions */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleInsertHeading}
              title="Add Bold Heading (##)"
              className="px-2.5 py-1.5 rounded-md hover:bg-background border border-transparent hover:border-border text-xs font-semibold text-foreground transition-all flex items-center gap-1.5"
            >
              <Heading2 className="w-3.5 h-3.5 text-primary-600" />
              <span>Heading</span>
            </button>

            <button
              type="button"
              onClick={handleInsertBold}
              title="Make Text Bold (**text**)"
              className="px-2.5 py-1.5 rounded-md hover:bg-background border border-transparent hover:border-border text-xs font-semibold text-foreground transition-all flex items-center gap-1.5"
            >
              <Bold className="w-3.5 h-3.5 text-primary-600" />
              <span>Bold</span>
            </button>

            <button
              type="button"
              onClick={handleInsertBullet}
              title="Add Bullet Point (-)"
              className="px-2.5 py-1.5 rounded-md hover:bg-background border border-transparent hover:border-border text-xs font-semibold text-foreground transition-all flex items-center gap-1.5"
            >
              <List className="w-3.5 h-3.5 text-primary-600" />
              <span>Bullet Point</span>
            </button>

            {onLoadTemplate && (
              <button
                type="button"
                onClick={onLoadTemplate}
                title="Load standard engineering job description template"
                className="px-2.5 py-1.5 rounded-md hover:bg-background border border-transparent hover:border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-all flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Template</span>
              </button>
            )}
          </div>

          {/* Mode Switcher: Write vs Preview */}
          <div className="flex items-center gap-1 bg-background p-0.5 rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setMode("write")}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5",
                mode === "write"
                  ? "bg-primary-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Edit3 className="w-3 h-3" />
              <span>Write</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("preview")}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5",
                mode === "preview"
                  ? "bg-primary-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Eye className="w-3 h-3" />
              <span>Live Preview</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        {mode === "write" ? (
          <div>
            <textarea
              ref={textareaRef}
              rows={14}
              required
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Enter full job description here...&#10;&#10;Formatting Tips:&#10;• Type ## at the start of a line to make it a bold title&#10;• Type - or * to create bullet points&#10;• You can write freely without titles if you prefer&#10;• Use **text** for bold words"
              className="w-full p-4 bg-background font-mono text-xs sm:text-sm text-foreground leading-relaxed focus:outline-none resize-y min-h-[280px]"
            />
          </div>
        ) : (
          <div className="p-6 bg-background min-h-[280px] max-h-[500px] overflow-y-auto">
            <div className="mb-3 pb-2 border-b border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <span>Candidate Preview Mode:</span>
              <span className="text-[11px] bg-muted px-2 py-0.5 rounded">Exact candidate rendering</span>
            </div>
            <JobDescriptionRenderer content={value} />
          </div>
        )}

        {/* Bottom Helper Bar */}
        <div className="px-4 py-2.5 bg-muted/20 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-primary-600 shrink-0" />
            <span>
              Use <code className="font-mono text-foreground font-semibold">##</code> for bold headings,{" "}
              <code className="font-mono text-foreground font-semibold">-</code> for bullet points, or write freely without titles.
            </span>
          </div>
          <span className="hidden sm:inline">
            {value.length} characters
          </span>
        </div>
      </div>
    </div>
  );
}
