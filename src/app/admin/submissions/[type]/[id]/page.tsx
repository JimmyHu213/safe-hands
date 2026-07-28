import { notFound } from "next/navigation";
import { bindings } from "@/lib/server/request-context";
import { db } from "@/lib/db/client";
import { getSubmission } from "@/lib/db/queries/submissions";
import { listEducatorDocuments } from "@/lib/db/queries/educators";
import { presignGetUrl } from "@/lib/storage/r2";
import { StatusTransition } from "@/components/admin/StatusTransition";

export const dynamic = "force-dynamic";

interface Props {
	params: Promise<{ type: string; id: string }>;
}

export default async function SubmissionDetailPage({ params }: Props) {
	const { type: rawType, id } = await params;
	if (rawType !== "centre" && rawType !== "family" && rawType !== "educator") {
		notFound();
	}
	const type = rawType;
	const env = bindings();
	const dbi = db(env.DB);
	const row =
		type === "centre"
			? await getSubmission(dbi, "centre", id)
			: type === "family"
				? await getSubmission(dbi, "family", id)
				: await getSubmission(dbi, "educator", id);
	if (!row) notFound();

	let docs: { docType: string; originalFilename: string; url: string }[] = [];
	if (type === "educator") {
		const rows = await listEducatorDocuments(dbi, id);
		docs = await Promise.all(
			rows.map(async (d) => ({
				docType: d.docType,
				originalFilename: d.originalFilename,
				url: await presignGetUrl({
					accountId: env.R2_ACCOUNT_ID,
					accessKeyId: env.R2_ACCESS_KEY_ID,
					secretAccessKey: env.R2_SECRET_ACCESS_KEY,
					bucket: "beebrightstaffing-educator-docs",
					key: d.r2Key,
					expiresInSeconds: 24 * 3600,
				}),
			})),
		);
	}

	const status = (row as { status: string }).status;

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold capitalize">{type} submission</h1>
			<StatusTransition type={type} id={id} current={status} />
			<pre className="overflow-auto rounded-md border bg-white p-4 text-xs">{JSON.stringify(row, null, 2)}</pre>
			{type === "educator" && docs.length > 0 ? (
				<section>
					<h2 className="text-lg font-semibold">Documents</h2>
					<ul className="mt-2 space-y-1">
						{docs.map((d) => (
							<li key={d.url}><a className="underline" href={d.url} target="_blank" rel="noopener noreferrer">{d.docType} — {d.originalFilename}</a></li>
						))}
					</ul>
				</section>
			) : null}
		</div>
	);
}
