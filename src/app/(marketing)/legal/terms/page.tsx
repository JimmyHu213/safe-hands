import { SITE } from "@/lib/cms/content";

export default function TermsPage() {
	return (
		<article className="prose mx-auto max-w-3xl px-4 py-12">
			<h1>Terms of Use</h1>
			<p>Last updated: 2 June 2026.</p>

			<h2>1. About this site</h2>
			<p>
				This website is operated by {SITE.name}. By using the site you agree to these terms. If you
				do not agree, please do not use the site.
			</p>

			<h2>2. Service provision</h2>
			<p>
				Use of the booking-request and application forms on this site is an enquiry, not a binding
				contract for service. A formal service agreement (Master Service Agreement for centres,
				Private Family Client Agreement for families, or Worker Onboarding Agreement for educators)
				applies before any shift is filled.
			</p>

			<h2>3. Acceptable use</h2>
			<p>
				You must not submit false information, attempt to circumvent rate limits, or attempt to
				access areas of the site for which you have not been granted credentials.
			</p>

			<h2>4. Liability</h2>
			<p>
				To the maximum extent permitted by law, our liability arising out of your use of this site
				is limited to the supply of the relevant information or service again. This does not affect
				any non-excludable consumer guarantees under Australian Consumer Law.
			</p>

			<h2>5. Governing law</h2>
			<p>These terms are governed by the laws of New South Wales, Australia.</p>

			<h2>6. Contact</h2>
			<p>
				Questions about these terms can be sent to{" "}
				<a href={`mailto:${SITE.emailGeneral}`}>{SITE.emailGeneral}</a>.
			</p>
		</article>
	);
}
