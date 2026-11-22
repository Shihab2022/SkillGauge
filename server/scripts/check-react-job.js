const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function check() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  const job = await client.query('SELECT * FROM "JobPosting" WHERE title ILIKE \'%raeact%\'');
  console.log('Job found:', JSON.stringify(job.rows, null, 2));

  await client.end();
}

check().catch(console.error);
