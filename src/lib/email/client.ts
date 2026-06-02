import { Resend } from "resend";

export interface SendEmailInput {
  client: Resend;
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(input: SendEmailInput): Promise<{ id: string }> {
  const { client, from, to, subject, html, text } = input;
  const { data, error } = await client.emails.send({ from, to, subject, html, text });
  if (error) throw new Error(`Resend send failed: ${error.message}`);
  return { id: data!.id };
}

export function makeResend(apiKey: string): Resend {
  return new Resend(apiKey);
}
