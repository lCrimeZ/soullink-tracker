// components/TypePill.tsx
import { TYPE_META, normalizeType } from "@/lib/pokemon-types";

export function TypePill({ t }: { t: string }) {
  const key = normalizeType(t);
  const meta = TYPE_META[key];

  // Fallback, falls irgendein unbekannter Typ reinkommt
  const label = meta?.label ?? t;
  const cls =
    meta?.className ?? "bg-zinc-800 border border-zinc-700 text-zinc-200";

  return (
    <span
      className={[
        "px-2 py-1 rounded-full text-xs border inline-flex items-center leading-none",
        cls,
      ].join(" ")}
      title={label}
    >
      {label}
    </span>
  );
}
