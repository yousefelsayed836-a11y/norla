export const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string; selectBg: string }> = {
  PENDING:    { bg: "bg-amber-100",  text: "text-amber-800",  dot: "bg-amber-500",  label: "Pending",    selectBg: "#fef3c7" },
  PROCESSING: { bg: "bg-blue-100",   text: "text-blue-800",   dot: "bg-blue-500",   label: "Processing", selectBg: "#dbeafe" },
  SHIPPED:    { bg: "bg-violet-100", text: "text-violet-800", dot: "bg-violet-500", label: "Shipped",    selectBg: "#ede9fe" },
  DELIVERED:  { bg: "bg-green-100",  text: "text-green-800",  dot: "bg-green-500",  label: "Delivered",  selectBg: "#dcfce7" },
  CANCELLED:  { bg: "bg-red-100",    text: "text-red-800",    dot: "bg-red-500",    label: "Cancelled",  selectBg: "#fee2e2" },
  EXPRESS:    { bg: "bg-cyan-100",   text: "text-cyan-800",   dot: "bg-cyan-500",   label: "Express",    selectBg: "#cffafe" },
  PROBLEM:    { bg: "bg-rose-100",   text: "text-rose-800",   dot: "bg-rose-500",   label: "Problem",    selectBg: "#ffe4e6" },
};

export default function OrderStatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-400", label: status, selectBg: "#f3f4f6" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
