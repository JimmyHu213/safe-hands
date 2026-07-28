import { LANDING } from "@/lib/cms/content";

function TrustIconIdentity() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
			<rect x="3" y="5" width="18" height="14" rx="2.5"></rect>
			<circle cx="8.5" cy="11" r="2.2"></circle>
			<path d="M13 9.5h5"></path>
			<path d="M13 13h5"></path>
			<path d="M5.5 15.5a3 3 0 0 1 6 0"></path>
		</svg>
	);
}

function TrustIconShield() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
			<path d="M12 3l7 2.6v5.2c0 4.6-3.1 7.6-7 8.9-3.9-1.3-7-4.3-7-8.9V5.6z"></path>
			<path d="M9 12l2 2 4-4"></path>
		</svg>
	);
}

function TrustIconDocument() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
			<path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20z"></path>
			<path d="M13.5 3.5V8h4.5"></path>
			<path d="M9.5 13h5"></path>
			<path d="M9.5 16h5"></path>
		</svg>
	);
}

function TrustIconBadge() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
			<circle cx="12" cy="9" r="5.2"></circle>
			<path d="M8.5 13.2L7 21l5-2.4L17 21l-1.5-7.8"></path>
		</svg>
	);
}

function TrustIconRefresh() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
			<path d="M20 11A8 8 0 0 0 6.3 6.3L4 8.5"></path>
			<path d="M4 4.5v4h4"></path>
			<path d="M4 13a8 8 0 0 0 13.7 4.7L20 15.5"></path>
			<path d="M20 19.5v-4h-4"></path>
		</svg>
	);
}

const TRUST_ICONS = [
	{ Icon: TrustIconIdentity, tile: "var(--bb-surface-tint)", color: "var(--bb-ink-soft)" },
	{ Icon: TrustIconShield, tile: "var(--bb-surface-tint)", color: "var(--bb-ink-soft)" },
	{ Icon: TrustIconDocument, tile: "var(--bb-surface-tint)", color: "var(--bb-ink-soft)" },
	{ Icon: TrustIconBadge, tile: "var(--bb-surface-tint)", color: "var(--bb-ink-soft)" },
	{ Icon: TrustIconRefresh, tile: "var(--bb-amber-soft)", color: "var(--bb-amber-dark)" },
];

export function TrustSafety() {
	const { trust } = LANDING;
	return (
		<section id="trust" style={{ position: "relative", padding: "clamp(64px,9vw,116px) 0", background: "var(--bb-surface)" }}>
			<div
				aria-hidden="true"
				style={{
					position: "absolute",
					left: 0,
					right: 0,
					top: 0,
					transform: "translateY(-99%)",
					lineHeight: 0,
					pointerEvents: "none",
					zIndex: 2,
				}}
			>
				<svg
					viewBox="0 0 1440 100"
					preserveAspectRatio="none"
					style={{ display: "block", width: "100%", height: "clamp(40px,5vw,72px)" }}
				>
					<path
						d="M0,100 V56 C 38,56 52,31 96,28 C 132,26 141,55 186,54 C 214,53 221,13 286,10 C 341,8 352,47 393,49 C 431,51 442,29 489,26 C 521,24 530,59 586,56 C 641,54 650,17 706,14 C 746,12 761,51 809,53 C 851,54 860,33 906,30 C 947,28 956,61 1011,58 C 1071,55 1080,11 1141,8 C 1196,6 1206,45 1256,47 C 1301,48 1313,25 1371,22 C 1406,20 1421,51 1440,53 V100 Z"
						fill="var(--bb-surface)"
					></path>
				</svg>
			</div>
			<div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 22px" }}>
				<div style={{ maxWidth: 720 }}>
					<span
						style={{
							display: "inline-block",
							fontFamily: "'Hanken Grotesk',sans-serif",
							fontWeight: 700,
							fontSize: ".78rem",
							letterSpacing: ".13em",
							textTransform: "uppercase",
							color: "var(--bb-ink-muted)",
						}}
					>
						{trust.eyebrow}
					</span>
					<h2
						style={{
							fontFamily: "'Hanken Grotesk',sans-serif",
							fontWeight: 800,
							fontSize: "clamp(1.9rem,3.6vw,2.8rem)",
							lineHeight: 1.08,
							letterSpacing: "-.022em",
							color: "var(--bb-ink-strong)",
							margin: "14px 0 0",
						}}
					>
						{trust.title}
					</h2>
					<p style={{ fontSize: "clamp(1.04rem,1.4vw,1.16rem)", lineHeight: 1.6, color: "var(--bb-ink-muted)", margin: "16px 0 0" }}>
						{trust.lede}
					</p>
				</div>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
						gap: 18,
						marginTop: 46,
					}}
				>
					{trust.cards.map((card, i) => {
						const { Icon, tile, color } = TRUST_ICONS[i];
						return (
							<div
								key={card.title}
								style={{ background: "#fff", border: "1px solid rgba(var(--bb-shadow-rgb),.07)", borderRadius: 20, padding: "26px 22px" }}
							>
								<span
									style={{
										display: "inline-flex",
										alignItems: "center",
										justifyContent: "center",
										width: 48,
										height: 48,
										borderRadius: 14,
										background: tile,
										color,
									}}
								>
									<Icon />
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
									{card.title}
								</h3>
								<p style={{ color: "var(--bb-ink-muted)", lineHeight: 1.5, margin: 0, fontSize: ".94rem" }}>{card.body}</p>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
