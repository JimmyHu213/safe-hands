import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "@/lib/db/schema";

export function makeTestDb() {
	const sqlite = new Database(":memory:");
	const drizzleDb = drizzle(sqlite, { schema });
	migrate(drizzleDb, { migrationsFolder: "drizzle/migrations" });
	return drizzleDb;
}

export type TestDb = ReturnType<typeof makeTestDb>;
