import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/admin";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const schema = z.object({
    cap_id: z.string().uuid(),
    cleared: z.boolean(),
  });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "bad request" }, { status: 400 });

  const sb = supabaseServer();
  const { error } = await sb
    .from("level_caps")
    .update({ cleared: parsed.data.cleared, updated_at: new Date().toISOString() })
    .eq("id", parsed.data.cap_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
