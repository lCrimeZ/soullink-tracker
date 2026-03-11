import { loadRunBySlug } from "@/lib/load-run";
import { isAdmin } from "@/lib/admin";
import { PlayerBoard } from "@/components/PlayerBoard";
import { LevelCaps } from "@/components/LevelCaps";
import { CatchRateLauncher } from "@/components/CatchRateLauncher";
import { TypeGuideLauncher } from "@/components/TypeGuideLauncher";
import RunClient from "./run-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RunPage({
  params,
}: {
  params: { slug: string };
}) {
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
      {/* Background Glow */}
      <div className="absolute -top-[220px] -left-[220px] h-[520px] w-[520px] rounded-full blur-3xl pointer-events-none bg-red-900/25" />
      <div className="absolute -bottom-[240px] -right-[220px] h-[520px] w-[520px] rounded-full blur-3xl pointer-events-none bg-amber-500/10" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.08),transparent_35%)]" />

      <div className="relative px-6 py-6">
        <div className="mx-auto max-w-[1400px] space-y-6">
          {/* Header */}
          <div className="poke-header poke-glass fade-in-up soft-shimmer">
            <div>
              <div className="text-sm text-zinc-300">
                {data.run.game} · Gen {data.run.gen}
              </div>

              <div className="mt-1 text-3xl font-bold tracking-tight">
                {data.run.title}
              </div>

              <div className="mt-2 text-sm text-zinc-400">
                Share: /run/{data.run.slug}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="rounded-xl border border-[rgba(212,175,55,0.45)] bg-black/30 px-4 py-2 backdrop-blur-sm shadow-[0_0_14px_rgba(212,175,55,0.08)]">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                  Current Cap
                </div>
                <div className="mt-1 text-sm font-semibold text-zinc-100">
                  {currentCap
                    ? `${currentCap.label}: ${currentCap.cap_p1 ?? "-"} / ${currentCap.cap_p2 ?? "-"}`
                    : "Kein Level Cap"}
                </div>
              </div>

              <CatchRateLauncher />
              <TypeGuideLauncher />

              <div
                className={[
                  "rounded-xl border px-4 py-2 text-sm font-semibold backdrop-blur-sm",
                  admin
                    ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-200 shadow-[0_0_14px_rgba(16,185,129,0.12)]"
                    : "border-zinc-700 bg-zinc-900/60 text-zinc-300",
                ].join(" ")}
              >
                {admin ? "Admin: edit enabled" : "Read-only"}
              </div>
            </div>
          </div>

          {/* Player Boards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
