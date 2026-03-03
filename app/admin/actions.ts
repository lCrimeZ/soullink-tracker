"use server";

import { z } from "zod";
import { setAdminCookie, clearAdminCookie } from "@/lib/admin";

export async function adminLogin(_: any, formData: FormData) {
  const schema = z.object({ password: z.string().min(1) });
  const parsed = schema.safeParse({ password: formData.get("password") });
  if (!parsed.success) return { ok: false, error: "Passwort fehlt." };

  if (parsed.data.password !== process.env.ADMIN_PASSWORD) {
    return { ok: false, error: "Falsches Passwort." };
  }
  setAdminCookie();
  return { ok: true, error: "" };
}

export async function adminLogout() {
  clearAdminCookie();
  return { ok: true };
}
