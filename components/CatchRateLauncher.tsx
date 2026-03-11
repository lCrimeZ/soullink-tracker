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

const BALL_LABELS: Record<BallKey, string> = {
  poke: "Poké Ball",
  great: "Great Ball",
  ultra: "Ultra Ball",
  dusk: "Dusk Ball",
  quick: "Quick Ball",
  repeat: "Repeat Ball",
  master: "Master Ball",
};

function getBallRanking(opts: {
  captureRate: number;
  hpPercent: number;
  status: StatusKey;
  isDark: boolean;
  firstTurn: boolean;
  alreadyCaught: boolean;
}) {
  const balls: BallKey[] = ["poke", "great", "ultra", "dusk", "quick", "repeat"];
  return balls
    .map((ball) => ({
      ball,
      chance: gen4CatchChancePercent({
        captureRate: opts.captureRate,
        hpPercent: opts.hpPercent,
        status: opts.status,
        ball,
        isDark: opts.isDark,
        firstTurn: opts.firstTurn,
        alreadyCaught: opts.alreadyCaught,
      }),
    }))
    .sort((a, b) => b.chance - a.chance);
}

function buildCoachText({
  currentBall,
  currentChance,
  bestBall,
  bestBallChance,
  sleepChance,
  oneHpChance,
  quickChance,
  duskChance,
  firstTurn,
  isDark,
}: {
  currentBall: BallKey;
  currentChance: number | null;
  bestBall: BallKey | null;
  bestBallChance: number | null;
  sleepChance: number | null;
  oneHpChance: number | null;
  quickChance: number | null;
  duskChance: number | null;
  firstTurn: boolean;
  isDark: boolean;
}) {
  if (currentChance == null) {
    return {
      main: "Wähle zuerst ein Pokémon aus.",
      tips: [] as string[],
    };
  }

  const tips: string[] = [];

  if (bestBall && bestBallChance != null && bestBall !== currentBall) {
    tips.push(
      `${BALL_LABELS[bestBall]} wäre aktuell stärker als ${BALL_LABELS[currentBall]} (${bestBallChance}% statt ${currentChance}%).`
    );
  }

  if (sleepChance != null && sleepChance > currentChance) {
    tips.push(
      `Schlaf oder Eis würde die Fangchance auf etwa ${sleepChance}% erhöhen.`
    );
  }

  if (oneHpChance != null && oneHpChance > currentChance) {
    tips.push(
      `Wenn du das Ziel weiter auf 1 HP schwächst, steigt die Fangchance auf etwa ${oneHpChance}%.`
    );
  }

  if (firstTurn && quickChance != null) {
    tips.push(`Im ersten Zug lohnt sich Quick Ball besonders (${quickChance}%).`);
  }

  if (isDark && duskChance != null) {
    tips.push(`In Höhlen oder nachts ist Dusk Ball besonders stark (${duskChance}%).`);
  }

  let main = "";
  if (currentChance >= 85) {
    main = "Die Fangchance ist bereits sehr gut. Du kannst den Ball jetzt meist sicher werfen.";
  } else if (currentChance >= 55) {
    main = "Die Fangchance ist ordentlich, aber mit besserem Ball oder Status noch klar steigerbar.";
  } else if (currentChance >= 25) {
    main = "Die Fangchance ist eher mittelmäßig. Schlaf, Dusk Ball oder weniger HP würden stark helfen.";
  } else {
    main = "Die Fangchance ist aktuell eher niedrig. Besser schwächen, Status setzen oder einen besseren Ball wählen.";
  }

  return { main, tips };
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

  const quickChance = useMemo(() => {
    if (captureRate == null) return null;
    return gen4CatchChancePercent({
      captureRate,
      hpPercent,
      status,
      ball: "quick",
      isDark,
      firstTurn: true,
      alreadyCaught,
    });
  }, [captureRate, hpPercent, status, isDark, alreadyCaught]);

  const ballRanking = useMemo(() => {
    if (captureRate == null) return null;
    return getBallRanking({
      captureRate,
      hpPercent,
      status,
      isDark,
      firstTurn,
      alreadyCaught,
    });
  }, [captureRate, hpPercent, status, isDark, firstTurn, alreadyCaught]);

  const bestBall = ballRanking?.[0]?.ball ?? null;
  const bestBallChance = ballRanking?.[0]?.chance ?? null;

  const coach = useMemo(() => {
    return buildCoachText({
      currentBall: ball,
      currentChance: catchChance,
      bestBall,
      bestBallChance,
      sleepChance,
      oneHpChance,
      quickChance,
      duskChance,
      firstTurn,
      isDark,
    });
  }, [
    ball,
    catchChance,
    bestBall,
    bestBallChance,
    sleepChance,
    oneHpChance,
    quickChance,
    duskChance,
    firstTurn,
    isDark,
  ]);

  const modal = open ? (
    <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[rgba(212,175,55,0.45)] bg-zinc-950/95 shadow-[0_0_40px_rgba(0,0,0,0.6)] fade-in-up">
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

        <div className="p-5 space-y-5">
          {/* Suche */}
          <div className="rounded-3xl border border-[rgba(212,175,55,0.18)] bg-black/15 p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Pokémon auswählen
            </div>

            <div className="mt-4 relative">
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
                      <span className="font-medium text-zinc-100">{p.de}</span>
                      <span className="text-xs text-zinc-400">{p.en}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-3 text-sm text-zinc-300">
              {resolvedEn ? (
                <>
                  Aktuell gewählt:{" "}
                  <span className="font-semibold text-zinc-100">
                    {displayPokemonDe(resolvedEn)}
                  </span>
                </>
              ) : (
                "Bitte zuerst ein Pokémon auswählen."
              )}
            </div>
          </div>

          {/* Coach */}
          <div className="rounded-3xl border border-[rgba(212,175,55,0.20)] bg-black/20 p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Empfehlung für Anfänger
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-emerald-700/30 bg-emerald-950/10 p-4">
                <div className="text-sm font-semibold text-emerald-300">
                  Einschätzung
                </div>
                <div className="mt-2 text-sm leading-6 text-zinc-300">
                  {coach.main}
                </div>
              </div>

              <div className="rounded-2xl border border-amber-700/30 bg-amber-950/10 p-4">
                <div className="text-sm font-semibold text-amber-300">
                  Bester Ball gerade
                </div>
                <div className="mt-2 text-sm leading-6 text-zinc-300">
                  {bestBall && bestBallChance != null ? (
                    <>
                      <span className="font-semibold text-zinc-100">
                        {BALL_LABELS[bestBall]}
                      </span>{" "}
                      mit etwa{" "}
                      <span className="font-semibold text-amber-300">
                        {bestBallChance}%
                      </span>
                      .
                    </>
                  ) : (
                    "Wähle zuerst ein Pokémon aus."
                  )}
                </div>
              </div>
            </div>

            {coach.tips.length > 0 ? (
              <div className="mt-4 rounded-2xl border border-[rgba(212,175,55,0.18)] bg-black/15 p-4">
                <div className="text-sm font-semibold text-zinc-200">
                  Konkrete Tipps
                </div>
                <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                  {coach.tips.map((tip, idx) => (
                    <li key={idx}>• {tip}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {/* Einstellungen + Anzeige */}
          <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-3xl border border-[rgba(212,175,55,0.18)] bg-black/15 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                Fangbedingungen einstellen
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
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
                    Nacht / Höhle aktiv
                  </label>

                  <label className="mt-2 flex items-center gap-3 text-sm text-zinc-200">
                    <input
                      type="checkbox"
                      checked={firstTurn}
                      onChange={(e) => setFirstTurn(e.target.checked)}
                    />
                    Erster Zug
                  </label>

                  <label className="mt-2 flex items-center gap-3 text-sm text-zinc-200">
                    <input
                      type="checkbox"
                      checked={alreadyCaught}
                      onChange={(e) => setAlreadyCaught(e.target.checked)}
                    />
                    Art bereits gefangen
                  </label>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Aktuelle Chance"
                  value={loading ? "…" : catchChance != null ? `${catchChance}%` : "—"}
                />
                <StatCard
                  title="Mit Schlaf"
                  value={sleepChance != null ? `${sleepChance}%` : "—"}
                />
                <StatCard
                  title="Mit 1 HP"
                  value={oneHpChance != null ? `${oneHpChance}%` : "—"}
                />
                <StatCard
                  title="Quick Ball"
                  value={quickChance != null ? `${quickChance}%` : "—"}
                  subtitle="im ersten Zug"
                />
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-3xl border border-[rgba(212,175,55,0.28)] bg-black/20 p-5 text-center">
                <div className="text-sm uppercase tracking-[0.20em] text-zinc-400">
                  Aktuelle Fangchance
                </div>

                <div className="mt-5 flex items-center justify-center">
                  <div className="relative flex h-44 w-44 items-center justify-center rounded-full border-[10px] border-[rgba(212,175,55,0.72)] bg-black/25 shadow-[0_0_24px_rgba(212,175,55,0.14)]">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-amber-300">
                        {loading ? "…" : catchChance != null ? `${catchChance}%` : "—"}
                      </div>
                      <div className="mt-1 text-xs text-zinc-400">
                        Catch Rate
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-zinc-300">
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

              <div className="rounded-3xl border border-[rgba(212,175,55,0.18)] bg-black/15 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                  Ball-Vergleich
                </div>

                <div className="mt-4 space-y-3">
                  {ballRanking?.slice(0, 5).map((entry) => (
                    <div
                      key={entry.ball}
                      className="flex items-center justify-between rounded-2xl border border-[rgba(212,175,55,0.14)] bg-black/15 px-4 py-3"
                    >
                      <div className="text-sm font-medium text-zinc-200">
                        {BALL_LABELS[entry.ball]}
                      </div>
                      <div className="text-sm font-semibold text-amber-300">
                        {entry.chance}%
                      </div>
                    </div>
                  ))}

                  {!ballRanking ? (
                    <div className="text-sm text-zinc-500">
                      Wähle zuerst ein Pokémon aus.
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="rounded-3xl border border-[rgba(212,175,55,0.18)] bg-black/15 p-5 text-sm text-zinc-300">
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
