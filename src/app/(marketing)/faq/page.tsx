import { getCloudflareContext } from "@opennextjs/cloudflare";
import { db } from "@/lib/db/client";
import { listPublishedFaq, groupByAudience } from "@/lib/cms/faq";
import { PageHero } from "@/components/marketing/PageHero";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export const dynamic = "force-dynamic";

const sectionTitleStyle = {
	fontFamily: "'Hanken Grotesk',sans-serif",
	fontWeight: 700,
	fontSize: "1.24rem",
	color: "var(--sh-deep,#245b56)",
	margin: "0 0 16px",
} as const;

export default async function FaqPage() {
	const { env } = getCloudflareContext();
	const entries = await listPublishedFaq(db(env.DB));
	const grouped = groupByAudience(entries);

	const sections: { key: keyof typeof grouped; title: string }[] = [
		{ key: "general", title: "General" },
		{ key: "centre", title: "For centres" },
		{ key: "family", title: "For families" },
		{ key: "educator", title: "For educators" },
	];

	return (
		<>
			<PageHero
				eyebrow="FAQ"
				title="Frequently asked questions"
				lede="Answers to the questions we hear most. If yours is not here, give us a call."
			/>
			<section style={{ padding: "clamp(48px,7vw,80px) 22px", maxWidth: 860, margin: "0 auto" }}>
				<div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
					{sections.map((s) => {
						const items = grouped[s.key];
						if (items.length === 0) return null;
						return (
							<div key={s.key}>
								<h2 style={sectionTitleStyle}>{s.title}</h2>
								<Accordion
									className="sh-faq-accordion"
									style={{
										background: "#fff",
										border: "1px solid rgba(36,91,86,.07)",
										borderRadius: 22,
										boxShadow: "0 2px 14px rgba(36,91,86,.05)",
										padding: "4px 26px",
									}}
								>
									{items.map((e) => (
										<AccordionItem key={e.id} value={e.id} style={{ borderColor: "rgba(36,91,86,.08)" }}>
											<AccordionTrigger
												style={{
													color: "var(--sh-ink,#20413e)",
													fontFamily: "'Hanken Grotesk',sans-serif",
													fontWeight: 700,
													fontSize: "1.02rem",
													padding: "18px 0",
												}}
											>
												{e.question}
											</AccordionTrigger>
											<AccordionContent
												style={{ color: "var(--sh-muted,#5f726f)", lineHeight: 1.6, whiteSpace: "pre-line" }}
											>
												{e.answer}
											</AccordionContent>
										</AccordionItem>
									))}
								</Accordion>
							</div>
						);
					})}

					{entries.length === 0 ? (
						<p style={{ color: "var(--sh-muted,#5f726f)" }}>
							No FAQ entries yet — please contact us directly.
						</p>
					) : null}
				</div>
			</section>
		</>
	);
}
