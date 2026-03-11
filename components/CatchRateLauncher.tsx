"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  displayPokemonDe,
  resolvePokemonToEn,
  searchPokemon,
} from "@/lib/pokedex";

type BallKey =
  | "poke"
  | "great"
  | "ultra"
  | "dusk"
  | "quick"
  | "repeat"
  | "master";

type StatusKey =
  | "none"
  | "sleep"
  | "freeze"
  | "paralysis"
  | "burn"
  | "poison";

function statusModifier(status: StatusKey) {
  if (status === "sleep" || status === "freeze") return 2;
  if (status === "paralysis" || status === "burn" || status === "poison")
    return 1.5;
  return 1;
}

function ballModifier(
  ball: BallKey,
  opts: { isDark: boolean; firstTurn: boolean; alreadyCaught: boolean }
) {
  switch (ball) {
    case "poke":
      return 1;
    case "great":
      return 1.5;
    case "ultra":
      return 2;
    case "dusk":
      return opts.isDark ? 3.5 : 1;
    case "quick":
      return opts.firstTurn ? 4 : 1;
    case "repeat":
      return opts.alreadyCaught ? 3 : 1;
    case "master":
      return Infinity;
    default:
      return 1;
  }
}

function gen4CatchChancePercent({
  captureRate,
  hpPercent,
  status,
  ball,
  isDark,
  firstTurn,
  alreadyCaught,
}: {
  captureRate: number;
  hpPercent: number;
  status: StatusKey;
  ball: BallKey;
  isDark: boolean;
  firstTurn: boolean;
  alreadyCaught: boolean;
}) {
  if (ball === "master") return 100;

  const ballMod = ballModifier(ball, { isDark, firstTurn, alreadyCaught });
  const statusMod = statusModifier(status);

  const maxHP = 100;
  const currentHP = hpPercent <= 1 ? 1 : Math.max(1, Math.round(hpPercent));
  const a =
    (((3 * maxHP - 2 * currentHP) * captureRate * ballMod) / (3 * maxHP)) *
    statusMod;

  if (a >= 255) return 100;
  if (a <= 0) return 0;

  const b = 1048560 / Math.sqrt(Math.sqrt(16711680 / a));
  const pShake = Math.min(1, b / 65535);
  const pCatch = Math.pow(pShake, 4);

  return Math.max(0, Math.min(100, Math.round(pCatch * 100)));
}

export function CatchRateLauncher() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [query, setQuery] = useState("");
  const [pickedEn, setPickedEn] = useState("");

  const [loading, setLoading] = useState(false);
  const [captureRate, setCaptureRate] = useState<number | null>(null);
  const [spriteUrl, setSpriteUrl] = useState<string | null>(null);

  const [hpPercent, setHpPercent] = useState<number>(10);
  const [status, setStatus] = useState<StatusKey>("sleep");
  const [ball, setBall] = useState<BallKey>("ultra");
  const [isDark, setIsDark] = useState(true);
  const [firstTurn, setFirstTurn] = useState(true);
  const [alreadyCaught, setAlreadyCaught] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resolvedEn = pickedEn || resolvePokemonToEn(query) || "";

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    return searchPokemon(query, 8);
  }, [query]);

  useEffect(() => {
    let cancelled = false;

    async function loadPokemon() {
      if (!resolvedEn) {
        setCaptureRate(null);
        setSpriteUrl(null);
        return;
      }

      setLoading(true);

      try {
        const pokemonRes = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${resolvedEn}`
        );
        if (!pokemonRes.ok) throw new Error("pokemon fetch failed");
        const pokemonData = await pokemonRes.json();

        const speciesRes = await fetch(pokemonData.species.url);
        if (!speciesRes.ok) throw new Error("species fetch failed");
        const speciesData = await speciesRes.json();

        if (cancelled) return;

        setCaptureRate(speciesData.capture_rate ?? null);
        setSpriteUrl(
          pokemonData.sprites?.other?.["official-artwork"]?.front_default ||
            pokemonData.sprites?.front_default ||
            null
        );
      } catch {
        if (cancelled) return;
        setCaptureRate(null);
        setSpriteUrl(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPokemon();

    return () => {
      cancelled = true;
    };
  }, [resolvedEn]);

  const catchChance = useMemo(() => {
    if (captureRate == null) return null;

    return gen4CatchChancePercent({
      captureRate,
      hpPercent,
      status,
      ball,
      isDark,
      firstTurn,
      alreadyCaught,
    });
  }, [captureRate, hpPercent, status, ball, isDark, firstTurn, alreadyCaught]);

  const duskChance = useMemo(() => {
    if (captureRate == null) return null;
    return gen4CatchChancePercent({
      captureRate,
      hpPercent,
      status,
      ball: "dusk",
      isDark: true,
      firstTurn,
      alreadyCaught,
    });
  }, [captureRate, hpPercent, status, firstTurn, alreadyCaught]);

  const sleepChance = useMemo(() => {
    if (captureRate == null) return null;
    return gen4CatchChancePercent({
      captureRate,
      hpPercent,
      status: "sleep",
      ball,
      isDark,
      firstTurn,
      alreadyCaught,
    });
  }, [captureRate, hpPercent, ball, isDark, firstTurn, alreadyCaught]);

  const oneHpChance = useMemo(() => {
    if (captureRate == null) return null;
    return gen4CatchChancePercent({
      captureRate,
      hpPercent: 1,
      status,
      ball,
      isDark,
      firstTurn,
      alreadyCaught,
    });
  }, [captureRate, status, ball, isDark, firstTurn, alreadyCaught]);

  const modal = open ? (
    <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[rgba(212,175,55,0.45)] bg-zinc-950/95 shadow-[0_0_40px_rgba(0,0,0,0.6)] fade-in-up">
        <div className="flex items-start justify-between gap-4 border-b border-[rgba(212,175,55,0.18)] px-5 py-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl border border-[rgba(212,175,55,0.22)] bg-black/20 flex items-center justify-center overflow-hidden shrink-0">
              {spriteUrl ? (
                <img
                  src={spriteUrl}
                  alt={resolvedEn || "Pokémon"}
                  className="h-14 w-14 object-contain poke-sprite"
                />
              ) : (
                <span className="text-xs text-zinc-500">Kein Pokémon</span>
              )}
            </div>

            <div>
              <div className="text-2xl font-bold tracking-tight text-zinc-100">
                Catch Rate Calculator
              </div>
              <div className="mt-1 text-sm text-zinc-400">
                Globales Tool für Randomizer · SoulSilver nutzt Gen-4-Mechanics
              </div>
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

        <div className="grid gap-6 p-5 lg:grid-cols-[1.25fr_0.85fr]">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Pokémon
                </label>

                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPickedEn("");
                  }}
                  placeholder="Pokémon suchen (z. B. Endivie / Cresselia / Riolu)"
                  className="w-full rounded-2xl border border-[rgba(212,175,55,0.28)] bg-zinc-900/85 px-4 py-3 text-zinc-100 placeholder:text-zinc-500 outline-none"
                  autoComplete="off"
                />

                {query.trim() && suggestions.length > 0 ? (
                  <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl">
                    {suggestions.map((p) => (
                      <button
                        key={p.en}
                        type="button"
                        onClick={() => {
                          setPickedEn(p.en);
                          setQuery(p.de);
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
                  Verwendet wird:{" "}
                  <span className="font-semibold text-zinc-200">
                    {resolvedEn || "—"}
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  HP (ungefähr)
                </label>
                <select
                  value={hpPercent}
                  onChange={(e) => setHpPercent(Number(e.target.value))}
                  className="w-full rounded-2xl border border-[rgba(212,175,55,0.28)] bg-zinc-900/85 px-4 py-3 text-zinc-100"
                >
                  {[100, 75, 50, 25, 10, 5, 1].map((n) => (
                    <option key={n} value={n}>
                      {n === 1 ? "1 HP" : `${n}%`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Ball
                </label>
                <select
                  value={ball}
                  onChange={(e) => setBall(e.target.value as BallKey)}
                  className="w-full rounded-2xl border border-[rgba(212,175,55,0.28)] bg-zinc-900/85 px-4 py-3 text-zinc-100"
                >
                  <option value="poke">Poké Ball</option>
                  <option value="great">Great Ball</option>
                  <option value="ultra">Ultra Ball</option>
                  <option value="dusk">Dusk Ball</option>
                  <option value="quick">Quick Ball</option>
                  <option value="repeat">Repeat Ball</option>
                  <option value="master">Master Ball</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StatusKey)}
                  className="w-full rounded-2xl border border-[rgba(212,175,55,0.28)] bg-zinc-900/85 px-4 py-3 text-zinc-100"
                >
                  <option value="none">Kein Status</option>
                  <option value="sleep">Schlaf</option>
                  <option value="freeze">Eis</option>
                  <option value="paralysis">Paralyse</option>
                  <option value="burn">Verbrennung</option>
                  <option value="poison">Vergiftung</option>
                </select>
              </div>

              <div className="rounded-2xl border border-[rgba(212,175,55,0.18)] bg-black/15 px-4 py-3">
                <div className="text-sm font-medium text-zinc-300">
                  Spezialoptionen
                </div>

                <label className="mt-3 flex items-center gap-3 text-sm text-zinc-200">
                  <input
                    type="checkbox"
                    checked={isDark}
                    onChange={(e) => setIsDark(e.target.checked)}
                  />
                  Nacht / Höhle aktiv (für Dusk Ball)
                </label>

                <label className="mt-2 flex items-center gap-3 text-sm text-zinc-200">
                  <input
                    type="checkbox"
                    checked={firstTurn}
                    onChange={(e) => setFirstTurn(e.target.checked)}
                  />
                  Erster Zug (für Quick Ball)
                </label>

                <label className="mt-2 flex items-center gap-3 text-sm text-zinc-200">
                  <input
                    type="checkbox"
                    checked={alreadyCaught}
                    onChange={(e) => setAlreadyCaught(e.target.checked)}
                  />
                  Art bereits gefangen (für Repeat Ball)
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-[rgba(212,175,55,0.18)] bg-black/15 p-4">
              <div className="text-sm font-medium text-zinc-300">
                Hinweise zur Verbesserung
              </div>

              <ul className="mt-3 space-y-2 text-sm text-zinc-200">
                <li>
                  {duskChance != null ? (
                    <>
                      Dusk Ball bei Nacht/Höhle:{" "}
                      <span className="font-semibold text-amber-300">
                        {duskChance}%
                      </span>
                    </>
                  ) : (
                    "Dusk Ball bei Nacht/Höhle: —"
                  )}
                </li>
                <li>
                  {sleepChance != null ? (
                    <>
                      Schlafstatus statt aktueller Status:{" "}
                      <span className="font-semibold text-amber-300">
                        {sleepChance}%
                      </span>
                    </>
                  ) : (
                    "Schlafstatus: —"
                  )}
                </li>
                <li>
                  {oneHpChance != null ? (
                    <>
                      Auf 1 HP senken:{" "}
                      <span className="font-semibold text-amber-300">
                        {oneHpChance}%
                      </span>
                    </>
                  ) : (
                    "1 HP: —"
                  )}
                </li>
              </ul>

              <div className="mt-4 text-xs leading-6 text-zinc-400">
                Hinweis: Das Tool rechnet global für dein aktuell gewähltes
                Pokémon und ist damit ideal für Randomizer-Runs. Für SoulSilver
                wird mit Gen-4-Catch-Mechanics gerechnet.
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4">
            <div className="rounded-3xl border border-[rgba(212,175,55,0.28)] bg-black/20 p-5 text-center">
              <div className="text-sm uppercase tracking-[0.20em] text-zinc-400">
                Aktuelle Fangchance
              </div>

              <div className="mt-5 flex items-center justify-center">
                <div className="relative flex h-52 w-52 items-center justify-center rounded-full border-8 border-[rgba(212,175,55,0.7)] bg-black/25 shadow-[0_0_30px_rgba(212,175,55,0.14)]">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-amber-300">
                      {loading ? "…" : catchChance != null ? `${catchChance}%` : "—"}
                    </div>
                    <div className="mt-2 text-sm text-zinc-400">Catch Rate</div>
                  </div>
                </div>
              </div>

              <div className="mt-5 text-sm text-zinc-300">
                {resolvedEn ? (
                  <>
                    Pokémon:{" "}
                    <span className="font-semibold text-zinc-100">
                      {displayPokemonDe(resolvedEn)}
                    </span>
                  </>
                ) : (
                  "Bitte zuerst ein Pokémon auswählen."
                )}
              </div>

              <div className="mt-2 text-xs text-zinc-500">
                Kritischer Fang existiert in SoulSilver noch nicht.
              </div>
            </div>

            <div className="rounded-2xl border border-[rgba(212,175,55,0.18)] bg-black/15 p-4 text-sm text-zinc-300">
              <div className="font-medium text-zinc-200">Verwendete Mechanics</div>
              <div className="mt-2 leading-6 text-zinc-400">
                Formel nach Gen III/IV Capture-Mechanics. Das Ergebnis ist als
                praktischer Tracker-Wert gedacht und basiert auf Capture Rate,
                HP-Näherung, Ball-Multiplikator und Status.
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
        🎯 Catch Rate
      </button>

      {mounted ? createPortal(modal, document.body) : null}
    </>
  );
}
