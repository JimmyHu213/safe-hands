import Link from "next/link";
import { FOR_EDUCATORS } from "@/lib/cms/content";
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

export default function ForEducatorsPage() {
	return (
		<>
			<PageHero eyebrow="For Educators" title={FOR_EDUCATORS.h1} lede={FOR_EDUCATORS.lede} />

			<section style={{ padding: "clamp(48px,7vw,80px) 22px", maxWidth: 1080, margin: "0 auto" }}>
				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 22 }}>
					{FOR_EDUCATORS.bullets.map((b) => (
						<div
							key={b}
							className="bb-why-card"
							style={{
								background: "#fff",
								border: "1px solid rgba(var(--bb-shadow-rgb),.07)",
								borderRadius: 22,
								padding: "30px 28px",
								boxShadow: "0 2px 14px rgba(var(--bb-shadow-rgb),.05)",
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
									background: "var(--bb-surface-tint)",
									color: "var(--bb-ink-soft)",
								}}
							>
								<BenefitIconCheck />
							</span>
							<p style={{ color: "var(--bb-ink)", lineHeight: 1.55, margin: "18px 0 0", fontWeight: 600 }}>{b}</p>
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
						background: "linear-gradient(130deg,var(--bb-ink-strong) 0%, var(--bb-ink-soft) 100%)",
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
							background: "var(--bb-amber)",
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
							Join the bench
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
							Tell us about your qualifications, where you can travel, and when you can work. Step through at
							your own pace — we will email you a link to resume any time.
						</p>
						<div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", marginTop: 34 }}>
							<Link
								href="/for-educators/apply"
								className="bb-request-cta-primary"
								style={{
									display: "inline-flex",
									alignItems: "center",
									justifyContent: "center",
									gap: 9,
									background: "#fff",
									color: "var(--bb-ink-strong)",
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
								Start your application
								<ArrowIcon />
							</Link>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
