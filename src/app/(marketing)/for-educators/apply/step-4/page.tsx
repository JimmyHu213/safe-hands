import { WizardProgress } from "@/components/wizard/WizardProgress";
import { Step4Review } from "@/components/wizard/Step4Review";
import { PageHero } from "@/components/marketing/PageHero";

export default function ApplyStep4Page() {
	return (
		<>
			<PageHero eyebrow="For Educators" title="Educator application" lede="Step 4 of 4 — review & submit" />
			<section style={{ background: "var(--bb-surface-tint)", padding: "clamp(48px,7vw,80px) 22px" }}>
				<div style={{ maxWidth: 780, margin: "0 auto" }}>
					<div style={{ marginBottom: 28 }}><WizardProgress current={4} /></div>
					<div
						style={{
							background: "#fff",
							border: "1px solid rgba(var(--bb-shadow-rgb),.07)",
							borderRadius: 22,
							boxShadow: "0 2px 14px rgba(var(--bb-shadow-rgb),.05)",
							padding: "clamp(24px,4vw,40px)",
						}}
					>
						<Step4Review />
					</div>
				</div>
			</section>
		</>
	);
}
