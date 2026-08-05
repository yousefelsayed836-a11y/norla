import webpush from "web-push";
import { prisma } from "@/lib/prisma";

const PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const SUBJECT = process.env.VAPID_SUBJECT || "mailto:me.nouryossry00@gmail.com";

if (PUBLIC_KEY && PRIVATE_KEY) {
  webpush.setVapidDetails(SUBJECT, PUBLIC_KEY, PRIVATE_KEY);
}

export function pushConfigured() {
  return !!PUBLIC_KEY && !!PRIVATE_KEY;
}

export async function sendPushToAdmins(payload: { title: string; body: string; url: string }) {
  if (!pushConfigured()) {
    console.warn("[push] Skipped: VAPID keys not configured");
    return;
  }

  const subscriptions = await prisma.pushSubscription.findMany();
  console.log(`[push] Sending "${payload.title}" to ${subscriptions.length} subscription(s)`);
  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload)
        );
        console.log(`[push] Sent OK to ${sub.endpoint.slice(0, 50)}...`);
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          console.warn(`[push] Subscription expired (${statusCode}), removing: ${sub.endpoint.slice(0, 50)}...`);
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        } else {
          console.error(`[push] Failed to send to ${sub.endpoint.slice(0, 50)}...`, err);
        }
      }
    })
  );
}
