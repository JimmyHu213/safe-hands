import { SITE } from "@/lib/cms/content";

export default function PrivacyPage() {
	return (
		<article className="prose mx-auto max-w-3xl px-4 py-12">
			<h1>Privacy Policy</h1>
			<p>Last updated: 2 June 2026.</p>

			<h2>1. Who we are</h2>
			<p>
				{SITE.name} ({SITE.shortName}) is an Australian Pty Ltd company operating in New South
				Wales. We collect and handle personal information in accordance with the Privacy Act 1988
				(Cth) and the Australian Privacy Principles.
			</p>

			<h2>2. What we collect</h2>
			<ul>
				<li>
					<strong>From centres and families submitting a request:</strong> business / parent name,
					contact details, suburb, postcode, the shift details you supply.
				</li>
				<li>
					<strong>From educators applying to join our bench:</strong> identity, contact, suburb,
					qualifications, work history, availability, and the compliance documents you upload
					(Working With Children Check, First Aid, qualification certificates, ID, references).
				</li>
				<li>
					<strong>Technical:</strong> we hash your IP address with a daily-rotated salt for rate
					limiting and abuse prevention. We do not store raw IP addresses.
				</li>
			</ul>

			<h2>3. Where it is stored</h2>
			<p>
				Submitted information is stored in Cloudflare D1 (database) and Cloudflare R2 (uploaded
				files), in Cloudflare's Asia–Pacific region.
			</p>

			<h2>4. How long we keep it</h2>
			<p>
				Submissions that we do not action are automatically purged 24 months after submission.
				Submissions related to a current or past working relationship are retained for the duration
				required by tax, work health and safety, and child-safety record-keeping obligations.
			</p>

			<h2>5. Your rights</h2>
			<p>
				You may request access to or deletion of your personal information by emailing{" "}
				<a href={`mailto:${SITE.emailGeneral}`}>{SITE.emailGeneral}</a>. We respond within 30 days.
			</p>

			<h2>6. Cookies</h2>
			<p>
				We use a minimal set of cookies: one to remember you have dismissed our cookie consent
				banner, and one to keep our admin team logged in to the administration portal. We do not
				use analytics or advertising cookies on this site.
			</p>

			<h2>7. Contact</h2>
			<p>
				Privacy questions can be sent to{" "}
				<a href={`mailto:${SITE.emailGeneral}`}>{SITE.emailGeneral}</a>.
			</p>
		</article>
	);
}
