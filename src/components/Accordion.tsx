"use client";

import { useState } from "react";

export default function Accordion({
  title,
  children,
  defaultOpen,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);

  return (
    <div className="border-t border-brand-light">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left font-medium uppercase tracking-wide"
      >
        {title}
        <span className={`transition-transform ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      {open && <div className="pb-4 text-sm text-foreground/70 whitespace-pre-line">{children}</div>}
    </div>
  );
}
