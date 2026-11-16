import type { ResumeContent } from "./types.resume";

export interface AtsCheck {
  id: string;
  label: string;
  passed: boolean;
  scoreWeight: number;
  tip: string;
  sectionKey: string;
}

export interface AtsScoreResult {
  score: number; // 0 - 100
  rating: "Exceptional" | "Competitive" | "Needs Polish" | "Incomplete";
  tone: "green" | "blue" | "amber" | "red";
  checks: AtsCheck[];
  stats: {
    wordCount: number;
    bulletCount: number;
    metricsCount: number;
    skillsCount: number;
    experienceCount: number;
    educationCount: number;
    projectsCount: number;
  };
}

const ACTION_VERBS = new Set([
  "architected", "engineered", "developed", "spearheaded", "orchestrated",
  "accelerated", "optimized", "streamlined", "overhauled", "implemented",
  "designed", "deployed", "scaled", "delivered", "mentored", "championed",
  "built", "automated", "refactored", "integrated", "pioneered", "secured"
]);

const METRIC_REGEX = /(\b\d+(\.\d+)?%|\$\d+(\.\d+)?([kmbt])?|\b\d+([kmbt])?\+?(\s*(users|requests|qps|rps|candidates|clients|transactions|ms|seconds|minutes|hours|days|weeks|engineers|members|x))\b|\b\d{2,}\b)/i;

export function calculateLiveAtsScore(content: ResumeContent | null | undefined): AtsScoreResult {
  if (!content) {
    return {
      score: 0,
      rating: "Incomplete",
      tone: "red",
      checks: [],
      stats: {
        wordCount: 0,
        bulletCount: 0,
        metricsCount: 0,
        skillsCount: 0,
        experienceCount: 0,
        educationCount: 0,
        projectsCount: 0,
      },
    };
  }

  const p = content.personal || ({} as any);
  const summary = (content.summary || p.summary || "").trim();
  const experiences = content.experience || [];
  const education = content.education || [];
  const skillGroups = content.skillGroups || [];
  const projects = content.projects || [];

  // Extract all bullets
  const allBullets: string[] = [];
  experiences.forEach((exp) => {
    (exp.bullets || []).forEach((b) => {
      const clean = b.trim();
      if (clean) allBullets.push(clean);
    });
  });

  // Calculate statistics
  const totalSkills = skillGroups.reduce((acc, g) => acc + (g.skills?.length || 0), 0);
  const fullText = [
    p.fullName, p.title, p.location, summary,
    ...allBullets,
    ...projects.map((pr) => `${pr.name} ${pr.description} ${pr.outcomes}`),
    ...education.map((ed) => `${ed.institution} ${ed.degree} ${ed.field}`),
  ].join(" ");

  const words = fullText.split(/\s+/).filter(Boolean);
  const summaryWords = summary ? summary.split(/\s+/).filter(Boolean).length : 0;
  const metricsCount = allBullets.filter((b) => METRIC_REGEX.test(b)).length;

  const checks: AtsCheck[] = [
    // Personal / Contact Info (20 pts total)
    {
      id: "name-title",
      label: "Full Name & Professional Title",
      passed: Boolean(p.fullName?.trim() && p.title?.trim()),
      scoreWeight: 6,
      tip: "Include your full name and a clear target role title at the top.",
      sectionKey: "personal",
    },
    {
      id: "email-phone",
      label: "Email & Phone Number",
      passed: Boolean(p.email?.trim() && p.phone?.trim()),
      scoreWeight: 8,
      tip: "Recruiters and ATS need a verified email address and direct phone number.",
      sectionKey: "personal",
    },
    {
      id: "location-links",
      label: "Location & Profile Links (LinkedIn / GitHub)",
      passed: Boolean(p.location?.trim() && (p.linkedin?.trim() || p.github?.trim())),
      scoreWeight: 6,
      tip: "Add your city/country and a professional profile link (LinkedIn or GitHub).",
      sectionKey: "personal",
    },

    // Summary (15 pts total)
    {
      id: "summary-presence",
      label: "Professional Summary Provided",
      passed: Boolean(summary.length > 20),
      scoreWeight: 7,
      tip: "A 2-4 line executive summary hooks hiring managers and adds keyword weight.",
      sectionKey: "summary",
    },
    {
      id: "summary-length",
      label: "Optimal Summary Length (30–90 words)",
      passed: summaryWords >= 30 && summaryWords <= 90,
      scoreWeight: 8,
      tip: `Current length is ${summaryWords} words. Aim for 30 to 80 words for optimal ATS density.`,
      sectionKey: "summary",
    },

    // Work Experience & Impact (30 pts total)
    {
      id: "experience-presence",
      label: "Work Experience Listed",
      passed: experiences.length >= 1,
      scoreWeight: 10,
      tip: "List at least one professional work experience or internship position.",
      sectionKey: "experience",
    },
    {
      id: "bullets-density",
      label: "Achievement Bullet Points (3+ total)",
      passed: allBullets.length >= 3,
      scoreWeight: 10,
      tip: `You have ${allBullets.length} bullet points. Top resumes have 3-5 bullets per recent position.`,
      sectionKey: "experience",
    },
    {
      id: "metrics-impact",
      label: "Measurable Impact & Metrics (XYZ formula)",
      passed: metricsCount >= 2,
      scoreWeight: 10,
      tip: `Found metrics in ${metricsCount} bullet(s). Include numbers, percentages, latency or scale (e.g. "cut API latency by 35%").`,
      sectionKey: "experience",
    },

    // Skills (15 pts total)
    {
      id: "skills-groups",
      label: "Categorized Technical Skills",
      passed: skillGroups.length >= 1 && totalSkills >= 6,
      scoreWeight: 8,
      tip: "Organize skills into logical groups (e.g. Languages, Frameworks, Tools).",
      sectionKey: "skills",
    },
    {
      id: "skills-volume",
      label: "Comprehensive Keyword Count (10+ skills)",
      passed: totalSkills >= 10,
      scoreWeight: 7,
      tip: `You have ${totalSkills} skills listed. Aim for 10-18 role-relevant skills for maximum ATS match.`,
      sectionKey: "skills",
    },

    // Education & Projects (20 pts total)
    {
      id: "education-presence",
      label: "Education Details",
      passed: education.length >= 1 && Boolean(education[0]?.institution && education[0]?.degree),
      scoreWeight: 10,
      tip: "Include your degree, field of study, and academic institution.",
      sectionKey: "education",
    },
    {
      id: "projects-presence",
      label: "Applied Projects or Portfolio Works",
      passed: projects.length >= 1,
      scoreWeight: 10,
      tip: "Add applied projects demonstrating production technologies and measurable outcomes.",
      sectionKey: "projects",
    },
  ];

  let rawScore = 0;
  checks.forEach((c) => {
    if (c.passed) rawScore += c.scoreWeight;
  });

  const finalScore = Math.min(100, Math.max(0, rawScore));

  let rating: AtsScoreResult["rating"] = "Incomplete";
  let tone: AtsScoreResult["tone"] = "red";

  if (finalScore >= 85) {
    rating = "Exceptional";
    tone = "green";
  } else if (finalScore >= 70) {
    rating = "Competitive";
    tone = "blue";
  } else if (finalScore >= 50) {
    rating = "Needs Polish";
    tone = "amber";
  }

  return {
    score: finalScore,
    rating,
    tone,
    checks,
    stats: {
      wordCount: words.length,
      bulletCount: allBullets.length,
      metricsCount,
      skillsCount: totalSkills,
      experienceCount: experiences.length,
      educationCount: education.length,
      projectsCount: projects.length,
    },
  };
}
