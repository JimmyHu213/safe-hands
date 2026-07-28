import { ABOUT } from "@/lib/cms/content";
import { PageHero } from "@/components/marketing/PageHero";
import { RequestCta } from "@/components/marketing/RequestCta";

export default function AboutPage() {
	return (
		<>
			<PageHero eyebrow="About" title={ABOUT.h1} />
			<section style={{ padding: "clamp(48px,7vw,80px) 22px", maxWidth: 1080, margin: "0 auto" }}>
				<div style={{ maxWidth: 720 }}>
					{ABOUT.paragraphs.map((p, i) => (
						<p
							key={i}
							style={{
								fontSize: "clamp(1.04rem,1.4vw,1.16rem)",
								lineHeight: 1.6,
								color: "var(--bb-ink-muted)",
								margin: i === 0 ? 0 : "16px 0 0",
							}}
						>
							{p}
						</p>
					))}
				</div>
				<div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 32 }}>
					{ABOUT.values.map((value) => (
						<span
							key={value}
							style={{
								display: "inline-flex",
								alignItems: "center",
								gap: 8,
								fontFamily: "'Hanken Grotesk',sans-serif",
								fontWeight: 700,
								fontSize: ".78rem",
								letterSpacing: ".13em",
								textTransform: "uppercase",
								color: "var(--bb-ink-muted)",
								background: "var(--bb-surface-tint)",
								border: "1px solid rgba(var(--bb-shadow-rgb),.08)",
								padding: "8px 15px",
								borderRadius: 999,
							}}
						>
							{value}
						</span>
					))}
				</div>
			</section>
			<RequestCta />
		</>
	);
}
