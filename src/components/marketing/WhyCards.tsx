import { LANDING } from "@/lib/cms/content";

function WhyIconVetting() {
	return (
		<svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
			<path d="M12 3l7 2.6v5.2c0 4.6-3.1 7.6-7 8.9-3.9-1.3-7-4.3-7-8.9V5.6z"></path>
			<path d="M9 12l2 2 4-4"></path>
		</svg>
	);
}

function WhyIconTrained() {
	return (
		<svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
			<circle cx="12" cy="9" r="5.2"></circle>
			<path d="M8.5 13.2L7 21l5-2.4L17 21l-1.5-7.8"></path>
		</svg>
	);
}

function WhyIconHeart() {
	return (
		<svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
			<path d="M12 20.5C12 20.5 4 15 4 9.2A4.2 4.2 0 0 1 12 6.6 4.2 4.2 0 0 1 20 9.2C20 15 12 20.5 12 20.5Z"></path>
		</svg>
	);
}

function WhyIconCalendar() {
	return (
		<svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
			<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"></rect>
			<path d="M3.5 9.5h17"></path>
			<path d="M8 3v4"></path>
			<path d="M16 3v4"></path>
		</svg>
	);
}

function WhyIconRefresh() {
	return (
		<svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
			<path d="M20 11A8 8 0 0 0 6.3 6.3L4 8.5"></path>
			<path d="M4 4.5v4h4"></path>
			<path d="M4 13a8 8 0 0 0 13.7 4.7L20 15.5"></path>
			<path d="M20 19.5v-4h-4"></path>
		</svg>
	);
}

function WhyIconSeal() {
	return (
		<svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
			<path d="M12 3l2.1 2 2.9-.3.8 2.8 2.5 1.5-1.2 2.7 1.2 2.7-2.5 1.5-.8 2.8-2.9-.3L12 21l-2.1-2-2.9.3-.8-2.8L3.7 15l1.2-2.7L3.7 9.6l2.5-1.5.8-2.8 2.9.3z"></path>
			<path d="M9 12l2 2 4-4"></path>
		</svg>
	);
}

const WHY_ICONS = [
	{ Icon: WhyIconVetting, tile: "var(--sh-tint,#e6f2ef)", color: "var(--sh-teal,#2f8f86)" },
	{ Icon: WhyIconTrained, tile: "var(--sh-tint,#e6f2ef)", color: "var(--sh-teal,#2f8f86)" },
	{ Icon: WhyIconHeart, tile: "var(--sh-accent-soft,#fce3bb)", color: "var(--sh-accent-dark,#e0902a)" },
	{ Icon: WhyIconCalendar, tile: "var(--sh-tint,#e6f2ef)", color: "var(--sh-teal,#2f8f86)" },
	{ Icon: WhyIconRefresh, tile: "var(--sh-tint,#e6f2ef)", color: "var(--sh-teal,#2f8f86)" },
	{ Icon: WhyIconSeal, tile: "var(--sh-tint,#e6f2ef)", color: "var(--sh-teal,#2f8f86)" },
];

export function WhyCards() {
	const { why } = LANDING;
	return (
		<section id="why" style={{ position: "relative", padding: "clamp(64px,9vw,116px) 0", background: "var(--sh-cream,#fbf7f1)" }}>
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
						fill="var(--sh-cream,#fbf7f1)"
					></path>
				</svg>
			</div>
			<div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 22px" }}>
				<div style={{ maxWidth: 660 }}>
					<span
						style={{
							display: "inline-block",
							fontFamily: "'Hanken Grotesk',sans-serif",
							fontWeight: 700,
							fontSize: ".78rem",
							letterSpacing: ".13em",
							textTransform: "uppercase",
							color: "var(--sh-teal,#2f8f86)",
						}}
					>
						{why.eyebrow}
					</span>
					<h2
						style={{
							fontFamily: "'Hanken Grotesk',sans-serif",
							fontWeight: 800,
							fontSize: "clamp(1.9rem,3.6vw,2.8rem)",
							lineHeight: 1.08,
							letterSpacing: "-.022em",
							color: "var(--sh-deep,#245b56)",
							margin: "14px 0 0",
						}}
					>
						{why.title}
					</h2>
					<p
						style={{
							fontSize: "clamp(1.04rem,1.4vw,1.16rem)",
							lineHeight: 1.6,
							color: "var(--sh-muted,#5f726f)",
							margin: "16px 0 0",
						}}
					>
						{why.lede}
					</p>
				</div>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))",
						gap: 22,
						marginTop: 48,
					}}
				>
					{why.cards.map((card, i) => {
						const { Icon, tile, color } = WHY_ICONS[i];
						return (
							<div
								key={card.title}
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
										fontSize: "1.24rem",
										color: "var(--sh-deep,#245b56)",
										margin: "18px 0 8px",
									}}
								>
									{card.title}
								</h3>
								<p style={{ color: "var(--sh-muted,#5f726f)", lineHeight: 1.55, margin: 0 }}>{card.body}</p>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
