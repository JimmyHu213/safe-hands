import { redirect } from "next/navigation";
import { getWizardCookie } from "@/lib/auth/wizard-cookie";
import { WizardProgress } from "@/components/wizard/WizardProgress";
import { Step3Documents } from "@/components/wizard/Step3Documents";

export default async function ApplyStep3Page() {
	if (!(await getWizardCookie())) redirect("/for-educators/apply");
	return (
		<section className="px-4 py-12">
			<div className="mx-auto max-w-3xl">
				<h1 className="text-3xl font-semibold tracking-tight">Educator application</h1>
				<p className="mt-2 text-slate-700">Step 3 of 4 — documents</p>
				<div className="mt-6"><WizardProgress current={3} /></div>
				<div className="mt-8 rounded-lg border bg-white p-6">
					<Step3Documents />
				</div>
			</div>
		</section>
	);
}
