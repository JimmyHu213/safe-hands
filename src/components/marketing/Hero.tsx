"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { HOME, LANDING } from "@/lib/cms/content";

type HeroTab = "carer" | "facility" | "care";

// Reference DOM order (source: section-00-top.html) maps to LANDING.hero.chips
// by chip key — button copy is identical between the reference and LANDING,
// only "Staff my Center" -> "Staff my Centre" (AU spelling) differs, so we
// keep LANDING's localised chip as the source of label/hint/CTA text.
const TAB_ORDER: { tab: HeroTab; chipKey: (typeof LANDING.hero.chips)[number]["key"] }[] = [
	{ tab: "carer", chipKey: "educator" },
	{ tab: "facility", chipKey: "facility" },
	{ tab: "care", chipKey: "family" },
];

interface TabRect {
	left: number;
	top: number;
	width: number;
	height: number;
}

export function Hero() {
	const rootRef = useRef<HTMLElement>(null);
	const tablistRef = useRef<HTMLDivElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);

	const [heroTab, setHeroTab] = useState<HeroTab>("care");
	const [isMobile, setIsMobile] = useState(false);
	const [tabCenters, setTabCenters] = useState<number[] | null>(null);
	const [tabRects, setTabRects] = useState<TabRect[] | null>(null);

	// measureTabs(): re-measures the tab buttons' geometry so the sliding
	// accent pill and tip triangle can be positioned via inline styles.
	const measureTabs = useCallback(() => {
		const tablist = tablistRef.current;
		const panel = panelRef.current;
		if (!tablist || !panel) return;
		const pr = panel.getBoundingClientRect();
		const btns = Array.from(tablist.querySelectorAll("button"));
		const centers = btns.map((b) => {
			const r = b.getBoundingClientRect();
			return Math.round(r.left - pr.left + r.width / 2);
		});
		const rects = btns.map((b) => ({
			left: b.offsetLeft,
			top: b.offsetTop,
			width: b.offsetWidth,
			height: b.offsetHeight,
		}));
		setTabCenters(centers);
		setTabRects(rects);
	}, []);

	useEffect(() => {
		measureTabs();
		const onResize = () => {
			setIsMobile(window.innerWidth < 880);
			measureTabs();
		};
		onResize();
		window.addEventListener("resize", onResize);
		const timer = setTimeout(measureTabs, 350);
		if (document.fonts?.ready) {
			document.fonts.ready.then(() => measureTabs());
		}
		return () => {
			window.removeEventListener("resize", onResize);
			clearTimeout(timer);
		};
	}, [measureTabs]);

	const idx = TAB_ORDER.findIndex((t) => t.tab === heroTab);
	const activeChipKey = TAB_ORDER[idx].chipKey;
	const activeChip = LANDING.hero.chips.find((c) => c.key === activeChipKey)!;

	const pillBase: CSSProperties = {
		position: "absolute",
		background: "var(--bb-amber)",
		borderRadius: 999,
		boxShadow: "0 6px 14px rgba(var(--bb-amber-rgb),.5)",
		transition:
			"left .32s cubic-bezier(.4,0,.2,1),width .32s cubic-bezier(.4,0,.2,1),top .3s ease,height .3s ease",
		zIndex: 0,
		pointerEvents: "none",
	};
	const activeRect = tabRects?.[idx];
	const pillStyle: CSSProperties = activeRect
		? { ...pillBase, top: activeRect.top, left: activeRect.left, width: activeRect.width, height: activeRect.height }
		: { ...pillBase, top: 5, left: 5, width: 0, height: 0 };

	const tipLeft = tabCenters?.[idx] ?? 88;
	const tipStyle: CSSProperties = {
		position: "absolute",
		top: -7,
		left: tipLeft,
		width: 15,
		height: 15,
		background: "rgba(255,255,255,.62)",
		borderLeft: "1px solid rgba(255,255,255,.8)",
		borderTop: "1px solid rgba(255,255,255,.8)",
		transform: "translateX(-50%) rotate(45deg)",
		backdropFilter: "blur(10px)",
		WebkitBackdropFilter: "blur(10px)",
		transition: "left .3s cubic-bezier(.4,0,.2,1)",
	};

	const desktop = !isMobile;
	const mobile = isMobile;

	const ratingBubble = (
		width: string,
		avatarSize: number,
		avatarFontSize: string,
		starSize: number,
		ratingFontSize: string,
		labelFontSize: string,
		pointerEvents?: CSSProperties["pointerEvents"],
	) => (
		<div
			style={{
				pointerEvents: pointerEvents,
				position: "relative",
				overflow: "hidden",
				width: width,
				height: width,
				borderRadius: "50%",
				background:
					"radial-gradient(circle at 30% 26%, rgba(255,255,255,.62), rgba(255,255,255,.26) 56%, rgba(255,255,255,.42))",
				backdropFilter: "blur(14px) saturate(165%)",
				WebkitBackdropFilter: "blur(14px) saturate(165%)",
				border: "1px solid rgba(255,255,255,.7)",
				boxShadow:
					"inset 0 1px 12px rgba(255,255,255,.65), inset 0 -10px 22px rgba(var(--bb-amber-rgb),.22), 0 18px 42px rgba(var(--bb-shadow-rgb),.22)",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				textAlign: "center",
				padding: 12,
				animation: "bb-bubble 6.2s ease-in-out infinite",
			}}
		>
			<span
				aria-hidden="true"
				style={{
					position: "absolute",
					top: "13%",
					left: "17%",
					width: "36%",
					height: "27%",
					borderRadius: "50%",
					background: "radial-gradient(circle at 38% 38%, rgba(255,255,255,.95), rgba(255,255,255,0) 72%)",
					pointerEvents: "none",
				}}
			></span>
			<div style={{ display: "flex", position: "relative" }}>
				<span
					style={{
						width: avatarSize,
						height: avatarSize,
						borderRadius: "50%",
						border: "2px solid #fff",
						background: "var(--bb-border)",
						color: "var(--bb-ink)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontFamily: "'Hanken Grotesk',sans-serif",
						fontWeight: 800,
						fontSize: avatarFontSize,
					}}
				>
					MR
				</span>
				<span
					style={{
						width: avatarSize,
						height: avatarSize,
						borderRadius: "50%",
						border: "2px solid #fff",
						background: "var(--bb-amber)",
						color: "var(--bb-ink)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontFamily: "'Hanken Grotesk',sans-serif",
						fontWeight: 800,
						fontSize: avatarFontSize,
						marginLeft: -11,
					}}
				>
					DO
				</span>
				<span
					style={{
						width: avatarSize,
						height: avatarSize,
						borderRadius: "50%",
						border: "2px solid #fff",
						background: "var(--bb-decor)",
						color: "var(--bb-ink)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontFamily: "'Hanken Grotesk',sans-serif",
						fontWeight: 800,
						fontSize: avatarFontSize,
						marginLeft: -11,
					}}
				>
					PS
				</span>
			</div>
			<div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 9 }}>
				<svg width={starSize} height={starSize} viewBox="0 0 24 24" fill="var(--bb-amber)" aria-hidden="true">
					<path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.7 5.9 21l1.4-6.8L2.2 9l6.9-.7z"></path>
				</svg>
				<span
					style={{
						fontFamily: "'Hanken Grotesk',sans-serif",
						fontWeight: 800,
						fontSize: ratingFontSize,
						color: "var(--bb-ink-strong)",
					}}
				>
					4.9
				</span>
			</div>
			<span
				style={{
					fontSize: labelFontSize,
					color: "var(--bb-ink)",
					fontWeight: 700,
					lineHeight: 1.2,
					marginTop: 2,
				}}
			>
				8,000+ families
			</span>
		</div>
	);

	const watchStoryBubble = (
		width: string,
		playSize: number,
		iconSize: number,
		labelFontSize: string,
		pointerEvents?: CSSProperties["pointerEvents"],
	) => (
		<div
			style={{
				pointerEvents: pointerEvents,
				position: "relative",
				overflow: "hidden",
				width: width,
				height: width,
				borderRadius: "50%",
				background:
					"radial-gradient(circle at 30% 26%, rgba(255,255,255,.62), rgba(255,255,255,.26) 56%, rgba(255,255,255,.42))",
				backdropFilter: "blur(14px) saturate(165%)",
				WebkitBackdropFilter: "blur(14px) saturate(165%)",
				border: "1px solid rgba(255,255,255,.7)",
				boxShadow:
					"inset 0 1px 12px rgba(255,255,255,.65), inset 0 -10px 22px rgba(var(--bb-amber-rgb),.28), 0 18px 42px rgba(var(--bb-shadow-rgb),.22)",
				animation: "bb-bubble-b 7.4s ease-in-out infinite",
			}}
		>
			<span
				aria-hidden="true"
				style={{
					position: "absolute",
					top: "13%",
					left: "17%",
					width: "36%",
					height: "27%",
					borderRadius: "50%",
					background: "radial-gradient(circle at 38% 38%, rgba(255,255,255,.95), rgba(255,255,255,0) 72%)",
					pointerEvents: "none",
				}}
			></span>
			<button
				aria-label="Watch our story"
				className="bb-hero-watch"
				style={{
					position: "absolute",
					inset: 0,
					background: "none",
					border: "none",
					cursor: "pointer",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					gap: 9,
					transition: "transform .22s ease",
				}}
			>
				<span
					style={{
						width: playSize,
						height: playSize,
						borderRadius: "50%",
						background: "var(--bb-amber)",
						color: "var(--bb-amber-ink)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						boxShadow: "0 8px 18px rgba(var(--bb-amber-rgb),.55)",
					}}
				>
					<svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
						<path d="M8 5.5v13l11-6.5z"></path>
					</svg>
				</span>
				<span
					style={{
						fontFamily: "'Hanken Grotesk',sans-serif",
						fontWeight: 700,
						fontSize: labelFontSize,
						color: "var(--bb-ink-strong)",
						lineHeight: 1.05,
					}}
				>
					Watch Story
				</span>
			</button>
		</div>
	);

	return (
		<section
			ref={rootRef}
			id="top"
			style={{
				position: "relative",
				minHeight: "clamp(600px,93vh,920px)",
				overflow: "hidden",
				background: "var(--bb-surface-tint)",
				display: "flex",
			}}
		>
			<div style={{ position: "absolute", inset: 0 }}>
				<Image src={HOME.heroImage.src} alt="" fill priority style={{ objectFit: "cover" }} />
			</div>
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
					pointerEvents: "none",
					width: "100%",
					maxWidth: 1180,
					margin: "0 auto",
					padding: "clamp(110px,15vh,180px) 22px clamp(80px,10vh,128px)",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
				}}
			>
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
					{LANDING.hero.eyebrow}
				</span>
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
					{LANDING.hero.h1}
				</h1>
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
					{LANDING.hero.lede}
				</p>
				<div style={{ pointerEvents: "auto", marginTop: 30 }}>
					<div
						ref={tablistRef}
						role="tablist"
						aria-label="I am a"
						style={{
							position: "relative",
							display: "inline-flex",
							flexWrap: "wrap",
							background: "rgba(255,255,255,.55)",
							backdropFilter: "blur(8px)",
							WebkitBackdropFilter: "blur(8px)",
							border: "1px solid rgba(255,255,255,.8)",
							borderRadius: 999,
							padding: 5,
							gap: 4,
							boxShadow: "0 8px 22px rgba(var(--bb-shadow-rgb),.12)",
						}}
					>
						<span aria-hidden="true" style={pillStyle}></span>
						{TAB_ORDER.map(({ tab, chipKey }) => {
							const chip = LANDING.hero.chips.find((c) => c.key === chipKey)!;
							return (
								<button
									key={tab}
									type="button"
									role="tab"
									aria-selected={heroTab === tab}
									onClick={() => setHeroTab(tab)}
									style={{
										position: "relative",
										zIndex: 1,
										background: "transparent",
										border: "none",
										cursor: "pointer",
										fontFamily: "'Hanken Grotesk',sans-serif",
										fontWeight: 700,
										fontSize: ".92rem",
										padding: "11px 17px",
										borderRadius: 999,
										color: "var(--bb-ink-strong)",
										whiteSpace: "nowrap",
									}}
								>
									{chip.label}
								</button>
							);
						})}
					</div>
					<div
						ref={panelRef}
						data-hint-panel="1"
						style={{
							position: "relative",
							marginTop: 15,
							maxWidth: 466,
							minHeight: 180,
							background: "rgba(255,255,255,.6)",
							backdropFilter: "blur(10px)",
							WebkitBackdropFilter: "blur(10px)",
							border: "1px solid rgba(255,255,255,.8)",
							borderRadius: 20,
							padding: "18px 20px",
							boxShadow: "0 12px 30px rgba(var(--bb-shadow-rgb),.13)",
							display: "flex",
							flexDirection: "column",
							justifyContent: "space-between",
							gap: 15,
						}}
					>
						<span aria-hidden="true" style={tipStyle}></span>
						<p style={{ margin: 0, color: "var(--bb-ink)", fontSize: "1rem", lineHeight: 1.5, fontWeight: 500 }}>
							{activeChip.hint}
						</p>
						<Link
							href={activeChip.ctaHref}
							className="bb-hero-cta"
							style={{
								alignSelf: "flex-start",
								display: "inline-flex",
								alignItems: "center",
								justifyContent: "center",
								gap: 9,
								background: "var(--bb-btn-primary)",
								color: "var(--bb-ink-strong)",
								fontFamily: "'Hanken Grotesk',sans-serif",
								fontWeight: 800,
								fontSize: "1.04rem",
								padding: "14px 26px",
								borderRadius: 999,
								textDecoration: "none",
								boxShadow: "0 12px 26px rgba(var(--bb-shadow-rgb),.3)",
								transition: "transform .2s ease,box-shadow .2s ease",
							}}
						>
							{activeChip.ctaLabel}
							<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
								<path d="M5 12h14"></path>
								<path d="M13 6l6 6-6 6"></path>
							</svg>
						</Link>
					</div>
				</div>
				{mobile && (
					<div
						style={{
							pointerEvents: "auto",
							display: "flex",
							flexWrap: "wrap",
							alignItems: "center",
							gap: 16,
							marginTop: "clamp(34px,5vh,58px)",
						}}
					>
						{ratingBubble("clamp(142px,15vw,166px)", 34, ".7rem", 17, "1.2rem", ".74rem")}
						{watchStoryBubble("clamp(142px,15vw,166px)", 46, 20, ".86rem")}
					</div>
				)}
			</div>

			{desktop && (
				<div
					style={{
						position: "absolute",
						right: "clamp(20px,5vw,76px)",
						top: 0,
						bottom: 0,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						gap: 22,
						zIndex: 4,
						pointerEvents: "none",
					}}
				>
					{watchStoryBubble("clamp(150px,11vw,180px)", 48, 21, ".88rem", "auto")}
					{ratingBubble("clamp(150px,11vw,180px)", 36, ".72rem", 18, "1.24rem", ".76rem", "auto")}
				</div>
			)}
		</section>
	);
}
