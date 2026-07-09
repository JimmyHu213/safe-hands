import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";

export default function FamilyRequestAck(props: {
	parentName: string;
	shiftDate: string;
	shiftStart: string;
}) {
	return (
		<Html>
			<Head />
			<Preview>We have received your care request</Preview>
			<Body style={{ fontFamily: "ui-sans-serif, system-ui", color: "#0f172a" }}>
				<Container style={{ maxWidth: 560, padding: 24 }}>
					<Heading as="h1" style={{ fontSize: 20 }}>Thanks, {props.parentName}.</Heading>
					<Section>
						<Text>
							We have received your care request for {props.shiftDate} at {props.shiftStart}.
						</Text>
						<Text>
							A Safe Hands operator will be in touch within 4 business hours to discuss next steps.
						</Text>
						<Text>— Safe Hands Staffing</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}
