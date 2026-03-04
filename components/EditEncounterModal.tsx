"use client";

import { useState } from "react";
import { Encounter, Player, Route } from "@/lib/types";

async function fetchPokemon(name: string) {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon/" + name.toLowerCase());
  if (!res.ok) return null;
  const data = await res.json();

  return {
    sprite: data.sprites.front_default,
    type1: data.types[0]?.type.name,
    type2: data.types[1]?.type.name || null
  };
}

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
  setSaving(true);

  const pokemonName = formData.get("pokemon_name") as string;

  const poke = pokemonName ? await fetchPokemon(pokemonName) : null;

  const payload = {
    encounter_id: encounter!.id,
    pokemon_name: pokemonName || null,
    sprite_url: poke?.sprite || null,
    type1: poke?.type1 || null,
    type2: poke?.type2 || null,
    status: formData.get("status") as "alive" | "dead" | "lost",
    team_slot: formData.get("team_slot") ? Number(formData.get("team_slot")) : null,
    notes: (formData.get("notes") as string) || null,
  };
}

    const res = await fetch("/api/encounter/update", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (!res.ok) {
      alert((await res.json())?.error ?? "Fehler beim Speichern");
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
            <div className="text-sm text-zinc-300">{route.name} · {player.name}</div>
            <div className="text-xl font-semibold mt-1">Encounter bearbeiten</div>
          </div>
          <button onClick={onClose} className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800">✕</button>
        </div>

        <form action={save} className="mt-4 grid gap-3">
          <input name="pokemon_name" defaultValue={encounter.pokemon_name ?? ""} placeholder="Pokémon Name"
            className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3" />
          <input name="sprite_url" defaultValue={encounter.sprite_url ?? ""} placeholder="Sprite URL (optional)"
            className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3" />

          <div className="grid grid-cols-2 gap-3">
            <input name="type1" defaultValue={encounter.type1 ?? ""} placeholder="Typ 1"
              className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3" />
            <input name="type2" defaultValue={encounter.type2 ?? ""} placeholder="Typ 2 (optional)"
              className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select name="status" defaultValue={encounter.status}
              className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3">
              <option value="alive">alive</option>
              <option value="dead">dead</option>
              <option value="lost">lost</option>
            </select>
            <select name="team_slot" defaultValue={encounter.team_slot ?? ""}
              className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3">
              <option value="">Team-Slot (optional)</option>
              {[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <textarea name="notes" defaultValue={encounter.notes ?? ""} placeholder="Notizen"
            className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 min-h-[90px]" />

          <button disabled={saving}
            className="rounded-xl bg-emerald-500/90 hover:bg-emerald-500 px-4 py-3 font-semibold disabled:opacity-60">
            {saving ? "Speichern…" : "Speichern"}
          </button>
        </form>
      </div>
    </div>
  );
}
