"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SITE } from "@/lib/cms/content";

export interface HeaderProps {
	appLoginUrl?: string;
}

const NAV_LINKS = [
	{ href: "/#how", label: "How it works" },
	{ href: "/for-families", label: "For Families" },
	{ href: "/for-centres", label: "For Childcare Centres" },
	{ href: "/for-educators", label: "For Educators" },
	{ href: "/about", label: "About" },
];

export function Header({ appLoginUrl }: HeaderProps) {
	const navRef = useRef<HTMLElement>(null);
	const barRef = useRef<HTMLDivElement>(null);
	// SSR guard: window is undefined on the server, so default to desktop
	// and let the mount effect below set the real value.
	const [isMobile, setIsMobile] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const menuOpenRef = useRef(menuOpen);
	menuOpenRef.current = menuOpen;
	const isMobileRef = useRef(isMobile);
	isMobileRef.current = isMobile;

	// Scroll pill: transparent bar -> floating rounded pill, mirroring
	// logic-x-dc.js's onScroll (imperative style mutation on barRef).
	const applyBarStyle = () => {
		const b = barRef.current;
		if (!b) return;
		const y =
			window.scrollY ||
			document.documentElement.scrollTop ||
			document.scrollingElement?.scrollTop ||
			0;
		const scrolled = y > 14 || menuOpenRef.current;
		b.style.maxWidth = scrolled ? "1080px" : "1180px";
		b.style.margin = scrolled ? "12px auto 0" : "0 auto";
		b.style.padding = scrolled ? "10px 14px 10px 20px" : "13px 22px";
		b.style.background = scrolled ? "rgba(255,255,255,.92)" : "transparent";
		b.style.borderRadius = scrolled ? "999px" : "0px";
		b.style.boxShadow = scrolled ? "0 12px 32px rgba(20,60,55,.14)" : "none";
		b.style.backdropFilter = scrolled ? "saturate(170%) blur(12px)" : "none";
		(b.style as CSSStyleDeclaration & { webkitBackdropFilter: string }).webkitBackdropFilter =
			scrolled ? "saturate(170%) blur(12px)" : "none";
		b.style.borderColor = scrolled ? "rgba(36,91,86,.06)" : "transparent";
	};

	useEffect(() => {
		applyBarStyle();
		window.addEventListener("scroll", applyBarStyle, { passive: true, capture: true });
		return () => window.removeEventListener("scroll", applyBarStyle, { capture: true });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Re-run the scroll style whenever the menu opens/closes, matching
	// componentDidUpdate() calling this.onScroll() after every state change.
	useEffect(() => {
		applyBarStyle();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [menuOpen]);

	// isMobile = window.innerWidth < 880, re-checked on resize; closes the
	// mobile menu when crossing the breakpoint.
	useEffect(() => {
		const onResize = () => {
			const m = window.innerWidth < 880;
			if (m !== isMobileRef.current) setMenuOpen(false);
			setIsMobile(m);
		};
		onResize();
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, []);

	const toggleMenu = () => setMenuOpen((prev) => !prev);
	const closeMenu = () => setMenuOpen(false);

	return (
		<header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 60 }}>
			<nav
				ref={navRef}
				aria-label="Primary"
				style={{
					background: "transparent",
					transition: "box-shadow .25s ease, background .25s ease, backdrop-filter .25s ease",
					borderBottom: "1px solid transparent",
				}}
			>
				<div
					ref={barRef}
					style={{
						maxWidth: 1180,
						margin: "0 auto",
						padding: "13px 22px",
						display: "flex",
						alignItems: "center",
						gap: 24,
						border: "1px solid transparent",
						transition:
							"max-width .32s ease, margin .32s ease, padding .32s ease, background .32s ease, border-radius .32s ease, box-shadow .32s ease",
					}}
				>
					<Link
						href="/"
						aria-label={`${SITE.name} home`}
						style={{
							display: "flex",
							alignItems: "center",
							gap: 11,
							textDecoration: "none",
							flexShrink: 0,
						}}
					>
						<Image
							src="/brand/safehands-icon-192.png"
							alt=""
							width={36}
							height={36}
							aria-hidden="true"
						/>
						<span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
							<span
								style={{
									fontFamily: "'Hanken Grotesk',sans-serif",
									fontWeight: 800,
									fontSize: "1.18rem",
									color: "var(--sh-deep,#245b56)",
									letterSpacing: "-.02em",
								}}
							>
								{SITE.shortName}
							</span>
							<span
								style={{
									fontFamily: "'Hanken Grotesk',sans-serif",
									fontWeight: 700,
									fontSize: ".64rem",
									letterSpacing: ".14em",
									textTransform: "uppercase",
									color: "var(--sh-muted,#5f726f)",
								}}
							>
								Staffing Agency
							</span>
						</span>
					</Link>

					{!isMobile && (
						<div style={{ display: "flex", alignItems: "center", gap: 30, marginLeft: "auto" }}>
							<div style={{ display: "flex", alignItems: "center", gap: 26 }}>
								{NAV_LINKS.map((link) => (
									<Link
										key={link.href}
										href={link.href}
										className="sh-header-nav-link"
										style={{
											color: "var(--sh-ink,#20413e)",
											textDecoration: "none",
											fontWeight: 600,
											fontSize: ".97rem",
											transition: "color .2s",
										}}
									>
										{link.label}
									</Link>
								))}
							</div>
							{appLoginUrl ? (
								<a
									href={appLoginUrl}
									className="sh-header-nav-link"
									style={{
										color: "var(--sh-ink,#20413e)",
										textDecoration: "none",
										fontWeight: 600,
										fontSize: ".97rem",
										transition: "color .2s",
									}}
								>
									Access the app
								</a>
							) : null}
							<Link
								href="/for-families/request"
								className="sh-header-cta"
								style={{
									display: "inline-flex",
									alignItems: "center",
									gap: 8,
									background: "var(--sh-accent,#f4a93a)",
									color: "var(--sh-accent-ink,#3a2a08)",
									fontFamily: "'Hanken Grotesk',sans-serif",
									fontWeight: 800,
									fontSize: ".98rem",
									padding: "11px 21px",
									borderRadius: 999,
									textDecoration: "none",
									boxShadow: "0 8px 18px rgba(244,169,58,.32)",
									transition: "transform .2s ease,box-shadow .2s ease",
								}}
							>
								Request an Educator
							</Link>
						</div>
					)}

					{isMobile && (
						<button
							onClick={toggleMenu}
							aria-label="Open menu"
							style={{
								marginLeft: "auto",
								display: "flex",
								flexDirection: "column",
								gap: 5,
								background: "none",
								border: "none",
								cursor: "pointer",
								padding: 8,
							}}
						>
							<span
								style={{
									display: "block",
									width: 26,
									height: "2.6px",
									borderRadius: 2,
									background: "var(--sh-deep,#245b56)",
								}}
							></span>
							<span
								style={{
									display: "block",
									width: 26,
									height: "2.6px",
									borderRadius: 2,
									background: "var(--sh-deep,#245b56)",
								}}
							></span>
							<span
								style={{
									display: "block",
									width: 26,
									height: "2.6px",
									borderRadius: 2,
									background: "var(--sh-deep,#245b56)",
								}}
							></span>
						</button>
					)}
				</div>

				{menuOpen && (
					<div
						style={{
							background: "#fff",
							borderBottom: "1px solid rgba(36,91,86,.1)",
							boxShadow: "0 14px 30px rgba(36,91,86,.1)",
						}}
					>
						<div
							style={{
								maxWidth: 1180,
								margin: "0 auto",
								padding: "10px 22px 22px",
								display: "flex",
								flexDirection: "column",
								gap: 4,
							}}
						>
							{NAV_LINKS.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									onClick={closeMenu}
									style={{
										color: "var(--sh-ink,#20413e)",
										textDecoration: "none",
										fontWeight: 700,
										fontSize: "1.05rem",
										padding: "13px 4px",
										borderBottom: "1px solid rgba(36,91,86,.07)",
									}}
								>
									{link.label}
								</Link>
							))}
							{appLoginUrl ? (
								<a
									href={appLoginUrl}
									onClick={closeMenu}
									style={{
										color: "var(--sh-ink,#20413e)",
										textDecoration: "none",
										fontWeight: 700,
										fontSize: "1.05rem",
										padding: "13px 4px",
										borderBottom: "1px solid rgba(36,91,86,.07)",
									}}
								>
									Access the app
								</a>
							) : null}
							<Link
								href="/for-families/request"
								onClick={closeMenu}
								style={{
									marginTop: 14,
									display: "inline-flex",
									alignItems: "center",
									justifyContent: "center",
									gap: 8,
									background: "var(--sh-accent,#f4a93a)",
									color: "var(--sh-accent-ink,#3a2a08)",
									fontFamily: "'Hanken Grotesk',sans-serif",
									fontWeight: 800,
									fontSize: "1.05rem",
									padding: "15px 22px",
									borderRadius: 999,
									textDecoration: "none",
								}}
							>
								Request an Educator
							</Link>
						</div>
					</div>
				)}
			</nav>
		</header>
	);
}
