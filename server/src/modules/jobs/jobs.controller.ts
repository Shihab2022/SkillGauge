import { Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import { AuthRequest } from "../../middlewares/auth";
import { JobServices } from "./jobs.service";

/* ------------------------------------------------------------- Recruiter Endpoints */

const createJob = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await JobServices.createJobPosting(req.user!, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: "Job posting created successfully",
    data: result,
  });
});

const updateJob = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id);
  const result = await JobServices.updateJobPosting(req.user!, id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Job posting updated successfully",
    data: result,
  });
});

const deleteJob = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id);
  const result = await JobServices.deleteJobPosting(req.user!, id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Job posting deleted successfully",
    data: result,
  });
});

const getMineOne = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id);
  const result = await JobServices.getJobPostingForRecruiter(req.user!, id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Job posting retrieved successfully",
    data: result,
  });
});

const listMine = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await JobServices.listCompanyJobPostings(
    req.user!,
    req.query as any,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Company job postings retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const listApplications = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = String(req.params.id);
  const result = await JobServices.listJobApplications(
    req.user!,
    id,
    req.query as any,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Job applications retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const listAllCompanyApplications = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const result = await JobServices.listJobApplications(
      req.user!,
      undefined,
      req.query as any,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Company applications retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  },
);

const getApplication = catchAsync(async (req: AuthRequest, res: Response) => {
  const applicationId = String(req.params.applicationId);
  const result = await JobServices.getJobApplication(req.user!, applicationId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Job application retrieved successfully",
    data: result,
  });
});

const updateApplicationStatus = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const applicationId = String(req.params.applicationId);
    const result = await JobServices.updateApplicationStatus(
      req.user!,
      applicationId,
      req.body,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Application status updated successfully",
      data: result,
    });
  },
);

const inviteAssessment = catchAsync(async (req: AuthRequest, res: Response) => {
  const applicationId = String(req.params.applicationId);
  const result = await JobServices.inviteApplicantToAssessment(
    req.user!,
    applicationId,
    req.body.assessmentId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Applicant invited to assessment",
    data: result,
  });
});

const inviteInterview = catchAsync(async (req: AuthRequest, res: Response) => {
  const applicationId = String(req.params.applicationId);
  const result = await JobServices.inviteApplicantToInterview(
    req.user!,
    applicationId,
    req.body.interviewId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Applicant invited to video interview",
    data: result,
  });
});

/* ------------------------------------------------------------- Public Endpoints */

const listPublic = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await JobServices.listPublicJobPostings(req.query as any);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Public job postings retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getCompanyCareer = catchAsync(async (req: AuthRequest, res: Response) => {
  const companySlug = String(req.params.companySlug);
  const result = await JobServices.getPublicCompanyCareerPage(companySlug);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Company career page retrieved successfully",
    data: result,
  });
});

const getPublicJob = catchAsync(async (req: AuthRequest, res: Response) => {
  const idOrSlug = String(req.params.idOrSlug);
  const companySlug = typeof req.query.company === "string" ? req.query.company : undefined;
  const result = await JobServices.getPublicJobPosting(idOrSlug, companySlug);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: "Job posting retrieved successfully",
    data: result,
  });
});

const applyToJob = catchAsync(async (req: AuthRequest, res: Response) => {
  const idOrSlug = String(req.params.idOrSlug);
  const result = await JobServices.submitJobApplication(
    idOrSlug,
    req.user ?? null,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: result.message,
    data: result,
  });
});

/* ------------------------------------------------------------- Candidate Endpoints */

const getCandidateApplications = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const result = await JobServices.getCandidateApplications(req.user!);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: "Candidate applications retrieved successfully",
      data: result,
    });
  },
);

export const JobControllers = {
  createJob,
  updateJob,
  deleteJob,
  getMineOne,
  listMine,
  listApplications,
  listAllCompanyApplications,
  getApplication,
  updateApplicationStatus,
  inviteAssessment,
  inviteInterview,
  listPublic,
  getCompanyCareer,
  getPublicJob,
  applyToJob,
  getCandidateApplications,
};
