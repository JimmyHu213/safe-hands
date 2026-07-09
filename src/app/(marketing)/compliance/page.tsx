import { COMPLIANCE } from "@/lib/cms/content";

export default function CompliancePage() {
	return (
		<>
			<section className="border-b bg-slate-50 px-4 py-16">
				<div className="mx-auto max-w-3xl">
					<p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
						Compliance
					</p>
					<h1 className="mt-3 text-4xl font-semibold tracking-tight">{COMPLIANCE.h1}</h1>
					<p className="mt-4 text-lg text-slate-700">{COMPLIANCE.lede}</p>
				</div>
			</section>
			<section className="px-4 py-12">
				<div className="mx-auto max-w-3xl">
					<h2 className="text-xl font-semibold">Documents we track on every educator</h2>
					<table className="mt-4 w-full border-collapse">
						<thead>
							<tr className="border-b text-left text-sm text-slate-600">
								<th className="py-2">Document</th>
								<th className="py-2">Renewal</th>
							</tr>
						</thead>
						<tbody>
							{COMPLIANCE.documents.map((d) => (
								<tr key={d.name} className="border-b text-sm">
									<td className="py-3">{d.name}</td>
									<td className="py-3 text-slate-600">{d.renewal}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>
			<section className="bg-slate-50 px-4 py-12">
				<div className="mx-auto max-w-3xl">
					<h2 className="text-xl font-semibold">Frameworks we operate under</h2>
					<ul className="mt-4 space-y-2 text-sm text-slate-700">
						{COMPLIANCE.frameworks.map((f) => (
							<li key={f}>• {f}</li>
						))}
					</ul>
				</div>
			</section>
		</>
	);
}
