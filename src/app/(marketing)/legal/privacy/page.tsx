import { SITE } from "@/lib/cms/content";
import { PageHero } from "@/components/marketing/PageHero";

const h2Style = {
	fontFamily: "'Hanken Grotesk',sans-serif",
	fontWeight: 700,
	fontSize: "1.24rem",
	color: "var(--sh-deep,#245b56)",
	margin: "32px 0 8px",
};
const pStyle = { color: "var(--sh-muted,#5f726f)", lineHeight: 1.6, margin: "0 0 8px" };
const liStyle = { color: "var(--sh-muted,#5f726f)", lineHeight: 1.6, margin: "0 0 4px" };

export default function PrivacyPage() {
	return (
		<>
			<PageHero eyebrow="Legal" title="Privacy Policy" lede="Last updated: 2 June 2026." />
			<section style={{ padding: "clamp(48px,7vw,80px) 22px", maxWidth: 1080, margin: "0 auto" }}>
				<div style={{ maxWidth: 720 }}>
					<h2 style={{ ...h2Style, marginTop: 0 }}>1. Who we are</h2>
					<p style={pStyle}>
						{SITE.name} ({SITE.shortName}) is an Australian Pty Ltd company operating in New South
						Wales. We collect and handle personal information in accordance with the Privacy Act 1988
						(Cth) and the Australian Privacy Principles.
					</p>

					<h2 style={h2Style}>2. What we collect</h2>
					<ul style={{ margin: 0, paddingLeft: 20 }}>
						<li style={liStyle}>
							<strong style={{ color: "var(--sh-ink,#20413e)" }}>From centres and families submitting a request:</strong> business /
							parent name, contact details, suburb, postcode, the shift details you supply.
						</li>
						<li style={liStyle}>
							<strong style={{ color: "var(--sh-ink,#20413e)" }}>From educators applying to join our bench:</strong> identity,
							contact, suburb, qualifications, work history, availability, and the compliance
							documents you upload (Working With Children Check, First Aid, qualification
							certificates, ID, references).
						</li>
						<li style={liStyle}>
							<strong style={{ color: "var(--sh-ink,#20413e)" }}>Technical:</strong> we hash your IP address with a daily-rotated
							salt for rate limiting and abuse prevention. We do not store raw IP addresses.
						</li>
					</ul>

					<h2 style={h2Style}>3. Where it is stored</h2>
					<p style={pStyle}>
						Submitted information is stored in Cloudflare D1 (database) and Cloudflare R2 (uploaded
						files), in Cloudflare&apos;s Asia&ndash;Pacific region.
					</p>

					<h2 style={h2Style}>4. How long we keep it</h2>
					<p style={pStyle}>
						Submissions that we do not action are automatically purged 24 months after submission.
						Submissions related to a current or past working relationship are retained for the
						duration required by tax, work health and safety, and child-safety record-keeping
						obligations.
					</p>

					<h2 style={h2Style}>5. Your rights</h2>
					<p style={pStyle}>
						You may request access to or deletion of your personal information by emailing{" "}
						<a
							href={`mailto:${SITE.emailGeneral}`}
							style={{ color: "var(--sh-deep,#1d4b47)", textDecoration: "underline" }}
						>
							{SITE.emailGeneral}
						</a>
						. We respond within 30 days.
					</p>

					<h2 style={h2Style}>6. Cookies</h2>
					<p style={pStyle}>
						We use a minimal set of cookies: one to remember you have dismissed our cookie consent
						banner, and one to keep our admin team logged in to the administration portal. We do not
						use analytics or advertising cookies on this site.
					</p>

					<h2 style={h2Style}>7. Contact</h2>
					<p style={pStyle}>
						Privacy questions can be sent to{" "}
						<a
							href={`mailto:${SITE.emailGeneral}`}
							style={{ color: "var(--sh-deep,#1d4b47)", textDecoration: "underline" }}
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
