import { bindings } from "@/lib/server/request-context";
import { db } from "@/lib/db/client";
import { listAllFaq } from "@/lib/db/queries/faq";
import { FaqEditor } from "@/components/admin/FaqEditor";

export const dynamic = "force-dynamic";

export default async function AdminFaqPage() {
	const env = bindings();
	const entries = await listAllFaq(db(env.DB));
	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">FAQ</h1>
			<FaqEditor entries={entries} />
		</div>
	);
}
