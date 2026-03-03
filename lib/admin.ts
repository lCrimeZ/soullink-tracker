import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "sl_admin";

function sign(payload: string) {
  const secret = process.env.ADMIN_COOKIE_SECRET!;
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function setAdminCookie() {
  const payload = `ok:${Date.now()}`;
  const value = `${payload}.${sign(payload)}`;
  cookies().set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export function clearAdminCookie() {
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

export function isAdmin() {
  const c = cookies().get(COOKIE_NAME)?.value;
  if (!c) return false;
  const [payload, sig] = c.split(".");
  if (!payload || !sig) return false;
  return sign(payload) === sig && payload.startsWith("ok:");
}
