import { z } from "zod";

export const envSchema = z.object({
  ADMIN_EMAIL: z.string().email(),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_ADDRESS: z.string().email(),
  TURNSTILE_SITE_KEY: z.string().min(1),
  TURNSTILE_SECRET_KEY: z.string().min(1),
  APP_LOGIN_URL: z.string().url().optional().or(z.literal("")),
  SESSION_COOKIE_DOMAIN: z.string().min(1),
  IP_HASH_SALT_ROTATION: z.string().min(32),
  PUBLIC_SITE_URL: z.string().url(),
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  CRON_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function readEnv(source: Record<string, string | undefined>): Env {
  return envSchema.parse(source);
}
