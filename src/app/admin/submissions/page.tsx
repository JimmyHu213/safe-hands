import { bindings } from "@/lib/server/request-context";
import { db } from "@/lib/db/client";
import { listSubmissions, type SubmissionType } from "@/lib/db/queries/submissions";
import { SUBMISSION_STATUS } from "@/lib/db/schema";
import { SubmissionFilters } from "@/components/admin/SubmissionFilters";
import { SubmissionsTable } from "@/components/admin/SubmissionsTable";

export const dynamic = "force-dynamic";

interface PageProps {
	searchParams: Promise<{ type?: string; status?: string; q?: string; offset?: string }>;
}

type StatusFilter = (typeof SUBMISSION_STATUS)[number] | "all";

function parseType(v: string | undefined): SubmissionType | "all" {
	if (v === "centre" || v === "family" || v === "educator") return v;
	return "all";
}

function parseStatus(v: string | undefined): StatusFilter {
	if (v === "new" || v === "contacted" || v === "qualified" || v === "archived") return v;
	return "all";
}

export default async function SubmissionsPage({ searchParams }: PageProps) {
	const sp = await searchParams;
	const type = parseType(sp.type);
	const status = parseStatus(sp.status);
	const q = sp.q ?? "";
	const offset = Number(sp.offset ?? 0);
	const limit = 50;

	const env = bindings();
	const rows = await listSubmissions(db(env.DB), { type, status, q, limit, offset });

	const baseParams = { type: type === "all" ? "" : type, status: status === "all" ? "" : status, q };
	const prevHref = `?${new URLSearchParams({ ...baseParams, offset: String(Math.max(0, offset - limit)) }).toString()}`;
	const nextHref = `?${new URLSearchParams({ ...baseParams, offset: String(offset + limit) }).toString()}`;

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Submissions</h1>
			<SubmissionFilters />
			<SubmissionsTable rows={rows} />
			<nav className="flex justify-between text-sm">
				{offset > 0 ? <a className="underline" href={prevHref}>← Previous</a> : <span />}
				{rows.length === limit ? <a className="underline" href={nextHref}>Next →</a> : <span />}
			</nav>
		</div>
	);
}
