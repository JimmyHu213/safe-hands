export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  count: number;
}

export async function checkRateLimit(
  kv: KVNamespace,
  bucketKey: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const key = `rl:${bucketKey}`;
  const current = Number((await kv.get(key)) ?? "0");
  if (current >= limit) {
    return { allowed: false, remaining: 0, count: current };
  }
  const next = current + 1;
  await kv.put(key, String(next), { expirationTtl: windowSeconds });
  return { allowed: true, remaining: limit - next, count: next };
}
