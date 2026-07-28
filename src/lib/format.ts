export function formatEGP(value: number | string) {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return `${n.toLocaleString("en-US", { maximumFractionDigits: 0 })} LE`;
}
