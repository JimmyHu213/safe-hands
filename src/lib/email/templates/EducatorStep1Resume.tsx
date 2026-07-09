import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";

export default function EducatorStep1Resume(props: { firstName: string; resumeUrl: string }) {
	return (
		<Html>
			<Head />
			<Preview>Resume your Safe Hands application</Preview>
			<Body style={{ fontFamily: "ui-sans-serif, system-ui", color: "#0f172a" }}>
				<Container style={{ maxWidth: 560, padding: 24 }}>
					<Heading as="h1" style={{ fontSize: 20 }}>Hi {props.firstName},</Heading>
					<Section>
						<Text>
							Thanks for starting your application with Safe Hands Staffing. You can finish it now
							or come back later — use the link below to resume from where you left off.
						</Text>
						<Text>
							<a href={props.resumeUrl}>Resume your application →</a>
						</Text>
						<Text style={{ fontSize: 12, color: "#475569" }}>
							This link is valid for 30 days and can only be used once. If you need a new link,
							contact us at recruitment@safehandsstaffing.com.au.
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}
