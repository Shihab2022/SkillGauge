"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface JobDescriptionRendererProps {
  content: string;
  className?: string;
}

// Inline formatting helper: handles **bold**, __bold__, `code`, and [links](url)
function renderInline(text: string): React.ReactNode {
  if (!text) return null;

  // Regex to match bold (**text** or __text__), inline code (`code`), or markdown link [text](url)
  const tokenRegex = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Bold with ** or __
    if (
      (part.startsWith("**") && part.endsWith("**") && part.length >= 4) ||
      (part.startsWith("__") && part.endsWith("__") && part.length >= 4)
    ) {
      return (
        <strong key={index} className="font-bold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Inline code
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded bg-muted/80 text-foreground font-mono text-xs border border-border/50"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Markdown link
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 dark:text-primary-400 font-medium underline underline-offset-2 hover:text-primary-700 dark:hover:text-primary-300"
        >
          {linkMatch[1]}
        </a>
      );
    }

    // Normal text
    return <span key={index}>{part}</span>;
  });
}

type BlockType =
  | { type: "heading"; level: number; text: string }
  | { type: "bullet-list"; items: string[] }
  | { type: "numbered-list"; items: string[] }
  | { type: "paragraph"; text: string };

function parseBlocks(rawContent: string): BlockType[] {
  if (!rawContent || !rawContent.trim()) return [];

  const lines = rawContent.replace(/\r\n/g, "\n").split("\n");
  const blocks: BlockType[] = [];

  let currentBulletItems: string[] = [];
  let currentNumberedItems: string[] = [];
  let currentParagraphLines: string[] = [];

  const flushBullets = () => {
    if (currentBulletItems.length > 0) {
      blocks.push({ type: "bullet-list", items: [...currentBulletItems] });
      currentBulletItems = [];
    }
  };

  const flushNumbered = () => {
    if (currentNumberedItems.length > 0) {
      blocks.push({ type: "numbered-list", items: [...currentNumberedItems] });
      currentNumberedItems = [];
    }
  };

  const flushParagraph = () => {
    if (currentParagraphLines.length > 0) {
      const fullText = currentParagraphLines.join(" ").trim();
      if (fullText) {
        blocks.push({ type: "paragraph", text: fullText });
      }
      currentParagraphLines = [];
    }
  };

  const flushAll = () => {
    flushBullets();
    flushNumbered();
    flushParagraph();
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const trimmed = line.trim();

    // Blank line indicates separation between blocks
    if (!trimmed) {
      flushAll();
      continue;
    }

    // 1. Heading checks (e.g. ## Title or # Title or ### Title)
    // Matches: "## Title", "### Title", or "##Title"
    const headingMatch = trimmed.match(/^(#{1,6})\s*(.*)$/);
    if (headingMatch && headingMatch[2]!.trim().length > 0) {
      flushAll();
      const level = headingMatch[1]!.length;
      const text = headingMatch[2]!.trim();
      blocks.push({ type: "heading", level, text });
      continue;
    }

    // 2. Bullet list checks (e.g. - item, * item, + item, • item)
    const bulletMatch =
      trimmed.match(/^([-*+•]|\u2022)\s+(.*)$/) || trimmed.match(/^[•]\s*(.*)$/);
    if (bulletMatch) {
      flushNumbered();
      flushParagraph();
      const itemText = bulletMatch[bulletMatch.length - 1]!.trim();
      currentBulletItems.push(itemText);
      continue;
    }

    // 3. Numbered list checks (e.g. 1. item, 2. item)
    const numberedMatch = trimmed.match(/^\d+[\.\)]\s+(.*)$/);
    if (numberedMatch) {
      flushBullets();
      flushParagraph();
      currentNumberedItems.push(numberedMatch[1]!.trim());
      continue;
    }

    // 4. Regular text (paragraph - user can write text without title)
    if (currentBulletItems.length > 0) {
      flushBullets();
    }
    if (currentNumberedItems.length > 0) {
      flushNumbered();
    }
    currentParagraphLines.push(trimmed);
  }

  flushAll();
  return blocks;
}

export function JobDescriptionRenderer({
  content,
  className,
}: JobDescriptionRendererProps) {
  if (!content || !content.trim()) {
    return (
      <div className={cn("text-xs text-muted-foreground italic", className)}>
        No description provided.
      </div>
    );
  }

  const blocks = parseBlocks(content);

  return (
    <div className={cn("space-y-4 text-foreground/90 font-sans", className)}>
      {blocks.map((block, idx) => {
        if (block.type === "heading") {
          // If user starts with ## or #, display as bold heading
          if (block.level === 1) {
            return (
              <h2
                key={idx}
                className="text-lg sm:text-xl font-bold text-foreground tracking-tight pt-3 first:pt-0"
              >
                {renderInline(block.text)}
              </h2>
            );
          }
          if (block.level === 2) {
            return (
              <h3
                key={idx}
                className="text-base sm:text-lg font-bold text-foreground tracking-tight pt-3 first:pt-0"
              >
                {renderInline(block.text)}
              </h3>
            );
          }
          return (
            <h4
              key={idx}
              className="text-sm sm:text-base font-bold text-foreground pt-2 first:pt-0"
            >
              {renderInline(block.text)}
            </h4>
          );
        }

        if (block.type === "bullet-list") {
          // Bullet point lists
          return (
            <ul key={idx} className="space-y-2 my-2.5 pl-1">
              {block.items.map((item, itemIdx) => (
                <li
                  key={itemIdx}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90 leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400 mt-2 shrink-0" />
                  <span className="flex-1">{renderInline(item)}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "numbered-list") {
          return (
            <ol key={idx} className="space-y-2 my-2.5 pl-1 list-none">
              {block.items.map((item, itemIdx) => (
                <li
                  key={itemIdx}
                  className="flex items-start gap-2 text-xs sm:text-sm text-foreground/90 leading-relaxed"
                >
                  <span className="font-semibold text-primary-600 dark:text-primary-400 text-xs mt-0.5 shrink-0 w-4">
                    {itemIdx + 1}.
                  </span>
                  <span className="flex-1">{renderInline(item)}</span>
                </li>
              ))}
            </ol>
          );
        }

        if (block.type === "paragraph") {
          // Text without title renders as a clean paragraph
          return (
            <p
              key={idx}
              className="text-xs sm:text-sm text-foreground/90 leading-relaxed my-2"
            >
              {renderInline(block.text)}
            </p>
          );
        }

        return null;
      })}
    </div>
  );
}
