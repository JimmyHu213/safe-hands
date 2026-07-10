import { CentreRequestForm } from "@/components/forms/CentreRequestForm";
import { PageHero } from "@/components/marketing/PageHero";

export default function CentreRequestPage() {
	const siteKey = process.env.TURNSTILE_SITE_KEY ?? "";
	return (
		<>
			<PageHero eyebrow="For Centres" title="Centre booking request" />
			<section style={{ background: "var(--sh-tint,#EAF0F1)", padding: "clamp(48px,7vw,80px) 22px" }}>
				<div style={{ maxWidth: 780, margin: "0 auto" }}>
					<p style={{ fontSize: "clamp(1.04rem,1.4vw,1.16rem)", lineHeight: 1.6, color: "var(--sh-ink,#20413e)", margin: "0 0 28px" }}>
						Prefer to call? We answer the phone on{" "}
						<a href="tel:1300723343" style={{ color: "var(--sh-deep,#1d4b47)", fontWeight: 700, textDecoration: "underline" }}>
							1300 SAFE HANDS
						</a>
						.
					</p>
					<div
						style={{
							background: "#fff",
							border: "1px solid rgba(36,91,86,.07)",
							borderRadius: 22,
							boxShadow: "0 2px 14px rgba(36,91,86,.05)",
							padding: "clamp(24px,4vw,40px)",
						}}
					>
						<CentreRequestForm siteKey={siteKey} />
					</div>
				</div>
			</section>
		</>
	);
}
