import Link from "next/link";
import { db } from "@/lib/db/client";
import { bindings } from "@/lib/server/request-context";
import { getCounts, listSubmissions } from "@/lib/db/queries/submissions";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
	const env = bindings();
	const counts = await getCounts(db(env.DB));
	const recent = await listSubmissions(db(env.DB), {
		type: "all", status: "all", q: "", limit: 10, offset: 0,
	});

	return (
		<div className="space-y-8">
			<h1 className="text-2xl font-semibold">Dashboard</h1>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<Card title="Centre requests" value={counts.centre} href="/admin/submissions?type=centre" />
				<Card title="Family requests" value={counts.family} href="/admin/submissions?type=family" />
				<Card title="Educator applications" value={counts.educator} href="/admin/submissions?type=educator" />
			</div>
			<section>
				<h2 className="mb-2 text-lg font-semibold">Latest activity</h2>
				<div className="rounded-md border bg-white">
					<table className="w-full text-sm">
						<thead className="border-b text-left text-ink-600">
							<tr><th className="p-3">Type</th><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Status</th><th className="p-3">Date</th></tr>
						</thead>
						<tbody>
							{recent.map((r) => (
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
							{recent.length === 0 ? (
								<tr><td colSpan={5} className="p-6 text-center text-ink-500">No submissions yet.</td></tr>
							) : null}
						</tbody>
					</table>
				</div>
			</section>
		</div>
	);
}

function Card({ title, value, href }: { title: string; value: number; href: string }) {
	return (
		<Link href={href} className="rounded-md border bg-white p-4 hover:border-ink-300">
			<p className="text-sm text-ink-600">{title}</p>
			<p className="mt-1 text-3xl font-semibold">{value}</p>
		</Link>
	);
}
