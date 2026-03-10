"use client";

import { useState } from "react";

export function EditEncounterModal({
  open,
  encounter,
  route,
  player,
  onClose,
  onSaved,
}: any) {
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");

  if (!open || !encounter) return null;

  async function save(formData: FormData) {
    if (saving) return;

    setSaving(true);

    const payload = {
      encounter_id: encounter.id,
      pokemon_name: formData.get("pokemon_name") || null,
      sprite_url: formData.get("sprite_url") || null,
      type1: formData.get("type1") || null,
      type2: formData.get("type2") || null,
      status: formData.get("status") || "alive",
      team_slot: Number(formData.get("team_slot")) || null,
      notes: formData.get("notes") || null,
    };

    try {
      const res = await fetch("/api/encounter/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        alert("Fehler beim Speichern");
        return;
      }

      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-[rgba(212,175,55,0.45)] bg-zinc-900/95 shadow-[0_0_40px_rgba(0,0,0,0.6)] p-6">

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="text-sm text-zinc-400">{player?.name}</div>
            <div className="text-xl font-bold text-zinc-100">
              {route?.name}
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg border border-zinc-700 px-3 py-1 text-sm hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form action={save} className="grid gap-4">

          <input
            name="pokemon_name"
            defaultValue={encounter?.pokemon_name ?? ""}
            placeholder="Pokémon (z.B. Riolu)"
            className="rounded-xl border border-[rgba(212,175,55,0.25)] bg-zinc-950 px-4 py-2 text-zinc-100"
          />

          <input
            name="sprite_url"
            defaultValue={encounter?.sprite_url ?? ""}
            placeholder="Sprite URL"
            className="rounded-xl border border-[rgba(212,175,55,0.25)] bg-zinc-950 px-4 py-2 text-zinc-100"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              name="type1"
              defaultValue={encounter?.type1 ?? ""}
              placeholder="Typ 1"
              className="rounded-xl border border-[rgba(212,175,55,0.25)] bg-zinc-950 px-4 py-2 text-zinc-100"
            />

            <input
              name="type2"
              defaultValue={encounter?.type2 ?? ""}
              placeholder="Typ 2"
              className="rounded-xl border border-[rgba(212,175,55,0.25)] bg-zinc-950 px-4 py-2 text-zinc-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select
              name="status"
              defaultValue={encounter?.status ?? "alive"}
              className="rounded-xl border border-[rgba(212,175,55,0.25)] bg-zinc-950 px-4 py-2 text-zinc-100"
            >
              <option value="alive">alive</option>
              <option value="dead">dead</option>
              <option value="lost">lost</option>
            </select>

            <select
              name="team_slot"
              defaultValue={encounter?.team_slot ?? ""}
              className="rounded-xl border border-[rgba(212,175,55,0.25)] bg-zinc-950 px-4 py-2 text-zinc-100"
            >
              <option value="">Team Slot</option>
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <textarea
            name="notes"
            defaultValue={encounter?.notes ?? ""}
            placeholder="Notizen"
            className="rounded-xl border border-[rgba(212,175,55,0.25)] bg-zinc-950 px-4 py-2 text-zinc-100 h-20"
          />

          <button
            disabled={saving}
            className="mt-2 rounded-xl border border-[rgba(212,175,55,0.45)] bg-emerald-700 hover:bg-emerald-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Speichern..." : "Speichern"}
          </button>
        </form>
      </div>
    </div>
  );
}
