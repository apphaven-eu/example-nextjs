import { readFile } from "node:fs/promises";
import path from "node:path";

import { Pool, type QueryResultRow } from "pg";

// Next.js reloads modules in development, so the pool and the schema promise
// are cached on globalThis to keep exactly one of each per process.
const globalForDb = globalThis as unknown as {
  apphavenPool?: Pool;
  apphavenSchema?: Promise<void>;
};

function getPool(): Pool {
  if (!globalForDb.apphavenPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }
    globalForDb.apphavenPool = new Pool({ connectionString, max: 5 });
    globalForDb.apphavenPool.on("error", (error) => console.error("idle database connection error", error));
  }
  return globalForDb.apphavenPool;
}

// schema.sql sits next to the standalone server.js in the image and at the project
// root in development, so the working directory resolves it in both.
function readSchema(): Promise<string> {
  return readFile(path.join(process.cwd(), "schema.sql"), "utf8");
}

// Retries so the app survives PostgreSQL not being ready yet.
async function createSchema(): Promise<void> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      await getPool().query(await readSchema());
      return;
    } catch (error) {
      if (attempt >= 30) throw error;
      console.warn(`database not ready (attempt ${attempt}): ${String(error)}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

function ensureSchema(): Promise<void> {
  if (!globalForDb.apphavenSchema) {
    globalForDb.apphavenSchema = createSchema().catch((error) => {
      globalForDb.apphavenSchema = undefined;
      throw error;
    });
  }
  return globalForDb.apphavenSchema;
}

export async function query<T extends QueryResultRow>(
  text: string,
  params: ReadonlyArray<unknown> = [],
): Promise<T[]> {
  await ensureSchema();
  const result = await getPool().query<T>(text, params as unknown[]);
  return result.rows;
}
