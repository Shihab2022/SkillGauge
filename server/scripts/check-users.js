const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function check() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  const users = await client.query('SELECT id, email, name, role, "companyId" FROM "User"');
  console.log('Users:', users.rows);

  const companies = await client.query('SELECT id, name, slug FROM "Company"');
  console.log('Companies:', companies.rows);

  const jobs = await client.query('SELECT id, title, slug, "companyId", status FROM "JobPosting"');
  console.log('Jobs in DB:', jobs.rows);

  await client.end();
}

check().catch(console.error);
