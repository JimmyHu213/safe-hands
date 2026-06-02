import { eq, asc } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { faqEntries, type FaqEntry, FAQ_AUDIENCE } from "@/lib/db/schema";

export async function listPublishedFaq(db: Db): Promise<FaqEntry[]> {
  return db
    .select()
    .from(faqEntries)
    .where(eq(faqEntries.published, true))
    .orderBy(asc(faqEntries.audience), asc(faqEntries.sortOrder));
}

export function groupByAudience(
  entries: FaqEntry[],
): Record<(typeof FAQ_AUDIENCE)[number], FaqEntry[]> {
  const empty = { centre: [], family: [], educator: [], general: [] } as Record<
    (typeof FAQ_AUDIENCE)[number],
    FaqEntry[]
  >;
  const grouped = entries.reduce((acc, e) => {
    acc[e.audience].push(e);
    return acc;
  }, empty);
  for (const key of Object.keys(grouped) as (typeof FAQ_AUDIENCE)[number][]) {
    grouped[key].sort((a, b) => a.sortOrder - b.sortOrder);
  }
  return grouped;
}
