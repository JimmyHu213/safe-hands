import Link from "next/link";
import { LANDING } from "@/lib/cms/content";

export function RequestCta() {
	const { request } = LANDING;
	return (
		<section id="request" style={{ padding: "clamp(28px,4vw,56px) 22px clamp(60px,8vw,90px)" }}>
			<div
				style={{
					maxWidth: 1080,
					margin: "0 auto",
					position: "relative",
					overflow: "hidden",
					borderRadius: 32,
					background: "linear-gradient(130deg,var(--sh-deep,#245b56) 0%, var(--sh-teal,#2f8f86) 100%)",
					padding: "clamp(40px,6vw,72px) clamp(28px,5vw,64px)",
					textAlign: "center",
				}}
			>
				<div
					aria-hidden="true"
					style={{
						position: "absolute",
						top: -70,
						left: -50,
						width: 240,
						height: 240,
						borderRadius: "50%",
						background: "rgba(255,255,255,.07)",
					}}
				></div>
				<div
					aria-hidden="true"
					style={{
						position: "absolute",
						bottom: -90,
						right: -40,
						width: 260,
						height: 260,
						borderRadius: "50%",
						background: "var(--sh-accent,#f4a93a)",
						opacity: 0.18,
					}}
				></div>
				<div style={{ position: "relative" }}>
					<h2
						style={{
							fontFamily: "'Hanken Grotesk',sans-serif",
							fontWeight: 800,
							fontSize: "clamp(2rem,4vw,3.2rem)",
							lineHeight: 1.06,
							letterSpacing: "-.025em",
							color: "#fff",
							margin: 0,
							textWrap: "balance",
						}}
					>
						{request.title}
					</h2>
					<p
						style={{
							fontSize: "clamp(1.06rem,1.5vw,1.22rem)",
							lineHeight: 1.55,
							color: "rgba(255,255,255,.85)",
							margin: "18px auto 0",
							maxWidth: 540,
						}}
					>
						{request.body}
					</p>
					<div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", marginTop: 34 }}>
						<Link
							href={request.primary.href}
							className="sh-request-cta-primary"
							style={{
								display: "inline-flex",
								alignItems: "center",
								justifyContent: "center",
								gap: 9,
								background: "#fff",
								color: "var(--sh-deep,#1A3B5E)",
								fontFamily: "'Hanken Grotesk',sans-serif",
								fontWeight: 800,
								fontSize: "1.08rem",
								padding: "17px 32px",
								borderRadius: 999,
								textDecoration: "none",
								boxShadow: "0 14px 30px rgba(0,0,0,.18)",
								transition: "transform .2s ease,box-shadow .2s ease",
							}}
						>
							{request.primary.label}
							<svg
								width="17"
								height="17"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2.4"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M5 12h14"></path>
								<path d="M13 6l6 6-6 6"></path>
							</svg>
						</Link>
						<Link
							href={request.secondary.href}
							className="sh-request-cta-secondary"
							style={{
								display: "inline-flex",
								alignItems: "center",
								justifyContent: "center",
								gap: 8,
								background: "rgba(255,255,255,.12)",
								color: "#fff",
								fontFamily: "'Hanken Grotesk',sans-serif",
								fontWeight: 700,
								fontSize: "1.08rem",
								padding: "16px 30px",
								borderRadius: 999,
								textDecoration: "none",
								border: "1.5px solid rgba(255,255,255,.4)",
								transition: "background .2s,transform .2s",
							}}
						>
							{request.secondary.label}
						</Link>
					</div>
					<p style={{ margin: "24px 0 0", color: "rgba(255,255,255,.8)", fontSize: ".94rem", fontWeight: 600 }}>
						{request.note}
					</p>
				</div>
			</div>
		</section>
	);
}
