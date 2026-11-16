import type { ResumeContent } from "./types.resume";

export interface ActionVerbCategory {
  category: string;
  verbs: string[];
}

export const ACTION_VERBS_BY_CATEGORY: ActionVerbCategory[] = [
  {
    category: "Technical & Architecture",
    verbs: ["Architected", "Engineered", "Designed", "Constructed", "Deployed", "Refactored", "Containerized", "Automated"],
  },
  {
    category: "Optimization & Performance",
    verbs: ["Accelerated", "Optimized", "Streamlined", "Reduced", "Scaled", "Boosted", "Maximized", "Overhauled"],
  },
  {
    category: "Leadership & Strategy",
    verbs: ["Spearheaded", "Championed", "Orchestrated", "Mentored", "Pioneered", "Steered", "Directed", "Mobilized"],
  },
  {
    category: "Delivery & Execution",
    verbs: ["Delivered", "Shipped", "Integrated", "Executed", "Implemented", "Launched", "Rolled out", "Established"],
  },
];

export interface RolePreset {
  id: string;
  name: string;
  role: string;
  summary: string;
  skillGroups: { category: string; skills: string[] }[];
  sampleExperience: {
    company: string;
    jobTitle: string;
    startDate: string;
    endDate: string;
    current: boolean;
    location: string;
    bullets: string[];
  }[];
}

export const ROLE_PRESETS: RolePreset[] = [
  {
    id: "full-stack",
    name: "Full-Stack Engineer",
    role: "Senior Full-Stack Engineer",
    summary: "Full-Stack Software Engineer with 4+ years of experience architecting high-performance SaaS applications with React, Node.js, and PostgreSQL. Proven track record of cutting API latency by 45%, leading agile teams, and shipping production features used by 50,000+ active users.",
    skillGroups: [
      { category: "Frontend", skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Redux Toolkit", "HTML5/CSS3"] },
      { category: "Backend & Cloud", skills: ["Node.js", "Express", "PostgreSQL", "Prisma ORM", "Redis", "Docker", "RESTful APIs", "AWS"] },
      { category: "DevOps & Tools", skills: ["Git", "GitHub Actions", "Jest", "CI/CD", "Linux", "Webpack/Vite"] },
    ],
    sampleExperience: [
      {
        company: "Apex Cloud Technologies",
        jobTitle: "Senior Full-Stack Engineer",
        startDate: "Jan 2023",
        endDate: "Present",
        current: true,
        location: "Remote",
        bullets: [
          "Architected multi-tenant assessment platform serving 50k+ monthly developers with 99.98% uptime.",
          "Cut p95 database query latency by 45% through Redis caching layers and PostgreSQL index optimization.",
          "Spearheaded automated CI/CD deployment pipelines on GitHub Actions, shrinking release cycle from 2 weeks to 2 hours.",
          "Mentored 4 junior engineers on clean architecture, TypeScript best practices, and unit test coverage (88%).",
        ],
      },
      {
        company: "NextGen Software Labs",
        jobTitle: "Software Engineer",
        startDate: "Jun 2021",
        endDate: "Dec 2022",
        current: false,
        location: "Dhaka",
        bullets: [
          "Engineered responsive customer portal with Next.js and Tailwind CSS, increasing mobile conversion rate by 28%.",
          "Implemented secure JWT and OAuth 2.0 dual-token authentication flow with granular role-based access control (RBAC).",
          "Automated PDF invoice generation and Stripe billing webhooks, processing over $300k in recurring transactions.",
        ],
      },
    ],
  },
  {
    id: "frontend-react",
    name: "Frontend Engineer (React / Next.js)",
    role: "Lead Frontend Engineer",
    summary: "User-focused Frontend Engineer specializing in React, Next.js, and TypeScript. Expert in responsive web apps, Web Vitals performance tuning, and design systems. Experienced in transforming Figma specifications into accessible, pixel-perfect production software.",
    skillGroups: [
      { category: "Core Technologies", skills: ["React 18/19", "Next.js App Router", "TypeScript", "JavaScript (ESNext)", "HTML5", "CSS3"] },
      { category: "Styling & UI", skills: ["Tailwind CSS", "Radix UI", "Shadcn/UI", "Framer Motion", "Storybook", "Sass"] },
      { category: "State & Testing", skills: ["Zustand", "TanStack React Query", "Jest", "React Testing Library", "Cypress", "Vite"] },
    ],
    sampleExperience: [
      {
        company: "Vanguard Digital Media",
        jobTitle: "Lead Frontend Engineer",
        startDate: "Feb 2023",
        endDate: "Present",
        current: true,
        location: "Remote",
        bullets: [
          "Overhauled legacy client dashboard to Next.js 14 App Router, elevating Google Lighthouse score from 58 to 96.",
          "Constructed internal component design system with Radix UI and Tailwind CSS, standardizing 40+ reusable UI components.",
          "Optimized bundle size and asset chunking, reducing First Contentful Paint (FCP) by 1.4s across all global markets.",
        ],
      },
    ],
  },
  {
    id: "backend-distributed",
    name: "Backend & Systems Engineer",
    role: "Senior Backend Engineer",
    summary: "Backend Engineer with a focus on distributed architectures, high-concurrency microservices, and relational database tuning. Experienced in Node.js, Go, PostgreSQL, and event-driven messaging with Kafka and Redis.",
    skillGroups: [
      { category: "Languages & Frameworks", skills: ["Node.js", "TypeScript", "Go (Golang)", "Express", "NestJS", "Python"] },
      { category: "Databases & Storage", skills: ["PostgreSQL", "Redis", "Prisma", "Elasticsearch", "MongoDB", "MySQL"] },
      { category: "Infrastructure & Messaging", skills: ["Kafka", "RabbitMQ", "Docker", "Kubernetes", "gRPC", "AWS (ECS, S3, RDS)"] },
    ],
    sampleExperience: [
      {
        company: "Synapse Data Systems",
        jobTitle: "Senior Backend Engineer",
        startDate: "Mar 2022",
        endDate: "Present",
        current: true,
        location: "Remote",
        bullets: [
          "Designed and shipped event-driven payment ledger processing 10,000+ daily transactions with idempotency guarantees.",
          "Implemented database connection pooling and read replicas in AWS RDS, eliminating query contention during peak surges.",
          "Refactored monolith into isolated domain microservices communicated via gRPC and RabbitMQ.",
        ],
      },
    ],
  },
  {
    id: "devops-cloud",
    name: "DevOps & Cloud Architect",
    role: "DevOps / SRE Engineer",
    summary: "Cloud and Site Reliability Engineer with 5+ years automating infrastructure on AWS and Kubernetes. Proven expertise in Terraform, GitHub Actions, zero-downtime blue/green releases, and 24/7 observability.",
    skillGroups: [
      { category: "Cloud & Containers", skills: ["AWS", "Kubernetes (EKS)", "Docker", "Terraform", "Helm", "Linux/Unix"] },
      { category: "CI/CD & Automation", skills: ["GitHub Actions", "GitLab CI", "ArgoCD", "Bash Scripting", "Python"] },
      { category: "Monitoring & Reliability", skills: ["Prometheus", "Grafana", "Datadog", "ELK Stack", "OpenTelemetry"] },
    ],
    sampleExperience: [
      {
        company: "Stratos Cloud Platform",
        jobTitle: "Senior Cloud Infrastructure Engineer",
        startDate: "Jan 2022",
        endDate: "Present",
        current: true,
        location: "Remote",
        bullets: [
          "Provisioned reproducible multi-region AWS cloud infrastructure using Terraform and Terragrunt for 12 microservices.",
          "Configured Kubernetes auto-scaling policies (HPA/KEDA), reducing monthly AWS infrastructure spend by 32% ($45k/yr).",
          "Built zero-downtime GitOps continuous delivery pipeline with ArgoCD, handling 20+ automated production releases daily.",
        ],
      },
    ],
  },
];

export function resumeToPlainText(content: ResumeContent): string {
  const p = content.personal || ({} as any);
  const lines: string[] = [];

  // Header
  if (p.fullName) lines.push(p.fullName.toUpperCase());
  if (p.title) lines.push(p.title);
  const contacts = [p.email, p.phone, p.location, p.linkedin, p.github, p.portfolio].filter(Boolean);
  if (contacts.length) lines.push(contacts.join(" | "));
  lines.push("\n" + "=".repeat(60) + "\n");

  // Summary
  const summary = (content.summary || p.summary || "").trim();
  if (summary) {
    lines.push("PROFESSIONAL SUMMARY");
    lines.push("-".repeat(20));
    lines.push(summary + "\n");
  }

  // Experience
  if (content.experience?.length) {
    lines.push("WORK EXPERIENCE");
    lines.push("-".repeat(20));
    content.experience.forEach((e) => {
      const dates = `${e.startDate || ""} - ${e.current ? "Present" : e.endDate || ""}`.trim();
      lines.push(`${e.jobTitle} | ${e.company}${e.location ? ` | ${e.location}` : ""} (${dates})`);
      (e.bullets || []).filter(Boolean).forEach((b) => {
        lines.push(`  • ${b}`);
      });
      lines.push("");
    });
  }

  // Skills
  if (content.skillGroups?.length) {
    lines.push("TECHNICAL SKILLS");
    lines.push("-".repeat(20));
    content.skillGroups.forEach((g) => {
      if (g.skills?.length) {
        lines.push(`${g.category}: ${g.skills.join(", ")}`);
      }
    });
    lines.push("");
  }

  // Projects
  if (content.projects?.length) {
    lines.push("PROJECTS");
    lines.push("-".repeat(20));
    content.projects.forEach((pr) => {
      lines.push(`${pr.name}${pr.technologies?.length ? ` [${pr.technologies.join(", ")}]` : ""}`);
      if (pr.description) lines.push(`  ${pr.description}`);
      if (pr.outcomes) lines.push(`  Outcomes: ${pr.outcomes}`);
      if (pr.url || pr.githubUrl) lines.push(`  Links: ${[pr.url, pr.githubUrl].filter(Boolean).join(" | ")}`);
      lines.push("");
    });
  }

  // Education
  if (content.education?.length) {
    lines.push("EDUCATION");
    lines.push("-".repeat(20));
    content.education.forEach((ed) => {
      lines.push(`${ed.degree} in ${ed.field} | ${ed.institution} (${ed.graduationDate || ""})`);
    });
    lines.push("");
  }

  // Certifications
  if (content.certifications?.length) {
    lines.push("CERTIFICATIONS");
    lines.push("-".repeat(20));
    content.certifications.forEach((c) => {
      lines.push(`${c.title} - ${c.issuer} (${c.date || ""})`);
    });
    lines.push("");
  }

  return lines.join("\n");
}
