// Compact hero band for interior pages, assembled from the same reference
// blocks as the homepage Hero (tint bg + gradient overlays, eyebrow chip, h1)
// and StatsBand (bottom wavy divider), with sizes reduced via clamp().
export function PageHero({
	eyebrow,
	title,
	lede,
}: {
	eyebrow?: string;
	title: string;
	lede?: string;
}) {
	return (
		<section
			style={{
				position: "relative",
				minHeight: "clamp(260px,38vh,380px)",
				overflow: "hidden",
				background: "var(--bb-surface-tint)",
				display: "flex",
			}}
		>
			<div
				aria-hidden="true"
				style={{
					position: "absolute",
					inset: 0,
					pointerEvents: "none",
					background:
						"linear-gradient(96deg, rgba(var(--bb-surface-tint-rgb),.97) 0%, rgba(var(--bb-surface-tint-rgb),.88) 24%, rgba(var(--bb-surface-tint-rgb),.52) 44%, rgba(var(--bb-surface-tint-rgb),.08) 62%, rgba(var(--bb-surface-tint-rgb),0) 76%)",
				}}
			></div>
			<div
				aria-hidden="true"
				style={{
					position: "absolute",
					inset: 0,
					pointerEvents: "none",
					background: "linear-gradient(0deg, rgba(var(--bb-surface-tint-rgb),.4) 0%, transparent 26%)",
				}}
			></div>
			<div
				style={{
					position: "relative",
					width: "100%",
					maxWidth: 1180,
					margin: "0 auto",
					padding: "clamp(70px,10vh,110px) 22px clamp(48px,6vh,72px)",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
				}}
			>
				{eyebrow && (
					<span
						style={{
							display: "inline-flex",
							alignSelf: "flex-start",
							alignItems: "center",
							gap: 8,
							fontFamily: "'Hanken Grotesk',sans-serif",
							fontWeight: 700,
							fontSize: ".78rem",
							letterSpacing: ".13em",
							textTransform: "uppercase",
							color: "var(--bb-ink-muted)",
							background: "rgba(255,255,255,.62)",
							backdropFilter: "blur(6px)",
							WebkitBackdropFilter: "blur(6px)",
							border: "1px solid rgba(255,255,255,.75)",
							padding: "8px 15px",
							borderRadius: 999,
						}}
					>
						{eyebrow}
					</span>
				)}
				<h1
					style={{
						fontFamily: "'Hanken Grotesk',sans-serif",
						fontWeight: 800,
						fontSize: "clamp(2.5rem,5.7vw,4.5rem)",
						lineHeight: 1.01,
						letterSpacing: "-.03em",
						color: "var(--bb-ink-strong)",
						margin: "20px 0 0",
						maxWidth: 640,
						textWrap: "balance",
						textShadow: "0 2px 26px rgba(255,255,255,.5)",
					}}
				>
					{title}
				</h1>
				{lede && (
					<p
						style={{
							fontSize: "clamp(1.06rem,1.5vw,1.24rem)",
							lineHeight: 1.6,
							color: "var(--bb-ink)",
							fontWeight: 500,
							margin: "22px 0 0",
							maxWidth: 500,
						}}
					>
						{lede}
					</p>
				)}
			</div>
			<div
				aria-hidden="true"
				style={{
					position: "absolute",
					left: 0,
					right: 0,
					bottom: 0,
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
						fill="#ffffff"
					></path>
				</svg>
			</div>
		</section>
	);
}
