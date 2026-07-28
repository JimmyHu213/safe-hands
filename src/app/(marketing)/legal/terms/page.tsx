import { SITE } from "@/lib/cms/content";
import { PageHero } from "@/components/marketing/PageHero";

const h2Style = {
	fontFamily: "'Hanken Grotesk',sans-serif",
	fontWeight: 700,
	fontSize: "1.24rem",
	color: "var(--bb-ink-strong)",
	margin: "32px 0 8px",
};
const pStyle = { color: "var(--bb-ink-muted)", lineHeight: 1.6, margin: "0 0 8px" };

export default function TermsPage() {
	return (
		<>
			<PageHero eyebrow="Legal" title="Terms of Use" lede="Last updated: 2 June 2026." />
			<section style={{ padding: "clamp(48px,7vw,80px) 22px", maxWidth: 1080, margin: "0 auto" }}>
				<div style={{ maxWidth: 720 }}>
					<h2 style={{ ...h2Style, marginTop: 0 }}>1. About this site</h2>
					<p style={pStyle}>
						This website is operated by {SITE.name}. By using the site you agree to these terms. If
						you do not agree, please do not use the site.
					</p>

					<h2 style={h2Style}>2. Service provision</h2>
					<p style={pStyle}>
						Use of the booking-request and application forms on this site is an enquiry, not a
						binding contract for service. A formal service agreement (Master Service Agreement for
						centres, Private Family Client Agreement for families, or Worker Onboarding Agreement
						for educators) applies before any shift is filled.
					</p>

					<h2 style={h2Style}>3. Acceptable use</h2>
					<p style={pStyle}>
						You must not submit false information, attempt to circumvent rate limits, or attempt to
						access areas of the site for which you have not been granted credentials.
					</p>

					<h2 style={h2Style}>4. Liability</h2>
					<p style={pStyle}>
						To the maximum extent permitted by law, our liability arising out of your use of this
						site is limited to the supply of the relevant information or service again. This does
						not affect any non-excludable consumer guarantees under Australian Consumer Law.
					</p>

					<h2 style={h2Style}>5. Governing law</h2>
					<p style={pStyle}>These terms are governed by the laws of New South Wales, Australia.</p>

					<h2 style={h2Style}>6. Contact</h2>
					<p style={pStyle}>
						Questions about these terms can be sent to{" "}
						<a
							href={`mailto:${SITE.emailGeneral}`}
							style={{ color: "var(--bb-ink-strong)", textDecoration: "underline" }}
						>
							{SITE.emailGeneral}
						</a>
						.
					</p>
				</div>
			</section>
		</>
	);
}
