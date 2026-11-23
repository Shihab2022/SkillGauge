"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  DollarSign,
  Building2,
  Video,
  ClipboardList,
  Check,
  FileText,
  ListPlus,
} from "lucide-react";
import { toast } from "sonner";
import { useCreateJobPosting } from "@/hooks/useJobs";
import { useAssessments } from "@/hooks/useAssessments";
import { useInterviews } from "@/hooks/useInterviews";
import { Button } from "@/components/ui/Button";
import { CustomFieldBuilder } from "@/components/recruiter/CustomFieldBuilder";
import { JobDescriptionEditor } from "@/components/jobs/JobDescriptionEditor";
import { cn } from "@/lib/utils";
import type {
  JobWorkplaceType,
  JobEmploymentType,
  JobSeniority,
  JobPostingStatus,
  CustomQuestion,
} from "@/lib/types.jobs";

const TEMPLATE_ENGINEER = `## About the Company
We are a high-growth technology company building next-generation infrastructure and developer tools. Our mission is to empower software teams worldwide to build faster, smarter, and with greater confidence.

## About the Role
As a Software Engineer on our team, you will design, build, and maintain mission-critical web applications and backend systems. You will collaborate closely with product managers, designers, and fellow engineers to deliver seamless user experiences.

## Responsibilities
- Architect, build, and deploy performant full-stack features using modern frameworks.
- Write clean, well-tested, and maintainable TypeScript and Python/Go code.
- Optimize database queries, caching strategies, and system latency.
- Participate in code reviews, technical architecture sessions, and sprint planning.
- Continuously improve engineering standards, documentation, and tooling.

## Qualifications & Requirements
- 3+ years of experience building modern web applications at scale.
- Strong proficiency in TypeScript, React, Next.js, and Node.js.
- Solid understanding of relational databases (PostgreSQL), ORMs (Prisma), and caching (Redis).
- Experience designing and consuming RESTful APIs and asynchronous background queues.
- Passion for software craftsmanship, user experience, and continuous learning.

## Benefits & Perks
- Competitive salary with equity compensation package.
- Comprehensive health, dental, and vision insurance.
- Flexible remote-first work environment and home-office equipment budget.
- Generous paid time off, paid holidays, and parental leave.
- Continuous learning and conference attendance stipend.`;

export default function NewJobPostingPage() {
  const router = useRouter();
  const createMutation = useCreateJobPosting();
  const { data: assessmentsData } = useAssessments();
  const { data: interviewsData } = useInterviews();

  const assessments = assessmentsData?.data || [];
  const interviews = interviewsData?.data || [];

  // Form Fields
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [location, setLocation] = useState("Remote");
  const [workplaceType, setWorkplaceType] = useState<JobWorkplaceType>("REMOTE");
  const [employmentType, setEmploymentType] = useState<JobEmploymentType>("FULL_TIME");
  const [seniority, setSeniority] = useState<JobSeniority>("MID");

  const [salaryCurrency, setSalaryCurrency] = useState("USD");
  const [salaryMin, setSalaryMin] = useState<string>("120000");
  const [salaryMax, setSalaryMax] = useState<string>("180000");
  const [salaryInterval, setSalaryInterval] = useState("YEARLY");
  const [equityBonus, setEquityBonus] = useState("Equity + Comprehensive Health Benefits");

  const [overview, setOverview] = useState("");
  const [description, setDescription] = useState(TEMPLATE_ENGINEER);
  const [requirements, setRequirements] = useState("");
  const [contentTab, setContentTab] = useState<"description" | "fields">("description");

  const [assessmentId, setAssessmentId] = useState<string>("");
  const [interviewId, setInterviewId] = useState<string>("");
  const [status, setStatus] = useState<JobPostingStatus>("PUBLISHED");

  // Custom Screening Questions
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([
    {
      id: "q1",
      question: "Are you legally authorized to work in your country of residence?",
      type: "boolean",
      required: true,
    },
    {
      id: "q2",
      question: "How many years of professional experience do you have with modern full-stack web development?",
      type: "text",
      required: true,
    },
  ]);

  const addCustomQuestion = () => {
    setCustomQuestions([
      ...customQuestions,
      {
        id: `q_${Date.now()}`,
        question: "",
        type: "text",
        required: false,
      },
    ]);
  };

  const removeCustomQuestion = (index: number) => {
    setCustomQuestions(customQuestions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, updates: Partial<CustomQuestion>) => {
    const updated = [...customQuestions];
    updated[index] = { ...updated[index]!, ...updates };
    setCustomQuestions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a position title");
      return;
    }
    if (!description.trim() || description.length < 20) {
      toast.error("Please provide a comprehensive job description");
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      department: department.trim() || "Engineering",
      location: location.trim() || "Remote",
      workplaceType,
      employmentType,
      seniority,
      salaryCurrency,
      salaryMin: salaryMin ? parseInt(salaryMin, 10) : null,
      salaryMax: salaryMax ? parseInt(salaryMax, 10) : null,
      salaryInterval,
      equityBonus: equityBonus.trim() || null,
      overview: overview.trim() || null,
      description,
      requirements: requirements.trim() || null,
      customQuestions,
      assessmentId: assessmentId || null,
      interviewId: interviewId || null,
      status,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Back button */}
      <div>
        <Link
          href="/recruiter/jobs"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Job Openings
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Create New Job Opening
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Publish a new role with transparent compensation, screening questions, and an Ashby-style public career link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Role Overview */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary-600" /> Basic Role Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Job Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Software Engineer, Full Stack"
                className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Engineering, Product, Marketing..."
                className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Location Name
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="San Francisco, CA or Worldwide"
                className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Workplace Type
              </label>
              <select
                value={workplaceType}
                onChange={(e) => setWorkplaceType(e.target.value as JobWorkplaceType)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ON_SITE">On-site</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Employment Type
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as JobEmploymentType)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="FULL_TIME">Full-time</option>
                <option value="PART_TIME">Part-time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Experience Level / Seniority
              </label>
              <select
                value={seniority}
                onChange={(e) => setSeniority(e.target.value as JobSeniority)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="ENTRY">Entry Level</option>
                <option value="MID">Mid Level</option>
                <option value="SENIOR">Senior</option>
                <option value="LEAD">Lead / Staff</option>
                <option value="EXECUTIVE">Executive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Publication Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as JobPostingStatus)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="PUBLISHED">Published (Accepting Applications)</option>
                <option value="DRAFT">Draft (Internal Only)</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Compensation */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" /> Compensation & Equity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Currency
              </label>
              <select
                value={salaryCurrency}
                onChange={(e) => setSalaryCurrency(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="BDT">BDT (৳)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Minimum Salary
              </label>
              <input
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                placeholder="100000"
                className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Maximum Salary
              </label>
              <input
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                placeholder="160000"
                className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Pay Interval
              </label>
              <select
                value={salaryInterval}
                onChange={(e) => setSalaryInterval(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="YEARLY">Per Year</option>
                <option value="MONTHLY">Per Month</option>
                <option value="HOURLY">Per Hour</option>
              </select>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Equity & Perks Note
              </label>
              <input
                type="text"
                value={equityBonus}
                onChange={(e) => setEquityBonus(e.target.value)}
                placeholder="e.g. 0.1% - 0.5% Equity + 401(k) Match"
                className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Job Description & Application Fields (Tabbed Interface) */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {/* Tab Selection Header */}
          <div className="border-b border-border bg-muted/20 px-6 pt-4 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Role Details & Application Fields
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Switch between formatting the job description and customizing the application input fields.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-background p-1 rounded-xl border border-border self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setContentTab("description")}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2",
                  contentTab === "description"
                    ? "bg-primary-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Job Description</span>
              </button>

              <button
                type="button"
                onClick={() => setContentTab("fields")}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2",
                  contentTab === "fields"
                    ? "bg-primary-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <ListPlus className="w-3.5 h-3.5" />
                <span>Job Fields</span>
                <span
                  className={cn(
                    "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                    contentTab === "fields"
                      ? "bg-white/20 text-white"
                      : "bg-muted text-foreground"
                  )}
                >
                  {customQuestions.length}
                </span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {contentTab === "description" ? (
              <div className="space-y-4">
                <JobDescriptionEditor
                  value={description}
                  onChange={setDescription}
                  overview={overview}
                  onOverviewChange={setOverview}
                  onLoadTemplate={() => setDescription(TEMPLATE_ENGINEER)}
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Candidate Application Form & Custom Input Fields
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Control the input fields candidates see when applying for this role. Add questions, select input types (Text, Choices, Yes/No, Number, File), and toggle mandatory requirements.
                  </p>
                </div>

                {/* Standard Core Fields Overview */}
                <div className="bg-muted/20 border border-border/70 rounded-xl p-4 space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Standard Core Fields (Included Automatically)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded-lg border border-border/80 bg-background flex items-center justify-between">
                      <span className="font-medium text-foreground">Full Name</span>
                      <span className="text-[9px] font-bold text-rose-500 uppercase">Required</span>
                    </div>
                    <div className="p-2 rounded-lg border border-border/80 bg-background flex items-center justify-between">
                      <span className="font-medium text-foreground">Email Address</span>
                      <span className="text-[9px] font-bold text-rose-500 uppercase">Required</span>
                    </div>
                    <div className="p-2 rounded-lg border border-border/80 bg-background flex items-center justify-between">
                      <span className="font-medium text-foreground">Resume / CV</span>
                      <span className="text-[9px] font-bold text-rose-500 uppercase">Required</span>
                    </div>
                    <div className="p-2 rounded-lg border border-border/80 bg-background flex items-center justify-between">
                      <span className="font-medium text-foreground">Phone & Links</span>
                      <span className="text-[9px] text-muted-foreground">Optional</span>
                    </div>
                  </div>
                </div>

                <CustomFieldBuilder
                  questions={customQuestions}
                  onChange={setCustomQuestions}
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 5: SkillGauge Integrations (Superpower) */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" /> SkillGauge Assessment & AI Interview Linkage (Optional)
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Connect an assessment or video interview to invite applicants with one click from the ATS pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <ClipboardList className="w-3.5 h-3.5 text-primary-600" /> Link SkillGauge Coding Assessment
              </label>
              <select
                value={assessmentId}
                onChange={(e) => setAssessmentId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">-- No automated coding assessment --</option>
                {assessments.map((a: any) => (
                  <option key={a.id} value={a.id}>
                    {a.title} ({a.durationMinutes} mins)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-purple-600" /> Link AI Video Interview
              </label>
              <select
                value={interviewId}
                onChange={(e) => setInterviewId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">-- No AI video interview --</option>
                {interviews.map((i: any) => (
                  <option key={i.id} value={i.id}>
                    {i.title} ({i.technology})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Link href="/recruiter/jobs">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            loading={createMutation.isPending}
            className="px-6"
          >
            Publish Job Opening
          </Button>
        </div>
      </form>
    </div>
  );
}
