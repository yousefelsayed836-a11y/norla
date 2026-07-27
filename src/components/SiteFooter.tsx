import Image from "next/image";

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TiktokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.5 2h-3v13.5a3 3 0 1 1-2.2-2.9V9.4a6.1 6.1 0 1 0 5.2 6.03V8.2a7.4 7.4 0 0 0 4.5 1.5V6.6a4.4 4.4 0 0 1-4.5-4.6Z" />
    </svg>
  );
}

function WhatsappIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm5.2 14.3c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.7-1.2-4.5-3.9-4.6-4.1-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .5.4.2.5.7 1.7.7 1.9.1.2.1.3 0 .5-.1.2-.2.3-.3.5-.2.2-.3.3-.5.5-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.5 1.6.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.2.1 1.5.7 1.7.8.2.1.4.2.4.3.1.2.1.6-.1 1.2Z" />
    </svg>
  );
}

export default function SiteFooter({
  instagramUrl,
  tiktokUrl,
  whatsappUrl,
}: {
  instagramUrl: string;
  tiktokUrl: string;
  whatsappUrl: string;
}) {
  return (
    <footer className="mt-16 border-t border-brand-light bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col items-center gap-3">
        <Image src="/brand/logo-dark.webp" alt="Norla Designs" width={90} height={15} />

        <div className="flex items-center gap-4 text-foreground/60">
          <a
            href={instagramUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hover:text-brand-dark transition-colors"
          >
            <InstagramIcon />
          </a>
          <a
            href={tiktokUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="hover:text-brand-dark transition-colors"
          >
            <TiktokIcon />
          </a>
          <a
            href={whatsappUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="hover:text-brand-dark transition-colors"
          >
            <WhatsappIcon />
          </a>
        </div>

        <p className="text-xs text-foreground/50">© {new Date().getFullYear()} Norla Designs</p>
      </div>
    </footer>
  );
}
