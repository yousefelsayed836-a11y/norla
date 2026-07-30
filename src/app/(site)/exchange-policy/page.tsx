import T from "@/components/T";

export default function ExchangePolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-[9rem] pb-24 animate-rise-in">
      <h1 className="font-display text-3xl mb-8 text-center">
        <T k="policy.exchangeTitle" />
      </h1>

      <p className="flex items-center gap-2 text-sm text-foreground/80 mb-6">
        <span aria-hidden>⚠️</span>
        <T k="policy.noticeIntro" />
      </p>

      <p className="text-xl md:text-2xl font-semibold text-black text-center mb-10 leading-snug">
        <T k="policy.noOpenOnDelivery" />
      </p>

      <h2 className="text-sm font-bold uppercase tracking-wide text-black mb-3">
        <T k="policy.exchangeSectionTitle" />
      </h2>
      <ul className="space-y-2.5 text-sm text-foreground/80 leading-relaxed mb-10 list-disc pl-5">
        <li>
          <T k="policy.exchangeBullet1" />
        </li>
        <li>
          <T k="policy.exchangeBullet2" />
        </li>
        <li>
          <T k="policy.exchangeBullet3" />
        </li>
        <li>
          <T k="policy.exchangeBullet4" />
        </li>
      </ul>

      <h2 className="text-sm font-bold uppercase tracking-wide text-black mb-3">
        <T k="policy.refundSectionTitle" />
      </h2>
      <p className="text-sm text-foreground/80 leading-relaxed">
        <T k="policy.refundText" />
      </p>
    </div>
  );
}
