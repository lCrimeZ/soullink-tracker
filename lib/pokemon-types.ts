// lib/pokemon-types.ts
export const TYPE_META: Record<
  string,
  { label: string; className: string }
> = {
  normal:  { label: "Normal",   className: "bg-zinc-500/30 border-zinc-400/40 text-zinc-100" },
  fire:    { label: "Feuer",    className: "bg-orange-500/25 border-orange-400/40 text-orange-100" },
  water:   { label: "Wasser",   className: "bg-sky-500/25 border-sky-400/40 text-sky-100" },
  electric:{ label: "Elektro",  className: "bg-yellow-400/25 border-yellow-300/40 text-yellow-50" },
  grass:   { label: "Pflanze",  className: "bg-emerald-500/25 border-emerald-400/40 text-emerald-50" },
  ice:     { label: "Eis",      className: "bg-cyan-400/25 border-cyan-300/40 text-cyan-50" },
  fighting:{ label: "Kampf",    className: "bg-red-500/25 border-red-400/40 text-red-50" },
  poison:  { label: "Gift",     className: "bg-fuchsia-500/25 border-fuchsia-400/40 text-fuchsia-50" },
  ground:  { label: "Boden",    className: "bg-amber-600/25 border-amber-500/40 text-amber-50" },
  flying:  { label: "Flug",     className: "bg-indigo-400/25 border-indigo-300/40 text-indigo-50" },
  psychic: { label: "Psycho",   className: "bg-pink-500/25 border-pink-400/40 text-pink-50" },
  bug:     { label: "Käfer",    className: "bg-lime-500/25 border-lime-400/40 text-lime-50" },
  rock:    { label: "Gestein",  className: "bg-stone-500/25 border-stone-400/40 text-stone-50" },
  ghost:   { label: "Geist",    className: "bg-violet-500/25 border-violet-400/40 text-violet-50" },
  dragon:  { label: "Drache",   className: "bg-indigo-600/25 border-indigo-500/40 text-indigo-50" },
  dark:    { label: "Unlicht",  className: "bg-neutral-700/35 border-neutral-500/40 text-neutral-50" },
  steel:   { label: "Stahl",    className: "bg-slate-400/25 border-slate-300/40 text-slate-50" },
  fairy:   { label: "Fee",      className: "bg-rose-400/25 border-rose-300/40 text-rose-50" },
};

// Helper: normalisiert Eingaben wie "Fire", " FEUER ", etc.
export function normalizeType(t: string) {
  return (t || "").trim().toLowerCase();
}
