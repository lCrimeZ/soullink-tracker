"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { TypePill } from "./TypePill";
import { displayPokemonDe } from "@/lib/pokedex";
import {
  buildCoachSummary,
  getAliveMembers,
  getBestDefensiveTypes,
  getDangerousTypes,
  getFragileAnswerTypes,
  getOffensiveCoverage,
  getSharedWeaknesses,
  getTopStrongIntoForPlayer,
  getTopWeakTypesForPlayer,
  getTeamPresentTypes,
  TeamAnalysisPlayer,
} from "@/lib/team-analysis";
import { Gen4Type, TYPE_LABEL_DE } from "@/lib/type-chart-gen4";

type TeamMember = {
  pokemon_name: string | null;
  sprite_url: string | null;
  type1: string | null;
  type2: string | null;
  status: "alive" | "dead" | "lost";
  team_slot: number | null;
  routeName?: string;
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
      {children}
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-2xl border border-[rgba(212,175,55,0.18)] bg-black/15 p-4">
      <div className="text-xs uppercase tracking-[0.16em] text-zinc-500">
        {title}
      </div>
      <div className="mt-2 text-xl font-semibold text-amber-300">{value}</div>
      {subtitle ? (
        <div className="mt-1 text-xs leading-5 text-zinc-400">{subtitle}</div>
      ) : null}
    </div>
  );
}

function TypeList({
  title,
  colorClass,
  items,
  withCount,
}: {
  title: string;
  colorClass: string;
  items: Array<
    | Gen4Type
    | {
        type: Gen4Type;
        weakCount?: number;
        answerCount?: number;
      }
  >;
  withCount?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[rgba(212,175,55,0.16)] bg-black/15 p-4">
      <div className={`text-sm font-semibold ${colorClass}`}>{title}</div>

      {items.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item, idx) => {
            const type = typeof item === "string" ? item : item.type;

            return (
              <div
                key={`${type}-${idx}`}
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(212,175,55,0.20)] bg-zinc-900/70 px-2.5 py-1.5"
              >
                <TypePill t={type} />
                {withCount && typeof item !== "string" ? (
                  <span className="text-[11px] font-semibold text-zinc-300">
                    {item.weakCount != null ? `${item.weakCount} weak` : ""}
                    {item.answerCount != null ? ` · ${item.answerCount} answers` : ""}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-3 text-sm text-zinc-500">Keine</div>
      )}
    </div>
  );
}

function PlayerPanel({
  player,
}: {
  player: TeamAnalysisPlayer;
}) {
  const alive = getAliveMembers(player.team);
  const presentTypes = getTeamPresentTypes(player.team);
  const weakTypes = getTopWeakTypesForPlayer(player.team);
  const strongInto = getTopStrongIntoForPlayer(player.team);

  return (
    <div className="rounded-3xl border border-[rgba(212,175,55,0.18)] bg-black/15 p-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="text-lg font-semibold text-zinc-100">{player.name}</div>
          <div className="mt-1 text-sm text-zinc-400">
            {alive.length} aktive Pokémon
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {presentTypes.map((t) => (
            <TypePill key={t} t={t} />
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <TypeList
          title="Top Schwächen"
          colorClass="text-red-300"
          items={weakTypes.map((entry) => ({ type: entry.type, weakCount: entry.weakCount, answerCount: entry.answerCount }))}
          withCount
        />

        <TypeList
          title="Gute STAB-Coverage gegen"
          colorClass="text-emerald-300"
          items={strongInto}
        />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {alive.map((mon, idx) => (
          <div
            key={`${mon.pokemon_name}-${idx}`}
            className="rounded-2xl border border-[rgba(212,175,55,0.14)] bg-black/15 p-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-[rgba(212,175,55,0.18)] bg-zinc-900/80 shrink-0">
                {mon.sprite_url ? (
                  <img
                    src={mon.sprite_url}
                    alt={mon.pokemon_name ?? "Pokémon"}
                    className="h-11 w-11 object-contain poke-sprite"
                  />
                ) : (
                  <span className="text-xs text-zinc-500">?</span>
                )}
              </div>

              <div className="min-w-0">
                <div className="truncate font-semibold text-zinc-100">
                  {displayPokemonDe(mon.pokemon_name)}
                </div>
                <div className="mt-1 text-xs text-zinc-500 truncate">
                  {mon.routeName ?? "—"}
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {mon.type1 ? <TypePill t={mon.type1} /> : null}
              {mon.type2 ? <TypePill t={mon.type2} /> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TeamAnalysisLauncher({
  players,
}: {
  players: TeamAnalysisPlayer[];
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const combinedTeam = useMemo(
    () => players.flatMap((p) => p.team),
    [players]
  );

  const combinedAlive = useMemo(
    () => getAliveMembers(combinedTeam),
    [combinedTeam]
  );

  const presentTypes = useMemo(
    () => getTeamPresentTypes(combinedTeam),
    [combinedTeam]
  );

  const offensive = useMemo(
    () => getOffensiveCoverage(combinedTeam),
    [combinedTeam]
  );

  const sharedWeak = useMemo(
    () => getSharedWeaknesses(combinedTeam),
    [combinedTeam]
  );

  const dangerous = useMemo(
    () => getDangerousTypes(combinedTeam),
    [combinedTeam]
  );

  const fragile = useMemo(
    () => getFragileAnswerTypes(combinedTeam),
    [combinedTeam]
  );

  const bestDef = useMemo(
    () => getBestDefensiveTypes(combinedTeam),
    [combinedTeam]
  );

  const coachSummary = useMemo(
    () => buildCoachSummary(players),
    [players]
  );

  const modal = open ? (
    <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[rgba(212,175,55,0.42)] bg-zinc-950/95 shadow-[0_0_40px_rgba(0,0,0,0.6)] fade-in-up">
        <div className="flex items-start justify-between gap-4 border-b border-[rgba(212,175,55,0.18)] px-5 py-4">
          <div>
            <div className="text-2xl font-bold tracking-tight text-zinc-100">
              Team Analyse
            </div>
            <div className="mt-1 text-sm text-zinc-400">
              Kombinierte Auswertung beider Teams · Coverage · Schwächen · Coach-Hinweise
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="shrink-0 rounded-xl border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-200 hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Overview */}
          <div className="rounded-3xl border border-[rgba(212,175,55,0.18)] bg-black/15 p-5">
            <SectionTitle>Gesamtüberblick</SectionTitle>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Aktive Pokémon"
                value={`${combinedAlive.length}`}
                subtitle="beide Teams zusammen"
              />
              <StatCard
                title="STAB-Typen"
                value={`${presentTypes.length}`}
                subtitle="verschiedene Typen vorhanden"
              />
              <StatCard
                title="Gute Coverage"
                value={`${offensive.strongInto.length}`}
                subtitle="Typen, die ihr offensiv gut trefft"
              />
              <StatCard
                title="Kritische Typen"
                value={`${dangerous.length + fragile.length}`}
                subtitle="gefährliche oder fragile Matchups"
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {presentTypes.map((t) => (
                <TypePill key={t} t={t} />
              ))}
            </div>
          </div>

          {/* Coach */}
          <div className="rounded-3xl border border-[rgba(212,175,55,0.20)] bg-black/20 p-5">
            <SectionTitle>Coach-Zusammenfassung</SectionTitle>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {coachSummary.map((line, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-[rgba(212,175,55,0.16)] bg-black/15 p-4 text-sm leading-6 text-zinc-300"
                >
                  {line}
                </div>
              ))}
            </div>
          </div>

          {/* Combined strategic analysis */}
          <div className="grid gap-5 xl:grid-cols-2">
            <div className="rounded-3xl border border-[rgba(212,175,55,0.18)] bg-black/15 p-5">
              <SectionTitle>Defensiv kritisch</SectionTitle>

              <div className="mt-4 space-y-4">
                <TypeList
                  title="Gemeinsame Schwächen"
                  colorClass="text-red-300"
                  items={sharedWeak.map((entry) => ({
                    type: entry.type,
                    weakCount: entry.weakCount,
                    answerCount: entry.answerCount,
                  }))}
                  withCount
                />

                <TypeList
                  title="Gefährlichste Typen"
                  colorClass="text-red-300"
                  items={dangerous.map((entry) => ({
                    type: entry.type,
                    weakCount: entry.weakCount,
                    answerCount: entry.answerCount,
                  }))}
                  withCount
                />

                <TypeList
                  title="Single Points of Failure"
                  colorClass="text-amber-300"
                  items={fragile.map((entry) => ({
                    type: entry.type,
                    weakCount: entry.weakCount,
                    answerCount: entry.answerCount,
                  }))}
                  withCount
                />
              </div>
            </div>

            <div className="rounded-3xl border border-[rgba(212,175,55,0.18)] bg-black/15 p-5">
              <SectionTitle>Offensiv & Defensiv stark</SectionTitle>

              <div className="mt-4 space-y-4">
                <TypeList
                  title="Gute offensive STAB-Coverage"
                  colorClass="text-emerald-300"
                  items={offensive.strongInto}
                />

                <TypeList
                  title="Fehlende offensive Coverage"
                  colorClass="text-red-300"
                  items={offensive.missingInto}
                />

                <TypeList
                  title="Stabile defensive Antworten"
                  colorClass="text-emerald-300"
                  items={bestDef.slice(0, 8).map((entry) => ({
                    type: entry.type,
                    weakCount: entry.weakCount,
                    answerCount: entry.answerCount,
                  }))}
                  withCount
                />
              </div>
            </div>
          </div>

          {/* Per player */}
          <div className="space-y-5">
            <SectionTitle>Analyse pro Spieler</SectionTitle>

            <div className="grid gap-5 xl:grid-cols-2">
              {players.map((player) => (
                <PlayerPanel key={player.name} player={player} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl border border-[rgba(212,175,55,0.45)] bg-black/30 px-4 py-2 text-sm font-semibold text-zinc-100 backdrop-blur-sm shadow-[0_0_14px_rgba(212,175,55,0.08)] hover:bg-black/40"
      >
        📊 Team Analyse
      </button>

      {mounted ? createPortal(modal, document.body) : null}
    </>
  );
}
