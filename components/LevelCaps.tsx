// components/LevelCaps.tsx
"use client";

import { useMemo, useState } from "react";
import type { Cap } from "@/lib/types";

export function LevelCaps({
  caps,
  isAdmin = false,
}: {
  caps: Cap[];
  isAdmin?: boolean;
}) {
  const [items, setItems] = useState<Cap[]>(caps);
  const [savingId, setSavingId] = useState<string | null>(null);

  const sorted = useMemo(() => {
    // sort nach "sort" (Fallback 0)
    return [...items].sort((a: any, b: any) => (a.sort ?? 0) - (b.sort ?? 0));
  }, [items]);

  const done = useMemo(() => {
    return sorted.filter((c: any) => Boolean(c.cleared)).length;
  }, [sorted]);

  const total = sorted.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  async function toggleCap(cap: Cap) {
    if (!isAdmin) return;
    if (savingId) return;

    const next = !(cap as any).cleared;
    setSavingId((cap as any).id);

    // Optimistic UI
    setItems((prev) =>
      prev.map((c: any) => (c.id === (cap as any).id ? { ...c, cleared: next } : c))
    );

    try {
      const res = await fetch("/api/cap/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cap_id: (cap as any).id, cleared: next }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Toggle fehlgeschlagen");
      }
    } catch (e) {
      // rollback
      setItems((prev) =>
        prev.map((c: any) =>
          c.id === (cap as any).id ? { ...c, cleared: !next } : c
        )
      );
      alert("❌ Fehler beim Speichern");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold text-lg">Level-Limits</div>

          <div className="mt-2 flex items-center gap-3 flex-wrap">
            <span className="text-sm text-zinc-300">
              Fortschritt:{" "}
              <span className="font-semibold text-zinc-100">
                {done} / {total}
              </span>{" "}
              erledigt{" "}
              <span className="text-zinc-400">({pct}%)</span>
            </span>

            <div className="h-2 w-56 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden">
              <div
                className="h-full bg-emerald-500/70"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="text-xs text-zinc-400">
          {isAdmin ? "Admin: Abhaken aktiv" : "Read-only"}
        </div>
      </div>

      {/* Grid */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {sorted.map((c: any) => {
          const cleared = Boolean(c.cleared);
          const busy = savingId === c.id;

          const hasBadge = Boolean(c.badge_sprite || c.badge_name);

          return (
            <div
              key={c.id}
              className={[
                "rounded-xl border p-4 transition",
                cleared
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "border-zinc-800 bg-zinc-900/60",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3 min-w-0">
                  {/* Leader Sprite */}
                  <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center shrink-0">
                    {c.leader_sprite ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.leader_sprite}
                        alt={c.label}
                        className="h-10 w-10 object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-xs text-zinc-500">—</span>
                    )}
                  </div>

                  {/* Label + Caps */}
                  <div className="min-w-0">
                    <div className="text-sm text-zinc-200 leading-snug break-words">
                      {c.label}
                    </div>

                    <div className="mt-2 text-2xl font-semibold">
                      {c.cap_p1} / {c.cap_p2}
                    </div>
                  </div>
                </div>

                {/* Toggle */}
                <button
                  type="button"
                  disabled={!isAdmin || busy}
                  onClick={() => toggleCap(c)}
                  className={[
                    "shrink-0 rounded-xl border px-3 py-2 text-sm transition",
                    cleared
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                      : "border-zinc-700 bg-zinc-900/40 text-zinc-200",
                    !isAdmin ? "opacity-60 cursor-not-allowed" : "",
                    busy ? "opacity-60" : "",
                  ].join(" ")}
                  title={isAdmin ? "Als geschafft markieren" : "Nur Admin"}
                >
                  {busy ? "…" : cleared ? "Abgehakt" : "Abhaken"}
                </button>
              </div>

              {/* Status */}
              <div className="mt-3 text-sm">
                {cleared ? (
                  <div className="text-emerald-200/80">✓ Erledigt</div>
                ) : (
                  <div className="text-zinc-400">Noch offen</div>
                )}
              </div>

              {/* ✅ Badge Block (NEU) */}
              {hasBadge && (
                <div className="mt-3 flex items-center gap-2">
                  {c.badge_sprite ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.badge_sprite}
                      alt={c.badge_name ?? "Badge"}
                      className={[
                        "h-6 w-6 object-contain",
                        cleared
                          ? "opacity-100 drop-shadow-[0_0_8px_rgba(34,197,94,0.35)]"
                          : "opacity-30 grayscale",
                      ].join(" ")}
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className={[
                        "h-6 w-6 rounded-full border",
                        cleared
                          ? "border-emerald-500/40 bg-emerald-500/10"
                          : "border-zinc-700 bg-zinc-900/40",
                      ].join(" ")}
                    />
                  )}

                  <div className="text-sm text-zinc-300">
                    {c.badge_name ?? "Badge"}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
