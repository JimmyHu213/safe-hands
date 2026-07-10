import { LANDING } from "@/lib/cms/content";

function TestimonialQuoteIcon({ fill, ghost = false }: { fill: string; ghost?: boolean }) {
	return (
		<svg width="34" height="34" viewBox="0 0 24 24" fill={fill} aria-hidden="true">
			{ghost ? (
				<path
					d="M10 7H6a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v3H5v-2H4M20 7h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v3h-3v-2h-1"
					opacity={0}
				></path>
			) : null}
			<path d="M9.5 6C6.5 6 4 8.5 4 11.5S6.2 17 9 17v-3.5c-1 0-1.8-.8-1.8-1.8 0-1 .8-1.7 1.8-1.7.3 0 .6 0 .8.1V6.1C9.7 6 9.6 6 9.5 6zm9 0c-3 0-5.5 2.5-5.5 5.5S15.2 17 18 17v-3.5c-1 0-1.8-.8-1.8-1.8 0-1 .8-1.7 1.8-1.7.3 0 .6 0 .8.1V6.1c-.1-.1-.2-.1-.3-.1z"></path>
		</svg>
	);
}

const TESTIMONIAL_STYLES = [
	{
		iconFill: "var(--sh-accent,#f4a93a)",
		ghost: true,
		avatarBg: "var(--sh-tint,#e6f2ef)",
		avatarColor: "var(--sh-muted,#5f726f)",
	},
	{
		iconFill: "var(--sh-teal,#2f8f86)",
		ghost: false,
		avatarBg: "var(--sh-tint,#e6f2ef)",
		avatarColor: "var(--sh-deep,#245b56)",
	},
	{
		iconFill: "var(--sh-accent,#f4a93a)",
		ghost: false,
		avatarBg: "var(--sh-lavender,#B5B3C1)",
		avatarColor: "var(--sh-ink,#20413e)",
	},
];

export function Testimonials() {
	const { testimonials } = LANDING;
	return (
		<section
			id="testimonials"
			style={{ padding: "clamp(64px,9vw,116px) 0", background: "var(--sh-deep,#245b56)", position: "relative", overflow: "hidden" }}
		>
			<div
				aria-hidden="true"
				style={{ position: "absolute", top: -90, right: -70, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,.05)" }}
			></div>
			<div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 22px", position: "relative" }}>
				<div style={{ maxWidth: 660 }}>
					<span
						style={{
							display: "inline-block",
							fontFamily: "'Hanken Grotesk',sans-serif",
							fontWeight: 700,
							fontSize: ".78rem",
							letterSpacing: ".13em",
							textTransform: "uppercase",
							color: "var(--sh-soft,#7cc4b8)",
						}}
					>
						{testimonials.eyebrow}
					</span>
					<h2
						style={{
							fontFamily: "'Hanken Grotesk',sans-serif",
							fontWeight: 800,
							fontSize: "clamp(1.9rem,3.6vw,2.8rem)",
							lineHeight: 1.08,
							letterSpacing: "-.022em",
							color: "#fff",
							margin: "14px 0 0",
						}}
					>
						{testimonials.title}
					</h2>
				</div>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))",
						gap: 22,
						marginTop: 46,
					}}
				>
					{testimonials.quotes.map((t, i) => {
						const { iconFill, ghost, avatarBg, avatarColor } = TESTIMONIAL_STYLES[i];
						return (
							<figure
								key={t.name}
								style={{ background: "#fff", borderRadius: 22, padding: "30px 28px", margin: 0, display: "flex", flexDirection: "column" }}
							>
								<TestimonialQuoteIcon fill={iconFill} ghost={ghost} />
								<blockquote
									style={{ margin: "16px 0 0", fontSize: "1.12rem", lineHeight: 1.55, color: "var(--sh-ink,#20413e)", fontWeight: 500 }}
								>
									&ldquo;{t.quote}&rdquo;
								</blockquote>
								<figcaption style={{ marginTop: "auto", paddingTop: 22, display: "flex", alignItems: "center", gap: 13 }}>
									<span
										style={{
											display: "inline-flex",
											width: 46,
											height: 46,
											borderRadius: "50%",
											background: avatarBg,
											color: avatarColor,
											alignItems: "center",
											justifyContent: "center",
											fontFamily: "'Hanken Grotesk',sans-serif",
											fontWeight: 800,
										}}
									>
										{t.initials}
									</span>
									<span>
										<span style={{ display: "block", fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, color: "var(--sh-deep,#245b56)" }}>
											{t.name}
										</span>
										<span style={{ display: "block", color: "var(--sh-muted,#5f726f)", fontSize: ".9rem" }}>{t.role}</span>
									</span>
								</figcaption>
							</figure>
						);
					})}
				</div>
			</div>
		</section>
	);
}
