try { await import("dotenv/config"); } catch {}
import pg from "pg";

const { Client } = pg;

const client = new Client({
  host: process.env.ALPHA7_DB_HOST,
  port: Number(process.env.ALPHA7_DB_PORT || 15432),
  database: process.env.ALPHA7_DB_DATABASE,
  user: process.env.ALPHA7_DB_USER,
  password: process.env.ALPHA7_DB_PASSWORD,
});

try {
  await client.connect();
  const result = await client.query("select current_database() as database, current_schema() as schema, now() as server_time");
  console.log(JSON.stringify(result.rows[0], null, 2));
} finally {
  await client.end().catch(() => {});
}
