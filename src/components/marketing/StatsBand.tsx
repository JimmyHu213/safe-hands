import { LANDING } from "@/lib/cms/content";

const STAT_COLOR: Record<(typeof LANDING.stats)[number]["tone"], string> = {
	blush: "var(--sh-accent-dark,#e0902a)",
	teal: "var(--sh-teal,#2f8f86)",
	navy: "var(--sh-deep,#245b56)",
};

export function StatsBand() {
	return (
		<section
			aria-label="Safe Hands by the numbers"
			style={{
				position: "relative",
				background: "#fff",
				borderBottom: "1px solid rgba(36,91,86,.06)",
			}}
		>
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
						fill="#ffffff"
					></path>
				</svg>
			</div>
			<div
				style={{
					maxWidth: 1180,
					margin: "0 auto",
					padding: "clamp(60px,7vw,94px) 22px",
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
					gap: 24,
				}}
			>
				{LANDING.stats.map((stat, i) => (
					<div
						key={stat.label}
						style={{
							textAlign: "center",
							padding: "6px 12px",
							...(i > 0 ? { borderLeft: "1px solid rgba(36,91,86,.08)" } : {}),
						}}
					>
						<div
							style={{
								fontFamily: "'Hanken Grotesk',sans-serif",
								fontWeight: 800,
								fontSize: "clamp(2rem,3.2vw,2.7rem)",
								color: STAT_COLOR[stat.tone],
								lineHeight: 1,
							}}
						>
							<span>{stat.value}</span>
						</div>
						<div
							style={{
								marginTop: 8,
								color: "var(--sh-muted,#5f726f)",
								fontWeight: 600,
								fontSize: ".97rem",
							}}
						>
							{stat.label}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
