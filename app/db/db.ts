import { PGlite } from "@electric-sql/pglite";

export async function initDb(db: PGlite) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT,
      content TEXT,
      preview TEXT,
      "timestamp" TIMESTAMP
    );
  `);
} 