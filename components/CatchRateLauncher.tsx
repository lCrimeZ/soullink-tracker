import { Cap } from "@/lib/types";

export function LevelCaps({ caps }: { caps: Cap[] }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="font-semibold text-lg">Level Limits</div>
      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {caps.map((c) => (
          <div key={c.id} className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
            <div className="text-sm text-zinc-300">{c.label}</div>
            <div className="mt-2 text-2xl font-semibold">{c.cap_p1} / {c.cap_p2}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
