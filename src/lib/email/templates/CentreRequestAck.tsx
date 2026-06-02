import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";

export interface CentreRequestAckProps {
	contactName: string;
	centreName: string;
	shiftDate: string;
	shiftStart: string;
}

export default function CentreRequestAck(props: CentreRequestAckProps) {
	return (
		<Html>
			<Head />
			<Preview>We have received your centre booking request</Preview>
			<Body style={{ fontFamily: "ui-sans-serif, system-ui", color: "#0f172a" }}>
				<Container style={{ maxWidth: 560, padding: 24 }}>
					<Heading as="h1" style={{ fontSize: 20 }}>
						Thanks, {props.contactName}.
					</Heading>
					<Section>
						<Text>
							We have received your booking request for <strong>{props.centreName}</strong> on{" "}
							{props.shiftDate} at {props.shiftStart}.
						</Text>
						<Text>
							A Safe Hands operator will be in touch within 4 business hours to confirm coverage or
							ask any clarifying questions.
						</Text>
						<Text>
							If you need an immediate response, please call <strong>1300 SAFE HANDS</strong>.
						</Text>
						<Text>— Safe Hands Staffing</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}
