"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

type Status = "checking" | "unsupported" | "subscribed" | "unsubscribed" | "working";

export default function PushNotificationToggle() {
  const [status, setStatus] = useState<Status>("checking");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function check() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setStatus("unsupported");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setStatus(sub ? "subscribed" : "unsubscribed");
    }
    check();
  }, []);

  async function subscribe() {
    setStatus("working");
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setError(`Notification permission was ${permission}. Allow notifications for this site in your browser settings, then try again.`);
        setStatus("unsubscribed");
        return;
      }
      const keyRes = await fetch("/api/push/public-key");
      const { publicKey } = await keyRes.json();
      if (!publicKey) {
        setError("Server has no VAPID public key configured.");
        setStatus("unsupported");
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const saveRes = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      if (!saveRes.ok) {
        const body = await saveRes.json().catch(() => null);
        throw new Error(body?.error || `Server rejected subscription (${saveRes.status})`);
      }
      setStatus("subscribed");
    } catch (err) {
      setError(err instanceof Error ? `${err.name}: ${err.message}` : String(err));
      setStatus("unsubscribed");
    }
  }

  async function unsubscribe() {
    setStatus("working");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setStatus("unsubscribed");
    } catch {
      setStatus("subscribed");
    }
  }

  if (status === "unsupported") return null;

  return (
    <div>
      <button
        onClick={status === "subscribed" ? unsubscribe : subscribe}
        disabled={status === "checking" || status === "working"}
        className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white/10 disabled:opacity-50"
      >
        {status === "subscribed"
          ? "🔔 Order alerts on"
          : status === "working"
            ? "…"
            : "🔕 Enable order alerts"}
      </button>
      {error && <p className="px-3 text-xs text-red-300 break-words">{error}</p>}
    </div>
  );
}
