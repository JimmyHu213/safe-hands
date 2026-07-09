import { FamilyRequestForm } from "@/components/forms/FamilyRequestForm";

export default function FamilyRequestPage() {
	const siteKey = process.env.TURNSTILE_SITE_KEY ?? "";
	return (
		<section className="px-4 py-12">
			<div className="mx-auto max-w-3xl">
				<h1 className="text-3xl font-semibold tracking-tight">Request care</h1>
				<p className="mt-2 text-slate-700">
					We will call you back within 4 business hours during operating hours.
				</p>
				<div className="mt-8 rounded-lg border bg-white p-6">
					<FamilyRequestForm siteKey={siteKey} />
				</div>
			</div>
		</section>
	);
}
