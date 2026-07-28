import type { Metadata } from "next";
import { Geist_Mono, Hanken_Grotesk, Mulish } from "next/font/google";
import "./globals.css";
import "./brand.css";

const hanken = Hanken_Grotesk({
	variable: "--font-hanken",
	subsets: ["latin"],
});

const mulish = Mulish({
	variable: "--font-mulish",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Bee Bright Staffing Agency — Trusted childcare staff",
	description:
		"Vetted, compliant childcare educators for centres and families across NSW — casual relief, ratio cover and in-home care, usually within 48 hours.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={`${mulish.variable} ${hanken.variable} ${geistMono.variable}`}>
			<head>
				<link rel="icon" href="/brand/beebright-mark-32.fb9b7ca3.png" type="image/png" sizes="32x32"></link>
				<link rel="apple-touch-icon" href="/brand/beebright-mark-192.109a3f49.png"></link>
			</head>
			<body className="antialiased">{children}</body>
		</html>
	);
}
