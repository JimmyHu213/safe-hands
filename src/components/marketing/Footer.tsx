import Image from "next/image";
import Link from "next/link";
import { LANDING, SITE } from "@/lib/cms/content";
import { AcknowledgementOfCountry } from "./AcknowledgementOfCountry";

const FOOTER_LINK_STYLE = {
	color: "rgba(255,255,255,.74)",
	textDecoration: "none",
	transition: "color .2s",
} as const;

const SOCIAL_STYLE = {
	display: "inline-flex",
	width: 40,
	height: 40,
	borderRadius: "50%",
	background: "rgba(255,255,255,.1)",
	alignItems: "center",
	justifyContent: "center",
	color: "#fff",
	textDecoration: "none",
	transition: "background .2s",
} as const;

export function Footer() {
	return (
		<footer style={{ background: "var(--bb-ink-strong)", color: "rgba(255,255,255,.78)" }}>
			<AcknowledgementOfCountry />
			<div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(48px,6vw,72px) 22px clamp(28px,3vw,40px)" }}>
				<div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(40px,6vw,80px)", justifyContent: "space-between" }}>
					<div style={{ maxWidth: 360, flex: "1 1 280px" }}>
						<div style={{ display: "flex", alignItems: "center", gap: 11 }}>
							<span
								aria-hidden="true"
								style={{
									display: "inline-flex",
									background: "#fff",
									borderRadius: 9,
									padding: 4,
								}}
							>
								<Image src="/brand/beebright-mark-192.png" alt="" width={26} height={26} />
							</span>
							<span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
								<span
									style={{
										fontFamily: "'Hanken Grotesk',sans-serif",
										fontWeight: 800,
										fontSize: "1.3rem",
										color: "#fff",
										letterSpacing: "-.02em",
									}}
								>
									{SITE.shortName}
								</span>
								<span
									style={{
										fontFamily: "'Hanken Grotesk',sans-serif",
										fontWeight: 700,
										fontSize: ".55rem",
										letterSpacing: ".14em",
										textTransform: "uppercase",
										color: "var(--bb-border)",
									}}
								>
									Staffing Agency
								</span>
							</span>
						</div>
						<p style={{ margin: "16px 0 0", lineHeight: 1.6, color: "rgba(255,255,255,.72)" }}>
							{LANDING.footer.mission}
						</p>
						<div style={{ display: "flex", gap: 10, marginTop: 20 }}>
							<a href="#" aria-label="Instagram" className="bb-footer-social" style={SOCIAL_STYLE}>
								<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
									<rect x="3.5" y="3.5" width="17" height="17" rx="5"></rect>
									<circle cx="12" cy="12" r="4"></circle>
									<circle cx="17" cy="7" r="1.1" fill="currentColor" stroke="none"></circle>
								</svg>
							</a>
							<a href="#" aria-label="Facebook" className="bb-footer-social" style={SOCIAL_STYLE}>
								<svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
									<path d="M14 9V7.5c0-.8.2-1.2 1.3-1.2H17V3.3h-2.5C11.7 3.3 10.5 5 10.5 7.3V9H8.3v3.2h2.2V21H14v-8.8h2.4l.4-3.2z"></path>
								</svg>
							</a>
							<a href="#" aria-label="LinkedIn" className="bb-footer-social" style={SOCIAL_STYLE}>
								<svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
									<path d="M6.5 8.5H3.7V21h2.8zM5.1 3.5a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4zM21 21h-2.8v-6c0-1.6-.6-2.6-2-2.6-1 0-1.6.7-1.9 1.4-.1.2-.1.6-.1 1V21H11.4s.04-10.5 0-11.6h2.8v1.7c.4-.6 1-1.5 2.7-1.5 2 0 3.5 1.3 3.5 4z"></path>
								</svg>
							</a>
							<a href="#" aria-label="X" className="bb-footer-social" style={SOCIAL_STYLE}>
								<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
									<path d="M18 3h3l-7 8 8 10h-6l-4.5-5.8L6 21H3l7.4-8.5L3 3h6l4 5.3z"></path>
								</svg>
							</a>
						</div>
					</div>
					<div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(36px,5vw,72px)" }}>
						<div>
							<h4
								style={{
									fontFamily: "'Hanken Grotesk',sans-serif",
									fontWeight: 700,
									fontSize: ".84rem",
									letterSpacing: ".1em",
									textTransform: "uppercase",
									color: "#fff",
									margin: "0 0 16px",
								}}
							>
								Platform
							</h4>
							<ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 11 }}>
								<li>
									<Link href="/#how" className="bb-footer-link" style={FOOTER_LINK_STYLE}>
										How it works
									</Link>
								</li>
								<li>
									<Link href="/#why" className="bb-footer-link" style={FOOTER_LINK_STYLE}>
										Why {SITE.shortName}
									</Link>
								</li>
								<li>
									<Link href="/#trust" className="bb-footer-link" style={FOOTER_LINK_STYLE}>
										Trust &amp; safety
									</Link>
								</li>
								<li>
									<Link href="/faq" className="bb-footer-link" style={FOOTER_LINK_STYLE}>
										FAQ
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<h4
								style={{
									fontFamily: "'Hanken Grotesk',sans-serif",
									fontWeight: 700,
									fontSize: ".84rem",
									letterSpacing: ".1em",
									textTransform: "uppercase",
									color: "#fff",
									margin: "0 0 16px",
								}}
							>
								For you
							</h4>
							<ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 11 }}>
								<li>
									<Link href="/for-families" className="bb-footer-link" style={FOOTER_LINK_STYLE}>
										Families
									</Link>
								</li>
								<li>
									<Link href="/for-centres" className="bb-footer-link" style={FOOTER_LINK_STYLE}>
										Childcare centres
									</Link>
								</li>
								<li>
									<Link href="/for-educators" className="bb-footer-link" style={FOOTER_LINK_STYLE}>
										Educators
									</Link>
								</li>
								<li>
									<Link href="/about" className="bb-footer-link" style={FOOTER_LINK_STYLE}>
										About
									</Link>
								</li>
							</ul>
						</div>
						<div style={{ maxWidth: 220 }}>
							<h4
								style={{
									fontFamily: "'Hanken Grotesk',sans-serif",
									fontWeight: 700,
									fontSize: ".84rem",
									letterSpacing: ".1em",
									textTransform: "uppercase",
									color: "#fff",
									margin: "0 0 16px",
								}}
							>
								Contact
							</h4>
							<ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 11 }}>
								<li>
									<a href={`mailto:${SITE.emailGeneral}`} className="bb-footer-link" style={FOOTER_LINK_STYLE}>
										{SITE.emailGeneral}
									</a>
								</li>
								<li>
									<a href={`tel:${SITE.phoneTel}`} className="bb-footer-link" style={FOOTER_LINK_STYLE}>
										{SITE.phone}
									</a>
								</li>
								<li style={{ color: "rgba(255,255,255,.74)" }}>{SITE.hours}</li>
							</ul>
						</div>
					</div>
				</div>
				<div
					style={{
						marginTop: 44,
						paddingTop: 24,
						borderTop: "1px solid rgba(255,255,255,.13)",
						display: "flex",
						flexWrap: "wrap",
						gap: 14,
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<span style={{ color: "rgba(255,255,255,.6)", fontSize: ".9rem" }}>
						© {new Date().getFullYear()} {SITE.name}. All rights reserved. · ABN {SITE.abn}
					</span>
					<div style={{ display: "flex", gap: 22 }}>
						<Link
							href="/legal/privacy"
							className="bb-footer-bottom-link"
							style={{ color: "rgba(255,255,255,.6)", textDecoration: "none", fontSize: ".9rem", transition: "color .2s" }}
						>
							Privacy
						</Link>
						<Link
							href="/legal/terms"
							className="bb-footer-bottom-link"
							style={{ color: "rgba(255,255,255,.6)", textDecoration: "none", fontSize: ".9rem", transition: "color .2s" }}
						>
							Terms
						</Link>
						<Link
							href="/compliance"
							className="bb-footer-bottom-link"
							style={{ color: "rgba(255,255,255,.6)", textDecoration: "none", fontSize: ".9rem", transition: "color .2s" }}
						>
							Safeguarding
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
