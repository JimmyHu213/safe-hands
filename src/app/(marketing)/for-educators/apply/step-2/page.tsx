import { redirect } from "next/navigation";
import { getWizardCookie } from "@/lib/auth/wizard-cookie";
import { WizardProgress } from "@/components/wizard/WizardProgress";
import { Step2Qualifications } from "@/components/wizard/Step2Qualifications";

export default async function ApplyStep2Page() {
	if (!(await getWizardCookie())) redirect("/for-educators/apply");
	return (
		<section className="px-4 py-12">
			<div className="mx-auto max-w-3xl">
				<h1 className="text-3xl font-semibold tracking-tight">Educator application</h1>
				<p className="mt-2 text-slate-700">Step 2 of 4 — qualifications & availability</p>
				<div className="mt-6"><WizardProgress current={2} /></div>
				<div className="mt-8 rounded-lg border bg-white p-6">
					<Step2Qualifications />
				</div>
			</div>
		</section>
	);
}
