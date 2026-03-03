import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/admin";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const schema = z.object({
    encounter_id: z.string().uuid(),
    pokemon_name: z.string().nullable().optional(),
    sprite_url: z.string().nullable().optional(),
    type1: z.string().nullable().optional(),
    type2: z.string().nullable().optional(),
    status: z.enum(["alive", "dead", "lost"]).optional(),
    team_slot: z.number().int().min(1).max(6).nullable().optional(),
    notes: z.string().nullable().optional(),
  });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "bad request" }, { status: 400 });

  const sb = supabaseServer();
  const { error } = await sb
    .from("encounters")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", parsed.data.encounter_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
