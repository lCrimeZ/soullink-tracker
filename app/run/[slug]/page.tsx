import { loadRunBySlug } from "@/lib/load-run";
import { isAdmin } from "@/lib/admin";
import { PlayerBoard } from "@/components/PlayerBoard";
import { LevelCaps } from "@/components/LevelCaps";
import RunClient from "./run-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RunPage({ params }: { params: { slug: string } }) {
  const data = await loadRunBySlug(params.slug);
  const admin = isAdmin();

  const routesById = new Map<string, string>(
    data.routes.map((r: any) => [r.id, r.name])
  );

  const p1 = data.players[0];
  const p2 = data.players[1];

  const team1 = data.encounters
    .filter((e: any) => e.player_id === p1.id && e.team_slot)
    .map((e: any) => ({
      ...e,
      routeName: routesById.get(e.route_id) ?? "-",
    }));

  const team2 = data.encounters
    .filter((e: any) => e.player_id === p2.id && e.team_slot)
    .map((e: any) => ({
      ...e,
      routeName: routesById.get(e.route_id) ?? "-",
    }));

  const currentCap = data.caps?.[0];

  return (
    <div className="min-h-screen relative overflow-hidden text-zinc-100">

      {/* Pokémon Style Glow */}
      <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-red-500/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative p-6">
        <div className="max-w-6xl mx-auto space-y-5">

          {/* Header */}
          <div className="poke-header poke-glass">
            <div>
              <div className="text-sm text-zinc-300">
                {data.run.game} · Gen {data.run.gen}
              </div>

              <div className="text-2xl font-semibold">
                {data.run.title}
              </div>

              <div className="text-xs text-zinc-400 mt-1">
                Share: /run/{data.run.slug}
              </div>
            </div>

            <div className="flex gap-2 text-sm">

              <span className="px-3 py-2 rounded-xl bg-zinc-950/40 border border-zinc-800">
                Level Cap (MVP):{" "}
                <span className="font-semibold text-zinc-100">
                  {currentCap?.cap_p1 ?? "-"} / {currentCap?.cap_p2 ?? "-"}
                </span>
              </span>

              <span
                className={[
                  "px-3 py-2 rounded-xl border",
                  admin
                    ? "bg-emerald-950/30 border-emerald-800/50"
                    : "bg-zinc-950/40 border-zinc-800",
                ].join(" ")}
              >
                {admin ? "Admin: edit enabled" : "Read-only"}
              </span>

            </div>
          </div>

          {/* Player Boards */}
          <div className="grid lg:grid-cols-2 gap-5">
            <PlayerBoard player={p1} team={team1} />
            <PlayerBoard player={p2} team={team2} />
          </div>

          {/* Level Caps */}
          <LevelCaps caps={data.caps} isAdmin={admin} />

          {/* Client */}
          <RunClient initial={data} isAdmin={admin} />

        </div>
      </div>
    </div>
  );
}
