import { describe, it, expect } from "vitest";
import { groupByAudience } from "@/lib/cms/faq";
import type { FaqEntry } from "@/lib/db/schema";

const entries: FaqEntry[] = [
  { id: "1", audience: "centre", question: "A?", answer: "X", sortOrder: 1, published: true, createdAt: 1, updatedAt: 1 },
  { id: "2", audience: "centre", question: "B?", answer: "Y", sortOrder: 0, published: true, createdAt: 1, updatedAt: 1 },
  { id: "3", audience: "family", question: "C?", answer: "Z", sortOrder: 0, published: true, createdAt: 1, updatedAt: 1 },
];

describe("groupByAudience", () => {
  it("groups entries by audience", () => {
    const g = groupByAudience(entries);
    expect(g.centre).toHaveLength(2);
    expect(g.family).toHaveLength(1);
    expect(g.educator).toHaveLength(0);
    expect(g.general).toHaveLength(0);
  });

  it("sorts within each group by sortOrder", () => {
    const g = groupByAudience(entries);
    expect(g.centre[0].question).toBe("B?");
    expect(g.centre[1].question).toBe("A?");
  });
});
