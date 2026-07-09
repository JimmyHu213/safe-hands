const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(input: {
  token: string;
  remoteIp: string;
  secret: string;
}): Promise<boolean> {
  if (!input.token) return false;
  try {
    const body = new FormData();
    body.append("secret", input.secret);
    body.append("response", input.token);
    body.append("remoteip", input.remoteIp);
    const res = await fetch(VERIFY_URL, { method: "POST", body });
    const data = (await res.json()) as { success: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
}
