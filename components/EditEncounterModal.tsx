"use client";

import { useMemo, useState } from "react";
import type { Encounter, Player, Route } from "@/lib/types";
import { fetchPokemon } from "@/lib/pokemon";
import { resolveGen1ToEn, searchGen1 } from "@/lib/pokedex-gen1";

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

  // Für Autocomplete (nur UI)
  const [query, setQuery] = useState<string>("");
  const [pickedEn, setPickedEn] = useState<string>("");

  if (!open || !encounter || !route || !player) return null;

  // Vorschläge anhand deiner Eingabe
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    return searchGen1(query, 10);
  }, [query]);

  async function save(formData: FormData) {
    if (!encounter) return;
    if (saving) return;

    setSaving(true);

    // Input kommt aus dem Feld pokemon_name (wir füttern das gleich mit query)
    const rawInput = (formData.get("pokemon_name") as string) || "";

    // 1) wenn User aus Dropdown gewählt hat, nehmen wir EN
    // 2) sonst versuchen wir, freie Eingabe (DE/EN) auf EN zu mappen
    // 3) falls gar nichts matcht -> null (oder speichere rawInput wenn du willst)
    const resolvedEn =
      (pickedEn && resolveGen1ToEn(pickedEn)) ||
      resolveGen1ToEn(rawInput) ||
      null;

    // Für PokeAPI: nur EN verwenden
    const pokemon = resolvedEn ? await fetchPokemon(resolvedEn) : null;

    const manualSprite = (formData.get("sprite_url") as string) || "";
    const manualType1 = (formData.get("type1") as string) || "";
    const manualType2 = (formData.get("type2") as string) || "";

    const payload = {
      encounter_id: encounter.id,

      // ✅ in DB speichern wir EN
      pokemon_name: resolvedEn,

      // Sprite/Types: wenn API was findet -> auto, sonst manuell
      sprite_url: pokemon?.sprite || manualSprite || null,
      type1: pokemon?.type1 || manualType1 || null,
      type2: pokemon?.type2 || manualType2 || null,

      status: formData.get("status") as "alive" | "dead" | "lost",
      team_slot: formData.get("team_slot")
        ? Number(formData.get("team_slot"))
        : null,
      notes: (formData.get("notes") as string) || null,
    };

    try {
      const res = await fetch("/api/encounter/update", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error ?? "Fehler beim Speichern");
        return;
      }

      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
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
          {/* ✅ Pokemon Name (DE/EN) + Vorschläge */}
          <div className="relative">
            <input
              name="pokemon_name"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPickedEn("");
              }}
              placeholder="Pokémon (z.B. Schiggy / Squirtle)"
              className="rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 w-full"
              autoComplete="off"
            />

            {query.trim() && suggestions.length > 0 && (
              <div className="absolute z-10 mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl">
                {suggestions.map((p) => (
                  <button
                    key={p.en}
                    type="button"
                    onClick={() => {
                      setPickedEn(p.en);
                      setQuery(p.de); // im Feld steht deutsch
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-zinc-900 flex items-center justify-between"
                  >
                    <span className="text-zinc-100 font-medium">{p.de}</span>
                    <span className="text-xs text-zinc-400">{p.en}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-2 text-xs text-zinc-400">
              Wird gespeichert als:{" "}
              <span className="text-zinc-200 font-semibold">
                {pickedEn || resolveGen1ToEn(query) || "—"}
              </span>
            </div>
          </div>

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
              placeholder="Typ 2 (optional)"
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
            {saving ? "Speichern..." : "Speichern"}
          </button>
        </form>
      </div>
    </div>
  );
}
