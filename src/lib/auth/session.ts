export const SESSION_COOKIE_NAME = "sh_admin_session";

export interface BuildSessionCookieInput {
  token: string;
  domain: string;
  maxAgeSeconds: number;
}

export function buildSessionCookie(input: BuildSessionCookieInput): string {
  const parts = [
    `${SESSION_COOKIE_NAME}=${input.token}`,
    `Path=/`,
    `Domain=${input.domain}`,
    `Max-Age=${input.maxAgeSeconds}`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
  ];
  return parts.join("; ");
}

export function parseSessionCookie(header: string | null | undefined): string | null {
  if (!header) return null;
  const parts = header.split(";").map((p) => p.trim());
  for (const part of parts) {
    if (part.startsWith(`${SESSION_COOKIE_NAME}=`)) {
      return part.slice(SESSION_COOKIE_NAME.length + 1);
    }
  }
  return null;
}
