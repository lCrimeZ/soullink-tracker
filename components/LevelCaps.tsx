"use client";

import { useState } from "react";

type Cap = {
  id: string;
  label: string;
  cap_p1?: number | null;
  cap_p2?: number | null;
  badge_name?: string | null;
  badge_sprite?: string | null;
  leader_sprite?: string | null;
  cleared?: boolean | null;
};

export function LevelCaps({
  caps: initialCaps,
  isAdmin,
}: {
  caps: Cap[];
  isAdmin?: boolean;
}) {
  const [caps, setCaps] = useState(initialCaps);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function toggleCap(cap: Cap) {
    if (!isAdmin || savingId) return;

    const next = !cap.cleared;
    setSavingId(cap.id);

    setCaps((prev) =>
      prev.map((c) => (c.id === cap.id ? { ...c, cleared: next } : c))
    );

    try {
      const res = await fetch("/api/cap/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cap_id: cap.id, cleared: next }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Toggle fehlgeschlagen");
      }
    } catch (e) {
      setCaps((prev) =>
        prev.map((c) => (c.id === cap.id ? { ...c, cleared: cap.cleared } : c))
      );
      alert("Fehler beim Speichern");
    } finally {
      setSavingId(null);
    }
  }

  const done = caps.filter((c) => c.cleared).length;
  const total = caps.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="poke-card poke-glass p-5 fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
            Level-Limits
          </h2>

          <div className="mt-2 flex items-center gap-3 flex-wrap text-sm">
            <span className="text-zinc-300">
              Fortschritt:{" "}
              <span className="font-semibold text-zinc-100">
                {done} / {total} erledigt ({pct}%)
              </span>
            </span>

            <div className="w-44 h-2 rounded-full overflow-hidden border border-[rgba(212,175,55,0.35)] bg-zinc-900/80">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${pct}%`,
                  background:
                    "linear-gradient(90deg, rgba(185,28,28,0.95), rgba(212,175,55,0.95))",
                }}
              />
            </div>
          </div>
        </div>

        <div className="text-sm text-zinc-400">
          {isAdmin ? "Admin: Abhaken aktiv" : "Read-only"}
        </div>
      </div>

      {/* Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {caps.map((c) => {
          const cleared = Boolean(c.cleared);
          const busy = savingId === c.id;

          return (
            <div
              key={c.id}
              className={[
                "poke-arena relative overflow-hidden",
                cleared ? "poke-badge-complete" : "",
              ].join(" ")}
            >
              <div
                className="absolute inset-x-0 top-0 h-[2px]"
                style={{
                  background: cleared
                    ? "linear-gradient(90deg, rgba(212,175,55,0.95), rgba(185,28,28,0.9), rgba(212,175,55,0.95))"
                    : "linear-gradient(90deg, rgba(212,175,55,0.5), rgba(212,175,55,0.12))",
                }}
              />

              {/* upper section */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3 min-w-0">
                  {/* Leader sprite */}
                  <div className="h-12 w-12 rounded-xl border border-[rgba(212,175,55,0.45)] bg-zinc-900/80 flex items-center justify-center overflow-hidden shrink-0">
                    {c.leader_sprite ? (
                      <img
                        src={c.leader_sprite}
                        alt={c.label}
                        className="h-10 w-10 object-contain poke-sprite"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-xs text-zinc-500">?</span>
                    )}
                  </div>

                  {/* text */}
                  <div className="min-w-0">
                    <div className="text-sm text-zinc-100 font-semibold leading-snug break-words">
                      {c.label}
                    </div>

                    <div className="mt-3">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        Level Cap
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-zinc-100">
                        <span className="rounded-lg border border-[rgba(212,175,55,0.28)] bg-black/20 px-3 py-1 text-xl font-semibold leading-none">
                          {c.cap_p1 ?? "-"}
                        </span>

                        <span className="text-zinc-500 text-base font-medium">
                          /
                        </span>

                        <span className="rounded-lg border border-[rgba(212,175,55,0.28)] bg-black/20 px-3 py-1 text-xl font-semibold leading-none">
                          {c.cap_p2 ?? "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* button */}
                <button
                  type="button"
                  disabled={!isAdmin || busy}
                  onClick={() => toggleCap(c)}
                  className={[
                    "shrink-0 rounded-xl border px-3 py-2 text-sm font-semibold transition-all",
                    cleared
                      ? "border-[rgba(212,175,55,0.55)] bg-emerald-950/40 text-emerald-200"
                      : "border-[rgba(212,175,55,0.4)] bg-zinc-900/80 text-zinc-200",
                    isAdmin
                      ? "hover:-translate-y-[1px] hover:shadow-[0_0_14px_rgba(212,175,55,0.18)]"
                      : "opacity-70 cursor-not-allowed",
                    busy ? "opacity-70" : "",
                  ].join(" ")}
                  title={
                    !isAdmin
                      ? "Als Admin freischalten"
                      : busy
                        ? "Speichert..."
                        : cleared
                          ? "Abgehakt"
                          : "Abhaken"
                  }
                >
                  {busy ? "..." : cleared ? "Abgehakt" : "Abhaken"}
                </button>
              </div>

              {/* status */}
              <div className="mt-4 text-sm">
                {cleared ? (
                  <div className="text-emerald-300 font-medium">✓ Erledigt</div>
                ) : (
                  <div className="text-zinc-400">Noch offen</div>
                )}
              </div>

              {/* badge block */}
              <div className="mt-5 flex items-center gap-3 rounded-xl border border-[rgba(212,175,55,0.22)] bg-black/20 px-3 py-3">
                {c.badge_sprite ? (
                  <img
                    src={c.badge_sprite}
                    alt={c.badge_name ?? "Badge"}
                    className={[
                      "h-10 w-10 object-contain transition-all duration-200",
                      cleared
                        ? "opacity-100 drop-shadow-[0_0_10px_rgba(212,175,55,0.45)]"
                        : "opacity-80",
                    ].join(" ")}
                    loading="lazy"
                  />
                ) : (
                  <div
                    className={[
                      "h-10 w-10 rounded-full border flex items-center justify-center text-xs",
                      cleared
                        ? "border-[rgba(212,175,55,0.55)] bg-emerald-950/30"
                        : "border-zinc-700 bg-zinc-900/60",
                    ].join(" ")}
                  >
                    ?
                  </div>
                )}

                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Badge
                  </div>
                  <div className="text-sm font-medium text-zinc-200 truncate">
                    {c.badge_name ?? "Badge"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
