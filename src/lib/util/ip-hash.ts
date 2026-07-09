const enc = new TextEncoder();

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function dailySalt(date: Date, base: string): Promise<string> {
  const day = date.toISOString().slice(0, 10);
  return sha256Hex(`${base}|${day}`);
}

export async function hashIp(ip: string, date: Date, base: string): Promise<string> {
  const salt = await dailySalt(date, base);
  return sha256Hex(`${salt}|${ip}`);
}
