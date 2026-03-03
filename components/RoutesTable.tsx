"use client";

import { useMemo, useState } from "react";
import { Encounter, Player, Route } from "@/lib/types";
import { TypePill } from "./TypePill";

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
  onEdit: (encounter: Encounter, route: Route, player: Player) => void;
  isAdmin: boolean;
}) {
  const [q, setQ] = useState("");

  const byRoutePlayer = useMemo(() => {
    const m = new Map<string, Encounter>();
    for (const e of encounters) m.set(`${e.route_id}:${e.player_id}`, e);
    return m;
  }, [encounters]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (qq.length < 2) return routes;
    return routes.filter((r) => r.name.toLowerCase().includes(qq));
  }, [q, routes]);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="font-semibold text-lg">Routen</div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Route suchen (ab 2 Zeichen)…"
          className="w-full sm:w-[420px] rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-2 outline-none"
        />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-zinc-300">
            <tr className="text-left border-b border-zinc-800">
              <th className="py-2 pr-4">Route</th>
              <th className="py-2 pr-4">{players[0]?.name}</th>
              <th className="py-2 pr-4">{players[1]?.name}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-zinc-900">
                <td className="py-3 pr-4 whitespace-nowrap text-zinc-100">{r.name}</td>
                {players.map((p) => {
                  const e = byRoutePlayer.get(`${r.id}:${p.id}`);
                  return (
                    <td key={p.id} className="py-3 pr-4">
                      {e ? (
                        <button
                          onClick={() => isAdmin && onEdit(e, r, p)}
                          className={`w-full text-left rounded-xl border px-3 py-2 ${
                            e.status === "dead"
                              ? "bg-red-950/30 border-red-900/60"
                              : e.status === "lost"
                              ? "bg-zinc-950/40 border-zinc-800"
                              : "bg-emerald-950/10 border-zinc-800"
                          } ${isAdmin ? "hover:border-zinc-600" : "cursor-default"}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-zinc-950/40 border border-zinc-800 flex items-center justify-center overflow-hidden">
                              {e.sprite_url ? <img src={e.sprite_url} alt="" className="h-9 w-9" /> : <span className="text-xs text-zinc-400">?</span>}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold truncate">{e.pokemon_name ?? "—"}</div>
                              <div className="mt-1 flex gap-1 flex-wrap">
                                {e.type1 ? <TypePill t={e.type1} /> : null}
                                {e.type2 ? <TypePill t={e.type2} /> : null}
                                <span className="px-2 py-1 rounded-full text-xs bg-zinc-800 border border-zinc-700">
                                  {e.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ) : (
                        <div className="text-zinc-500">—</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!isAdmin ? <div className="text-xs text-zinc-400 mt-3">Readonly. Admin kann über /admin einloggen.</div> : null}
    </div>
  );
}
