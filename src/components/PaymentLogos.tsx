import Image from "next/image";

export function InstaPayLogo({ className }: { className?: string }) {
  return (
    <span className={`${className ?? ""} relative inline-block overflow-hidden bg-white`}>
      <Image src="/payment/instapay.png" alt="InstaPay" fill className="object-contain p-0.5" sizes="40px" />
    </span>
  );
}

export function VodafoneCashLogo({ className }: { className?: string }) {
  return (
    <span className={`${className ?? ""} relative inline-block overflow-hidden bg-white`}>
      <Image src="/payment/vodafone-cash.png" alt="Vodafone Cash" fill className="object-contain" sizes="40px" />
    </span>
  );
}
