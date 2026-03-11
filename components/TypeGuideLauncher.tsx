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
import {
  displayPokemonDe,
  resolvePokemonToEn,
  searchPokemon,
} from "@/lib/pokedex";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
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
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(212,175,55,0.20)] bg-zinc-900/70 px-2.5 py-1.5"
            >
              <TypePill t={item.type} />
              {item.mult != null ? (
                <span className="text-[11px] font-semibold text-zinc-300">
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

function SelectField({
  label,
  value,
  onChange,
  allowEmpty,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  allowEmpty?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-300">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-[rgba(212,175,55,0.28)] bg-zinc-900/85 px-4 py-3 text-zinc-100 outline-none"
      >
        {allowEmpty ? <option value="">Kein Zweittyp</option> : null}
        {GEN4_TYPES.map((type) => (
          <option key={type} value={type}>
            {TYPE_LABEL_DE[type]}
          </option>
        ))}
      </select>
    </div>
  );
}

function buildRecommendationText({
  attackType,
  defenders,
  attackMultiplier,
  defenseSummary,
}: {
  attackType: Gen4Type;
  defenders: Gen4Type[];
  attackMultiplier: number;
  defenseSummary: ReturnType<typeof getDefenseSummary>;
}) {
  const atkName = TYPE_LABEL_DE[attackType];
  const targetNames = defenders.map((t) => TYPE_LABEL_DE[t]).join(" / ");

  const bestWeak = defenseSummary.weak[0];
  const bestResist = defenseSummary.resist[0];
  const bestImmune = defenseSummary.immune[0];

  let offenseText = "";
  if (!targetNames) {
    offenseText = "Wähle ein Ziel, um eine Angriffsempfehlung zu erhalten.";
  } else if (attackMultiplier === 0) {
    offenseText = `${atkName} solltest du gegen ${targetNames} vermeiden, weil es gar keinen Schaden macht.`;
  } else if (attackMultiplier >= 4) {
    offenseText = `${atkName} ist gegen ${targetNames} eine extrem starke Wahl.`;
  } else if (attackMultiplier > 1) {
    offenseText = `${atkName} ist gegen ${targetNames} eine gute offensive Wahl.`;
  } else if (attackMultiplier < 1) {
    offenseText = `${atkName} ist gegen ${targetNames} eher keine gute Wahl.`;
  } else {
    offenseText = `${atkName} trifft ${targetNames} neutral und ist damit okay, aber nicht optimal.`;
  }

  let defenseText = "";
  if (bestWeak?.mult === 4) {
    defenseText = `Pass besonders auf ${TYPE_LABEL_DE[bestWeak.type]} auf — hier besteht sogar eine 4×-Schwäche.`;
  } else if (bestWeak?.mult === 2) {
    defenseText = `Sei vorsichtig gegen ${TYPE_LABEL_DE[bestWeak.type]}, weil dein Pokémon davon extra Schaden nimmt.`;
  } else if (bestImmune) {
    defenseText = `Gut zu wissen: Gegen ${TYPE_LABEL_DE[bestImmune.type]} bist du sogar komplett immun.`;
  } else if (bestResist) {
    defenseText = `${TYPE_LABEL_DE[bestResist.type]} ist defensiv meist angenehm, weil dein Pokémon diesen Typ gut aushält.`;
  } else {
    defenseText = `Dein aktuelles Typing ist defensiv ziemlich ausgeglichen.`;
  }

  return { offenseText, defenseText };
}

function getBestAttackTypes(defenders: Gen4Type[]) {
  const ranked = GEN4_TYPES.map((type) => ({
    type,
    mult: getTypeMultiplier(type, defenders),
  })).sort((a, b) => b.mult - a.mult);

  const best = ranked.filter((r) => r.mult > 1);
  const neutral = ranked.filter((r) => r.mult === 1);
  const bad = ranked.filter((r) => r.mult < 1 && r.mult > 0);
  const immune = ranked.filter((r) => r.mult === 0);

  return { best, neutral, bad, immune };
}

async function fetchPokemonTypes(nameEn: string): Promise<{
  sprite: string | null;
  type1: Gen4Type | null;
  type2: Gen4Type | null;
}> {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${nameEn}`);
  if (!res.ok) {
    throw new Error("pokemon fetch failed");
  }

  const data = await res.json();

  const types = [...(data.types ?? [])]
    .sort((a: any, b: any) => a.slot - b.slot)
    .map((entry: any) => entry.type?.name)
    .filter(Boolean) as string[];

  const type1 = (types[0] ?? null) as Gen4Type | null;
  const type2 = (types[1] ?? null) as Gen4Type | null;

  const sprite =
    data.sprites?.other?.["official-artwork"]?.front_default ||
    data.sprites?.front_default ||
    null;

  return { sprite, type1, type2 };
}

export function TypeGuideLauncher() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [attackType, setAttackType] = useState<Gen4Type>("fire");
  const [targetType1, setTargetType1] = useState<Gen4Type>("grass");
  const [targetType2, setTargetType2] = useState<Gen4Type | "">("steel");

  const [defType1, setDefType1] = useState<Gen4Type>("water");
  const [defType2, setDefType2] = useState<Gen4Type | "">("ground");

  const [pokemonQuery, setPokemonQuery] = useState("");
  const [pickedPokemonEn, setPickedPokemonEn] = useState("");
  const [pokemonLoading, setPokemonLoading] = useState(false);
  const [pokemonSprite, setPokemonSprite] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const pokemonSuggestions = useMemo(() => {
    if (!pokemonQuery.trim()) return [];
    return searchPokemon(pokemonQuery, 8);
  }, [pokemonQuery]);

  const resolvedPokemonEn =
    pickedPokemonEn || resolvePokemonToEn(pokemonQuery) || "";

  useEffect(() => {
    let cancelled = false;

    async function loadSelectedPokemon() {
      if (!resolvedPokemonEn) {
        setPokemonSprite(null);
        return;
      }

      setPokemonLoading(true);

      try {
        const data = await fetchPokemonTypes(resolvedPokemonEn);

        if (cancelled) return;

        setPokemonSprite(data.sprite);
        if (data.type1) setDefType1(data.type1);
        setDefType2(data.type2 ?? "");
        if (data.type1) setTargetType1(data.type1);
        setTargetType2(data.type2 ?? "");
      } catch {
        if (!cancelled) {
          setPokemonSprite(null);
        }
      } finally {
        if (!cancelled) setPokemonLoading(false);
      }
    }

    loadSelectedPokemon();

    return () => {
      cancelled = true;
    };
  }, [resolvedPokemonEn]);

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

  const attackSummary = useMemo(
    () => getAttackSummary(attackType),
    [attackType]
  );
  const defenseSummary = useMemo(
    () => getDefenseSummary(ownTypes),
    [ownTypes]
  );

  const attackExplanation = useMemo(() => {
    const atk = TYPE_LABEL_DE[attackType];
    const defs = defenders.map((t) => TYPE_LABEL_DE[t]).join(" / ");

    if (!defs) return "Wähle bitte ein Ziel aus.";

    if (attackMultiplier === 0) {
      return `${atk} hat keine Wirkung gegen ${defs}.`;
    }

    if (attackMultiplier >= 4) {
      return `${atk} ist extrem effektiv gegen ${defs}.`;
    }

    if (attackMultiplier > 1) {
      return `${atk} ist sehr effektiv gegen ${defs}.`;
    }

    if (attackMultiplier < 1) {
      return `${atk} ist nicht sehr effektiv gegen ${defs}.`;
    }

    return `${atk} trifft ${defs} neutral.`;
  }, [attackType, defenders, attackMultiplier]);

  const defenseExplanation = useMemo(() => {
    const own = ownTypes.map((t) => TYPE_LABEL_DE[t]).join(" / ");

    if (!own) return "Wähle mindestens einen Typ aus.";

    const biggestWeak = defenseSummary.weak[0];
    const bestResist = defenseSummary.resist[0];
    const bestImmune = defenseSummary.immune[0];

    if (biggestWeak?.mult === 4) {
      return `${own} hat eine starke 4×-Schwäche gegen ${TYPE_LABEL_DE[biggestWeak.type]}.`;
    }

    if (biggestWeak?.mult === 2) {
      return `${own} ist anfällig für ${TYPE_LABEL_DE[biggestWeak.type]}.`;
    }

    if (bestImmune) {
      return `${own} ist immun gegen ${TYPE_LABEL_DE[bestImmune.type]}.`;
    }

    if (bestResist) {
      return `${own} resistiert ${TYPE_LABEL_DE[bestResist.type]} besonders gut.`;
    }

    return `${own} hat ein ausgeglichenes Defensivprofil.`;
  }, [ownTypes, defenseSummary]);

  const recommendation = useMemo(() => {
    return buildRecommendationText({
      attackType,
      defenders,
      attackMultiplier,
      defenseSummary,
    });
  }, [attackType, defenders, attackMultiplier, defenseSummary]);

  const bestAttackTypes = useMemo(() => {
    return getBestAttackTypes(defenders);
  }, [defenders]);

  const modal = open ? (
    <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[rgba(212,175,55,0.42)] bg-zinc-950/95 shadow-[0_0_40px_rgba(0,0,0,0.6)] fade-in-up">
        <div className="flex items-start justify-between gap-4 border-b border-[rgba(212,175,55,0.18)] px-5 py-4">
          <div>
            <div className="text-2xl font-bold tracking-tight text-zinc-100">
              Typen Guide
            </div>
            <div className="mt-1 text-sm text-zinc-400">
              SoulSilver · Gen-4-Logik · anfängerfreundlich erklärt · ohne Fee-Typ
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
          {/* Pokemon quick lookup */}
          <div className="rounded-3xl border border-[rgba(212,175,55,0.18)] bg-black/15 p-5">
            <SectionTitle>Pokémon direkt prüfen</SectionTitle>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_120px]">
              <div className="relative">
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Pokémon suchen
                </label>
                <input
                  value={pokemonQuery}
                  onChange={(e) => {
                    setPokemonQuery(e.target.value);
                    setPickedPokemonEn("");
                  }}
                  placeholder="z. B. Garados / Stahlos / Dragoran"
                  className="w-full rounded-2xl border border-[rgba(212,175,55,0.28)] bg-zinc-900/85 px-4 py-3 text-zinc-100 placeholder:text-zinc-500 outline-none"
                  autoComplete="off"
                />

                {pokemonQuery.trim() && pokemonSuggestions.length > 0 ? (
                  <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl">
                    {pokemonSuggestions.map((p) => (
                      <button
                        key={p.en}
                        type="button"
                        onClick={() => {
                          setPickedPokemonEn(p.en);
                          setPokemonQuery(p.de);
                        }}
                        className="flex w-full items-center justify-between px-4 py-2 text-left hover:bg-zinc-900"
                      >
                        <span className="font-medium text-zinc-100">
                          {p.de}
                        </span>
                        <span className="text-xs text-zinc-400">{p.en}</span>
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="mt-2 text-xs text-zinc-400">
                  Übernimmt automatisch Typen für Angriffsziel und Verteidigung.
                </div>
              </div>

              <div className="flex items-end">
                <div className="flex h-[54px] w-[120px] items-center justify-center rounded-2xl border border-[rgba(212,175,55,0.22)] bg-zinc-900/80 overflow-hidden">
                  {pokemonSprite ? (
                    <img
                      src={pokemonSprite}
                      alt={resolvedPokemonEn || "Pokémon"}
                      className="h-14 w-14 object-contain poke-sprite"
                    />
                  ) : (
                    <span className="text-xs text-zinc-500">
                      {pokemonLoading ? "..." : "Kein Sprite"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {resolvedPokemonEn ? (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-zinc-300">
                <span>Aktuell gewählt:</span>
                <span className="font-semibold text-zinc-100">
                  {displayPokemonDe(resolvedPokemonEn)}
                </span>
                <TypePill t={defType1} />
                {defType2 ? <TypePill t={defType2} /> : null}
              </div>
            ) : null}
          </div>

          {/* Empfehlung */}
          <div className="rounded-3xl border border-[rgba(212,175,55,0.20)] bg-black/20 p-5">
            <SectionTitle>Empfehlung für Anfänger</SectionTitle>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-emerald-700/30 bg-emerald-950/10 p-4">
                <div className="text-sm font-semibold text-emerald-300">
                  Offensiv empfohlen
                </div>
                <div className="mt-2 text-sm leading-6 text-zinc-300">
                  {recommendation.offenseText}
                </div>
              </div>

              <div className="rounded-2xl border border-red-700/30 bg-red-950/10 p-4">
                <div className="text-sm font-semibold text-red-300">
                  Defensiv beachten
                </div>
                <div className="mt-2 text-sm leading-6 text-zinc-300">
                  {recommendation.defenseText}
                </div>
              </div>
            </div>
          </div>

          {/* Beste Angriffstypen */}
          <div className="rounded-3xl border border-[rgba(212,175,55,0.20)] bg-black/20 p-5">
            <SectionTitle>Beste Angriffstypen gegen das Ziel</SectionTitle>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <TypeGroup
                title="Am besten geeignet"
                colorClass="text-emerald-300"
                items={bestAttackTypes.best}
              />

              <TypeGroup
                title="Neutral brauchbar"
                colorClass="text-zinc-300"
                items={bestAttackTypes.neutral.slice(0, 6)}
              />
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <TypeGroup
                title="Eher vermeiden"
                colorClass="text-red-300"
                items={bestAttackTypes.bad}
              />

              <TypeGroup
                title="Wirkt gar nicht"
                colorClass="text-zinc-300"
                items={bestAttackTypes.immune}
              />
            </div>

            <div className="mt-4 rounded-2xl border border-[rgba(212,175,55,0.18)] bg-black/15 p-4 text-sm text-zinc-300">
              <div className="font-medium text-zinc-200">Kurz gesagt</div>
              <div className="mt-2 leading-6 text-zinc-400">
                Nutze bevorzugt die Typen aus{" "}
                <span className="font-medium text-emerald-300">
                  „Am besten geeignet“
                </span>
                . Alles unter{" "}
                <span className="font-medium text-red-300">
                  „Eher vermeiden“
                </span>{" "}
                macht weniger Schaden, und{" "}
                <span className="font-medium text-zinc-200">
                  „Wirkt gar nicht“
                </span>{" "}
                solltest du komplett meiden.
              </div>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {/* Angriff */}
            <div className="rounded-3xl border border-[rgba(212,175,55,0.18)] bg-black/15 p-5">
              <SectionTitle>Angriff prüfen</SectionTitle>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <SelectField
                  label="Angreifender Typ"
                  value={attackType}
                  onChange={(value) => setAttackType(value as Gen4Type)}
                />

                <SelectField
                  label="Ziel Typ 1"
                  value={targetType1}
                  onChange={(value) => setTargetType1(value as Gen4Type)}
                />

                <SelectField
                  label="Ziel Typ 2"
                  value={targetType2}
                  onChange={(value) => setTargetType2(value as Gen4Type | "")}
                  allowEmpty
                />
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[240px_1fr]">
                <div className="rounded-3xl border border-[rgba(212,175,55,0.24)] bg-black/20 p-4 text-center">
                  <div className="text-xs uppercase tracking-[0.20em] text-zinc-400">
                    Effektivität
                  </div>

                  <div className="mt-4 flex items-center justify-center">
                    <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-[10px] border-[rgba(212,175,55,0.72)] bg-black/25 shadow-[0_0_24px_rgba(212,175,55,0.14)]">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-amber-300">
                          {formatMultiplier(attackMultiplier)}
                        </div>
                        <div className="mt-1 text-xs text-zinc-400">
                          Multiplier
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-sm leading-6 text-zinc-300">
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

            {/* Verteidigung */}
            <div className="rounded-3xl border border-[rgba(212,175,55,0.18)] bg-black/15 p-5">
              <SectionTitle>Verteidigung prüfen</SectionTitle>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <SelectField
                  label="Dein Typ 1"
                  value={defType1}
                  onChange={(value) => setDefType1(value as Gen4Type)}
                />

                <SelectField
                  label="Dein Typ 2"
                  value={defType2}
                  onChange={(value) => setDefType2(value as Gen4Type | "")}
                  allowEmpty
                />
              </div>

              <div className="mt-5 rounded-2xl border border-[rgba(212,175,55,0.18)] bg-black/15 p-4 text-sm text-zinc-300">
                <div className="font-medium text-zinc-200">Einfach erklärt</div>
                <div className="mt-2 leading-6 text-zinc-400">
                  {defenseExplanation}
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
                <div className="font-medium text-zinc-200">Legende</div>
                <div className="mt-2 leading-6 text-zinc-400">
                  <span className="font-medium text-red-300">Schwächen</span> =
                  mehr Schaden.
                  <br />
                  <span className="font-medium text-emerald-300">
                    Resistenzen
                  </span>{" "}
                  = weniger Schaden.
                  <br />
                  <span className="font-medium text-zinc-200">Immunitäten</span>{" "}
                  = gar kein Schaden.
                </div>
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
