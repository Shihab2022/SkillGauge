import express from "express";
import auth, { optionalAuth } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import {
  createJobPostingSchema,
  updateJobPostingSchema,
  listJobPostingsQuerySchema,
  submitApplicationSchema,
  updateApplicationStatusSchema,
  inviteApplicantAssessmentSchema,
  inviteApplicantInterviewSchema,
} from "./jobs.validation";
import { JobControllers } from "./jobs.controller";

const router = express.Router();

/* ------------------------------------------------------------- Public Routes (Ashby Style) */

// Global Job Board
router.get(
  "/",
  validate(listJobPostingsQuerySchema),
  JobControllers.listPublic,
);

// Company public career page
router.get("/company/:companySlug", JobControllers.getCompanyCareer);

// Single public job posting details
router.get("/posting/:idOrSlug", JobControllers.getPublicJob);

// Public application submission (guest or logged in candidate)
router.post(
  "/posting/:idOrSlug/apply",
  optionalAuth,
  validate(submitApplicationSchema),
  JobControllers.applyToJob,
);

/* ------------------------------------------------------------- Candidate Portal Routes */

router.get(
  "/candidate/my-applications",
  auth("CANDIDATE"),
  JobControllers.getCandidateApplications,
);

/* ------------------------------------------------------------- Recruiter / Company Routes */

router.get(
  "/manage/mine",
  auth("RECRUITER", "ADMIN"),
  JobControllers.listMine,
);

router.post(
  "/manage",
  auth("RECRUITER", "ADMIN"),
  validate(createJobPostingSchema),
  JobControllers.createJob,
);

router.get(
  "/manage/applications",
  auth("RECRUITER", "ADMIN"),
  JobControllers.listAllCompanyApplications,
);

router.get(
  "/manage/applications/:applicationId",
  auth("RECRUITER", "ADMIN"),
  JobControllers.getApplication,
);

router.patch(
  "/manage/applications/:applicationId/status",
  auth("RECRUITER", "ADMIN"),
  validate(updateApplicationStatusSchema),
  JobControllers.updateApplicationStatus,
);

router.post(
  "/manage/applications/:applicationId/invite-assessment",
  auth("RECRUITER", "ADMIN"),
  validate(inviteApplicantAssessmentSchema),
  JobControllers.inviteAssessment,
);

router.post(
  "/manage/applications/:applicationId/invite-interview",
  auth("RECRUITER", "ADMIN"),
  validate(inviteApplicantInterviewSchema),
  JobControllers.inviteInterview,
);

router.get(
  "/manage/:id",
  auth("RECRUITER", "ADMIN"),
  JobControllers.getMineOne,
);

router.patch(
  "/manage/:id",
  auth("RECRUITER", "ADMIN"),
  validate(updateJobPostingSchema),
  JobControllers.updateJob,
);

router.delete(
  "/manage/:id",
  auth("RECRUITER", "ADMIN"),
  JobControllers.deleteJob,
);

router.get(
  "/manage/:id/applications",
  auth("RECRUITER", "ADMIN"),
  JobControllers.listApplications,
);

export const JobRouter = router;
