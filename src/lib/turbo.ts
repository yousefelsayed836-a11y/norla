const BASE_URL = "https://platform.turbo.info/external-api";

const API_KEY = process.env.TURBO_API_KEY;
const CLIENT_CODE = process.env.TURBO_CLIENT_CODE;
export const SENDER_PHONE = "01027096110";

// Maps our ShippingZone.governorate (English) to Turbo's government name (Arabic).
export const TURBO_GOVERNMENT_MAP: Record<string, string> = {
  Cairo: "القاهرة",
  Giza: "الجيزة",
  Alexandria: "الإسكندرية",
  Qalyubia: "القليوبية",
  "Port Said": "بورسعيد",
  Suez: "السويس",
  Dakahlia: "الدقهلية",
  Sharqia: "الشرقية",
  Gharbia: "الغربية",
  Monufia: "المنوفية",
  Beheira: "البحيرة",
  Ismailia: "الإسماعيلية",
  "Kafr El Sheikh": "كفر الشيخ",
  Damietta: "دمياط",
  Faiyum: "الفيوم",
  "Beni Suef": "بني سويف",
  Minya: "المنيا",
  Asyut: "أسيوط",
  Sohag: "سوهاج",
  Qena: "قنا",
  Luxor: "الأقصر",
  Aswan: "أسوان",
  "Red Sea": "البحر الأحمر",
  "New Valley": "الوادي الجديد",
  Matrouh: "مطروح",
  "North Sinai": "شمال سيناء",
  "South Sinai": "جنوب سيناء",
};

export type TurboAddOrderParams = {
  government: string;
  area: string;
  address: string;
  receiver: string;
  phone1: string;
  phone2?: string;
  apiFollowupPhone: string;
  amountToBeCollected: number;
  orderSummary: string;
  weight: number;
  notes?: string;
  isFragile: boolean;
  remoteOrderId: number;
  returnAmount?: number;
  returnSummary?: string;
};

export type TurboResult =
  | { success: true; turboOrderId: string | number; raw: unknown }
  | { success: false; error: string; raw?: unknown };

export function turboConfigured() {
  return !!API_KEY && !!CLIENT_CODE;
}

export async function sendOrderToTurbo(params: TurboAddOrderParams): Promise<TurboResult> {
  if (!API_KEY || !CLIENT_CODE) {
    return { success: false, error: "Turbo is not configured (missing API key)" };
  }

  const body = {
    authentication_key: API_KEY,
    main_client_code: Number(CLIENT_CODE),
    government: params.government,
    area: params.area,
    api_followup_phone: params.apiFollowupPhone,
    address: params.address,
    amount_to_be_collected: params.amountToBeCollected,
    order_summary: params.orderSummary,
    weight: params.weight,
    notes: params.notes || "",
    delivery_type: 0,
    remote_order_id: params.remoteOrderId,
    receiver: params.receiver,
    phone1: params.phone1,
    phone2: params.phone2 || params.phone1,
    is_order: "0",
    is_fragile: params.isFragile ? 1 : 0,
    return_amount: params.returnAmount ?? 0,
    return_summary: params.returnSummary || "",
  };

  try {
    const res = await fetch(`${BASE_URL}/add-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.success) {
      const turboOrderId = data.result?.code ?? data.result?.bar_code ?? data.result?.invoice_number;
      return { success: true, turboOrderId, raw: data };
    }
    return { success: false, error: data.message || "Turbo rejected the order", raw: data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Network error" };
  }
}
