import { COMPLIANCE } from "@/lib/cms/content";
import { PageHero } from "@/components/marketing/PageHero";

function ComplianceCheckIcon() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
			<circle cx="12" cy="12" r="8.5"></circle>
			<path d="M8.5 12.3l2.4 2.4 4.6-4.9"></path>
		</svg>
	);
}

const sectionTitleStyle = {
	fontFamily: "'Hanken Grotesk',sans-serif",
	fontWeight: 700,
	fontSize: "1.24rem",
	color: "var(--bb-ink-strong)",
	margin: "0 0 16px",
} as const;

const cardStyle = {
	background: "#fff",
	border: "1px solid rgba(var(--bb-shadow-rgb),.07)",
	borderRadius: 20,
	padding: "26px 22px",
} as const;

export default function CompliancePage() {
	return (
		<>
			<PageHero eyebrow="Compliance" title={COMPLIANCE.h1} lede={COMPLIANCE.lede} />

			<section style={{ padding: "clamp(48px,7vw,80px) 22px", maxWidth: 1080, margin: "0 auto" }}>
				<h2 style={sectionTitleStyle}>Documents we track on every educator</h2>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
						gap: 18,
						marginTop: 24,
					}}
				>
					{COMPLIANCE.documents.map((d) => (
						<div key={d.name} style={cardStyle}>
							<span
								style={{
									display: "inline-flex",
									alignItems: "center",
									justifyContent: "center",
									width: 48,
									height: 48,
									borderRadius: 14,
									background: "var(--bb-surface-tint)",
									color: "var(--bb-ink-soft)",
								}}
							>
								<ComplianceCheckIcon />
							</span>
							<h3
								style={{
									fontFamily: "'Hanken Grotesk',sans-serif",
									fontWeight: 700,
									fontSize: "1.08rem",
									color: "var(--bb-ink-strong)",
									margin: "16px 0 6px",
								}}
							>
								{d.name}
							</h3>
							<p style={{ color: "var(--bb-ink-muted)", lineHeight: 1.5, margin: 0, fontSize: ".94rem" }}>
								Renewal: {d.renewal}
							</p>
						</div>
					))}
				</div>
			</section>

			<section style={{ position: "relative", padding: "clamp(48px,7vw,80px) 0", background: "var(--bb-surface)" }}>
				<div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 22px" }}>
					<h2 style={sectionTitleStyle}>Frameworks we operate under</h2>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
							gap: 18,
							marginTop: 24,
						}}
					>
						{COMPLIANCE.frameworks.map((f) => (
							<div key={f} style={cardStyle}>
								<span
									style={{
										display: "inline-flex",
										alignItems: "center",
										justifyContent: "center",
										width: 48,
										height: 48,
										borderRadius: 14,
										background: "var(--bb-surface-tint)",
										color: "var(--bb-ink-soft)",
									}}
								>
									<ComplianceCheckIcon />
								</span>
								<p
									style={{
										color: "var(--bb-ink)",
										lineHeight: 1.5,
										margin: "16px 0 0",
										fontWeight: 600,
									}}
								>
									{f}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>
		</>
	);
}
