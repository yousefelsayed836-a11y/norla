"use client";

import { useLanguage } from "@/lib/i18n";

export default function Pick({ en, ar }: { en: string; ar?: string | null }) {
  const { pick } = useLanguage();
  return <>{pick(en, ar)}</>;
}
