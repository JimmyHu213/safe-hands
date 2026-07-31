import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";

export default function EducatorSubmittedAck({ firstName }: { firstName: string }) {
	return (
		<Html>
			<Head />
			<Preview>Your Bee Bright application has been submitted</Preview>
			<Body style={{ fontFamily: "ui-sans-serif, system-ui", color: "#0f172a" }}>
				<Container style={{ maxWidth: 560, padding: 24 }}>
					<Heading as="h1" style={{ fontSize: 20 }}>Application received, {firstName}.</Heading>
					<Section>
						<Text>
							Thanks for completing your application. Our recruitment team will review it and be in
							touch within 5 business days to arrange a phone screen.
						</Text>
						<Text>— Bee Bright Staffing</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}
