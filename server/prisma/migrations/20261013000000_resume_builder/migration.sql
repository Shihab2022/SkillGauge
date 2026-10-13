-- Resume builder & ATS analyzer tables
CREATE TYPE "ResumeStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "AnalysisSource" AS ENUM ('BUILDER', 'UPLOAD', 'URL');
CREATE TYPE "AnalysisStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

CREATE TABLE "Resume" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "targetRole" TEXT,
  "content" JSONB NOT NULL,
  "templateId" TEXT NOT NULL DEFAULT 'ats-classic-01',
  "customization" JSONB,
  "status" "ResumeStatus" NOT NULL DEFAULT 'DRAFT',
  "deletedAt" TIMESTAMP(3),
  "publicSlug" TEXT,
  "isPublic" BOOLEAN NOT NULL DEFAULT false,
  "latestScore" INTEGER,
  "lastAnalyzedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Resume_publicSlug_key" ON "Resume"("publicSlug");
CREATE INDEX "Resume_ownerId_idx" ON "Resume"("ownerId");
CREATE INDEX "Resume_ownerId_updatedAt_idx" ON "Resume"("ownerId", "updatedAt");
CREATE INDEX "Resume_status_idx" ON "Resume"("status");
CREATE INDEX "Resume_deletedAt_idx" ON "Resume"("deletedAt");

CREATE TABLE "ResumeVersion" (
  "id" TEXT NOT NULL,
  "resumeId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "content" JSONB NOT NULL,
  "templateId" TEXT,
  "label" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ResumeVersion_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ResumeVersion_resumeId_version_key" ON "ResumeVersion"("resumeId", "version");
CREATE INDEX "ResumeVersion_resumeId_idx" ON "ResumeVersion"("resumeId");

CREATE TABLE "JobDescription" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "company" TEXT,
  "description" TEXT NOT NULL,
  "sourceUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "JobDescription_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "JobDescription_ownerId_idx" ON "JobDescription"("ownerId");
CREATE INDEX "JobDescription_deletedAt_idx" ON "JobDescription"("deletedAt");

CREATE TABLE "ResumeAnalysis" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "resumeId" TEXT,
  "jobDescriptionId" TEXT,
  "source" "AnalysisSource" NOT NULL DEFAULT 'BUILDER',
  "status" "AnalysisStatus" NOT NULL DEFAULT 'PENDING',
  "resumeText" TEXT,
  "fileName" TEXT,
  "fileMime" TEXT,
  "sourceUrl" TEXT,
  "score" INTEGER,
  "categoryScores" JSONB,
  "report" JSONB,
  "provider" TEXT,
  "error" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ResumeAnalysis_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ResumeAnalysis_ownerId_idx" ON "ResumeAnalysis"("ownerId");
CREATE INDEX "ResumeAnalysis_resumeId_idx" ON "ResumeAnalysis"("resumeId");
CREATE INDEX "ResumeAnalysis_status_idx" ON "ResumeAnalysis"("status");

ALTER TABLE "Resume" ADD CONSTRAINT "Resume_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResumeVersion" ADD CONSTRAINT "ResumeVersion_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobDescription" ADD CONSTRAINT "JobDescription_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResumeAnalysis" ADD CONSTRAINT "ResumeAnalysis_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResumeAnalysis" ADD CONSTRAINT "ResumeAnalysis_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ResumeAnalysis" ADD CONSTRAINT "ResumeAnalysis_jobDescriptionId_fkey" FOREIGN KEY ("jobDescriptionId") REFERENCES "JobDescription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
