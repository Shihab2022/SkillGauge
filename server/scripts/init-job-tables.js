const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function init() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('Connected to Neon PostgreSQL');

  // Enums
  await client.query(`
    DO $$ BEGIN
      CREATE TYPE "JobWorkplaceType" AS ENUM ('REMOTE', 'HYBRID', 'ON_SITE');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "JobEmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "JobSeniority" AS ENUM ('ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "JobPostingStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "JobApplicationStatus" AS ENUM ('APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEWING', 'OFFERED', 'REJECTED', 'HIRED', 'WITHDRAWN');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `);
  console.log('Enums verified/created');

  // JobPosting table
  await client.query(`
    CREATE TABLE IF NOT EXISTS "JobPosting" (
      "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "companyId" TEXT NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
      "creatorId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "title" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "department" TEXT NOT NULL DEFAULT 'Engineering',
      "location" TEXT NOT NULL DEFAULT 'Remote',
      "workplaceType" "JobWorkplaceType" NOT NULL DEFAULT 'REMOTE',
      "employmentType" "JobEmploymentType" NOT NULL DEFAULT 'FULL_TIME',
      "seniority" "JobSeniority" NOT NULL DEFAULT 'MID',
      "salaryCurrency" TEXT NOT NULL DEFAULT 'USD',
      "salaryMin" INTEGER,
      "salaryMax" INTEGER,
      "salaryInterval" TEXT NOT NULL DEFAULT 'YEARLY',
      "equityBonus" TEXT,
      "overview" TEXT,
      "description" TEXT NOT NULL,
      "requirements" TEXT,
      "customQuestions" JSONB DEFAULT '[]'::jsonb,
      "assessmentId" TEXT REFERENCES "Assessment"("id") ON DELETE SET NULL,
      "interviewId" TEXT REFERENCES "Interview"("id") ON DELETE SET NULL,
      "status" "JobPostingStatus" NOT NULL DEFAULT 'PUBLISHED',
      "viewCount" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "deletedAt" TIMESTAMP(3)
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "JobPosting_companyId_slug_key" ON "JobPosting"("companyId", "slug");
    CREATE INDEX IF NOT EXISTS "JobPosting_companyId_idx" ON "JobPosting"("companyId");
    CREATE INDEX IF NOT EXISTS "JobPosting_status_idx" ON "JobPosting"("status");
    CREATE INDEX IF NOT EXISTS "JobPosting_workplaceType_idx" ON "JobPosting"("workplaceType");
    CREATE INDEX IF NOT EXISTS "JobPosting_employmentType_idx" ON "JobPosting"("employmentType");
    CREATE INDEX IF NOT EXISTS "JobPosting_department_idx" ON "JobPosting"("department");
    CREATE INDEX IF NOT EXISTS "JobPosting_createdAt_idx" ON "JobPosting"("createdAt");
  `);
  console.log('JobPosting table and indexes verified/created');

  // JobApplication table
  await client.query(`
    CREATE TABLE IF NOT EXISTS "JobApplication" (
      "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "jobPostingId" TEXT NOT NULL REFERENCES "JobPosting"("id") ON DELETE CASCADE,
      "candidateId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
      "fullName" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "phone" TEXT,
      "location" TEXT,
      "currentCompany" TEXT,
      "currentTitle" TEXT,
      "linkedinUrl" TEXT,
      "githubUrl" TEXT,
      "portfolioUrl" TEXT,
      "resumeUrl" TEXT,
      "resumeFileName" TEXT,
      "resumeText" TEXT,
      "resumeData" TEXT,
      "resumeSourceId" TEXT,
      "coverLetter" TEXT,
      "answers" JSONB DEFAULT '[]'::jsonb,
      "status" "JobApplicationStatus" NOT NULL DEFAULT 'APPLIED',
      "notes" TEXT,
      "rating" INTEGER,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "deletedAt" TIMESTAMP(3)
    );

    CREATE INDEX IF NOT EXISTS "JobApplication_jobPostingId_idx" ON "JobApplication"("jobPostingId");
    CREATE INDEX IF NOT EXISTS "JobApplication_candidateId_idx" ON "JobApplication"("candidateId");
    CREATE INDEX IF NOT EXISTS "JobApplication_email_idx" ON "JobApplication"("email");
    CREATE INDEX IF NOT EXISTS "JobApplication_status_idx" ON "JobApplication"("status");
    CREATE INDEX IF NOT EXISTS "JobApplication_createdAt_idx" ON "JobApplication"("createdAt");
  `);
  console.log('JobApplication table and indexes verified/created');

  const tables = await client.query(`
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('JobPosting', 'JobApplication')
  `);
  console.log('Verified created tables:', tables.rows.map(r => r.table_name));

  await client.end();
}

init().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
