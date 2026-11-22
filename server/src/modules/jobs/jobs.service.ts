import crypto from "crypto";
import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import ApiError from "../../helpers/ApiError";
import { IAuthUser } from "../../types";
import {
  JobWorkplaceType,
  JobEmploymentType,
  JobSeniority,
  JobPostingStatus,
  JobApplicationStatus,
} from "../../../generated/prisma/enums";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

/* ------------------------------------------------------------- Recruiter / Company Actions */

async function ensureCompany(user: IAuthUser): Promise<string> {
  let companyId = user.companyId;
  if (!companyId) {
    const member = await prisma.companyMember.findFirst({
      where: { userId: user.id },
      select: { companyId: true },
    });
    companyId = member?.companyId;
  }
  if (!companyId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You must belong to a company to post jobs or manage applications",
    );
  }
  return companyId;
}

export interface CreateJobPostingInput {
  title: string;
  department: string;
  location: string;
  workplaceType: JobWorkplaceType;
  employmentType: JobEmploymentType;
  seniority: JobSeniority;
  salaryCurrency: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryInterval?: string;
  equityBonus?: string | null;
  overview?: string | null;
  description: string;
  requirements?: string | null;
  customQuestions?: any[];
  assessmentId?: string | null;
  interviewId?: string | null;
  status?: JobPostingStatus;
}

async function createJobPosting(user: IAuthUser, data: CreateJobPostingInput) {
  const companyId = await ensureCompany(user);

  let baseSlug = slugify(data.title) || "job-position";
  let uniqueSlug = `${baseSlug}-${crypto.randomBytes(4).toString("hex")}`;

  // Check unique slug within company
  let collision = await prisma.jobPosting.findUnique({
    where: { companyId_slug: { companyId, slug: uniqueSlug } },
  });
  while (collision) {
    uniqueSlug = `${baseSlug}-${crypto.randomBytes(5).toString("hex")}`;
    collision = await prisma.jobPosting.findUnique({
      where: { companyId_slug: { companyId, slug: uniqueSlug } },
    });
  }

  // Validate optional assessment
  const cleanAssessmentId =
    data.assessmentId && typeof data.assessmentId === "string" && data.assessmentId.trim()
      ? data.assessmentId.trim()
      : null;
  if (cleanAssessmentId) {
    const assessment = await prisma.assessment.findFirst({
      where: { id: cleanAssessmentId, companyId, deletedAt: null },
    });
    if (!assessment) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Assessment not found or does not belong to your company",
      );
    }
  }

  // Validate optional interview
  const cleanInterviewId =
    data.interviewId && typeof data.interviewId === "string" && data.interviewId.trim()
      ? data.interviewId.trim()
      : null;
  if (cleanInterviewId) {
    const interview = await prisma.interview.findFirst({
      where: { id: cleanInterviewId, companyId, deletedAt: null },
    });
    if (!interview) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Video interview not found or does not belong to your company",
      );
    }
  }

  const posting = await prisma.jobPosting.create({
    data: {
      companyId,
      creatorId: user.id,
      title: data.title,
      slug: uniqueSlug,
      department: data.department || "Engineering",
      location: data.location || "Remote",
      workplaceType: data.workplaceType || "REMOTE",
      employmentType: data.employmentType || "FULL_TIME",
      seniority: data.seniority || "MID",
      salaryCurrency: data.salaryCurrency || "USD",
      salaryMin: data.salaryMin ?? null,
      salaryMax: data.salaryMax ?? null,
      salaryInterval: data.salaryInterval || "YEARLY",
      equityBonus: data.equityBonus ?? null,
      overview: data.overview ?? null,
      description: data.description,
      requirements: data.requirements ?? null,
      customQuestions: data.customQuestions || [],
      assessmentId: cleanAssessmentId,
      interviewId: cleanInterviewId,
      status: data.status || "PUBLISHED",
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
        },
      },
      assessment: {
        select: { id: true, title: true, durationMinutes: true },
      },
      interview: {
        select: { id: true, title: true, technology: true },
      },
    },
  });

  return posting;
}

async function updateJobPosting(
  user: IAuthUser,
  id: string,
  data: Partial<CreateJobPostingInput>,
) {
  const companyId = await ensureCompany(user);

  const existing = await prisma.jobPosting.findFirst({
    where: { id, companyId, deletedAt: null },
  });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Job posting not found");
  }

  const cleanAssessmentId =
    data.assessmentId !== undefined
      ? data.assessmentId && typeof data.assessmentId === "string" && data.assessmentId.trim()
        ? data.assessmentId.trim()
        : null
      : undefined;
  if (cleanAssessmentId) {
    const assessment = await prisma.assessment.findFirst({
      where: { id: cleanAssessmentId, companyId, deletedAt: null },
    });
    if (!assessment) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Assessment not found or does not belong to your company",
      );
    }
  }

  const cleanInterviewId =
    data.interviewId !== undefined
      ? data.interviewId && typeof data.interviewId === "string" && data.interviewId.trim()
        ? data.interviewId.trim()
        : null
      : undefined;
  if (cleanInterviewId) {
    const interview = await prisma.interview.findFirst({
      where: { id: cleanInterviewId, companyId, deletedAt: null },
    });
    if (!interview) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Video interview not found or does not belong to your company",
      );
    }
  }

  const updated = await prisma.jobPosting.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.department !== undefined && { department: data.department }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.workplaceType !== undefined && {
        workplaceType: data.workplaceType,
      }),
      ...(data.employmentType !== undefined && {
        employmentType: data.employmentType,
      }),
      ...(data.seniority !== undefined && { seniority: data.seniority }),
      ...(data.salaryCurrency !== undefined && {
        salaryCurrency: data.salaryCurrency,
      }),
      ...(data.salaryMin !== undefined && { salaryMin: data.salaryMin }),
      ...(data.salaryMax !== undefined && { salaryMax: data.salaryMax }),
      ...(data.salaryInterval !== undefined && {
        salaryInterval: data.salaryInterval,
      }),
      ...(data.equityBonus !== undefined && { equityBonus: data.equityBonus }),
      ...(data.overview !== undefined && { overview: data.overview }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.requirements !== undefined && {
        requirements: data.requirements,
      }),
      ...(data.customQuestions !== undefined && {
        customQuestions: data.customQuestions,
      }),
      ...(cleanAssessmentId !== undefined && {
        assessmentId: cleanAssessmentId,
      }),
      ...(cleanInterviewId !== undefined && { interviewId: cleanInterviewId }),
      ...(data.status !== undefined && { status: data.status }),
    },
    include: {
      company: {
        select: { id: true, name: true, slug: true, logo: true },
      },
      assessment: {
        select: { id: true, title: true, durationMinutes: true },
      },
      interview: {
        select: { id: true, title: true, technology: true },
      },
    },
  });

  return updated;
}

async function deleteJobPosting(user: IAuthUser, id: string) {
  const companyId = await ensureCompany(user);
  const existing = await prisma.jobPosting.findFirst({
    where: { id, companyId, deletedAt: null },
  });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Job posting not found");
  }

  await prisma.jobPosting.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      status: "ARCHIVED",
    },
  });

  return { success: true, message: "Job posting archived successfully" };
}

async function getJobPostingForRecruiter(user: IAuthUser, id: string) {
  const companyId = await ensureCompany(user);
  const posting = await prisma.jobPosting.findFirst({
    where: { id, companyId, deletedAt: null },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          website: true,
          description: true,
        },
      },
      assessment: {
        select: { id: true, title: true, durationMinutes: true },
      },
      interview: {
        select: { id: true, title: true, technology: true },
      },
      _count: {
        select: {
          applications: true,
        },
      },
    },
  });

  if (!posting) {
    throw new ApiError(httpStatus.NOT_FOUND, "Job posting not found");
  }

  // Count applications by status
  const statusCounts = await prisma.jobApplication.groupBy({
    by: ["status"],
    where: { jobPostingId: id, deletedAt: null },
    _count: { _all: true },
  });

  const breakdown = statusCounts.reduce(
    (acc, item) => {
      acc[item.status] = item._count._all;
      return acc;
    },
    {} as Record<string, number>,
  );

  return { ...posting, applicationBreakdown: breakdown };
}

async function listCompanyJobPostings(
  user: IAuthUser,
  query: {
    status?: JobPostingStatus;
    search?: string;
    page?: number | string;
    limit?: number | string;
  },
) {
  const companyId = await ensureCompany(user);
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);

  const where: any = {
    companyId,
    deletedAt: null,
  };

  if (query.status) {
    where.status = query.status;
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { department: { contains: query.search, mode: "insensitive" } },
      { location: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [total, postings] = await Promise.all([
    prisma.jobPosting.count({ where }),
    prisma.jobPosting.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
        assessment: {
          select: { id: true, title: true },
        },
        interview: {
          select: { id: true, title: true },
        },
      },
    }),
  ]);

  return {
    data: postings,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

/* ------------------------------------------------------------- Public Actions (Ashby Style) */

async function listPublicJobPostings(query: {
  search?: string;
  department?: string;
  workplaceType?: JobWorkplaceType;
  employmentType?: JobEmploymentType;
  seniority?: JobSeniority;
  companySlug?: string;
  page?: number | string;
  limit?: number | string;
}) {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);

  const where: any = {
    status: "PUBLISHED",
    deletedAt: null,
  };

  if (query.companySlug) {
    where.company = { slug: query.companySlug };
  }

  if (query.department) {
    where.department = { equals: query.department, mode: "insensitive" };
  }

  if (query.workplaceType) {
    where.workplaceType = query.workplaceType;
  }

  if (query.employmentType) {
    where.employmentType = query.employmentType;
  }

  if (query.seniority) {
    where.seniority = query.seniority;
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
      { location: { contains: query.search, mode: "insensitive" } },
      { company: { name: { contains: query.search, mode: "insensitive" } } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.jobPosting.count({ where }),
    prisma.jobPosting.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        department: true,
        location: true,
        workplaceType: true,
        employmentType: true,
        seniority: true,
        salaryCurrency: true,
        salaryMin: true,
        salaryMax: true,
        salaryInterval: true,
        equityBonus: true,
        overview: true,
        viewCount: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            location: true,
            industry: true,
            size: true,
          },
        },
      },
    }),
  ]);

  return {
    data: items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

async function getPublicCompanyCareerPage(companySlug: string) {
  const company = await prisma.company.findUnique({
    where: { slug: companySlug },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      description: true,
      website: true,
      industry: true,
      location: true,
      size: true,
    },
  });

  if (!company) {
    throw new ApiError(httpStatus.NOT_FOUND, "Company not found");
  }

  const jobs = await prisma.jobPosting.findMany({
    where: {
      companyId: company.id,
      status: "PUBLISHED",
      deletedAt: null,
    },
    orderBy: [{ department: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      department: true,
      location: true,
      workplaceType: true,
      employmentType: true,
      seniority: true,
      salaryCurrency: true,
      salaryMin: true,
      salaryMax: true,
      salaryInterval: true,
      equityBonus: true,
      overview: true,
      createdAt: true,
    },
  });

  // Group by department
  const departments: Record<string, typeof jobs> = {};
  for (const job of jobs) {
    const dept = job.department || "Other";
    if (!departments[dept]) {
      departments[dept] = [];
    }
    departments[dept].push(job);
  }

  return {
    company,
    totalOpenings: jobs.length,
    departments,
    jobs,
  };
}

async function getPublicJobPosting(idOrSlug: string, companySlug?: string) {
  // Find by ID or by (companySlug + slug) or by unique slug
  let posting = await prisma.jobPosting.findFirst({
    where: {
      OR: [
        { id: idOrSlug },
        { slug: idOrSlug },
        ...(companySlug
          ? [{ slug: idOrSlug, company: { slug: companySlug } }]
          : []),
      ],
      deletedAt: null,
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          description: true,
          website: true,
          industry: true,
          location: true,
          size: true,
        },
      },
    },
  });

  if (!posting) {
    throw new ApiError(httpStatus.NOT_FOUND, "Job posting not found");
  }

  // Increment view count asynchronously
  prisma.jobPosting
    .update({
      where: { id: posting.id },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => {});

  return posting;
}

export interface SubmitApplicationInput {
  fullName: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  currentCompany?: string | null;
  currentTitle?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  resumeUrl?: string | null;
  resumeFileName?: string | null;
  resumeText?: string | null;
  resumeData?: string | null;
  resumeSourceId?: string | null;
  coverLetter?: string | null;
  answers?: Array<{ questionId: string; question: string; answer: any }>;
}

async function submitJobApplication(
  idOrSlug: string,
  candidateUser: IAuthUser | null,
  data: SubmitApplicationInput,
) {
  const posting = await prisma.jobPosting.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      status: "PUBLISHED",
      deletedAt: null,
    },
    include: {
      company: { select: { id: true, name: true } },
    },
  });

  if (!posting) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "This job posting is no longer active or does not exist",
    );
  }

  // Check if candidate already applied with this email
  const existingApp = await prisma.jobApplication.findFirst({
    where: {
      jobPostingId: posting.id,
      email: data.email.toLowerCase().trim(),
      deletedAt: null,
    },
  });

  if (existingApp) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "You have already submitted an application for this position.",
    );
  }

  // If candidate is not logged in, try to link with existing user by email
  let candidateId = candidateUser?.id;
  if (!candidateId) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
      select: { id: true, role: true },
    });
    if (existingUser && existingUser.role === "CANDIDATE") {
      candidateId = existingUser.id;
    }
  }

  const application = await prisma.jobApplication.create({
    data: {
      jobPostingId: posting.id,
      candidateId: candidateId ?? null,
      fullName: data.fullName.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone ?? null,
      location: data.location ?? null,
      currentCompany: data.currentCompany ?? null,
      currentTitle: data.currentTitle ?? null,
      linkedinUrl: data.linkedinUrl || null,
      githubUrl: data.githubUrl || null,
      portfolioUrl: data.portfolioUrl || null,
      resumeUrl: data.resumeUrl ?? null,
      resumeFileName: data.resumeFileName ?? null,
      resumeText: data.resumeText ?? null,
      resumeData: data.resumeData ?? null,
      resumeSourceId: data.resumeSourceId ?? null,
      coverLetter: data.coverLetter ?? null,
      answers: data.answers || [],
      status: "APPLIED",
    },
  });

  // Notify company recruiters
  try {
    const recruiters = await prisma.companyMember.findMany({
      where: { companyId: posting.companyId },
      select: { userId: true },
    });

    for (const r of recruiters) {
      await prisma.notification.create({
        data: {
          userId: r.userId,
          type: "ASSESSMENT_INVITATION", // Or custom type
          title: "New Job Application Received",
          message: `${data.fullName} applied for ${posting.title}`,
          data: {
            jobPostingId: posting.id,
            applicationId: application.id,
            jobTitle: posting.title,
            applicantName: data.fullName,
            applicantEmail: data.email,
          },
        },
      });
    }
  } catch (err) {
    console.error("Failed to dispatch recruiter notification:", err);
  }

  return {
    applicationId: application.id,
    jobTitle: posting.title,
    companyName: posting.company.name,
    message: "Application submitted successfully! The hiring team has been notified.",
  };
}

/* ------------------------------------------------------------- Recruiter Application Management */

async function listJobApplications(
  user: IAuthUser,
  jobPostingId?: string,
  query: {
    status?: JobApplicationStatus;
    search?: string;
    page?: number | string;
    limit?: number | string;
  } = {},
) {
  const companyId = await ensureCompany(user);
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);

  const where: any = {
    jobPosting: { companyId, deletedAt: null },
    deletedAt: null,
  };

  if (jobPostingId) {
    where.jobPostingId = jobPostingId;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.search) {
    where.OR = [
      { fullName: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } },
      { currentCompany: { contains: query.search, mode: "insensitive" } },
      { currentTitle: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [total, applications] = await Promise.all([
    prisma.jobApplication.count({ where }),
    prisma.jobApplication.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        jobPosting: {
          select: {
            id: true,
            title: true,
            slug: true,
            department: true,
            assessmentId: true,
            interviewId: true,
          },
        },
      },
    }),
  ]);

  return {
    data: applications,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

async function getJobApplication(user: IAuthUser, applicationId: string) {
  const companyId = await ensureCompany(user);
  const application = await prisma.jobApplication.findFirst({
    where: {
      id: applicationId,
      jobPosting: { companyId, deletedAt: null },
      deletedAt: null,
    },
    include: {
      jobPosting: {
        select: {
          id: true,
          title: true,
          slug: true,
          department: true,
          assessmentId: true,
          interviewId: true,
          assessment: { select: { id: true, title: true } },
          interview: { select: { id: true, title: true } },
        },
      },
      candidate: {
        select: {
          id: true,
          name: true,
          email: true,
          profileImageUrl: true,
          skills: true,
        },
      },
    },
  });

  if (!application) {
    throw new ApiError(httpStatus.NOT_FOUND, "Application not found");
  }

  return application;
}

async function updateApplicationStatus(
  user: IAuthUser,
  applicationId: string,
  data: {
    status?: JobApplicationStatus;
    notes?: string | null;
    rating?: number | null;
  },
) {
  const companyId = await ensureCompany(user);
  const application = await prisma.jobApplication.findFirst({
    where: {
      id: applicationId,
      jobPosting: { companyId, deletedAt: null },
      deletedAt: null,
    },
  });

  if (!application) {
    throw new ApiError(httpStatus.NOT_FOUND, "Application not found");
  }

  const updated = await prisma.jobApplication.update({
    where: { id: applicationId },
    data: {
      ...(data.status !== undefined && { status: data.status }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.rating !== undefined && { rating: data.rating }),
    },
  });

  return updated;
}

/* ------------------------------------------------------------- Integration with Assessments & AI Interviews */

async function inviteApplicantToAssessment(
  user: IAuthUser,
  applicationId: string,
  customAssessmentId?: string,
) {
  const companyId = await ensureCompany(user);
  const application = await prisma.jobApplication.findFirst({
    where: {
      id: applicationId,
      jobPosting: { companyId, deletedAt: null },
      deletedAt: null,
    },
    include: {
      jobPosting: true,
    },
  });

  if (!application) {
    throw new ApiError(httpStatus.NOT_FOUND, "Application not found");
  }

  const targetAssessmentId =
    customAssessmentId || application.jobPosting.assessmentId;
  if (!targetAssessmentId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "No assessment is associated with this job posting. Please select an assessment to send an invitation.",
    );
  }

  const assessment = await prisma.assessment.findFirst({
    where: { id: targetAssessmentId, companyId, deletedAt: null },
  });
  if (!assessment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Assessment not found");
  }

  // Create an Invitation in SkillGauge
  const inviteToken = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invitation = await prisma.invitation.create({
    data: {
      assessmentId: assessment.id,
      companyId,
      invitedBy: user.id,
      email: application.email.toLowerCase(),
      candidateId: application.candidateId ?? null,
      token: inviteToken,
      expiresAt,
      status: "PENDING",
    },
  });

  // Mark application as Shortlisted / Interviewing
  await prisma.jobApplication.update({
    where: { id: applicationId },
    data: {
      status: "INTERVIEWING",
      notes: application.notes
        ? `${application.notes}\n[System]: Invited to assessment '${assessment.title}'`
        : `[System]: Invited to assessment '${assessment.title}'`,
    },
  });

  return {
    invitationId: invitation.id,
    token: inviteToken,
    assessmentTitle: assessment.title,
    message: `Invitation generated for ${application.fullName} to assessment '${assessment.title}'`,
  };
}

async function inviteApplicantToInterview(
  user: IAuthUser,
  applicationId: string,
  customInterviewId?: string,
) {
  const companyId = await ensureCompany(user);
  const application = await prisma.jobApplication.findFirst({
    where: {
      id: applicationId,
      jobPosting: { companyId, deletedAt: null },
      deletedAt: null,
    },
    include: {
      jobPosting: true,
    },
  });

  if (!application) {
    throw new ApiError(httpStatus.NOT_FOUND, "Application not found");
  }

  const targetInterviewId =
    customInterviewId || application.jobPosting.interviewId;
  if (!targetInterviewId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "No video interview is associated with this job posting. Please select a video interview.",
    );
  }

  const interview = await prisma.interview.findFirst({
    where: { id: targetInterviewId, companyId, deletedAt: null },
  });
  if (!interview) {
    throw new ApiError(httpStatus.NOT_FOUND, "Video interview not found");
  }

  // Create or retrieve session link
  const sessionToken = crypto.randomBytes(16).toString("hex");
  const interviewSession = await prisma.interviewSession.create({
    data: {
      interviewId: interview.id,
      candidateId: application.candidateId ?? null,
      candidateEmail: application.email,
      candidateName: application.fullName,
      status: "NOT_STARTED",
      token: sessionToken,
    },
  });

  await prisma.jobApplication.update({
    where: { id: applicationId },
    data: {
      status: "INTERVIEWING",
      notes: application.notes
        ? `${application.notes}\n[System]: Invited to AI video interview '${interview.title}'`
        : `[System]: Invited to AI video interview '${interview.title}'`,
    },
  });

  return {
    sessionId: interviewSession.id,
    sessionToken,
    interviewTitle: interview.title,
    message: `Interview session generated for ${application.fullName}`,
  };
}

/* ------------------------------------------------------------- Candidate Portal Actions */

async function getCandidateApplications(user: IAuthUser) {
  const applications = await prisma.jobApplication.findMany({
    where: {
      OR: [{ candidateId: user.id }, { email: user.email.toLowerCase() }],
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
    include: {
      jobPosting: {
        select: {
          id: true,
          title: true,
          slug: true,
          department: true,
          location: true,
          workplaceType: true,
          employmentType: true,
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
            },
          },
        },
      },
    },
  });

  return applications;
}

export const JobServices = {
  createJobPosting,
  updateJobPosting,
  deleteJobPosting,
  getJobPostingForRecruiter,
  listCompanyJobPostings,
  listPublicJobPostings,
  getPublicCompanyCareerPage,
  getPublicJobPosting,
  submitJobApplication,
  listJobApplications,
  getJobApplication,
  updateApplicationStatus,
  inviteApplicantToAssessment,
  inviteApplicantToInterview,
  getCandidateApplications,
};
