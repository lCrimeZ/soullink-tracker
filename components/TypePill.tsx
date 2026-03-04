// components/TypePill.tsx
import { TYPE_META, normalizeType } from "@/lib/pokemon-types";

export function TypePill({ t }: { t: string }) {
  const key = normalizeType(t);
  const meta = TYPE_META[key];

  const label = meta?.label ?? t;
  const icon = meta?.icon ?? "•";
  const cls =
    meta?.className ?? "bg-zinc-800 border border-zinc-700 text-zinc-200";

  return (
    <span
      className={[
        "px-2 py-1 rounded-full text-xs border inline-flex items-center gap-1 leading-none",
        cls,
      ].join(" ")}
      title={label}
    >
      <span className="opacity-90">{icon}</span>
      <span>{label}</span>
    </span>
  );
}
