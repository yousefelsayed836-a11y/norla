export default function AnnouncementBar({ text }: { text: string }) {
  if (!text) return null;
  const items = Array.from({ length: 8 }, () => text);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-9 bg-white overflow-hidden flex items-center border-b border-black/5">
      <div className="flex whitespace-nowrap animate-marquee">
        {items.map((t, i) => (
          <span key={i} className="text-black text-xs font-medium tracking-wide px-8">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
