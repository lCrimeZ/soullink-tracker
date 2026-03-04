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
    return [...items].sort((a: any, b: any) => (a.sort ?? 0) - (b.sort ?? 0));
  }, [items]);

  async function toggleCap(cap: Cap) {
    if (!isAdmin) return;

    const next = !Boolean((cap as any).cleared);
    setSavingId((cap as any).id);

    // Optimistic UI
    setItems((prev) =>
      prev.map((c) => (((c as any).id === (cap as any).id ? { ...(c as any), cleared: next } : c) as any))
    );

    try {
      const res = await fetch("/api/cap/toggle", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cap_id: (cap as any).id, cleared: next }),
      });

      if (!res.ok) {
        const msg = (await res.json().catch(() => null))?.error ?? "Fehler";
        throw new Error(msg);
      }
    } catch (e: any) {
      // rollback
      setItems((prev) =>
        prev.map((c) => (((c as any).id === (cap as any).id ? { ...(c as any), cleared: !next } : c) as any))
      );
      alert(e?.message ?? "Fehler beim Speichern");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="font-semibold text-lg">Level Limits</div>
        {isAdmin ? (
          <span className="text-xs text-zinc-400">Admin: Abhaken aktiv</span>
        ) : (
          <span className="text-xs text-zinc-400">Read-only</span>
        )}
      </div>

      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {sorted.map((c: any) => {
          const cleared = Boolean(c.cleared);
          const busy = savingId === c.id;

          return (
            <div
              key={c.id}
              className={[
                "rounded-xl border p-4 transition",
                cleared ? "border-emerald-500/30 bg-emerald-500/10" : "border-zinc-800 bg-zinc-950/30",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* ✅ Leader Sprite wieder drin */}
                  <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center shrink-0">
                    {c.leader_sprite ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.leader_sprite}
                        alt=""
                        className="h-10 w-10 object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-zinc-500 text-xs">—</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm text-zinc-300 truncate">{c.label}</div>
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
                      ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-200"
                      : "border-zinc-700 bg-zinc-900 text-zinc-200",
                    !isAdmin ? "opacity-40 cursor-not-allowed" : "",
                    busy ? "opacity-60" : "",
                  ].join(" ")}
                  title={
                    !isAdmin
                      ? "Nur Admin kann abhaken"
                      : cleared
                      ? "Als nicht geschafft markieren"
                      : "Als geschafft markieren"
                  }
                >
                  {busy ? "…" : cleared ? "✓ Abgehakt" : "Abhaken"}
                </button>
              </div>

              {cleared ? (
                <div className="mt-3 text-xs text-emerald-200/80">Erledigt</div>
              ) : (
                <div className="mt-3 text-xs text-zinc-400">Noch offen</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
