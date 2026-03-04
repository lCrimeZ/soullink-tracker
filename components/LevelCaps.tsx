// components/LevelCaps.tsx
import { Cap } from "@/lib/types";
import { TypePill } from "@/components/TypePill";

// Feuerrot/Kanto: deutsche Namen + Leader-Typen anhand "sort"
const CAP_UI: Record<number, { title: string; type1?: string; type2?: string }> = {
  1: { title: "Arena 1 – Rocko", type1: "rock", type2: "ground" },
  2: { title: "Arena 2 – Misty", type1: "water" },
  3: { title: "Arena 3 – Major Bob", type1: "electric" },
  4: { title: "Arena 4 – Erika", type1: "grass" },
  5: { title: "Arena 5 – Koga", type1: "poison" },
  6: { title: "Arena 6 – Sabrina", type1: "psychic" },
  7: { title: "Arena 7 – Pyro", type1: "fire" },
  8: { title: "Arena 8 – Giovanni", type1: "ground" },

  9: { title: "Top 4 – Lorelei", type1: "ice", type2: "water" },
  10: { title: "Top 4 – Bruno", type1: "fighting", type2: "rock" },
  11: { title: "Top 4 – Agatha", type1: "ghost", type2: "poison" },
  12: { title: "Top 4 – Siegfried", type1: "dragon" },

  13: { title: "Champ – Blau", type1: undefined },
};

function initials(label: string) {
  const cleaned = label.replace(/\(.*?\)/g, "").trim();
  const parts = cleaned.split(" ").filter(Boolean);
  const a = parts[0]?.[0] ?? "?";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}

export function LevelCaps({ caps }: { caps: Cap[] }) {
  const sorted = [...caps].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="font-semibold text-lg">Level Limits</div>

      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {sorted.map((c) => {
          const meta = CAP_UI[c.sort ?? 0];
          const title = meta?.title ?? c.label;

          // optional: falls du später leader_type1/2 in der DB speicherst
          // @ts-ignore
          const t1 = (c as any).leader_type1 ?? meta?.type1;
          // @ts-ignore
          const t2 = (c as any).leader_type2 ?? meta?.type2;

          // optional: falls du leader_sprite in der DB hast
          // @ts-ignore
          const sprite: string | null = (c as any).leader_sprite ?? null;

          return (
            <div
              key={c.id}
              className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4"
            >
              <div className="flex items-center gap-3">
                {sprite ? (
                  <img
                    src={sprite}
                    alt={title}
                    className="h-10 w-10 rounded-full border border-zinc-700 bg-zinc-900 object-contain"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center text-xs text-zinc-200">
                    {initials(title)}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="text-sm text-zinc-200 truncate">{title}</div>
                  <div className="mt-1 flex gap-1 flex-wrap">
                    {t1 ? <TypePill t={t1} /> : null}
                    {t2 ? <TypePill t={t2} /> : null}
                  </div>
                </div>
              </div>

              <div className="mt-3 text-2xl font-semibold">
                {c.cap_p1} / {c.cap_p2}
              </div>
              <div className="text-xs text-zinc-400 mt-1">P1 / P2</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
