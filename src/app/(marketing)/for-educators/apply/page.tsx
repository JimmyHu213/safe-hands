import { WizardProgress } from "@/components/wizard/WizardProgress";
import { Step1Identity } from "@/components/wizard/Step1Identity";
import { PageHero } from "@/components/marketing/PageHero";

export default function ApplyStep1Page() {
	const siteKey = process.env.TURNSTILE_SITE_KEY ?? "";
	return (
		<>
			<PageHero eyebrow="For Educators" title="Educator application" lede="Step 1 of 4 — identity & consent" />
			<section style={{ background: "var(--sh-tint,#EAF0F1)", padding: "clamp(48px,7vw,80px) 22px" }}>
				<div style={{ maxWidth: 780, margin: "0 auto" }}>
					<div style={{ marginBottom: 28 }}><WizardProgress current={1} /></div>
					<div
						style={{
							background: "#fff",
							border: "1px solid rgba(36,91,86,.07)",
							borderRadius: 22,
							boxShadow: "0 2px 14px rgba(36,91,86,.05)",
							padding: "clamp(24px,4vw,40px)",
						}}
					>
						<Step1Identity siteKey={siteKey} />
					</div>
				</div>
			</section>
		</>
	);
}
