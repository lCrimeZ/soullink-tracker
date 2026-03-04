"use client";

import { useMemo, useState } from "react";
import type { Encounter, Player, Route } from "@/lib/types";
import { TypePill } from "./TypePill";
import { displayGen1De } from "@/lib/pokedex-gen1";

function statusIcon(status: Encounter["status"] | null | undefined) {
  if (status === "dead") return "☠";
  if (status === "lost") return "⛔";
  return "✅";
}

function statusPillClass(status: Encounter["status"] | null | undefined) {
  if (status === "dead") return "bg-red-950/40 border-red-900/60 text-red-200";
  if (status === "lost") return "bg-zinc-900/40 border-zinc-700 text-zinc-200";
  return "bg-emerald-950/30 border-emerald-900/40 text-emerald-200";
}

function cardClass(hasMon: boolean, status: Encounter["status"] | null | undefined) {
  if (!hasMon) return "bg-zinc-950/30 border-zinc-800";
  if (status === "dead") return "bg-red-950/25 border-red-900/40";
  if (status === "lost") return "bg-zinc-950/35 border-zinc-800";
  return "bg-emerald-950/15 border-zinc-800";
}

export function RoutesTable({
  routes,
  players,
  encounters,
  onEdit,
  isAdmin,
}: {
  routes: Route[];
  players: Player[];
  encounters: Encounter[];
  onEdit?: (encounter: Encounter, route: Route, player: Player) => void;
  isAdmin?: boolean;
}) {
  const [q, setQ] = useState("");

  const filteredRoutes = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (query.length < 2) return routes;
    return routes.filter((r) => (r.name ?? "").toLowerCase().includes(query));
  }, [q, routes]);

  // Helper: find encounter for (route, player)
  const getEncounter = (routeId: string, playerId: string) =>
    encounters.find((e) => e.route_id === routeId && e.player_id === playerId) ?? null;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="font-semibold text-lg">Routen</div>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Route suchen (ab 2 Zeichen)..."
          className="w-full sm:w-[420px] rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3"
        />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="text-left text-zinc-300">
              <th className="py-3 pr-4 w-[240px]">Route</th>
              {players.map((p) => (
                <th key={p.id} className="py-3 pr-4">
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="border-t border-zinc-800">
            {filteredRoutes.map((route) => {
              // ✅ Route done = beide Spieler haben pokemon_name
              const p1 = players[0]?.id;
              const p2 = players[1]?.id;

              const e1 = p1 ? getEncounter(route.id, p1) : null;
              const e2 = p2 ? getEncounter(route.id, p2) : null;

              const routeDone = Boolean(e1?.pokemon_name) && Boolean(e2?.pokemon_name);

              return (
                <tr key={route.id} className="border-b border-zinc-800/70">
                  {/* Route name + DONE badge */}
                  <td className="py-4 pr-4 align-top text-zinc-200 font-medium">
                    <div className="flex items-center gap-2">
                      <span className="truncate">{route.name}</span>

                      {routeDone ? (
                        <span className="px-2 py-0.5 rounded-full text-xs border border-emerald-700/60 bg-emerald-900/20 text-emerald-200">
                          Erledigt ✓
                        </span>
                      ) : null}
                    </div>
                  </td>

                  {players.map((player) => {
                    const enc = getEncounter(route.id, player.id);

                    const hasMon = Boolean(enc?.pokemon_name);
                    const clickable = Boolean(isAdmin && onEdit && enc);

                    return (
                      <td key={player.id} className="py-4 pr-4 align-top">
                        <button
                          type="button"
                          disabled={!clickable}
                          onClick={() => enc && onEdit?.(enc, route, player)}
                          className={[
                            "w-full text-left rounded-xl border p-3 transition",
                            "hover:border-zinc-700",
                            clickable
                              ? "cursor-pointer hover:translate-y-[-1px]"
                              : "cursor-default",
                            cardClass(hasMon, enc?.status),
                          ].join(" ")}
                          title={clickable ? "Bearbeiten" : ""}
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-12 w-12 rounded-lg bg-zinc-950/40 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                              {enc?.sprite_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={enc.sprite_url}
                                  alt={enc.pokemon_name ?? ""}
                                  className="h-10 w-10"
                                />
                              ) : (
                                <span className="text-xs text-zinc-500">?</span>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              {/* Name + Status icon */}
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-base">
                                  {hasMon ? statusIcon(enc?.status) : "—"}
                                </span>

                                <div className="font-semibold truncate">
                                  {hasMon ? displayGen1De(enc?.pokemon_name) : "—"}
                                </div>
                              </div>

                              {/* Types */}
                              <div className="mt-2 flex gap-1 flex-wrap">
                                {enc?.type1 ? <TypePill t={enc.type1} /> : null}
                                {enc?.type2 ? <TypePill t={enc.type2} /> : null}
                              </div>

                              {/* Status pill */}
                              <div className="mt-2">
                                <span
                                  className={[
                                    "inline-flex items-center gap-2 px-2 py-1 rounded-full border text-xs",
                                    statusPillClass(enc?.status),
                                  ].join(" ")}
                                >
                                  <span>{statusIcon(enc?.status)}</span>
                                  <span>{enc?.status ?? "alive"}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {q.trim().length >= 2 && filteredRoutes.length === 0 ? (
        <div className="mt-4 text-zinc-400 text-sm">Keine Route gefunden.</div>
      ) : null}
    </div>
  );
}
