const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function seed() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('Connected to DB');

  // Find or create a company
  let companyRes = await client.query(`SELECT id, name, slug FROM "Company" WHERE slug = 'retell-ai' OR id IS NOT NULL LIMIT 1`);
  let companyId;
  let companySlug;

  if (companyRes.rows.length === 0) {
    const newComp = await client.query(`
      INSERT INTO "Company" ("id", "name", "slug", "description", "website", "location", "industry", "size", "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid()::text,
        'Retell AI',
        'retell-ai',
        'Retell AI is a voice AI platform empowering developers and enterprises to build human-like conversational voice agents for customer experience.',
        'https://retellai.com',
        'San Francisco, CA',
        'Artificial Intelligence & Voice',
        '50-200',
        NOW(),
        NOW()
      )
      RETURNING id, name, slug
    `);
    companyId = newComp.rows[0].id;
    companySlug = newComp.rows[0].slug;
  } else {
    companyId = companyRes.rows[0].id;
    companySlug = companyRes.rows[0].slug;
  }

  // Find a user/creator
  let userRes = await client.query(`SELECT id FROM "User" LIMIT 1`);
  let userId;
  if (userRes.rows.length === 0) {
    const newUser = await client.query(`
      INSERT INTO "User" ("id", "email", "name", "password", "role", "status", "companyId", "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid()::text,
        'hiring@retellai.com',
        'Retell Hiring Team',
        '$2a$10$WkGfG...placeholder',
        'COMPANY',
        'ACTIVE',
        $1,
        NOW(),
        NOW()
      )
      RETURNING id
    `, [companyId]);
    userId = newUser.rows[0].id;
  } else {
    userId = userRes.rows[0].id;
  }

  // Check if Retell demo job already exists
  const existingJob = await client.query(`SELECT id, title, slug FROM "JobPosting" WHERE "companyId" = $1 LIMIT 1`, [companyId]);
  let jobId;

  if (existingJob.rows.length === 0) {
    const description = `## About Retell AI
Retell AI builds state-of-the-art voice artificial intelligence. Our platform enables businesses to deploy voice agents that handle customer conversations with sub-second latency, natural turn-taking, and deep domain intelligence.

## The Role: Senior Software Engineer, Full Stack
We are looking for a Senior Full Stack Engineer to join our founding engineering team in San Francisco. You will own core customer-facing products, dashboard analytics, real-time voice monitoring interfaces, and API integrations that handle millions of voice interactions every day.

## Key Responsibilities
- Design and build end-to-end full-stack web products and developer dashboards using React, Next.js, and TypeScript.
- Architect high-performance backend microservices and WebSockets handling real-time audio telemetry.
- Build clean, resilient REST and streaming APIs for developer self-service.
- Work closely with machine learning researchers and infrastructure engineers to optimize end-to-end latency.
- Champion code quality, automated test coverage, and continuous deployment pipelines.

## What We Look For
- 4+ years of professional full-stack software development experience.
- Deep expertise in modern frontend technologies (React, Next.js, TypeScript, Tailwind CSS).
- Strong proficiency in Node.js, Python, or Go for backend microservices.
- Experience with relational databases (PostgreSQL), distributed caches (Redis), and WebSockets/WebRTC.
- A builder mindset: you love taking ambiguous problems and shipping polished, high-performance solutions.

## Compensation & Benefits
- Base salary: $200,000 – $300,000 USD / year.
- Significant early-stage equity grant.
- Platinum healthcare, dental, and vision insurance for you and your dependents.
- Flexible PTO and company-sponsored wellness programs.
- Daily catered lunch and high-spec workstation in our San Francisco office.`;

    const customQuestions = JSON.stringify([
      {
        id: "auth",
        question: "Are you authorized to work in the United States without sponsorship?",
        type: "boolean",
        required: true
      },
      {
        id: "exp",
        question: "How many years of experience do you have building real-time or audio/video web applications?",
        type: "text",
        required: true
      },
      {
        id: "proud_project",
        question: "What is a complex technical project you led recently that you are most proud of?",
        type: "textarea",
        required: false
      }
    ]);

    const newJob = await client.query(`
      INSERT INTO "JobPosting" (
        "id", "companyId", "creatorId", "title", "slug", "department", "location",
        "workplaceType", "employmentType", "seniority", "salaryCurrency", "salaryMin", "salaryMax",
        "salaryInterval", "equityBonus", "overview", "description", "customQuestions", "status",
        "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text,
        $1, $2,
        'Senior Software Engineer, Full Stack',
        'senior-software-engineer-full-stack',
        'Engineering',
        'San Francisco Bay Area',
        'ON_SITE',
        'FULL_TIME',
        'SENIOR',
        'USD',
        200000,
        300000,
        'YEARLY',
        '0.1% - 0.5% Equity + Benefits',
        'Build real-time voice AI infrastructure and developer products handling millions of calls.',
        $3,
        $4::jsonb,
        'PUBLISHED',
        NOW(),
        NOW()
      )
      RETURNING id, title, slug
    `, [companyId, userId, description, customQuestions]);

    jobId = newJob.rows[0].id;
    console.log('Created demo JobPosting:', newJob.rows[0]);

    // Insert a sample applicant
    await client.query(`
      INSERT INTO "JobApplication" (
        "id", "jobPostingId", "fullName", "email", "phone", "location",
        "currentCompany", "currentTitle", "linkedinUrl", "githubUrl",
        "resumeFileName", "coverLetter", "status", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text,
        $1,
        'Alex Rivera',
        'alex.rivera@example.com',
        '+1 (415) 555-0192',
        'San Francisco, CA',
        'Stripe',
        'Senior Full Stack Engineer',
        'https://linkedin.com/in/alexrivera-example',
        'https://github.com/alexrivera-example',
        'Alex_Rivera_Senior_FullStack_Resume.pdf',
        'Excited about Retell AI voice infrastructure! I have spent the last 4 years scaling real-time web products at Stripe.',
        'APPLIED',
        NOW(),
        NOW()
      )
    `, [jobId]);
    console.log('Created sample candidate application for Alex Rivera');
  } else {
    jobId = existingJob.rows[0].id;
    console.log('Existing job found:', existingJob.rows[0]);
  }

  console.log(`Demo setup ready!`);
  console.log(`Ashby URL: http://localhost:3000/jobs/${jobId}`);
  console.log(`Company Career URL: http://localhost:3000/careers/${companySlug}`);
  console.log(`Global Jobs Board: http://localhost:3000/jobs`);

  await client.end();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
