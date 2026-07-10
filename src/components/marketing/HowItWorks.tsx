import { LANDING } from "@/lib/cms/content";

function StepIconOne() {
	return (
		<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
			<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v8A1.5 1.5 0 0 1 18.5 15H9l-5 4z"></path>
			<path d="M8 8h8"></path>
			<path d="M8 11h5"></path>
		</svg>
	);
}

function StepIconTwo() {
	return (
		<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
			<circle cx="9" cy="8" r="3.2"></circle>
			<path d="M3.5 19v-1a4.5 4.5 0 0 1 4.5-4.5h2A4.5 4.5 0 0 1 14.5 18v1"></path>
			<circle cx="17" cy="8.5" r="2.6"></circle>
			<path d="M16 13.4A4 4 0 0 1 20.5 17v2"></path>
		</svg>
	);
}

function StepIconThree() {
	return (
		<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
			<circle cx="12" cy="12" r="8.5"></circle>
			<path d="M8.5 12.2l2.4 2.4 4.6-4.8"></path>
		</svg>
	);
}

function StepIconFour() {
	return (
		<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
			<circle cx="12" cy="12" r="8.5"></circle>
			<circle cx="12" cy="12" r="3.4"></circle>
			<path d="M6 6l3.6 3.6"></path>
			<path d="M18 6l-3.6 3.6"></path>
			<path d="M6 18l3.6-3.6"></path>
			<path d="M18 18l-3.6-3.6"></path>
		</svg>
	);
}

const STEP_ICONS = [StepIconOne, StepIconTwo, StepIconThree, StepIconFour];

export function HowItWorks() {
	const { how } = LANDING;
	return (
		<section
			id="how"
			style={{
				position: "relative",
				padding: "clamp(64px,9vw,116px) 0",
				background: "var(--sh-tint,#e6f2ef)",
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
						fill="var(--sh-tint,#e6f2ef)"
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
						{how.eyebrow}
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
						{how.title}
					</h2>
					<p
						style={{
							fontSize: "clamp(1.04rem,1.4vw,1.16rem)",
							lineHeight: 1.6,
							color: "var(--sh-muted,#5f726f)",
							margin: "16px 0 0",
						}}
					>
						{how.lede}
					</p>
				</div>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
						gap: 22,
						marginTop: 48,
					}}
				>
					{how.steps.map((step, i) => {
						const StepIcon = STEP_ICONS[i];
						return (
							<div
								key={step.title}
								style={{
									position: "relative",
									background: "#fff",
									borderRadius: 22,
									padding: "28px 26px",
									boxShadow: "0 2px 14px rgba(36,91,86,.05)",
								}}
							>
								<span
									style={{
										position: "absolute",
										top: 22,
										right: 24,
										fontFamily: "'Hanken Grotesk',sans-serif",
										fontWeight: 800,
										fontSize: "2.4rem",
										color: "var(--sh-tint,#e6f2ef)",
										lineHeight: 1,
									}}
								>
									{String(i + 1).padStart(2, "0")}
								</span>
								<span
									style={{
										display: "inline-flex",
										alignItems: "center",
										justifyContent: "center",
										width: 54,
										height: 54,
										borderRadius: 16,
										background: "var(--sh-tint,#e6f2ef)",
										color: "var(--sh-teal,#2f8f86)",
									}}
								>
									<StepIcon />
								</span>
								<h3
									style={{
										fontFamily: "'Hanken Grotesk',sans-serif",
										fontWeight: 700,
										fontSize: "1.2rem",
										color: "var(--sh-deep,#245b56)",
										margin: "18px 0 8px",
									}}
								>
									{step.title}
								</h3>
								<p
									style={{
										color: "var(--sh-muted,#5f726f)",
										lineHeight: 1.55,
										margin: 0,
										fontSize: ".99rem",
									}}
								>
									{step.body}
								</p>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
