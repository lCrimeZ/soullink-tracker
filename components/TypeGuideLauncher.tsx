"use client";

import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { TypePill } from "./TypePill";
import {
  GEN4_TYPES,
  Gen4Type,
  TYPE_LABEL_DE,
  formatMultiplier,
  getAttackSummary,
  getDefenseSummary,
  getTypeMultiplier,
} from "@/lib/type-chart-gen4";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm font-medium uppercase tracking-[0.16em] text-zinc-400">
      {children}
    </div>
  );
}

function TypeGroup({
  title,
  items,
  colorClass,
}: {
  title: string;
  items: Array<{ type: Gen4Type; mult?: number }>;
  colorClass: string;
}) {
  return (
    <div className="rounded-2xl border border-[rgba(212,175,55,0.16)] bg-black/15 p-4">
      <div className={`text-sm font-semibold ${colorClass}`}>{title}</div>

      {items.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item) => (
            <div
              key={`${item.type}-${item.mult ?? "x"}`}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(212,175,55,0.22)] bg-zinc-900/70 px-2.5 py-1.5"
            >
              <TypePill t={item.type} />
              {item.mult != null ? (
                <span className="text-xs font-semibold text-zinc-300">
                  {formatMultiplier(item.mult)}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 text-sm text-zinc-500">Keine</div>
      )}
    </div>
  );
}

export function TypeGuideLauncher() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [attackType, setAttackType] = useState<Gen4Type>("fire");
  const [targetType1, setTargetType1] = useState<Gen4Type>("grass");
  const [targetType2, setTargetType2] = useState<Gen4Type | "">("steel");

  const [defType1, setDefType1] = useState<Gen4Type>("water");
  const [defType2, setDefType2] = useState<Gen4Type | "">("ground");

  useEffect(() => {
    setMounted(true);
  }, []);

  const defenders = useMemo(
    () => [targetType1, targetType2].filter(Boolean) as Gen4Type[],
    [targetType1, targetType2]
  );

  const ownTypes = useMemo(
    () => [defType1, defType2].filter(Boolean) as Gen4Type[],
    [defType1, defType2]
  );

  const attackMultiplier = useMemo(() => {
    if (!defenders.length) return 1;
    return getTypeMultiplier(attackType, defenders);
  }, [attackType, defenders]);

  const attackSummary = useMemo(() => getAttackSummary(attackType), [attackType]);
  const defenseSummary = useMemo(() => getDefenseSummary(ownTypes), [ownTypes]);

  const attackExplanation = useMemo(() => {
    const atk = TYPE_LABEL_DE[attackType];
    const defs = defenders.map((t) => TYPE_LABEL_DE[t]).join(" / ");

    if (!defs) return "Wähle bitte ein Ziel aus.";

    if (attackMultiplier === 0) {
      return `${atk} hat keine Wirkung gegen ${defs}.`;
    }

    if (attackMultiplier > 1) {
      return `${atk} ist sehr effektiv gegen ${defs}.`;
    }

    if (attackMultiplier < 1) {
      return `${atk} ist nicht sehr effektiv gegen ${defs}.`;
    }

    return `${atk} trifft ${defs} neutral.`;
  }, [attackType, defenders, attackMultiplier]);

  const modal = open ? (
    <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[rgba(212,175,55,0.45)] bg-zinc-950/95 shadow-[0_0_40px_rgba(0,0,0,0.6)] fade-in-up">
        <div className="flex items-start justify-between gap-4 border-b border-[rgba(212,175,55,0.18)] px-5 py-4">
          <div>
            <div className="text-2xl font-bold tracking-tight text-zinc-100">
              Typen Guide
            </div>
            <div className="mt-1 text-sm text-zinc-400">
              Anfängerfreundlicher Typenrechner für SoulSilver · Gen-4-Logik · ohne Fee-Typ
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-xl border border-zinc-700 bg-zinc-900/70 px-3 py-2 text-zinc-200 hover:bg-zinc-800 shrink-0"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-6 p-5 xl:grid-cols-2">
          {/* Angriff prüfen */}
          <div className="rounded-3xl border border-[rgba(212,175,55,0.20)] bg-black/15 p-5">
            <SectionTitle>Angriff prüfen</SectionTitle>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Angreifender Typ
                </label>
                <select
                  value={attackType}
                  onChange={(e) => setAttackType(e.target.value as Gen4Type)}
                  className="w-full rounded-2xl border border-[rgba(212,175,55,0.28)] bg-zinc-900/85 px-4 py-3 text-zinc-100"
                >
                  {GEN4_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {TYPE_LABEL_DE[type]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Ziel Typ 1
                </label>
                <select
                  value={targetType1}
                  onChange={(e) => setTargetType1(e.target.value as Gen4Type)}
                  className="w-full rounded-2xl border border-[rgba(212,175,55,0.28)] bg-zinc-900/85 px-4 py-3 text-zinc-100"
                >
                  {GEN4_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {TYPE_LABEL_DE[type]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Ziel Typ 2
                </label>
                <select
                  value={targetType2}
                  onChange={(e) => setTargetType2(e.target.value as Gen4Type | "")}
                  className="w-full rounded-2xl border border-[rgba(212,175,55,0.28)] bg-zinc-900/85 px-4 py-3 text-zinc-100"
                >
                  <option value="">Kein Zweittyp</option>
                  {GEN4_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {TYPE_LABEL_DE[type]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-3xl border border-[rgba(212,175,55,0.24)] bg-black/20 p-5 text-center">
                <div className="text-sm uppercase tracking-[0.20em] text-zinc-400">
                  Effektivität
                </div>

                <div className="mt-4 flex items-center justify-center">
                  <div className="relative flex h-44 w-44 items-center justify-center rounded-full border-8 border-[rgba(212,175,55,0.7)] bg-black/25 shadow-[0_0_30px_rgba(212,175,55,0.14)]">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-amber-300">
                        {formatMultiplier(attackMultiplier)}
                      </div>
                      <div className="mt-2 text-sm text-zinc-400">Multiplier</div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 text-sm text-zinc-300">
                  {attackExplanation}
                </div>
              </div>

              <div className="space-y-4">
                <TypeGroup
                  title="Sehr effektiv gegen"
                  colorClass="text-emerald-300"
                  items={attackSummary.strong.map((type) => ({ type }))}
                />
                <TypeGroup
                  title="Nicht sehr effektiv gegen"
                  colorClass="text-red-300"
                  items={attackSummary.weak.map((type) => ({ type }))}
                />
                <TypeGroup
                  title="Keine Wirkung gegen"
                  colorClass="text-zinc-300"
                  items={attackSummary.immune.map((type) => ({ type }))}
                />
              </div>
            </div>
          </div>

          {/* Verteidigung prüfen */}
          <div className="rounded-3xl border border-[rgba(212,175,55,0.20)] bg-black/15 p-5">
            <SectionTitle>Verteidigung prüfen</SectionTitle>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Dein Typ 1
                </label>
                <select
                  value={defType1}
                  onChange={(e) => setDefType1(e.target.value as Gen4Type)}
                  className="w-full rounded-2xl border border-[rgba(212,175,55,0.28)] bg-zinc-900/85 px-4 py-3 text-zinc-100"
                >
                  {GEN4_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {TYPE_LABEL_DE[type]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Dein Typ 2
                </label>
                <select
                  value={defType2}
                  onChange={(e) => setDefType2(e.target.value as Gen4Type | "")}
                  className="w-full rounded-2xl border border-[rgba(212,175,55,0.28)] bg-zinc-900/85 px-4 py-3 text-zinc-100"
                >
                  <option value="">Kein Zweittyp</option>
                  {GEN4_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {TYPE_LABEL_DE[type]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <TypeGroup
                title="Schwächen"
                colorClass="text-red-300"
                items={defenseSummary.weak}
              />
              <TypeGroup
                title="Resistenzen"
                colorClass="text-emerald-300"
                items={defenseSummary.resist}
              />
              <TypeGroup
                title="Immunitäten"
                colorClass="text-zinc-300"
                items={defenseSummary.immune}
              />
            </div>

            <div className="mt-5 rounded-2xl border border-[rgba(212,175,55,0.18)] bg-black/15 p-4 text-sm text-zinc-300">
              <div className="font-medium text-zinc-200">Einfach erklärt</div>
              <div className="mt-2 leading-6 text-zinc-400">
                <span className="text-red-300 font-medium">Schwächen</span> zeigen dir,
                welche Typen mehr Schaden machen.
                <br />
                <span className="text-emerald-300 font-medium">Resistenzen</span> zeigen,
                welche Typen weniger Schaden machen.
                <br />
                <span className="text-zinc-200 font-medium">Immunitäten</span> bedeuten,
                dass der Angriff gar keinen Schaden verursacht.
              </div>
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
        🛡️ Typen Guide
      </button>

      {mounted ? createPortal(modal, document.body) : null}
    </>
  );
}
