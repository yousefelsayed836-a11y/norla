"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "ar";

const translations = {
  en: {
    "nav.menu": "Menu",
    "nav.cart": "Cart",
    "nav.search": "Search",
    "nav.closeMenu": "Close menu",
    "nav.searchPlaceholder": "Search products...",
    "nav.language": "Language",
    "nav.home": "Home",
    "nav.store": "Store",
    "nav.contactUs": "Contact Us",
    "contact.heading": "Get In Touch",
    "contact.subheading": "We'd love to hear from you",
    "contact.phone": "Phone",
    "contact.email": "Email",
    "contact.address": "Address",
    "contact.hours": "Working Hours",
    "contact.followUs": "Follow Us",
    "contact.chatWhatsapp": "Chat on WhatsApp",
    "contact.sendMessage": "Send us a message",
    "contact.yourName": "Your Name",
    "contact.yourEmail": "Your Email",
    "contact.yourMessage": "Your Message",
    "contact.send": "Send Message",
    "contact.sending": "Sending...",
    "contact.sent": "Thank you! Your message has been sent — we'll get back to you soon.",
    "contact.formError": "Something went wrong. Please try again.",
    "reviews.heading": "Reviews",
    "reviews.writeReview": "Write a Review",
    "reviews.yourName": "Your Name",
    "reviews.yourRating": "Your Rating",
    "reviews.yourReview": "Your Review",
    "reviews.submit": "Submit Review",
    "reviews.submitting": "Submitting...",
    "reviews.thankYou": "Thank you! Your review is pending approval.",
    "reviews.none": "No reviews yet. Be the first to share your thoughts!",
    "reviews.error": "Something went wrong. Please try again.",
    "hero.shopNow": "Shop Now",
    "home.shopByCategory": "Shop by Category",
    "home.madeByUs": "Made By Us, Styled By You",
    "home.youMayAlsoLike": "You May Also Like",
    "product.quickView": "Quick view",
    "product.outOfStock": "Out of Stock",
    "product.sale": "Sale",
    "product.color": "Color",
    "product.size": "Size",
    "product.inStockReady": "In stock, ready to ship",
    "product.outOfStockLabel": "Out of stock",
    "product.addToCart": "Add to Cart",
    "product.buyItNow": "Buy It Now",
    "product.added": "Added",
    "product.washingInstructions": "Washing Instructions",
    "product.exchangePolicy": "Exchange Policy",
    "product.reviews": "reviews",
    "products.title": "Products",
    "products.none": "No products found in this category yet.",
    "gallery.viewFullImage": "View full image",
    "gallery.zoomImage": "Zoom image",
    "gallery.close": "Close",
    "gallery.scrollUp": "Scroll up",
    "gallery.scrollDown": "Scroll down",
    "gallery.goToImage": "Go to image",
    "cart.title": "Your Cart",
    "cart.closeCart": "Close cart",
    "cart.empty": "Your cart is empty",
    "cart.continueShopping": "Continue Shopping",
    "cart.total": "Total",
    "cart.checkout": "Checkout",
    "cart.remove": "Remove",
    "cart.startShopping": "Start Shopping",
    "cart.proceedToCheckout": "Proceed to Checkout",
    "checkout.title": "Checkout",
    "checkout.orderSummary": "Order Summary",
    "checkout.subtotal": "Subtotal",
    "checkout.shipping": "Shipping",
    "checkout.total": "Total",
    "checkout.depositDueNow": "Deposit due now",
    "checkout.placeOrder": "Place Order",
    "checkout.placingOrder": "Placing order...",
    "checkout.fullName": "Full name",
    "checkout.phone": "Phone number",
    "checkout.whatsapp": "WhatsApp number (to confirm your order)",
    "checkout.email": "Email (optional)",
    "checkout.governorate": "Governorate",
    "checkout.city": "City",
    "checkout.address": "Delivery address (street, building, apartment)",
    "checkout.selectGovernorate": "Select governorate",
    "checkout.free": "Free",
    "checkout.depositNote":
      "We'll message you on WhatsApp to arrange the deposit payment via InstaPay or Vodafone Cash. The remaining balance is paid on delivery.",
    "checkout.fillRequired":
      "Please fill in your name, phone, WhatsApp number, governorate, city and address.",
    "checkout.orderError": "Something went wrong placing your order. Please try again.",
    "checkout.cartEmpty": "Your cart is empty",
    "checkout.paymentMethod": "Payment Method",
    "checkout.instapay": "InstaPay",
    "checkout.vodafoneCash": "Vodafone Cash",
    "checkout.depositAmountLabel": "Deposit amount to send",
    "checkout.transferTo": "Transfer to",
    "checkout.accountNameNote": "Account name: Nourhan",
    "checkout.sendScreenshotNote": "After transferring, please send a screenshot of the receipt on WhatsApp to",
    "checkout.selectPaymentMethod": "Please select a payment method for the deposit.",
    "nav.exchangePolicy": "Exchange & Return Policy",
    "policy.exchangeTitle": "Refund Policy",
    "policy.noticeIntro": "Exchange and Return Policy,",
    "policy.noOpenOnDelivery": "Packages cannot be opened on delivery",
    "policy.exchangeSectionTitle": "Exchange Policy",
    "policy.exchangeBullet1": "If you are not fully satisfied with your order, you can exchange it within 24 hours of receiving it.",
    "policy.exchangeBullet2": "Items must be in their original condition, unworn, unwashed, and with all original tags and packaging.",
    "policy.exchangeBullet3": "Customers are responsible for the shipping costs related to the exchange.",
    "policy.exchangeBullet4": "Final sale items are not eligible for refund or exchange under any circumstance.",
    "policy.refundSectionTitle": "Refund Policy",
    "policy.refundText": "We don't accept refunds.",
    "testimonials.heading": "What Our Customers Are Saying",
    "testimonials.previous": "Previous",
    "testimonials.next": "Next",
    "testimonials.goTo": "Go to testimonial",
    "home.viewAll": "View all",
    "collections.none": "No products in this section yet.",
    "order.thankYou": "Thank you! 🎉",
    "order.confirmedMessage":
      "Your order has been placed successfully. Our team will contact you shortly to confirm delivery details.",
  },
  ar: {
    "nav.menu": "القائمة",
    "nav.cart": "السلة",
    "nav.search": "بحث",
    "nav.closeMenu": "إغلاق القائمة",
    "nav.searchPlaceholder": "ابحث عن منتجات...",
    "nav.language": "اللغة",
    "nav.home": "الرئيسية",
    "nav.store": "المتجر",
    "nav.contactUs": "تواصل معنا",
    "contact.heading": "تواصلي معانا",
    "contact.subheading": "يسعدنا نسمع منك",
    "contact.phone": "الهاتف",
    "contact.email": "البريد الإلكتروني",
    "contact.address": "العنوان",
    "contact.hours": "ساعات العمل",
    "contact.followUs": "تابعينا",
    "contact.chatWhatsapp": "تواصل عبر واتساب",
    "contact.sendMessage": "ابعتيلنا رسالة",
    "contact.yourName": "اسمك",
    "contact.yourEmail": "بريدك الإلكتروني",
    "contact.yourMessage": "رسالتك",
    "contact.send": "إرسال الرسالة",
    "contact.sending": "جاري الإرسال...",
    "contact.sent": "شكرًا لكِ! تم إرسال رسالتك — هنتواصل معاكِ قريبًا.",
    "contact.formError": "حدث خطأ. حاولي مرة أخرى.",
    "reviews.heading": "التقييمات",
    "reviews.writeReview": "اكتبي رأيك",
    "reviews.yourName": "اسمك",
    "reviews.yourRating": "تقييمك",
    "reviews.yourReview": "رأيك",
    "reviews.submit": "إرسال التقييم",
    "reviews.submitting": "جاري الإرسال...",
    "reviews.thankYou": "شكرًا لكِ! تقييمك قيد المراجعة.",
    "reviews.none": "لا توجد تقييمات بعد. كوني أول من يشارك رأيها!",
    "reviews.error": "حدث خطأ. حاولي مرة أخرى.",
    "hero.shopNow": "تسوقي الآن",
    "home.shopByCategory": "تسوقي حسب القسم",
    "home.madeByUs": "من صنعنا، بأسلوبك",
    "home.youMayAlsoLike": "قد يعجبك أيضًا",
    "product.quickView": "عرض سريع",
    "product.outOfStock": "غير متوفر",
    "product.sale": "خصم",
    "product.color": "اللون",
    "product.size": "المقاس",
    "product.inStockReady": "متوفر، جاهز للشحن",
    "product.outOfStockLabel": "غير متوفر",
    "product.addToCart": "أضف إلى السلة",
    "product.buyItNow": "اشترِ الآن",
    "product.added": "تمت الإضافة",
    "product.washingInstructions": "تعليمات الغسيل",
    "product.exchangePolicy": "سياسة الاستبدال",
    "product.reviews": "تقييم",
    "products.title": "المنتجات",
    "products.none": "لا توجد منتجات في هذا القسم حتى الآن.",
    "gallery.viewFullImage": "عرض الصورة كاملة",
    "gallery.zoomImage": "تكبير الصورة",
    "gallery.close": "إغلاق",
    "gallery.scrollUp": "التمرير لأعلى",
    "gallery.scrollDown": "التمرير لأسفل",
    "gallery.goToImage": "الانتقال إلى الصورة",
    "cart.title": "سلتك",
    "cart.closeCart": "إغلاق السلة",
    "cart.empty": "سلتك فارغة",
    "cart.continueShopping": "تابعي التسوق",
    "cart.total": "الإجمالي",
    "cart.checkout": "إتمام الشراء",
    "cart.remove": "إزالة",
    "cart.startShopping": "ابدأي التسوق",
    "cart.proceedToCheckout": "المتابعة للدفع",
    "checkout.title": "إتمام الشراء",
    "checkout.orderSummary": "ملخص الطلب",
    "checkout.subtotal": "المجموع الفرعي",
    "checkout.shipping": "الشحن",
    "checkout.total": "الإجمالي",
    "checkout.depositDueNow": "العربون المطلوب الآن",
    "checkout.placeOrder": "تأكيد الطلب",
    "checkout.placingOrder": "جاري تأكيد الطلب...",
    "checkout.fullName": "الاسم بالكامل",
    "checkout.phone": "رقم الهاتف",
    "checkout.whatsapp": "رقم الواتساب (لتأكيد طلبك)",
    "checkout.email": "البريد الإلكتروني (اختياري)",
    "checkout.governorate": "المحافظة",
    "checkout.city": "المدينة",
    "checkout.address": "عنوان التوصيل (الشارع، المبنى، الشقة)",
    "checkout.selectGovernorate": "اختر المحافظة",
    "checkout.free": "مجاني",
    "checkout.depositNote":
      "هنراسلك على الواتساب لترتيب دفع العربون عن طريق إنستا باي أو فودافون كاش. الباقي يتم دفعه عند الاستلام.",
    "checkout.fillRequired":
      "من فضلك أدخلي الاسم، رقم الهاتف، رقم الواتساب، المحافظة، المدينة والعنوان.",
    "checkout.orderError": "حدث خطأ أثناء تنفيذ الطلب. حاولي مرة أخرى.",
    "checkout.cartEmpty": "سلتك فارغة",
    "checkout.paymentMethod": "طريقة الدفع",
    "checkout.instapay": "إنستا باي",
    "checkout.vodafoneCash": "فودافون كاش",
    "checkout.depositAmountLabel": "مبلغ العربون المطلوب تحويله",
    "checkout.transferTo": "حولي المبلغ على رقم",
    "checkout.accountNameNote": "الحساب باسم نورهان",
    "checkout.sendScreenshotNote": "بعد التحويل، من فضلك ابعتي صورة إيصال التحويل على الواتساب رقم",
    "checkout.selectPaymentMethod": "من فضلك اختاري طريقة دفع العربون.",
    "nav.exchangePolicy": "سياسة الاستبدال والاسترجاع",
    "policy.exchangeTitle": "سياسة الاسترجاع",
    "policy.noticeIntro": "سياسة الاستبدال والاسترجاع،",
    "policy.noOpenOnDelivery": "لا يمكن فتح الطرد أمام مندوب التوصيل",
    "policy.exchangeSectionTitle": "سياسة الاستبدال",
    "policy.exchangeBullet1": "إذا لم تكوني راضية تمامًا عن طلبك، يمكنك استبداله خلال 24 ساعة من استلامه.",
    "policy.exchangeBullet2": "يجب أن تكون المنتجات بحالتها الأصلية، غير مستخدمة وغير مغسولة، ومعها جميع البطاقات والتغليف الأصلي.",
    "policy.exchangeBullet3": "العميلة مسؤولة عن تكاليف الشحن الخاصة بالاستبدال.",
    "policy.exchangeBullet4": "منتجات التخفيضات النهائية غير قابلة للاسترجاع أو الاستبدال تحت أي ظرف.",
    "policy.refundSectionTitle": "سياسة الاسترجاع",
    "policy.refundText": "لا نقبل استرجاع الأموال.",
    "testimonials.heading": "آراء عملائنا",
    "testimonials.previous": "السابق",
    "testimonials.next": "التالي",
    "testimonials.goTo": "الانتقال إلى تقييم",
    "home.viewAll": "عرض الكل",
    "collections.none": "لا توجد منتجات في هذا القسم حتى الآن.",
    "order.thankYou": "شكرًا لكِ! 🎉",
    "order.confirmedMessage":
      "تم تأكيد طلبك بنجاح. هيتواصل معاكِ فريقنا قريبًا لتأكيد تفاصيل التوصيل.",
  },
} satisfies Record<Lang, Record<string, string>>;

export type TranslationKey = keyof (typeof translations)["en"];

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
  pick: (en: string, ar?: string | null) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem("norla-lang");
    if (stored === "ar" || stored === "en") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration of the persisted language choice
      setLangState(stored);
    }
  }, []);

  function setLang(next: Lang) {
    setLangState(next);
    localStorage.setItem("norla-lang", next);
  }

  function t(key: TranslationKey) {
    return translations[lang][key] ?? translations.en[key] ?? key;
  }

  function pick(en: string, ar?: string | null) {
    return lang === "ar" && ar ? ar : en;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, pick }}>
      <div dir={lang === "ar" ? "rtl" : "ltr"} className="flex flex-col flex-1">
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
