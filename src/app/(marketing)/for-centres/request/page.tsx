import { CentreRequestForm } from "@/components/forms/CentreRequestForm";

export default function CentreRequestPage() {
	const siteKey = process.env.TURNSTILE_SITE_KEY ?? "";
	return (
		<section className="px-4 py-12">
			<div className="mx-auto max-w-3xl">
				<h1 className="text-3xl font-semibold tracking-tight">Centre booking request</h1>
				<p className="mt-2 text-slate-700">
					Prefer to call? We answer the phone on <a href="tel:1300723343" className="underline">1300 SAFE HANDS</a>.
				</p>
				<div className="mt-8 rounded-lg border bg-white p-6">
					<CentreRequestForm siteKey={siteKey} />
				</div>
			</div>
		</section>
	);
}
