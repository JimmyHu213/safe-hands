import { HOME } from "@/lib/cms/content";
import { AudienceCards } from "./AudienceCards";
import { PageBanner } from "./PageBanner";

export function Hero({ appLoginUrl }: { appLoginUrl?: string }) {
  return (
    <section className="border-b bg-gradient-to-b from-white to-slate-50 px-4 py-16 md:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
          {HOME.heroH1}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">{HOME.heroLede}</p>
        {appLoginUrl ? (
          <div className="mt-8">
            <a
              href={appLoginUrl}
              className="inline-block rounded-md bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              Access the app →
            </a>
          </div>
        ) : null}
      </div>
      <PageBanner src={HOME.heroImage.src} alt={HOME.heroImage.alt} priority />
      <AudienceCards />
    </section>
  );
}
