import { WizardProgress } from "@/components/wizard/WizardProgress";
import { Step1Identity } from "@/components/wizard/Step1Identity";

export default function ApplyStep1Page() {
	const siteKey = process.env.TURNSTILE_SITE_KEY ?? "";
	return (
		<section className="px-4 py-12">
			<div className="mx-auto max-w-3xl">
				<h1 className="text-3xl font-semibold tracking-tight">Educator application</h1>
				<p className="mt-2 text-slate-700">Step 1 of 4 — identity & consent</p>
				<div className="mt-6"><WizardProgress current={1} /></div>
				<div className="mt-8 rounded-lg border bg-white p-6">
					<Step1Identity siteKey={siteKey} />
				</div>
			</div>
		</section>
	);
}
