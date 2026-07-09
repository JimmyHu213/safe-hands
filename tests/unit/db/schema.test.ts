import { describe, it, expect } from "vitest";
import * as schema from "@/lib/db/schema";

describe("schema exports", () => {
  it("exports all 9 expected tables", () => {
    const tables = [
      "centreRequests",
      "familyRequests",
      "educatorApplications",
      "educatorResumeTokens",
      "educatorDocuments",
      "adminMagicLinks",
      "adminSessions",
      "faqEntries",
      "media",
    ];
    for (const t of tables) {
      expect(schema).toHaveProperty(t);
    }
  });
});
