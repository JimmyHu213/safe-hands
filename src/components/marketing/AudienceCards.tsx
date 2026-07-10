import Link from "next/link";
import { LANDING } from "@/lib/cms/content";

function AudienceIconHouse() {
	return (
		<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
			<path d="M3 11l9-7 9 7"></path>
			<path d="M5 9.5V20h14V9.5"></path>
			<path d="M9.5 20v-5h5v5"></path>
		</svg>
	);
}

function AudienceIconBuilding() {
	return (
		<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
			<path d="M4 20V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14"></path>
			<path d="M14 10h4a2 2 0 0 1 2 2v8"></path>
			<path d="M3 20h18"></path>
			<path d="M7.5 8h2.5M7.5 12h2.5M7.5 16h2.5"></path>
		</svg>
	);
}

function AudienceIconPeople() {
	return (
		<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
			<circle cx="12" cy="8" r="4"></circle>
			<path d="M5 20v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1"></path>
		</svg>
	);
}

function BulletCheck({ color }: { color: string }) {
	return (
		<svg
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke={color}
			strokeWidth={2.2}
			strokeLinecap="round"
			strokeLinejoin="round"
			style={{ flexShrink: 0, marginTop: 2 }}
		>
			<path d="M20 6L9 17l-5-5"></path>
		</svg>
	);
}

export function AudienceCards() {
	const { audience } = LANDING;
	const familyCard = audience.cards.find((c) => c.key === "family")!;
	const centreCard = audience.cards.find((c) => c.key === "centre")!;
	const educatorCard = audience.cards.find((c) => c.key === "educator")!;

	return (
		<section id="audience" style={{ position: "relative", padding: "clamp(64px,9vw,116px) 0", background: "var(--sh-tint,#e6f2ef)" }}>
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
						fill="var(--sh-tint,#e6f2ef)"
					></path>
				</svg>
			</div>
			<div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 22px" }}>
				<div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
					<span
						style={{
							display: "inline-block",
							fontFamily: "'Hanken Grotesk',sans-serif",
							fontWeight: 700,
							fontSize: ".78rem",
							letterSpacing: ".13em",
							textTransform: "uppercase",
							color: "var(--sh-muted,#5f726f)",
						}}
					>
						{audience.eyebrow}
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
						{audience.title}
					</h2>
					<p
						style={{
							fontSize: "clamp(1.04rem,1.4vw,1.16rem)",
							lineHeight: 1.6,
							color: "var(--sh-muted,#5f726f)",
							margin: "16px 0 0",
						}}
					>
						{audience.lede}
					</p>
				</div>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
						gap: 24,
						marginTop: 50,
					}}
				>
					<div
						id="families"
						style={{
							background: "#fff",
							borderRadius: 24,
							overflow: "hidden",
							boxShadow: "0 6px 24px rgba(36,91,86,.07)",
							display: "flex",
							flexDirection: "column",
						}}
					>
						<div style={{ height: 8, background: "var(--sh-teal,#2f8f86)" }}></div>
						<div style={{ padding: "30px 28px", display: "flex", flexDirection: "column", flex: 1 }}>
							<span
								style={{
									display: "inline-flex",
									alignItems: "center",
									justifyContent: "center",
									width: 52,
									height: 52,
									borderRadius: 14,
									background: "var(--sh-tint,#e6f2ef)",
									color: "var(--sh-teal,#2f8f86)",
								}}
							>
								<AudienceIconHouse />
							</span>
							<h3
								style={{
									fontFamily: "'Hanken Grotesk',sans-serif",
									fontWeight: 800,
									fontSize: "1.42rem",
									color: "var(--sh-deep,#245b56)",
									margin: "16px 0 4px",
								}}
							>
								{familyCard.title}
							</h3>
							<p style={{ color: "var(--sh-muted,#5f726f)", lineHeight: 1.5, margin: "0 0 18px", fontWeight: 600 }}>
								{familyCard.sub}
							</p>
							<ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 12 }}>
								{familyCard.bullets.map((b) => (
									<li
										key={b}
										style={{ display: "flex", gap: 10, alignItems: "flex-start", color: "var(--sh-ink,#20413e)", lineHeight: 1.45 }}
									>
										<BulletCheck color="var(--sh-teal,#2f8f86)" />
										{b}
									</li>
								))}
							</ul>
							<Link
								href={familyCard.ctaHref}
								className="sh-audience-cta"
								style={{
									marginTop: "auto",
									display: "inline-flex",
									alignItems: "center",
									justifyContent: "center",
									gap: 8,
									background: "var(--sh-accent,#f4a93a)",
									color: "var(--sh-accent-ink,#3a2a08)",
									fontFamily: "'Hanken Grotesk',sans-serif",
									fontWeight: 800,
									fontSize: "1rem",
									padding: "14px 22px",
									borderRadius: 999,
									textDecoration: "none",
									transition: "transform .2s",
								}}
							>
								{familyCard.ctaLabel}
							</Link>
						</div>
					</div>

					<div
						id="centers"
						style={{
							background: "#fff",
							borderRadius: 24,
							overflow: "hidden",
							boxShadow: "0 6px 24px rgba(36,91,86,.07)",
							display: "flex",
							flexDirection: "column",
						}}
					>
						<div style={{ height: 8, background: "var(--sh-deep,#245b56)" }}></div>
						<div style={{ padding: "30px 28px", display: "flex", flexDirection: "column", flex: 1 }}>
							<span
								style={{
									display: "inline-flex",
									alignItems: "center",
									justifyContent: "center",
									width: 52,
									height: 52,
									borderRadius: 14,
									background: "var(--sh-tint,#e6f2ef)",
									color: "var(--sh-deep,#245b56)",
								}}
							>
								<AudienceIconBuilding />
							</span>
							<h3
								style={{
									fontFamily: "'Hanken Grotesk',sans-serif",
									fontWeight: 800,
									fontSize: "1.42rem",
									color: "var(--sh-deep,#245b56)",
									margin: "16px 0 4px",
								}}
							>
								{centreCard.title}
							</h3>
							<p style={{ color: "var(--sh-muted,#5f726f)", lineHeight: 1.5, margin: "0 0 18px", fontWeight: 600 }}>
								{centreCard.sub}
							</p>
							<ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 12 }}>
								{centreCard.bullets.map((b) => (
									<li
										key={b}
										style={{ display: "flex", gap: 10, alignItems: "flex-start", color: "var(--sh-ink,#20413e)", lineHeight: 1.45 }}
									>
										<BulletCheck color="var(--sh-teal,#2f8f86)" />
										{b}
									</li>
								))}
							</ul>
							<Link
								href={centreCard.ctaHref}
								className="sh-audience-cta"
								style={{
									marginTop: "auto",
									display: "inline-flex",
									alignItems: "center",
									justifyContent: "center",
									gap: 8,
									background: "var(--sh-deep,#245b56)",
									color: "#fff",
									fontFamily: "'Hanken Grotesk',sans-serif",
									fontWeight: 800,
									fontSize: "1rem",
									padding: "14px 22px",
									borderRadius: 999,
									textDecoration: "none",
									transition: "transform .2s",
								}}
							>
								{centreCard.ctaLabel}
							</Link>
						</div>
					</div>

					<div
						id="carers"
						style={{
							order: -1,
							background: "#fff",
							borderRadius: 24,
							overflow: "hidden",
							boxShadow: "0 6px 24px rgba(36,91,86,.07)",
							display: "flex",
							flexDirection: "column",
						}}
					>
						<div style={{ height: 8, background: "var(--sh-accent,#f4a93a)" }}></div>
						<div style={{ padding: "30px 28px", display: "flex", flexDirection: "column", flex: 1 }}>
							<span
								style={{
									display: "inline-flex",
									alignItems: "center",
									justifyContent: "center",
									width: 52,
									height: 52,
									borderRadius: 14,
									background: "var(--sh-accent-soft,#fce3bb)",
									color: "var(--sh-accent-dark,#e0902a)",
								}}
							>
								<AudienceIconPeople />
							</span>
							<h3
								style={{
									fontFamily: "'Hanken Grotesk',sans-serif",
									fontWeight: 800,
									fontSize: "1.42rem",
									color: "var(--sh-deep,#245b56)",
									margin: "16px 0 4px",
								}}
							>
								{educatorCard.title}
							</h3>
							<p style={{ color: "var(--sh-muted,#5f726f)", lineHeight: 1.5, margin: "0 0 18px", fontWeight: 600 }}>
								{educatorCard.sub}
							</p>
							<ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 12 }}>
								{educatorCard.bullets.map((b) => (
									<li
										key={b}
										style={{ display: "flex", gap: 10, alignItems: "flex-start", color: "var(--sh-ink,#20413e)", lineHeight: 1.45 }}
									>
										<BulletCheck color="var(--sh-accent-dark,#e0902a)" />
										{b}
									</li>
								))}
							</ul>
							<Link
								href={educatorCard.ctaHref}
								className="sh-audience-cta-outline"
								style={{
									marginTop: "auto",
									display: "inline-flex",
									alignItems: "center",
									justifyContent: "center",
									gap: 8,
									background: "#fff",
									color: "var(--sh-deep,#245b56)",
									fontFamily: "'Hanken Grotesk',sans-serif",
									fontWeight: 700,
									fontSize: "1rem",
									padding: "13px 22px",
									borderRadius: 999,
									textDecoration: "none",
									border: "2px solid var(--sh-soft,#7cc4b8)",
									transition: "transform .2s,border-color .2s",
								}}
							>
								{educatorCard.ctaLabel}
							</Link>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
