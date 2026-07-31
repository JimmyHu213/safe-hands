import { redirect } from "next/navigation";
import { getWizardCookie } from "@/lib/auth/wizard-cookie";
import { WizardProgress } from "@/components/wizard/WizardProgress";
import { Step2Qualifications } from "@/components/wizard/Step2Qualifications";
import { PageHero } from "@/components/marketing/PageHero";

export default async function ApplyStep2Page() {
	if (!(await getWizardCookie())) redirect("/for-educators/apply");
	return (
		<>
			<PageHero eyebrow="For Educators" title="Educator application" lede="Step 2 of 4 — qualifications & availability" />
			<section style={{ background: "var(--bb-surface-tint)", padding: "clamp(48px,7vw,80px) 22px" }}>
				<div style={{ maxWidth: 780, margin: "0 auto" }}>
					<div style={{ marginBottom: 28 }}><WizardProgress current={2} /></div>
					<div
						style={{
							background: "#fff",
							border: "1px solid rgba(var(--bb-shadow-rgb),.07)",
							borderRadius: 22,
							boxShadow: "0 2px 14px rgba(var(--bb-shadow-rgb),.05)",
							padding: "clamp(24px,4vw,40px)",
						}}
					>
						<Step2Qualifications />
					</div>
				</div>
			</section>
		</>
	);
}
