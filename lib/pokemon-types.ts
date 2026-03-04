// lib/pokemon-types.ts
export const TYPE_META: Record<
  string,
  { label: string; icon: string; className: string; accent: string }
> = {
  normal:  { label: "Normal",   icon: "⚪", className: "bg-zinc-500/30 border-zinc-400/40 text-zinc-100", accent: "ring-zinc-400/30 shadow-[0_0_20px_rgba(161,161,170,0.25)]" },
  fire:    { label: "Feuer",    icon: "🔥", className: "bg-orange-500/25 border-orange-400/40 text-orange-100", accent: "ring-orange-400/30 shadow-[0_0_22px_rgba(251,146,60,0.30)]" },
  water:   { label: "Wasser",   icon: "💧", className: "bg-sky-500/25 border-sky-400/40 text-sky-100", accent: "ring-sky-400/30 shadow-[0_0_22px_rgba(56,189,248,0.30)]" },
  electric:{ label: "Elektro",  icon: "⚡", className: "bg-yellow-400/25 border-yellow-300/40 text-yellow-50", accent: "ring-yellow-300/30 shadow-[0_0_22px_rgba(253,224,71,0.30)]" },
  grass:   { label: "Pflanze",  icon: "🌿", className: "bg-emerald-500/25 border-emerald-400/40 text-emerald-50", accent: "ring-emerald-400/30 shadow-[0_0_22px_rgba(52,211,153,0.28)]" },
  ice:     { label: "Eis",      icon: "❄️", className: "bg-cyan-400/25 border-cyan-300/40 text-cyan-50", accent: "ring-cyan-300/30 shadow-[0_0_22px_rgba(103,232,249,0.30)]" },
  fighting:{ label: "Kampf",    icon: "🥊", className: "bg-red-500/25 border-red-400/40 text-red-50", accent: "ring-red-400/30 shadow-[0_0_22px_rgba(248,113,113,0.30)]" },
  poison:  { label: "Gift",     icon: "☠️", className: "bg-fuchsia-500/25 border-fuchsia-400/40 text-fuchsia-50", accent: "ring-fuchsia-400/30 shadow-[0_0_22px_rgba(232,121,249,0.30)]" },
  ground:  { label: "Boden",    icon: "🟫", className: "bg-amber-600/25 border-amber-500/40 text-amber-50", accent: "ring-amber-500/30 shadow-[0_0_22px_rgba(245,158,11,0.25)]" },
  flying:  { label: "Flug",     icon: "🪽", className: "bg-indigo-400/25 border-indigo-300/40 text-indigo-50", accent: "ring-indigo-300/30 shadow-[0_0_22px_rgba(165,180,252,0.30)]" },
  psychic: { label: "Psycho",   icon: "🧠", className: "bg-pink-500/25 border-pink-400/40 text-pink-50", accent: "ring-pink-400/30 shadow-[0_0_22px_rgba(244,114,182,0.30)]" },
  bug:     { label: "Käfer",    icon: "🐛", className: "bg-lime-500/25 border-lime-400/40 text-lime-50", accent: "ring-lime-400/30 shadow-[0_0_22px_rgba(163,230,53,0.28)]" },
  rock:    { label: "Gestein",  icon: "🪨", className: "bg-stone-500/25 border-stone-400/40 text-stone-50", accent: "ring-stone-400/30 shadow-[0_0_22px_rgba(168,162,158,0.25)]" },
  ghost:   { label: "Geist",    icon: "👻", className: "bg-violet-500/25 border-violet-400/40 text-violet-50", accent: "ring-violet-400/30 shadow-[0_0_22px_rgba(196,181,253,0.30)]" },
  dragon:  { label: "Drache",   icon: "🐉", className: "bg-indigo-600/25 border-indigo-500/40 text-indigo-50", accent: "ring-indigo-500/30 shadow-[0_0_22px_rgba(99,102,241,0.28)]" },
  dark:    { label: "Unlicht",  icon: "🌑", className: "bg-neutral-700/35 border-neutral-500/40 text-neutral-50", accent: "ring-neutral-500/25 shadow-[0_0_22px_rgba(115,115,115,0.22)]" },
  steel:   { label: "Stahl",    icon: "⚙️", className: "bg-slate-400/25 border-slate-300/40 text-slate-50", accent: "ring-slate-300/30 shadow-[0_0_22px_rgba(148,163,184,0.28)]" },
  fairy:   { label: "Fee",      icon: "✨", className: "bg-rose-400/25 border-rose-300/40 text-rose-50", accent: "ring-rose-300/30 shadow-[0_0_22px_rgba(253,164,175,0.30)]" },
};

// Helper: normalisiert Eingaben wie "Fire", " FEUER ", etc.
export function normalizeType(t: string) {
  return (t || "").trim().toLowerCase();
}
