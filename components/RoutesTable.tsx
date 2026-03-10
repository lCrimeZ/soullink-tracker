"use client";

import { useMemo, useState } from "react";
import { Encounter, Player, Route } from "@/lib/types";
import { TypePill } from "./TypePill";
import { displayPokemonDe } from "@/lib/pokedex";

function statusIcon(status: Encounter["status"] | null | undefined) {
  if (status === "dead") return "💀";
  if (status === "lost") return "⛔";
  return "✅";
}

function statusLabel(status: Encounter["status"] | null | undefined) {
  if (status === "dead") return "dead";
  if (status === "lost") return "lost";
  return "alive";
}

function statusPillClass(status: Encounter["status"] | null | undefined) {
  if (status === "dead") {
    return "border-red-800/70 bg-red-950/40 text-red-200";
  }

  if (status === "lost") {
    return "border-zinc-700 bg-zinc-900/80 text-zinc-300";
  }

  return "border-emerald-700/60 bg-emerald-950/20 text-emerald-200";
}

function encounterCardClass({
  exists,
  status,
}: {
  exists: boolean;
  status: Encounter["status"] | null | undefined;
}) {
  if (!exists) {
    return "border-[rgba(212,175,55,0.20)] bg-black/20";
  }

  if (status === "dead") {
    return "border-red-900/50 bg-red-950/20";
  }

  if (status === "lost") {
    return "border-zinc-800 bg-zinc-950/40";
  }

  return "border-[rgba(212,175,55,0.26)] bg-emerald-950/10";
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

  function getEncounter(routeId: string, playerId: string) {
    return encounters.find(
      (e) => e.route_id === routeId && e.player_id === playerId
    );
  }

  return (
    <div className="poke-card poke-glass p-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
            Routen
          </h2>
          <div className="mt-1 text-sm text-zinc-400">
            {filteredRoutes.length} / {routes.length} sichtbar
          </div>
        </div>

        <div className="w-full max-w-xl">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Route suchen (ab 2 Zeichen)..."
            className="w-full rounded-2xl border border-[rgba(212,175,55,0.28)] bg-zinc-900/85 px-5 py-3 text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-[rgba(212,175,55,0.60)] focus:shadow-[0_0_0_1px_rgba(212,175,55,0.18),0_0_16px_rgba(212,175,55,0.08)]"
          />
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-4">
          <thead>
            <tr>
              <th className="pb-2 pr-4 text-left text-sm font-semibold text-zinc-300">
                Route
              </th>

              {players.map((p) => (
                <th
                  key={p.id}
                  className="pb-2 text-left text-sm font-semibold text-zinc-300"
                >
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredRoutes.map((route) => {
              const p1 = players[0]?.id;
              const p2 = players[1]?.id;

              const e1 = p1 ? getEncounter(route.id, p1) : null;
              const e2 = p2 ? getEncounter(route.id, p2) : null;

              const routeDone =
                Boolean(e1?.pokemon_name) && Boolean(e2?.pokemon_name);

              return (
                <tr key={route.id}>
                  <td className="align-top pr-4">
                    <div className="pt-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-100">
                          {route.name}
                        </span>

                        {routeDone ? (
                          <span className="rounded-full border border-emerald-700/60 bg-emerald-950/20 px-2.5 py-0.5 text-xs text-emerald-200">
                            Erledigt
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </td>

                  {players.map((player) => {
                    const enc = getEncounter(route.id, player.id);
                    const hasMon = Boolean(enc?.pokemon_name);
                    const clickable = Boolean(isAdmin && enc && onEdit);

                    return (
                      <td key={player.id} className="align-top">
                        <button
                          type="button"
                          disabled={!clickable}
                          onClick={() => enc && onEdit?.(enc, route, player)}
                          className={[
                            "w-full rounded-3xl border p-4 text-left transition-all",
                            "backdrop-blur-sm",
                            clickable
                              ? "cursor-pointer hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.35),0_0_14px_rgba(212,175,55,0.10)]"
                              : "cursor-default",
                            encounterCardClass({
                              exists: hasMon,
                              status: enc?.status,
                            }),
                          ].join(" ")}
                          title={clickable ? "Bearbeiten" : ""}
                        >
                          <div className="flex items-start gap-4">
                            <div className="h-14 w-14 rounded-2xl border border-[rgba(212,175,55,0.22)] bg-zinc-900/80 flex items-center justify-center overflow-hidden shrink-0">
                              {enc?.sprite_url ? (
                                <img
                                  src={enc.sprite_url}
                                  alt={enc.pokemon_name ?? "Pokémon"}
                                  className="h-12 w-12 object-contain poke-sprite"
                                />
                              ) : (
                                <span className="text-sm text-zinc-500">?</span>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-sm">
                                  {hasMon ? statusIcon(enc?.status) : "—"}
                                </span>

                                <div className="font-semibold text-zinc-100 truncate">
                                  {hasMon
                                    ? displayPokemonDe(enc?.pokemon_name)
                                    : "— —"}
                                </div>
                              </div>

                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {enc?.type1 ? <TypePill t={enc.type1} /> : null}
                                {enc?.type2 ? <TypePill t={enc.type2} /> : null}
                              </div>

                              <div className="mt-3">
                                <span
                                  className={[
                                    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
                                    statusPillClass(enc?.status),
                                  ].join(" ")}
                                >
                                  <span>{statusIcon(enc?.status)}</span>
                                  <span>{statusLabel(enc?.status)}</span>
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
        <div className="mt-4 text-sm text-zinc-400">
          Keine Route gefunden.
        </div>
      ) : null}
    </div>
  );
}
