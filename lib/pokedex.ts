import { POKEDEX_GEN1 } from "@/lib/pokedex-gen1";
import { POKEDEX_GEN2 } from "@/lib/pokedex-gen2";

export type PokedexEntry = {
  en: string;
  de: string;
};

export const POKEDEX: PokedexEntry[] = [
  ...POKEDEX_GEN1.map((p) => ({ en: p.en, de: p.de })),
  ...POKEDEX_GEN2.map((p) => ({ en: p.en, de: p.de })),

  // Temporär / Custom
  { en: "riolu", de: "Riolu" },
  { en: "lucario", de: "Lucario" },
];

function normalize(s: string) {
  return (s || "")
    .trim()
    .toLowerCase()
    .replace(/[’'`´]/g, "")
    .replace(/[♀]/g, "f")
    .replace(/[♂]/g, "m")
    .replace(/\./g, "")
    .replace(/-/g, " ")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ");
}

export const EN_TO_DE: Record<string, string> = Object.fromEntries(
  POKEDEX.map((p) => [p.en, p.de])
);

const NORM_TO_EN: Record<string, string> = Object.fromEntries(
  POKEDEX.flatMap((p) => {
    const pairs: Array<[string, string]> = [];
    pairs.push([normalize(p.en), p.en]);
    pairs.push([normalize(p.de), p.en]);

    if (p.en === "mr-mime") {
      pairs.push([normalize("mr mime"), p.en]);
    }

    if (p.en === "farfetchd") {
      pairs.push([normalize("farfetch'd"), p.en]);
    }

    if (p.en === "nidoran-f") {
      pairs.push([normalize("nidoran w"), p.en]);
      pairs.push([normalize("nidoran weiblich"), p.en]);
    }

    if (p.en === "nidoran-m") {
      pairs.push([normalize("nidoran m"), p.en]);
      pairs.push([normalize("nidoran maennlich"), p.en]);
    }

    return pairs;
  })
);

export function resolvePokemonToEn(input: string | null | undefined): string | null {
  const key = normalize(input ?? "");
  if (!key) return null;
  return NORM_TO_EN[key] ?? null;
}

export function displayPokemonDe(en: string | null | undefined): string {
  if (!en) return "—";
  const key = en.toLowerCase();
  return EN_TO_DE[key] ?? en;
}

export function searchPokemon(query: string, limit = 10): PokedexEntry[] {
  const q = normalize(query);
  if (!q) return [];

  return POKEDEX.filter((p) => {
    const en = normalize(p.en);
    const de = normalize(p.de);
    return en.includes(q) || de.includes(q);
  }).slice(0, limit);
}
