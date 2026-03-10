"use client";

import { Encounter, Player } from "@/lib/types";
import { TypePill } from "./TypePill";
import { TYPE_META, normalizeType } from "@/lib/pokemon-types";
import { displayPokemonDe } from "@/lib/pokedex";

function cardBg(status: Encounter["status"]) {
  if (status === "dead") {
    return "bg-red-950/40 border-red-900/60";
  }

  if (status === "lost") {
    return "bg-zinc-950/40 border-zinc-800";
  }

  return "bg-emerald-950/20 border-zinc-800";
}

function typeRing(type?: string | null) {
  if (!type) return "";

  const key = normalizeType(type);
  const meta = TYPE_META[key];

  return meta ? `ring-1 ${meta.accent}` : "ring-1 ring-zinc-700/30";
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
  const slots = [1, 2, 3, 4, 5, 6].map(
    (s) => team.find((e) => e.team_slot === s) ?? null
  );

  return (
    <div className="poke-card fade-in-up">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="font-semibold text-lg">{player.name}</div>

        <div className="flex gap-2 text-xs">
          <span className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-700/60">
            Tode: {player.deaths}
          </span>

          <span className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-700/60">
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
                "poke-slot",
                "transition-all duration-150",
                clickable ? "cursor-pointer" : "",
                e ? cardBg(e.status) : "",
              ].join(" ")}
            >
              {e ? (
                <div className="flex gap-3 items-center">
                  <div
                    className={[
                      "h-12 w-12 rounded-lg bg-zinc-900/60 border border-zinc-800",
                      "flex items-center justify-center overflow-hidden shrink-0",
                      typeRing(e.type1),
                    ].join(" ")}
                  >
                    {e.sprite_url ? (
                      <img
                        src={e.sprite_url}
                        alt={e.pokemon_name ?? ""}
                        className="h-12 w-12 poke-sprite"
                      />
                    ) : (
                      <span className="text-xs text-zinc-500">?</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="font-semibold truncate">
                      {displayPokemonDe(e.pokemon_name)}
                    </div>

                    <div className="text-xs text-zinc-400 truncate">
                      {e.routeName}
                    </div>

                    <div className="mt-1 flex gap-1 flex-wrap">
                      {e.type1 ? <TypePill t={e.type1} /> : null}
                      {e.type2 ? <TypePill t={e.type2} /> : null}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-zinc-500">
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
