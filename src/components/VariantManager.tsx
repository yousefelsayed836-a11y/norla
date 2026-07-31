"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { maybeConvertHeic } from "@/lib/heic";

export type Variant = {
  id: string;
  label: string;
  color: string | null;
  colorHex: string | null;
  size: string | null;
  imageUrl: string | null;
  price: string | null;
  stockStatus: string;
  stockQty: number | null;
};

type ColorOption = { name: string; hex: string; imageUrl: string | null };
type CellState = { checked: boolean; stockQty: string; variantId?: string };

function buildInitialSizes(variants: Variant[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of variants) {
    if (v.size && !seen.has(v.size)) {
      seen.add(v.size);
      out.push(v.size);
    }
  }
  return out;
}

function buildInitialColors(variants: Variant[]): ColorOption[] {
  const map = new Map<string, ColorOption>();
  for (const v of variants) {
    if (!v.color) continue;
    const existing = map.get(v.color);
    if (!existing) {
      map.set(v.color, { name: v.color, hex: v.colorHex ?? "#000000", imageUrl: v.imageUrl });
    } else if (v.imageUrl && !existing.imageUrl) {
      existing.imageUrl = v.imageUrl;
    }
  }
  return Array.from(map.values());
}

function buildInitialCells(variants: Variant[]): Record<string, CellState> {
  const map: Record<string, CellState> = {};
  for (const v of variants) {
    if (!v.color || !v.size) continue;
    map[`${v.color}||${v.size}`] = {
      checked: true,
      stockQty: v.stockQty != null ? String(v.stockQty) : "",
      variantId: v.id,
    };
  }
  return map;
}

export default function VariantManager({
  productId,
  variants,
  productImages = [],
}: {
  productId: string;
  variants: Variant[];
  productImages?: string[];
}) {
  const router = useRouter();
  const [sizes, setSizes] = useState<string[]>(() => buildInitialSizes(variants));
  const [sizeInput, setSizeInput] = useState("");
  const [colors, setColors] = useState<ColorOption[]>(() => buildInitialColors(variants));
  const [colorNameInput, setColorNameInput] = useState("");
  const [colorHexInput, setColorHexInput] = useState("#000000");
  const [cells, setCells] = useState<Record<string, CellState>>(() => buildInitialCells(variants));
  const [uploadingColor, setUploadingColor] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pickerColor, setPickerColor] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [legacyVariants, setLegacyVariants] = useState(() =>
    variants.filter((v) => !(v.color && v.size))
  );
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  async function removeLegacy(id: string) {
    if (!confirm("Delete this variant?")) return;
    await fetch(`/api/variants/${id}`, { method: "DELETE" });
    setLegacyVariants((prev) => prev.filter((v) => v.id !== id));
    router.refresh();
  }

  function addSize() {
    const s = sizeInput.trim();
    if (!s || sizes.includes(s)) return;
    setSizes((prev) => [...prev, s]);
    setSizeInput("");
  }

  function removeSize(s: string) {
    setSizes((prev) => prev.filter((x) => x !== s));
    setCells((prev) => {
      const copy = { ...prev };
      for (const key of Object.keys(copy)) {
        if (key.endsWith(`||${s}`)) delete copy[key];
      }
      return copy;
    });
  }

  function addColor() {
    const name = colorNameInput.trim();
    if (!name || colors.some((c) => c.name === name)) return;
    setColors((prev) => [...prev, { name, hex: colorHexInput, imageUrl: null }]);
    setColorNameInput("");
  }

  function removeColor(name: string) {
    setColors((prev) => prev.filter((c) => c.name !== name));
    setCells((prev) => {
      const copy = { ...prev };
      for (const key of Object.keys(copy)) {
        if (key.startsWith(`${name}||`)) delete copy[key];
      }
      return copy;
    });
  }

  function toggleCell(color: string, size: string) {
    const key = `${color}||${size}`;
    setCells((prev) => {
      const existing = prev[key];
      if (existing?.checked) return { ...prev, [key]: { ...existing, checked: false } };
      return { ...prev, [key]: { checked: true, stockQty: existing?.stockQty ?? "", variantId: existing?.variantId } };
    });
  }

  function setCellStock(color: string, size: string, stockQty: string) {
    const key = `${color}||${size}`;
    setCells((prev) => ({ ...prev, [key]: { ...(prev[key] ?? { checked: true }), stockQty } }));
  }

  async function handleColorImageUpload(colorName: string, file: File) {
    setUploadingColor(colorName);
    setUploadError(null);
    let toUpload = file;
    try {
      toUpload = await maybeConvertHeic(file);
    } catch {
      setUploadError(`Couldn't convert ${file.name}. Try a JPG, PNG, or WebP photo.`);
      setUploadingColor(null);
      return;
    }
    const formData = new FormData();
    formData.append("file", toUpload);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      setColors((prev) => prev.map((c) => (c.name === colorName ? { ...c, imageUrl: data.url } : c)));
      setPickerColor(null);
    } else {
      const data = await res.json().catch(() => null);
      setUploadError(data?.error || "Failed to upload image.");
    }
    setUploadingColor(null);
  }

  function pickColorImage(colorName: string, url: string) {
    setColors((prev) => prev.map((c) => (c.name === colorName ? { ...c, imageUrl: url } : c)));
    setPickerColor(null);
  }

  async function handleSave() {
    setSaving(true);
    const colorByName = new Map(colors.map((c) => [c.name, c]));

    const targets: { color: string; size: string; stockQty: string; variantId?: string }[] = [];
    for (const [key, cell] of Object.entries(cells)) {
      if (!cell.checked) continue;
      const [color, size] = key.split("||");
      if (!colorByName.has(color) || !sizes.includes(size)) continue;
      targets.push({ color, size, stockQty: cell.stockQty, variantId: cell.variantId });
    }
    const targetIds = new Set(targets.filter((t) => t.variantId).map((t) => t.variantId));

    for (const v of variants) {
      if (v.color && v.size && !targetIds.has(v.id)) {
        await fetch(`/api/variants/${v.id}`, { method: "DELETE" });
      }
    }

    for (const t of targets) {
      const colorOpt = colorByName.get(t.color)!;
      const payload = {
        label: `${t.color}, ${t.size}`,
        color: t.color,
        colorHex: colorOpt.hex,
        size: t.size,
        imageUrl: colorOpt.imageUrl,
        stockStatus: "instock",
        stockQty: t.stockQty !== "" ? parseInt(t.stockQty) : null,
      };
      if (t.variantId) {
        await fetch(`/api/variants/${t.variantId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(`/api/products/${productId}/variants`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
    }

    setSaving(false);
    router.refresh();
  }

  return (
    <div className="max-w-2xl bg-white rounded-2xl p-8 shadow-sm mt-6 space-y-8">
      <div>
        <h2 className="font-display text-xl mb-1">Variants</h2>
        <p className="text-xs text-foreground/50">
          1. Add the sizes you offer. 2. Add the colors you offer. 3. For each color, tick the
          sizes available and set the stock for each.
        </p>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">1. Available Sizes</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {sizes.map((s) => (
            <span
              key={s}
              className="flex items-center gap-1.5 bg-brand-light rounded-full pl-3 pr-1.5 py-1 text-sm"
            >
              {s}
              <button
                type="button"
                onClick={() => removeSize(s)}
                className="w-5 h-5 rounded-full hover:bg-black/10 flex items-center justify-center"
                aria-label={`Remove size ${s}`}
              >
                ✕
              </button>
            </span>
          ))}
          {sizes.length === 0 && <p className="text-sm text-foreground/40">No sizes yet.</p>}
        </div>
        <div className="flex gap-2">
          <input
            placeholder="e.g. S/M, M/L, One size"
            className="flex-1 border border-brand-light rounded-xl px-3 py-2 text-sm"
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSize())}
          />
          <button
            type="button"
            onClick={addSize}
            className="border border-brand-light rounded-xl px-4 py-2 text-sm font-medium hover:bg-brand-light/50"
          >
            Add
          </button>
        </div>
      </div>

      <div className="border-t border-brand-light pt-6">
        <p className="text-sm font-medium mb-2">2. Colors</p>
        <ul className="space-y-2 mb-3">
          {colors.map((c) => (
            <li
              key={c.name}
              className="relative flex items-center gap-3 border border-brand-light rounded-xl px-3 py-2"
            >
              <span
                className="w-6 h-6 rounded-full border border-black/10 shrink-0"
                style={{ backgroundColor: c.hex }}
              />
              {c.imageUrl && (
                <div className="relative w-8 h-9 overflow-hidden bg-brand-light shrink-0">
                  <Image src={c.imageUrl} alt="" fill className="object-cover" sizes="32px" />
                </div>
              )}
              <span className="flex-1 text-sm">{c.name}</span>
              <input
                ref={(el) => {
                  fileRefs.current[c.name] = el;
                }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleColorImageUpload(c.name, e.target.files[0])}
              />
              <button
                type="button"
                onClick={() => setPickerColor((prev) => (prev === c.name ? null : c.name))}
                className="text-xs border border-brand-light rounded-lg px-2 py-1.5 hover:bg-brand-light/50"
              >
                {c.imageUrl ? "Change Photo" : "Link Photo"}
              </button>
              <button
                type="button"
                onClick={() => removeColor(c.name)}
                className="text-red-500 hover:text-red-700 text-sm"
                aria-label={`Remove color ${c.name}`}
              >
                ✕
              </button>

              {pickerColor === c.name && (
                <div className="absolute z-10 top-full right-0 mt-1 w-72 bg-white border border-brand-light rounded-xl shadow-lg p-3">
                  <p className="text-xs text-foreground/50 mb-2">
                    Pick one of this product&apos;s photos, or upload a new one.
                  </p>
                  {productImages.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {productImages.map((url) => (
                        <button
                          key={url}
                          type="button"
                          onClick={() => pickColorImage(c.name, url)}
                          className={`relative aspect-[2/3] overflow-hidden bg-brand-light border-2 transition-colors ${
                            c.imageUrl === url
                              ? "border-brand-dark"
                              : "border-transparent hover:border-brand-light"
                          }`}
                        >
                          <Image src={url} alt="" fill className="object-cover" sizes="64px" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-foreground/40 mb-3">
                      No product photos uploaded yet.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => fileRefs.current[c.name]?.click()}
                    disabled={uploadingColor === c.name}
                    className="w-full text-xs border border-brand-light rounded-lg px-2 py-1.5 hover:bg-brand-light/50 disabled:opacity-50"
                  >
                    {uploadingColor === c.name ? "Uploading..." : "Upload a new photo instead"}
                  </button>
                </div>
              )}
            </li>
          ))}
          {colors.length === 0 && <p className="text-sm text-foreground/40">No colors yet.</p>}
        </ul>
        {uploadError && <p className="text-red-600 text-xs mb-2">{uploadError}</p>}
        <div className="flex gap-2 items-center">
          <input
            type="color"
            className="w-9 h-9 rounded border border-brand-light cursor-pointer shrink-0"
            value={colorHexInput}
            onChange={(e) => setColorHexInput(e.target.value)}
          />
          <input
            placeholder="e.g. Beige, Red"
            className="flex-1 border border-brand-light rounded-xl px-3 py-2 text-sm"
            value={colorNameInput}
            onChange={(e) => setColorNameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
          />
          <button
            type="button"
            onClick={addColor}
            className="border border-brand-light rounded-xl px-4 py-2 text-sm font-medium hover:bg-brand-light/50"
          >
            Add
          </button>
        </div>
      </div>

      <div className="border-t border-brand-light pt-6">
        <p className="text-sm font-medium mb-3">3. Stock per Color &amp; Size</p>
        {colors.length === 0 || sizes.length === 0 ? (
          <p className="text-sm text-foreground/40">Add at least one size and one color above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="text-sm border-collapse">
              <thead>
                <tr>
                  <th className="text-left font-medium p-2">Color</th>
                  {sizes.map((s) => (
                    <th key={s} className="font-medium p-2 text-center min-w-[84px]">
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {colors.map((c) => (
                  <tr key={c.name} className="border-t border-brand-light">
                    <td className="p-2 whitespace-nowrap flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      {c.name}
                    </td>
                    {sizes.map((s) => {
                      const key = `${c.name}||${s}`;
                      const cell = cells[key];
                      return (
                        <td key={s} className="p-2 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <input
                              type="checkbox"
                              checked={!!cell?.checked}
                              onChange={() => toggleCell(c.name, s)}
                              className="accent-brand-dark w-4 h-4"
                            />
                            {cell?.checked && (
                              <input
                                type="number"
                                min={0}
                                placeholder="Qty"
                                className="w-16 border border-brand-light rounded-lg px-1.5 py-1 text-xs text-center"
                                value={cell.stockQty}
                                onChange={(e) => setCellStock(c.name, s, e.target.value)}
                              />
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {legacyVariants.length > 0 && (
        <div className="border-t border-brand-light pt-6">
          <p className="text-sm font-medium mb-1">Other variants</p>
          <p className="text-xs text-foreground/50 mb-3">
            These don&apos;t have both a color and a size, so they&apos;re not part of the matrix
            above. Remove them if they&apos;re no longer needed.
          </p>
          <ul className="space-y-2">
            {legacyVariants.map((v) => (
              <li
                key={v.id}
                className="flex items-center justify-between border border-brand-light rounded-xl px-4 py-2 text-sm"
              >
                <span>{v.label}</span>
                <button
                  type="button"
                  onClick={() => removeLegacy(v.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="bg-brand-dark text-white px-6 py-2.5 rounded-full text-sm font-medium disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Variants"}
      </button>
    </div>
  );
}
