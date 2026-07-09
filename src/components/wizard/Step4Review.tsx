import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getWizardCookie } from "@/lib/auth/wizard-cookie";
import { db } from "@/lib/db/client";
import { getDraftById, listEducatorDocuments } from "@/lib/db/queries/educators";
import { educatorStep4Action } from "@/app/(marketing)/for-educators/apply/actions";

export async function Step4Review() {
	const applicationId = await getWizardCookie();
	if (!applicationId) redirect("/for-educators/apply");
	const { env } = getCloudflareContext();
	const app = await getDraftById(db(env.DB), applicationId);
	if (!app) redirect("/for-educators/apply");
	const docs = await listEducatorDocuments(db(env.DB), applicationId);

	async function submitAction(formData: FormData) {
		"use server";
		await educatorStep4Action({ ok: true }, formData);
	}

	return (
		<div className="space-y-6 text-sm">
			<Section title="Identity">
				<Row label="Name" value={`${app.firstName} ${app.lastName}`} />
				<Row label="Email" value={app.email} />
				<Row label="Phone" value={app.phone} />
				<Row label="Suburb" value={`${app.suburb} ${app.postcode}`} />
			</Section>
			<Section title="Qualifications">
				<Row label="Qualification" value={app.qualificationLevel ?? "(not provided)"} />
				<Row label="Years experience" value={String(app.yearsExperience ?? 0)} />
				<Row label="Travel radius (km)" value={String(app.travelRadiusKm ?? 0)} />
				<Row label="Own transport" value={app.hasOwnTransport ? "yes" : "no"} />
				<Row label="Special-needs experience" value={app.specialNeedsExperience ? "yes" : "no"} />
			</Section>
			<Section title="Documents">
				<ul>
					{docs.map((d) => (
						<li key={d.id}>✓ {d.docType} — {d.originalFilename}</li>
					))}
				</ul>
			</Section>
			<form action={submitAction}>
				<button
					type="submit"
					className="rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white"
				>
					Submit application
				</button>
			</form>
		</div>
	);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="rounded-md border p-4">
			<h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
			<div className="mt-2 space-y-1">{children}</div>
		</div>
	);
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<p>
			<span className="font-medium">{label}:</span> {value}
		</p>
	);
}
