"use client";

import { useState } from "react";
import { Encounter, Player, Route } from "@/lib/types";
import { fetchPokemon } from "@/lib/pokemon";

export function EditEncounterModal({
  open,
  onClose,
  encounter,
  route,
  player,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  encounter: Encounter | null;
  route: Route | null;
  player: Player | null;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);

  if (!open || !encounter || !route || !player) return null;

  async function save(formData: FormData) {
  const enc = encounter;      // <- NEU
  if (!enc) return;           // <- NEU

  setSaving(true);

  const pokemonName =
  ((formData.get("pokemon_name") as string) || "").trim().toLowerCase();

  const manualSprite = ((formData.get("sprite_url") as string) || "").trim();
  const manualType1 = ((formData.get("type1") as string) || "").trim();
  const manualType2 = ((formData.get("type2") as string) || "").trim();

  const poke = pokemonName ? await fetchPokemon(pokemonName) : null;

  const payload = {
    encounter_id: enc.id,   // <- HIER: enc statt encounter

    pokemon_name: pokemonName || null,
    sprite_url: manualSprite || poke?.sprite || null,
    type1: manualType1 || poke?.type1 || null,
    type2: manualType2 || poke?.type2 || null,

    status: formData.get("status") as "alive" | "dead" | "lost",
    team_slot: formData.get("team_slot") ? Number(formData.get("team_slot")) : null,
    notes: (formData.get("notes") as string) || null,
  };

  const res = await fetch("/api/encounter/update", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  setSaving(false);

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    alert(data?.error ?? "Fehler beim Speichern");
    return;
  }

  onSaved();
  onClose();
}

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm text-zinc-300">
              {route.name} · {player.name}
            </div>
            <div className="text-xl font-semibold mt-1">Encounter bearbeiten</div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800"
          >
            ✕
          </button>
        </div>

        <form action={save} className="mt-4 grid gap-3">
          <input
            name="pokemon_name"
            defaultValue={encounter.pokemon_name ?? ""}
            placeholder="Pokémon Name (z.B. pikachu)"
            className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3"
          />

          <input
            name="sprite_url"
            defaultValue={encounter.sprite_url ?? ""}
            placeholder="Sprite URL (leer lassen = automatisch)"
            className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              name="type1"
              defaultValue={encounter.type1 ?? ""}
              placeholder="Typ 1 (leer lassen = automatisch)"
              className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3"
            />
            <input
              name="type2"
              defaultValue={encounter.type2 ?? ""}
              placeholder="Typ 2 (leer lassen = automatisch)"
              className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select
              name="status"
              defaultValue={encounter.status}
              className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3"
            >
              <option value="alive">alive</option>
              <option value="dead">dead</option>
              <option value="lost">lost</option>
            </select>

            <select
              name="team_slot"
              defaultValue={encounter.team_slot ?? ""}
              className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3"
            >
              <option value="">Team-Slot (optional)</option>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <textarea
            name="notes"
            defaultValue={encounter.notes ?? ""}
            placeholder="Notizen"
            className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 min-h-[90px]"
          />

          <button
            disabled={saving}
            className="rounded-xl bg-emerald-500/90 hover:bg-emerald-500 px-4 py-3 font-semibold disabled:opacity-60"
          >
            {saving ? "Speichern…" : "Speichern"}
          </button>
        </form>
      </div>
    </div>
  );
}
