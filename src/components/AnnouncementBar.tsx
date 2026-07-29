export default function AnnouncementBar({ text }: { text: string }) {
  if (!text) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-9 bg-white overflow-hidden flex items-center border-b border-black/5">
      <div className="whitespace-nowrap animate-marquee-single">
        <span className="text-black text-sm font-medium tracking-wide">{text}</span>
      </div>
    </div>
  );
}
