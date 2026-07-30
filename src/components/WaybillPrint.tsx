"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { SENDER_PHONE } from "@/lib/turbo";

const SENDER_NAME = "Norla designs";

export default function WaybillPrint({
  orderNo,
  trackingCode,
  receiverName,
  phone1,
  address,
  government,
  area,
  shippingDate,
  orderSummary,
  amountToCollect,
  returnAmount,
}: {
  orderNo: number;
  trackingCode: string;
  receiverName: string;
  phone1: string;
  address: string;
  government: string;
  area: string;
  shippingDate: string;
  orderSummary: string;
  amountToCollect: number;
  returnAmount?: number | null;
}) {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current && trackingCode) {
      JsBarcode(barcodeRef.current, trackingCode, {
        format: "CODE128",
        width: 1.5,
        height: 34,
        fontSize: 11,
        margin: 2,
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
        dir="rtl"
        className="bg-white text-black font-jost flex flex-col text-[10px] border border-black"
        style={{ width: "10cm", height: "15cm", padding: "0.25cm", boxSizing: "border-box" }}
      >
        <div className="flex items-start border-b border-black pb-1.5 mb-1.5">
          <div className="flex-1 text-center">
            <p className="text-[9px]">تفاصيل الدفع:</p>
            {returnAmount != null && returnAmount > 0 && (
              <div className="border border-black rounded px-1.5 py-0.5 mt-0.5 inline-block">
                <p className="text-[8px]">قيمة الارتجاع:</p>
                <p className="text-[10px] font-bold">{returnAmount.toFixed(2)} ج.م</p>
              </div>
            )}
            <p className="text-[9px] mt-1">الإجمالي</p>
            <p className="text-[15px] font-bold">{amountToCollect.toFixed(2)} ج.م</p>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <p className="font-bold text-[16px] italic">-turbo</p>
          </div>

          <div className="flex-1 text-center text-[9px] leading-relaxed">
            <p>الكود:</p>
            <p className="text-[12px] font-bold mb-1">{trackingCode || "—"}</p>
            {trackingCode && <svg ref={barcodeRef} />}
            <p className="mt-1">تاريخ الشحن: {shippingDate}</p>
            <p>تاريخ التسليم المتوقع: N/A</p>
            <p>طريقة الشحن: Ground</p>
          </div>
        </div>

        <table className="w-full border-collapse text-[9px]" style={{ tableLayout: "fixed" }}>
          <tbody>
            <tr>
              <td className="border border-black p-1 w-[14%] text-center align-middle" rowSpan={2}>
                من:
              </td>
              <td className="border border-black p-1 w-[28%] font-medium">اسم الراسل:</td>
              <td className="border border-black p-1">{SENDER_NAME}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-medium">رقم الراسل:</td>
              <td className="border border-black p-1" dir="ltr">
                {SENDER_PHONE}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1 text-center align-middle" rowSpan={2}>
                إلى:
              </td>
              <td className="border border-black p-1 font-medium">اسم المستلم:</td>
              <td className="border border-black p-1">{receiverName}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-medium">رقم المستلم:</td>
              <td className="border border-black p-1" dir="ltr">
                {phone1}
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-medium" colSpan={2}>
                العنوان:
              </td>
              <td className="border border-black p-1 leading-snug">{address}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-medium" colSpan={2}>
                رقم الفاتورة
              </td>
              <td className="border border-black p-1">{orderNo}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-medium" colSpan={2}>
                المحافظة:
              </td>
              <td className="border border-black p-1">{government}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-medium" colSpan={2}>
                المدينة:
              </td>
              <td className="border border-black p-1">{area}</td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-medium" colSpan={2}>
                الطابق / الشقة
              </td>
              <td className="border border-black p-1">N/A / N/A</td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-medium" colSpan={2}>
                رقم المبنى
              </td>
              <td className="border border-black p-1">N/A</td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-medium align-top" colSpan={2}>
                ملاحظات الشحنة
              </td>
              <td className="border border-black p-1 leading-relaxed">
                نوع الشحنة: تسليم
                <br />
                السماح بالفتح: لا
                <br />
                توصيل للمكتب: لا
              </td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-medium align-top" colSpan={2}>
                وصف ومحتويات الشحنة:
              </td>
              <td className="border border-black p-1 leading-snug">{orderSummary}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-auto pt-3 flex items-center gap-2" style={{ marginTop: "auto" }}>
          <span aria-hidden className="text-[12px]">
            ✂
          </span>
          <div className="flex-1 border-t border-dashed border-black" />
        </div>
      </div>
    </div>
  );
}
