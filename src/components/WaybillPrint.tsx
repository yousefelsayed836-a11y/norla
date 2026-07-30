"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { SENDER_PHONE } from "@/lib/turbo";

const SENDER_NAME = "نورلا ديزاين";

export default function WaybillPrint({
  orderNo,
  trackingCode,
  receiverName,
  phone1,
  phone2,
  address,
  government,
  area,
  shippingDate,
  amountToCollect,
  returnAmount,
  returnSummary,
}: {
  orderNo: number;
  trackingCode: string;
  receiverName: string;
  phone1: string;
  phone2: string;
  address: string;
  government: string;
  area: string;
  shippingDate: string;
  amountToCollect: number;
  returnAmount?: number | null;
  returnSummary?: string | null;
}) {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current && trackingCode) {
      JsBarcode(barcodeRef.current, trackingCode, {
        format: "CODE128",
        width: 1.5,
        height: 38,
        fontSize: 12,
        margin: 2,
      });
    }
  }, [trackingCode]);

  const fullAddress = [address, area, government].filter(Boolean).join(" - ");

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
        dir="rtl"
        className="bg-white border border-black text-black font-jost flex flex-col text-[11px]"
        style={{ width: "10cm", height: "15cm", padding: "0.3cm", boxSizing: "border-box" }}
      >
        <div className="flex items-start justify-between border-b border-black pb-1.5 mb-1.5">
          <div className="text-center flex-1">
            <p className="text-[10px]">قيمة</p>
            <div className="border border-black rounded px-2 py-0.5 mt-0.5 inline-block">
              <p className="text-[9px]">الإجمالي</p>
              <p className="text-[12px] font-bold">
                {amountToCollect} <span className="text-[9px] font-normal">ج.م</span>
              </p>
            </div>
          </div>

          <div className="text-center flex-1">
            <p className="font-bold text-[15px] uppercase tracking-wide">Norla Designs</p>
          </div>

          <div className="text-center flex-1">
            <p className="text-[10px]">الكود:</p>
            <p className="text-[13px] font-bold mb-1">{trackingCode || "—"}</p>
            {trackingCode && <svg ref={barcodeRef} />}
          </div>
        </div>

        <div className="text-[10px] leading-relaxed border-b border-black pb-1.5 mb-1.5">
          <p>تاريخ الشحن: {shippingDate}</p>
          <p>تاريخ التسليم المتوقع: N/A</p>
          <p>طريقة الشحن: Ground</p>
        </div>

        <table className="w-full border-collapse border border-black text-[10px]">
          <tbody>
            <tr>
              <td className="border border-black p-1 font-medium w-[28%]">اسم الراسل:</td>
              <td className="border border-black p-1">{SENDER_NAME}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-medium">رقم الراسل:</td>
              <td className="border border-black p-1" dir="ltr">
                {SENDER_PHONE}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-medium">اسم المستلم:</td>
              <td className="border border-black p-1">{receiverName}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-medium">رقم المستلم:</td>
              <td className="border border-black p-1" dir="ltr">
                {phone1}
                {phone2 && phone2 !== phone1 ? ` / ${phone2}` : ""}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-medium">العنوان:</td>
              <td className="border border-black p-1 leading-snug">{fullAddress}</td>
            </tr>
          </tbody>
        </table>

        {returnAmount != null && returnAmount > 0 && (
          <div className="border border-black rounded p-1.5 mt-1.5 text-center">
            <p className="text-[9px]">استلام مرتجع</p>
            <p className="text-[12px] font-bold">
              {returnAmount} <span className="text-[9px] font-normal">ج.م</span>
            </p>
            {returnSummary && <p className="text-[9px]">{returnSummary}</p>}
          </div>
        )}

        <p className="text-[10px] mt-1.5">رقم الفاتورة: {orderNo}</p>

        <div className="mt-auto pt-3 flex items-center gap-2" style={{ marginTop: "auto" }}>
          <span aria-hidden className="text-[12px]">✂</span>
          <div className="flex-1 border-t border-dashed border-black" />
        </div>
      </div>
    </div>
  );
}
