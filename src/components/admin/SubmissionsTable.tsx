import Link from "next/link";
import type { UnifiedRow } from "@/lib/db/queries/submissions";

export function SubmissionsTable({ rows }: { rows: UnifiedRow[] }) {
	if (rows.length === 0) {
		return <p className="rounded-md border bg-white p-6 text-center text-sm text-ink-500">No submissions match these filters.</p>;
	}
	return (
		<div className="rounded-md border bg-white">
			<table className="w-full text-sm">
				<thead className="border-b text-left text-ink-600">
					<tr><th className="p-3">Type</th><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Status</th><th className="p-3">Date</th></tr>
				</thead>
				<tbody>
					{rows.map((r) => (
						<tr key={`${r.type}-${r.id}`} className="border-b last:border-0">
							<td className="p-3 capitalize">{r.type}</td>
							<td className="p-3">
								<Link href={`/admin/submissions/${r.type}/${r.id}`} className="hover:underline">
									{r.primaryName}
								</Link>
							</td>
							<td className="p-3 text-ink-600">{r.contactEmail}</td>
							<td className="p-3 capitalize">{r.status}</td>
							<td className="p-3 text-ink-500">{new Date(r.createdAt).toLocaleString("en-AU")}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
