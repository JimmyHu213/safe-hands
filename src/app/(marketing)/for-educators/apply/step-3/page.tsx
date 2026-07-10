import { redirect } from "next/navigation";
import { getWizardCookie } from "@/lib/auth/wizard-cookie";
import { WizardProgress } from "@/components/wizard/WizardProgress";
import { Step3Documents } from "@/components/wizard/Step3Documents";
import { PageHero } from "@/components/marketing/PageHero";

export default async function ApplyStep3Page() {
	if (!(await getWizardCookie())) redirect("/for-educators/apply");
	return (
		<>
			<PageHero eyebrow="For Educators" title="Educator application" lede="Step 3 of 4 — documents" />
			<section style={{ background: "var(--sh-tint,#EAF0F1)", padding: "clamp(48px,7vw,80px) 22px" }}>
				<div style={{ maxWidth: 780, margin: "0 auto" }}>
					<div style={{ marginBottom: 28 }}><WizardProgress current={3} /></div>
					<div
						style={{
							background: "#fff",
							border: "1px solid rgba(36,91,86,.07)",
							borderRadius: 22,
							boxShadow: "0 2px 14px rgba(36,91,86,.05)",
							padding: "clamp(24px,4vw,40px)",
						}}
					>
						<Step3Documents />
					</div>
				</div>
			</section>
		</>
	);
}
