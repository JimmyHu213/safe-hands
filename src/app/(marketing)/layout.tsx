import type { ReactNode } from "react";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { CookieBanner } from "@/components/marketing/CookieBanner";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  const appLoginUrl = process.env.APP_LOGIN_URL ?? "";
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:shadow"
      >
        Skip to main content
      </a>
      <Header appLoginUrl={appLoginUrl} />
      <main id="main">{children}</main>
      <Footer />
      <CookieBanner />
    </>
  );
}
