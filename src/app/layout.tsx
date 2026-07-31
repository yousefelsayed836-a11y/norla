import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";

const jostDisplay = Jost({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const jostSans = Jost({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Norla Designs",
  description: "Norla Designs — Elegant abayas, dresses, skirts & blouses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jostDisplay.variable} ${jostSans.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Temporary diagnostic: reports uncaught client errors (hydration
            failures included) so we can see what's actually breaking on
            devices we can't test directly. Remove once the iPhone issue is
            confirmed fixed. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  var sent = 0;
  function report(payload) {
    if (sent >= 5) return;
    sent++;
    try {
      fetch("/api/client-error-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.assign({
          userAgent: navigator.userAgent,
          url: location.href,
          time: new Date().toISOString(),
        }, payload)),
        keepalive: true,
      }).catch(function () {});
    } catch (e) {}
  }
  window.addEventListener("error", function (e) {
    report({
      type: "error",
      message: e.message,
      source: e.filename,
      line: e.lineno,
      col: e.colno,
      stack: e.error && e.error.stack,
    });
  });
  window.addEventListener("unhandledrejection", function (e) {
    var reason = e.reason;
    report({
      type: "unhandledrejection",
      message: reason && reason.message ? reason.message : String(reason),
      stack: reason && reason.stack,
    });
  });
})();
`,
          }}
        />
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
