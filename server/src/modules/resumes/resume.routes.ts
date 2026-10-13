import express from "express";
import rateLimit from "express-rate-limit";
import auth from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { ResumeController } from "./resume.controller";
import {
  createResumeSchema, updateResumeSchema, resumeParamsSchema, resumeListQuerySchema,
  duplicateResumeSchema, createVersionSchema, createJobSchema, updateJobSchema, jobParamsSchema,
  createAnalysisSchema, analysisParamsSchema, analysisListQuerySchema, aiAssistSchema, fetchUrlSchema,
  publicResumeParamsSchema,
} from "./resume.validation";

const router = express.Router();

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, limit: 60, standardHeaders: "draft-7", legacyHeaders: false,
  message: { success: false, message: "AI request limit reached. Try again later.", errors: [] },
});

router.get("/scoring-model", ResumeController.scoringModel);
router.get("/shared/:slug", validate(publicResumeParamsSchema), ResumeController.publicResume);

router.use(auth());

// Resumes
router.get("/", validate(resumeListQuerySchema), ResumeController.listResumes);
router.post("/", validate(createResumeSchema), ResumeController.createResume);
router.get("/:resumeId", validate(resumeParamsSchema), ResumeController.getResume);
router.patch("/:resumeId", validate(updateResumeSchema), ResumeController.updateResume);
router.delete("/:resumeId", validate(resumeParamsSchema), ResumeController.deleteResume);
router.post("/:resumeId/duplicate", validate(duplicateResumeSchema), ResumeController.duplicateResume);
router.get("/:resumeId/versions", validate(resumeParamsSchema), ResumeController.listVersions);
router.post("/:resumeId/versions", validate(createVersionSchema), ResumeController.createVersion);

// Analyses
router.get("/analyses/list", validate(analysisListQuerySchema), ResumeController.listAnalyses);
router.post("/analyses", aiLimiter, validate(createAnalysisSchema), ResumeController.createAnalysis);
router.get("/analyses/:analysisId", validate(analysisParamsSchema), ResumeController.getAnalysis);
router.delete("/analyses/:analysisId", validate(analysisParamsSchema), ResumeController.deleteAnalysis);

// Job descriptions
router.get("/jobs/list", ResumeController.listJobs);
router.post("/jobs", validate(createJobSchema), ResumeController.createJob);
router.patch("/jobs/:jobId", validate(updateJobSchema), ResumeController.updateJob);
router.delete("/jobs/:jobId", validate(jobParamsSchema), ResumeController.deleteJob);

// AI assist + URL intake
router.post("/ai/assist", aiLimiter, validate(aiAssistSchema), ResumeController.aiAssist);
router.post("/fetch-url", aiLimiter, validate(fetchUrlSchema), ResumeController.fetchUrl);

export const ResumeRouter = router;

