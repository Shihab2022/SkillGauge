"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Briefcase,
  ArrowLeft,
  DollarSign,
  Video,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useCompanyJobPosting, useUpdateJobPosting } from "@/hooks/useJobs";
import { useAssessments } from "@/hooks/useAssessments";
import { useInterviews } from "@/hooks/useInterviews";
import { Button } from "@/components/ui/Button";
import { CustomFieldBuilder } from "@/components/recruiter/CustomFieldBuilder";
import type {
  JobWorkplaceType,
  JobEmploymentType,
  JobSeniority,
  JobPostingStatus,
  CustomQuestion,
} from "@/lib/types.jobs";

export default function EditJobPostingPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { data: job, isLoading } = useCompanyJobPosting(id);
  const updateMutation = useUpdateJobPosting(id);
  const { data: assessmentsData } = useAssessments();
  const { data: interviewsData } = useInterviews();

  const assessments = assessmentsData?.data || [];
  const interviews = interviewsData?.data || [];

  // Form Fields
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [workplaceType, setWorkplaceType] = useState<JobWorkplaceType>("REMOTE");
  const [employmentType, setEmploymentType] = useState<JobEmploymentType>("FULL_TIME");
  const [seniority, setSeniority] = useState<JobSeniority>("MID");

  const [salaryCurrency, setSalaryCurrency] = useState("USD");
  const [salaryMin, setSalaryMin] = useState<string>("");
  const [salaryMax, setSalaryMax] = useState<string>("");
  const [salaryInterval, setSalaryInterval] = useState("YEARLY");
  const [equityBonus, setEquityBonus] = useState("");

  const [overview, setOverview] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");

  const [assessmentId, setAssessmentId] = useState<string>("");
  const [interviewId, setInterviewId] = useState<string>("");
  const [status, setStatus] = useState<JobPostingStatus>("PUBLISHED");
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);

  useEffect(() => {
    if (job) {
      setTitle(job.title || "");
      setDepartment(job.department || "Engineering");
      setLocation(job.location || "Remote");
      setWorkplaceType(job.workplaceType || "REMOTE");
      setEmploymentType(job.employmentType || "FULL_TIME");
      setSeniority(job.seniority || "MID");
      setSalaryCurrency(job.salaryCurrency || "USD");
      setSalaryMin(job.salaryMin ? String(job.salaryMin) : "");
      setSalaryMax(job.salaryMax ? String(job.salaryMax) : "");
      setSalaryInterval(job.salaryInterval || "YEARLY");
      setEquityBonus(job.equityBonus || "");
      setOverview(job.overview || "");
      setDescription(job.description || "");
      setRequirements(job.requirements || "");
      setAssessmentId(job.assessmentId || "");
      setInterviewId(job.interviewId || "");
      setStatus(job.status || "PUBLISHED");
      setCustomQuestions(job.customQuestions || []);
    }
  }, [job]);

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

    updateMutation.mutate(
      {
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
      },
      {
        onSuccess: () => {
          toast.success("Job posting updated successfully!");
          router.push(`/recruiter/jobs/${id}`);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <p className="text-sm text-muted-foreground">Loading job details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div>
        <Link
          href={`/recruiter/jobs/${id}/applications`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Applicants
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Edit Job Opening
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update position description, screening questions, and compensation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Info */}
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
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as JobPostingStatus)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="PUBLISHED">Published (Active)</option>
                <option value="DRAFT">Draft</option>
                <option value="CLOSED">Closed</option>
                <option value="ARCHIVED">Archived</option>
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
                Equity & Benefits Note
              </label>
              <input
                type="text"
                value={equityBonus}
                onChange={(e) => setEquityBonus(e.target.value)}
                className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Job Description */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-foreground">
            Job Description (Markdown Supported)
          </h2>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Role Overview / One-Liner
            </label>
            <input
              type="text"
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Full Description & Requirements <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={14}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 rounded-lg border border-border bg-background font-mono text-xs sm:text-sm text-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Section 4: Application Input Fields Builder (Controlled by Admin) */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <CustomFieldBuilder
            questions={customQuestions}
            onChange={setCustomQuestions}
          />
        </div>

        {/* Section 5: SkillGauge Integrations */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-foreground">
            SkillGauge Assessment & Interview Linkage
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <ClipboardList className="w-3.5 h-3.5 text-primary-600" /> Linked Coding Assessment
              </label>
              <select
                value={assessmentId}
                onChange={(e) => setAssessmentId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">-- None --</option>
                {assessments.map((a: any) => (
                  <option key={a.id} value={a.id}>
                    {a.title} ({a.durationMinutes} mins)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-purple-600" /> Linked Video Interview
              </label>
              <select
                value={interviewId}
                onChange={(e) => setInterviewId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">-- None --</option>
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
          <Link href={`/recruiter/jobs/${id}/applications`}>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            loading={updateMutation.isPending}
            className="px-6"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
