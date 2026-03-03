import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/admin";
import { supabaseServer } from "@/lib/supabase-server";

const bodySchema = z.object({
  slug: z.string().min(3).max(40).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(60),
  player1: z.string().min(1).max(30),
  player2: z.string().min(1).max(30),
});

const FIRERED_CAPS: Array<[string, number]> = [
  ["Arena 1 (Brock)", 14],
  ["Arena 2 (Misty)", 21],
  ["Arena 3 (Lt. Surge)", 24],
  ["Arena 4 (Erika)", 29],
  ["Arena 5 (Koga)", 43],
  ["Arena 6 (Sabrina)", 43],
  ["Arena 7 (Blaine)", 47],
  ["Arena 8 (Giovanni)", 50],
  ["Elite 1 (Lorelei)", 54],
  ["Elite 2 (Bruno)", 56],
  ["Elite 3 (Agatha)", 58],
  ["Elite 4 (Lance)", 60],
  ["Champ (Rival)", 63],
];

const FIRERED_ROUTES: string[] = [
  "Pallet Town",
  "Route 1",
  "Viridian City",
  "Route 2",
  "Viridian Forest",
  "Pewter City",
  "Route 3",
  "Mt. Moon",
  "Route 4",
  "Cerulean City",
  "Route 24",
  "Route 25",
  "Route 5",
  "Route 6",
  "Vermilion City",
  "S.S. Anne",
  "Diglett's Cave",
  "Route 9",
  "Route 10 (South)",
  "Rock Tunnel",
  "Route 10 (North)",
  "Lavender Town",
  "Pokémon Tower",
  "Route 8",
  "Celadon City",
  "Game Corner",
  "Rocket Hideout",
  "Route 7",
  "Route 16",
  "Route 17",
  "Route 18",
  "Fuchsia City",
  "Safari Zone",
  "Route 15",
  "Route 14",
  "Route 13",
  "Route 12",
  "Route 11",
  "Route 19",
  "Route 20",
  "Seafoam Islands",
  "Cinnabar Island",
  "Pokémon Mansion",
  "Route 21",
  "Route 22",
  "Route 23",
  "Victory Road",
  "Indigo Plateau",
  "Power Plant",
  "Cerulean Cave (Postgame)",
];

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "bad request" }, { status: 400 });

  const sb = supabaseServer();

  const { data: run, error: runErr } = await sb
    .from("runs")
    .insert({ slug: parsed.data.slug, title: parsed.data.title, game: "FireRed", gen: 1 })
    .select("id, slug")
    .single();

  if (runErr || !run) return NextResponse.json({ error: runErr?.message ?? "run insert failed" }, { status: 500 });

  const { data: players, error: pErr } = await sb
    .from("players")
    .insert([
      { run_id: run.id, idx: 1, name: parsed.data.player1 },
      { run_id: run.id, idx: 2, name: parsed.data.player2 },
    ])
    .select("id, idx");

  if (pErr || !players) return NextResponse.json({ error: pErr?.message ?? "players insert failed" }, { status: 500 });

  const p1 = (players as any[]).find((p) => p.idx === 1)!.id;
  const p2 = (players as any[]).find((p) => p.idx === 2)!.id;

  const capsRows = FIRERED_CAPS.map(([label, cap], i) => ({
    run_id: run.id,
    label,
    cap_p1: cap,
    cap_p2: cap,
    sort: i + 1,
  }));
  const { error: cErr } = await sb.from("level_caps").insert(capsRows);
  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });

  const routesRows = FIRERED_ROUTES.map((name, i) => ({ run_id: run.id, name, sort: i + 1 }));
  const { data: routes, error: rErr } = await sb.from("routes").insert(routesRows).select("id");
  if (rErr || !routes) return NextResponse.json({ error: rErr?.message ?? "routes insert failed" }, { status: 500 });

  const encounterRows = (routes as any[]).flatMap((rt) => [
    { run_id: run.id, route_id: rt.id, player_id: p1 },
    { run_id: run.id, route_id: rt.id, player_id: p2 },
  ]);
  const { error: eErr } = await sb.from("encounters").insert(encounterRows);
  if (eErr) return NextResponse.json({ error: eErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, slug: run.slug });
}
