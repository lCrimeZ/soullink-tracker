import { Encounter, Player } from "@/lib/types";
import { TypePill } from "./TypePill";

function cardBg(status: Encounter["status"]) {
  if (status === "dead") return "bg-red-950/40 border-red-900/60";
  if (status === "lost") return "bg-zinc-950/40 border-zinc-800";
  return "bg-emerald-950/20 border-zinc-800";
}

export function PlayerBoard({ player, team }: { player: Player; team: Array<Encounter & { routeName: string }> }) {
  const slots = [1, 2, 3, 4, 5, 6].map((s) => team.find((e) => e.team_slot === s) ?? null);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="font-semibold text-lg">{player.name}</div>
        <div className="flex gap-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-zinc-800 border border-zinc-700">Tode: {player.deaths}</span>
          <span className="px-2 py-1 rounded-full bg-zinc-800 border border-zinc-700">Wipes: {player.wipes}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {slots.map((e, i) => (
          <div key={i} className={`rounded-xl border p-3 min-h-[92px] ${e ? cardBg(e.status) : "bg-zinc-950/30 border-zinc-800"}`}>
            {e ? (
              <div className="flex gap-3">
                <div className="h-12 w-12 rounded-lg bg-zinc-950/40 border border-zinc-800 flex items-center justify-center overflow-hidden">
                  {e.sprite_url ? <img src={e.sprite_url} alt="" className="h-10 w-10" /> : <span className="text-xs text-zinc-400">?</span>}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{e.pokemon_name ?? "—"}</div>
                  <div className="text-xs text-zinc-300 truncate">{e.routeName}</div>
                  <div className="mt-1 flex gap-1 flex-wrap">
                    {e.type1 ? <TypePill t={e.type1} /> : null}
                    {e.type2 ? <TypePill t={e.type2} /> : null}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-zinc-400 flex items-center justify-center h-full">Leer</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
