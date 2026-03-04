"use client";

import { Encounter, Player } from "@/lib/types";
import { TypePill } from "./TypePill";
import { TYPE_META, normalizeType } from "@/lib/pokemon-types";

function cardBg(status: Encounter["status"]) {
  if (status === "dead") return "bg-red-950/40 border-red-900/60";
  if (status === "lost") return "bg-zinc-950/40 border-zinc-800";
  return "bg-emerald-950/20 border-zinc-800";
}

function typeRing(type1?: string | null) {
  if (!type1) return "";
  const key = normalizeType(type1);
  return TYPE_META[key]?.accent ? `ring-1 ${TYPE_META[key].accent}` : "ring-1 ring-zinc-700/30";
}

export function PlayerBoard({
  player,
  team,
  onSelectEncounter,
}: {
  player: Player;
  team: Array<Encounter & { routeName: string }>;
  onSelectEncounter?: (e: Encounter & { routeName: string }) => void;
}) {
  const slots = [1, 2, 3, 4, 5, 6].map((s) => team.find((e) => e.team_slot === s) ?? null);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="font-semibold text-lg">{player.name}</div>

        <div className="flex gap-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-zinc-800 border border-zinc-700/80">
            Tode: {player.deaths}
          </span>
          <span className="px-2 py-1 rounded-full bg-zinc-800 border border-zinc-700/80">
            Wipes: {player.wipes}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {slots.map((e, i) => {
          const clickable = !!e && !!onSelectEncounter;

          return (
            <div
              key={i}
              onClick={() => e && onSelectEncounter?.(e)}
              className={[
                "rounded-xl border p-3 min-h-[96px]",
                "transition will-change-transform",
                "hover:-translate-y-0.5 hover:scale-[1.01] hover:border-zinc-600",
                "hover:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_10px_30px_rgba(0,0,0,0.35)]",
                clickable ? "cursor-pointer" : "",
                e ? cardBg(e.status) : "bg-zinc-950/30 border-zinc-800",
              ].join(" ")}
            >
              {e ? (
                <div className="flex gap-3">
                  <div
                    className={[
                      "h-12 w-12 rounded-lg bg-zinc-950/40 border border-zinc-800",
                      "flex items-center justify-center overflow-hidden shrink-0",
                      typeRing(e.type1),
                    ].join(" ")}
                    title={e.type1 ?? ""}
                  >
                    {e.sprite_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={e.sprite_url} alt={e.pokemon_name ?? ""} className="h-10 w-10" />
                    ) : (
                      <span className="text-xs text-zinc-500">?</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="font-semibold truncate">
                      {e.pokemon_name ? e.pokemon_name : "—"}
                    </div>

                    <div className="text-xs text-zinc-300 truncate">{e.routeName}</div>

                    <div className="mt-2 flex gap-1 flex-wrap">
                      {e.type1 ? <TypePill t={e.type1} /> : null}
                      {e.type2 ? <TypePill t={e.type2} /> : null}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-zinc-400">
                  Leer
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
