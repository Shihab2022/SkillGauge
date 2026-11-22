require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  await client.connect();
  const res = await client.query(
    `SELECT id, title, slug, status, "customQuestions", "createdAt" FROM "JobPosting" ORDER BY "createdAt" DESC LIMIT 5`
  );
  console.log("Found jobs:\n", JSON.stringify(res.rows, null, 2));
  await client.end();
}

run().catch(console.error);
