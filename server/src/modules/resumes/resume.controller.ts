import { Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import { AuthRequest } from "../../middlewares/auth";
import { ResumeServices } from "./resume.service";
import { AnalysisServices, fetchResumeUrlText } from "./analysis.service";
import { assistWithAi } from "./ai.service";
import { SCORING_WEIGHTS } from "./scoring";

const scoringModel = catchAsync(async (_req: AuthRequest, res: Response) => {
  sendResponse(res, { statusCode: httpStatus.OK, message: "Scoring model retrieved", data: { weights: SCORING_WEIGHTS, total: 100, note: "Internal quality indicator, not a vendor ATS guarantee." } });
});

const listResumes = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await ResumeServices.list(req.user!, req.query as never);
  sendResponse(res, { statusCode: httpStatus.OK, message: "Resumes retrieved", meta: result.meta, data: result.data });
});

const createResume = catchAsync(async (req: AuthRequest, res: Response) => {
  const resume = await ResumeServices.create(req.user!, req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, message: "Resume created", data: resume });
});

const getResume = catchAsync(async (req: AuthRequest, res: Response) => {
  const resume = await ResumeServices.getById(req.user!, String(req.params.resumeId));
  sendResponse(res, { statusCode: httpStatus.OK, message: "Resume retrieved", data: resume });
});

const updateResume = catchAsync(async (req: AuthRequest, res: Response) => {
  const resume = await ResumeServices.update(req.user!, String(req.params.resumeId), req.body);
  sendResponse(res, { statusCode: httpStatus.OK, message: "Resume saved", data: resume });
});

const deleteResume = catchAsync(async (req: AuthRequest, res: Response) => {
  await ResumeServices.remove(req.user!, String(req.params.resumeId));
  sendResponse(res, { statusCode: httpStatus.OK, message: "Resume deleted", data: null });
});

const duplicateResume = catchAsync(async (req: AuthRequest, res: Response) => {
  const resume = await ResumeServices.duplicate(req.user!, String(req.params.resumeId), req.body?.title);
  sendResponse(res, { statusCode: httpStatus.CREATED, message: "Resume duplicated", data: resume });
});

const listVersions = catchAsync(async (req: AuthRequest, res: Response) => {
  const data = await ResumeServices.versions(req.user!, String(req.params.resumeId));
  sendResponse(res, { statusCode: httpStatus.OK, message: "Versions retrieved", data });
});

const createVersion = catchAsync(async (req: AuthRequest, res: Response) => {
  const data = await ResumeServices.snapshot(req.user!, String(req.params.resumeId), req.body?.label);
  sendResponse(res, { statusCode: httpStatus.CREATED, message: "Version saved", data });
});

const publicResume = catchAsync(async (req: AuthRequest, res: Response) => {
  const data = await ResumeServices.publicGet(String(req.params.slug));
  sendResponse(res, { statusCode: httpStatus.OK, message: "Shared resume retrieved", data });
});

const createAnalysis = catchAsync(async (req: AuthRequest, res: Response) => {
  const data = await AnalysisServices.createAnalysis(req.user!, req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, message: "Analysis completed", data });
});

const listAnalyses = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await AnalysisServices.listAnalyses(req.user!, req.query as never);
  sendResponse(res, { statusCode: httpStatus.OK, message: "Analyses retrieved", meta: result.meta, data: result.data });
});

const getAnalysis = catchAsync(async (req: AuthRequest, res: Response) => {
  const data = await AnalysisServices.getAnalysis(req.user!, String(req.params.analysisId));
  sendResponse(res, { statusCode: httpStatus.OK, message: "Analysis retrieved", data });
});

const deleteAnalysis = catchAsync(async (req: AuthRequest, res: Response) => {
  await AnalysisServices.deleteAnalysis(req.user!, String(req.params.analysisId));
  sendResponse(res, { statusCode: httpStatus.OK, message: "Analysis deleted", data: null });
});

const listJobs = catchAsync(async (req: AuthRequest, res: Response) => {
  const data = await AnalysisServices.listJobs(req.user!);
  sendResponse(res, { statusCode: httpStatus.OK, message: "Job descriptions retrieved", data });
});

const createJob = catchAsync(async (req: AuthRequest, res: Response) => {
  const data = await AnalysisServices.createJob(req.user!, req.body);
  sendResponse(res, { statusCode: httpStatus.CREATED, message: "Job description saved", data });
});

const updateJob = catchAsync(async (req: AuthRequest, res: Response) => {
  const data = await AnalysisServices.updateJob(req.user!, String(req.params.jobId), req.body);
  sendResponse(res, { statusCode: httpStatus.OK, message: "Job description updated", data });
});

const deleteJob = catchAsync(async (req: AuthRequest, res: Response) => {
  await AnalysisServices.deleteJob(req.user!, String(req.params.jobId));
  sendResponse(res, { statusCode: httpStatus.OK, message: "Job description deleted", data: null });
});

const aiAssist = catchAsync(async (req: AuthRequest, res: Response) => {
  const { action, text, context, targetRole } = req.body;
  const data = await assistWithAi(action, text, context, targetRole);
  sendResponse(res, { statusCode: httpStatus.OK, message: "Suggestion ready — review before applying", data });
});

const fetchUrl = catchAsync(async (req: AuthRequest, res: Response) => {
  const data = await fetchResumeUrlText(req.body.url);
  sendResponse(res, { statusCode: httpStatus.OK, message: "Resume text extracted from URL", data });
});

export const ResumeController = {
  scoringModel, listResumes, createResume, getResume, updateResume, deleteResume,
  duplicateResume, listVersions, createVersion, publicResume, createAnalysis,
  listAnalyses, getAnalysis, deleteAnalysis, listJobs, createJob, updateJob, deleteJob, aiAssist, fetchUrl,
};
