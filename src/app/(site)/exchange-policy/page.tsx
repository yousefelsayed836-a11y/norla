import T from "@/components/T";
import ExchangePolicyContent from "@/components/ExchangePolicyContent";

export default function ExchangePolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-[9rem] pb-24 animate-rise-in">
      <h1 className="font-display text-3xl mb-8 text-center">
        <T k="policy.exchangeTitle" />
      </h1>
      <ExchangePolicyContent />
    </div>
  );
}
