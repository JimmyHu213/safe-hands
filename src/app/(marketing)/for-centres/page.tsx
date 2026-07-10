import Link from "next/link";
import { FOR_CENTRES, SITE } from "@/lib/cms/content";
import { PageHero } from "@/components/marketing/PageHero";

function BenefitIconCheck() {
	return (
		<svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
			<circle cx="12" cy="12" r="8.5"></circle>
			<path d="M8.5 12.3l2.4 2.4 4.6-4.9"></path>
		</svg>
	);
}

function ArrowIcon() {
	return (
		<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
			<path d="M5 12h14"></path>
			<path d="M13 6l6 6-6 6"></path>
		</svg>
	);
}

export default function ForCentresPage() {
	return (
		<>
			<PageHero eyebrow="For Centres" title={FOR_CENTRES.h1} lede={FOR_CENTRES.lede} />

			<section style={{ padding: "clamp(48px,7vw,80px) 22px", maxWidth: 1080, margin: "0 auto" }}>
				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 22 }}>
					{FOR_CENTRES.bullets.map((b) => (
						<div
							key={b}
							className="sh-why-card"
							style={{
								background: "#fff",
								border: "1px solid rgba(36,91,86,.07)",
								borderRadius: 22,
								padding: "30px 28px",
								boxShadow: "0 2px 14px rgba(36,91,86,.05)",
								transition: "transform .25s ease,box-shadow .25s ease",
							}}
						>
							<span
								style={{
									display: "inline-flex",
									alignItems: "center",
									justifyContent: "center",
									width: 56,
									height: 56,
									borderRadius: 16,
									background: "var(--sh-tint,#e6f2ef)",
									color: "var(--sh-teal,#2f8f86)",
								}}
							>
								<BenefitIconCheck />
							</span>
							<p style={{ color: "var(--sh-ink,#20413e)", lineHeight: 1.55, margin: "18px 0 0", fontWeight: 600 }}>{b}</p>
						</div>
					))}
				</div>
			</section>

			<section style={{ padding: "clamp(28px,4vw,56px) 22px clamp(60px,8vw,90px)" }}>
				<div
					style={{
						maxWidth: 1080,
						margin: "0 auto",
						position: "relative",
						overflow: "hidden",
						borderRadius: 32,
						background: "linear-gradient(130deg,var(--sh-deep,#245b56) 0%, var(--sh-teal,#2f8f86) 100%)",
						padding: "clamp(40px,6vw,72px) clamp(28px,5vw,64px)",
						textAlign: "center",
					}}
				>
					<div
						aria-hidden="true"
						style={{ position: "absolute", top: -70, left: -50, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,.07)" }}
					></div>
					<div
						aria-hidden="true"
						style={{
							position: "absolute",
							bottom: -90,
							right: -40,
							width: 260,
							height: 260,
							borderRadius: "50%",
							background: "var(--sh-accent,#f4a93a)",
							opacity: 0.18,
						}}
					></div>
					<div style={{ position: "relative" }}>
						<h2
							style={{
								fontFamily: "'Hanken Grotesk',sans-serif",
								fontWeight: 800,
								fontSize: "clamp(2rem,4vw,3.2rem)",
								lineHeight: 1.06,
								letterSpacing: "-.025em",
								color: "#fff",
								margin: 0,
								textWrap: "balance",
							}}
						>
							Centres talk to us first.
						</h2>
						<p
							style={{
								fontSize: "clamp(1.06rem,1.5vw,1.22rem)",
								lineHeight: 1.55,
								color: "rgba(255,255,255,.85)",
								margin: "18px auto 0",
								maxWidth: 540,
							}}
						>
							We do not ask centres to fill in a form to start. Call our booking line or email — we answer
							the phone.
						</p>
						<div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", marginTop: 34 }}>
							<a
								href={`tel:${SITE.phoneTel}`}
								className="sh-request-cta-primary"
								style={{
									display: "inline-flex",
									alignItems: "center",
									justifyContent: "center",
									gap: 9,
									background: "var(--sh-accent,#f4a93a)",
									color: "var(--sh-accent-ink,#3a2a08)",
									fontFamily: "'Hanken Grotesk',sans-serif",
									fontWeight: 800,
									fontSize: "1.08rem",
									padding: "17px 32px",
									borderRadius: 999,
									textDecoration: "none",
									boxShadow: "0 14px 30px rgba(0,0,0,.18)",
									transition: "transform .2s ease,box-shadow .2s ease",
								}}
							>
								{FOR_CENTRES.ctaPhone}: {SITE.phone}
								<ArrowIcon />
							</a>
							<a
								href={`mailto:${SITE.emailBookings}`}
								className="sh-request-cta-secondary"
								style={{
									display: "inline-flex",
									alignItems: "center",
									justifyContent: "center",
									gap: 8,
									background: "rgba(255,255,255,.12)",
									color: "#fff",
									fontFamily: "'Hanken Grotesk',sans-serif",
									fontWeight: 700,
									fontSize: "1.08rem",
									padding: "16px 30px",
									borderRadius: 999,
									textDecoration: "none",
									border: "1.5px solid rgba(255,255,255,.4)",
									transition: "background .2s,transform .2s",
								}}
							>
								{FOR_CENTRES.ctaEmail}
							</a>
						</div>
						<p style={{ margin: "24px 0 0", color: "rgba(255,255,255,.8)", fontSize: ".94rem", fontWeight: 600 }}>
							Prefer a structured request?{" "}
							<Link href="/for-centres/request" style={{ color: "#fff", textDecoration: "underline" }}>
								Submit a booking request →
							</Link>
						</p>
					</div>
				</div>
			</section>
		</>
	);
}
