import { describe, it, expect } from "vitest";
import { makeTestDb } from "../../../helpers/test-db";
import { createFaq, updateFaq, deleteFaq, listAllFaq } from "@/lib/db/queries/faq";

describe("faq queries", () => {
	it("creates, updates, deletes", async () => {
		const db = makeTestDb();
		const id = await createFaq(db as any, { audience: "centre", question: "Q?", answer: "A" });
		expect(await listAllFaq(db as any)).toHaveLength(1);
		await updateFaq(db as any, id, { published: true, sortOrder: 5 });
		const after = await listAllFaq(db as any);
		expect(after[0].published).toBe(true);
		expect(after[0].sortOrder).toBe(5);
		await deleteFaq(db as any, id);
		expect(await listAllFaq(db as any)).toHaveLength(0);
	});
});
