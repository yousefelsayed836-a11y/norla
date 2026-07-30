import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

if (!process.env.AUTH_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("AUTH_SECRET must be set in production");
}
const SECRET = process.env.AUTH_SECRET || "dev-secret-change-me";
const COOKIE_NAME = "norla_admin_session";

export type AdminSession = { userId: string; email: string; name: string };

export function signSession(payload: AdminSession) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifySession(token: string): AdminSession | null {
  try {
    return jwt.verify(token, SECRET) as AdminSession;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function setSessionCookie(payload: AdminSession) {
  const store = await cookies();
  store.set(COOKIE_NAME, signSession(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
