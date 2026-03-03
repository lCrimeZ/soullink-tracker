import { loadRunBySlug } from "@/lib/load-run";
import { isAdmin } from "@/lib/admin";
import { PlayerBoard } from "@/components/PlayerBoard";
import { LevelCaps } from "@/components/LevelCaps";
import RunClient from "./run-client";

export default async function RunPage({ params }: { params: { slug: string } }) {
  const data = await loadRunBySlug(params.slug);
  const admin = isAdmin();

  const routesById = new Map<string, string>(data.routes.map((r: any) => [r.id, r.name]));
  const p1 = data.players[0];
  const p2 = data.players[1];

  const team1 = data.encounters
    .filter((e: any) => e.player_id === p1.id && e.team_slot)
    .map((e: any) => ({ ...e, routeName: routesById.get(e.route_id) ?? "—" }));

  const team2 = data.encounters
    .filter((e: any) => e.player_id === p2.id && e.team_slot)
    .map((e: any) => ({ ...e, routeName: routesById.get(e.route_id) ?? "—" }));

  const currentCap = data.caps[0];

  return (
    <div className="min-h-screen p-6 text-zinc-100">
      <div className="max-w-6xl mx-auto space-y-5">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm text-zinc-300">{data.run.game} · Gen {data.run.gen}</div>
            <div className="text-2xl font-semibold">{data.run.title}</div>
            <div className="text-xs text-zinc-400 mt-1">Share: /run/{data.run.slug}</div>
          </div>
          <div className="flex gap-2 text-sm">
            <span className="px-3 py-2 rounded-xl bg-zinc-950/40 border border-zinc-800">
              Level Cap (MVP): {currentCap?.cap_p1} / {currentCap?.cap_p2}
            </span>
            <span className={`px-3 py-2 rounded-xl border ${admin ? "bg-emerald-950/30 border-emerald-800/50" : "bg-zinc-950/40 border-zinc-800"}`}>
              {admin ? "Admin: edit enabled" : "Readonly"}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <PlayerBoard player={p1} team={team1} />
          <PlayerBoard player={p2} team={team2} />
        </div>

        <LevelCaps caps={data.caps} />

        <RunClient initial={data} isAdmin={admin} />
      </div>
    </div>
  );
}
