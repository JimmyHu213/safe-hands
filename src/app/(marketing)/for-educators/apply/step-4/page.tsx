import { WizardProgress } from "@/components/wizard/WizardProgress";
import { Step4Review } from "@/components/wizard/Step4Review";

export default function ApplyStep4Page() {
	return (
		<section className="px-4 py-12">
			<div className="mx-auto max-w-3xl">
				<h1 className="text-3xl font-semibold tracking-tight">Educator application</h1>
				<p className="mt-2 text-slate-700">Step 4 of 4 — review & submit</p>
				<div className="mt-6"><WizardProgress current={4} /></div>
				<div className="mt-8 rounded-lg border bg-white p-6">
					<Step4Review />
				</div>
			</div>
		</section>
	);
}
