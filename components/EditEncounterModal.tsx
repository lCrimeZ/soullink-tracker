"use client";

import { useState } from "react";
import { Encounter } from "@/lib/types";

async function fetchPokemon(name: string) {
  try {
    const res = await fetch(
      "https://pokeapi.co/api/v2/pokemon/" + name.toLowerCase()
    );
    if (!res.ok) return null;

    const data = await res.json();

    return {
      sprite: data.sprites.front_default,
      type1: data.types[0]?.type.name || null,
      type2: data.types[1]?.type.name || null,
    };
  } catch {
    return null;
  }
}

export default function EditEncounterModal({
  encounter,
  onClose,
  onSaved,
}: {
  encounter: Encounter;
  onClose?: () => void;
  onSaved?: () => void;
}) {
  const [saving, setSaving] = useState(false);

  async function save(formData: FormData) {
    setSaving(true);

    const pokemonName = (formData.get("pokemon_name") as string) || "";

    const poke = pokemonName ? await fetchPokemon(pokemonName) : null;

    const payload = {
      encounter_id: encounter.id,
      pokemon_name: pokemonName || null,
      sprite_url: poke?.sprite || null,
      type1: poke?.type1 || null,
      type2: poke?.type2 || null,
      status: formData.get("status") as "alive" | "dead" | "lost",
      team_slot: formData.get("team_slot")
        ? Number(formData.get("team_slot"))
        : null,
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

    onSaved?.();
    onClose?.();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="text-lg font-semibold mb-4">Pokémon bearbeiten</h2>

        <form action={save} className="flex flex-col gap-3">
          <input
            name="pokemon_name"
            placeholder="Pokemon Name (z.B. pikachu)"
            className="rounded bg-zinc-900 p-2"
          />

          <select name="status" className="rounded bg-zinc-900 p-2">
            <option value="alive">Alive</option>
            <option value="dead">Dead</option>
            <option value="lost">Lost</option>
          </select>

          <input
            name="team_slot"
            type="number"
            placeholder="Team Slot (1-6)"
            className="rounded bg-zinc-900 p-2"
          />

          <textarea
            name="notes"
            placeholder="Notizen"
            className="rounded bg-zinc-900 p-2"
          />

          <div className="flex gap-3 mt-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded"
            >
              {saving ? "Speichern..." : "Speichern"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="bg-zinc-800 px-4 py-2 rounded"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
