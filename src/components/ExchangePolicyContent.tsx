import T from "@/components/T";

export default function ExchangePolicyContent() {
  return (
    <>
      <div className="rounded-2xl bg-brand-light/40 border border-brand-light p-5 mb-6 flex items-start gap-3">
        <span aria-hidden className="text-lg leading-none">
          ⚠️
        </span>
        <div>
          <p className="text-xs uppercase tracking-wide text-foreground/60 mb-1">
            <T k="policy.noticeIntro" />
          </p>
          <p className="text-base md:text-lg font-semibold text-black leading-snug">
            <T k="policy.noOpenOnDelivery" />
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-light p-5 mb-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-dark mb-3">
          <T k="policy.exchangeSectionTitle" />
        </h2>
        <ul className="space-y-2.5 text-sm text-foreground/80 leading-relaxed list-disc pl-5">
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
      </div>

      <div className="rounded-2xl border border-brand-light p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-dark mb-3">
          <T k="policy.refundSectionTitle" />
        </h2>
        <p className="text-sm text-foreground/80 leading-relaxed">
          <T k="policy.refundText" />
        </p>
      </div>
    </>
  );
}
