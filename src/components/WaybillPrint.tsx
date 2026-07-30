"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { formatEGP } from "@/lib/format";

const SENDER_NAME = "Norla Designs";
const SENDER_PHONE = "01027096110";

export default function WaybillPrint({
  orderNo,
  trackingCode,
  receiverName,
  phone1,
  phone2,
  address,
  government,
  area,
  itemsSummary,
  amountToCollect,
}: {
  orderNo: number;
  trackingCode: string;
  receiverName: string;
  phone1: string;
  phone2: string;
  address: string;
  government: string;
  area: string;
  itemsSummary: string;
  amountToCollect: number;
}) {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current && trackingCode) {
      JsBarcode(barcodeRef.current, trackingCode, {
        format: "CODE128",
        width: 1.6,
        height: 45,
        fontSize: 14,
        margin: 4,
      });
    }
  }, [trackingCode]);

  return (
    <div>
      <style>{`
        @page { size: 10cm 15cm; margin: 0; }
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
        }
      `}</style>

      <div className="no-print mb-4 flex items-center gap-3">
        <button
          onClick={() => window.print()}
          className="bg-brand-dark text-white px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90"
        >
          Print Waybill
        </button>
        <span className="text-xs text-foreground/50">Label size: 10cm × 15cm</span>
      </div>

      <div
        className="bg-white border border-black text-black font-jost"
        style={{ width: "10cm", height: "15cm", padding: "0.35cm", boxSizing: "border-box" }}
      >
        <div className="text-center border-b border-black pb-1 mb-2">
          <p className="font-bold text-[13px] uppercase tracking-wide">Norla Designs</p>
          <p className="text-[10px]">Order #{orderNo}</p>
        </div>

        <div className="border border-black rounded p-1.5 mb-2">
          <p className="text-[9px] uppercase text-gray-600">From</p>
          <p className="text-[11px] font-semibold">{SENDER_NAME}</p>
          <p className="text-[11px]">{SENDER_PHONE}</p>
        </div>

        <div className="border border-black rounded p-1.5 mb-2">
          <p className="text-[9px] uppercase text-gray-600">To</p>
          <p className="text-[12px] font-semibold">{receiverName}</p>
          <p className="text-[11px]">{phone1}{phone2 && phone2 !== phone1 ? ` / ${phone2}` : ""}</p>
          <p className="text-[11px] leading-snug">{address}</p>
          <p className="text-[11px]">
            {area}, {government}
          </p>
        </div>

        <div className="border border-black rounded p-1.5 mb-2">
          <p className="text-[9px] uppercase text-gray-600">Items</p>
          <p className="text-[10px] leading-snug">{itemsSummary}</p>
        </div>

        <div className="border border-black rounded p-1.5 mb-2 text-center">
          <p className="text-[9px] uppercase text-gray-600">Cash to Collect</p>
          <p className="text-[16px] font-bold">{formatEGP(amountToCollect)}</p>
        </div>

        <div className="flex flex-col items-center mt-2">
          {trackingCode ? (
            <svg ref={barcodeRef} />
          ) : (
            <p className="text-[10px] text-gray-500">No tracking code yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
