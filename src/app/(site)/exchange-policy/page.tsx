import { getSiteSettings } from "@/lib/settings";
import T from "@/components/T";

export default async function ExchangePolicyPage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-2xl px-4 pt-[9rem] pb-24 text-center">
      <h1 className="font-display text-3xl mb-10">
        <T k="policy.exchangeTitle" />
      </h1>
      <p className="whitespace-pre-line text-sm text-foreground/70 text-left leading-relaxed">
        {settings.returnPolicyText}
      </p>
    </div>
  );
}
