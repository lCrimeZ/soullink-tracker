// lib/pokedex-gen1.ts
export type PokedexEntry = { en: string; de: string };

// Gen 1 (Kanto) – 151 Pokémon (EN key für PokéAPI / DB, DE fürs UI)
export const POKEDEX_GEN1: PokedexEntry[] = [
  { en: "bulbasaur", de: "Bisasam" },
  { en: "ivysaur", de: "Bisaknosp" },
  { en: "venusaur", de: "Bisaflor" },
  { en: "charmander", de: "Glumanda" },
  { en: "charmeleon", de: "Glutexo" },
  { en: "charizard", de: "Glurak" },
  { en: "squirtle", de: "Schiggy" },
  { en: "wartortle", de: "Schillok" },
  { en: "blastoise", de: "Turtok" },
  { en: "caterpie", de: "Raupy" },
  { en: "metapod", de: "Safcon" },
  { en: "butterfree", de: "Smettbo" },
  { en: "weedle", de: "Hornliu" },
  { en: "kakuna", de: "Kokuna" },
  { en: "beedrill", de: "Bibor" },
  { en: "pidgey", de: "Taubsi" },
  { en: "pidgeotto", de: "Tauboga" },
  { en: "pidgeot", de: "Tauboss" },
  { en: "rattata", de: "Rattfratz" },
  { en: "raticate", de: "Rattikarl" },
  { en: "spearow", de: "Habitak" },
  { en: "fearow", de: "Ibitak" },
  { en: "ekans", de: "Rettan" },
  { en: "arbok", de: "Arbok" },
  { en: "pikachu", de: "Pikachu" },
  { en: "raichu", de: "Raichu" },
  { en: "sandshrew", de: "Sandan" },
  { en: "sandslash", de: "Sandamer" },
  { en: "nidoran-f", de: "Nidoran♀" },
  { en: "nidorina", de: "Nidorina" },
  { en: "nidoqueen", de: "Nidoqueen" },
  { en: "nidoran-m", de: "Nidoran♂" },
  { en: "nidorino", de: "Nidorino" },
  { en: "nidoking", de: "Nidoking" },
  { en: "clefairy", de: "Piepi" },
  { en: "clefable", de: "Pixi" },
  { en: "vulpix", de: "Vulpix" },
  { en: "ninetales", de: "Vulnona" },
  { en: "jigglypuff", de: "Pummeluff" },
  { en: "wigglytuff", de: "Knuddeluff" },
  { en: "zubat", de: "Zubat" },
  { en: "golbat", de: "Golbat" },
  { en: "oddish", de: "Myrapla" },
  { en: "gloom", de: "Duflor" },
  { en: "vileplume", de: "Giflor" },
  { en: "paras", de: "Paras" },
  { en: "parasect", de: "Parasek" },
  { en: "venonat", de: "Bluzuk" },
  { en: "venomoth", de: "Omot" },
  { en: "diglett", de: "Digda" },
  { en: "dugtrio", de: "Digdri" },
  { en: "meowth", de: "Mauzi" },
  { en: "persian", de: "Snobilikat" },
  { en: "psyduck", de: "Enton" },
  { en: "golduck", de: "Entoron" },
  { en: "mankey", de: "Menki" },
  { en: "primeape", de: "Rasaff" },
  { en: "growlithe", de: "Fukano" },
  { en: "arcanine", de: "Arkani" },
  { en: "poliwag", de: "Quapsel" },
  { en: "poliwhirl", de: "Quaputzi" },
  { en: "poliwrath", de: "Quappo" },
  { en: "abra", de: "Abra" },
  { en: "kadabra", de: "Kadabra" },
  { en: "alakazam", de: "Simsala" },
  { en: "machop", de: "Machollo" },
  { en: "machoke", de: "Maschock" },
  { en: "machamp", de: "Machomei" },
  { en: "bellsprout", de: "Knofensa" },
  { en: "weepinbell", de: "Ultrigaria" },
  { en: "victreebel", de: "Sarzenia" },
  { en: "tentacool", de: "Tentacha" },
  { en: "tentacruel", de: "Tentoxa" },
  { en: "geodude", de: "Kleinstein" },
  { en: "graveler", de: "Georok" },
  { en: "golem", de: "Geowaz" },
  { en: "ponyta", de: "Ponita" },
  { en: "rapidash", de: "Gallopa" },
  { en: "slowpoke", de: "Flegmon" },
  { en: "slowbro", de: "Lahmus" },
  { en: "magnemite", de: "Magnetilo" },
  { en: "magneton", de: "Magneton" },
  { en: "farfetchd", de: "Porenta" },
  { en: "doduo", de: "Dodu" },
  { en: "dodrio", de: "Dodri" },
  { en: "seel", de: "Jurob" },
  { en: "dewgong", de: "Jugong" },
  { en: "grimer", de: "Sleima" },
  { en: "muk", de: "Sleimok" },
  { en: "shellder", de: "Muschas" },
  { en: "cloyster", de: "Austos" },
  { en: "gastly", de: "Nebulak" },
  { en: "haunter", de: "Alpollo" },
  { en: "gengar", de: "Gengar" },
  { en: "onix", de: "Onix" },
  { en: "drowzee", de: "Traumato" },
  { en: "hypno", de: "Hypno" },
  { en: "krabby", de: "Krabby" },
  { en: "kingler", de: "Kingler" },
  { en: "voltorb", de: "Voltobal" },
  { en: "electrode", de: "Lektrobal" },
  { en: "exeggcute", de: "Owei" },
  { en: "exeggutor", de: "Kokowei" },
  { en: "cubone", de: "Tragosso" },
  { en: "marowak", de: "Knogga" },
  { en: "hitmonlee", de: "Kicklee" },
  { en: "hitmonchan", de: "Nockchan" },
  { en: "lickitung", de: "Schlurp" },
  { en: "koffing", de: "Smogon" },
  { en: "weezing", de: "Smogmog" },
  { en: "rhyhorn", de: "Rihorn" },
  { en: "rhydon", de: "Rizeros" },
  { en: "chansey", de: "Chaneira" },
  { en: "tangela", de: "Tangela" },
  { en: "kangaskhan", de: "Kangama" },
  { en: "horsea", de: "Seeper" },
  { en: "seadra", de: "Seemon" },
  { en: "goldeen", de: "Goldini" },
  { en: "seaking", de: "Golking" },
  { en: "staryu", de: "Sterndu" },
  { en: "starmie", de: "Starmie" },
  { en: "mr-mime", de: "Pantimos" },
  { en: "scyther", de: "Sichlor" },
  { en: "jynx", de: "Rossana" },
  { en: "electabuzz", de: "Elektek" },
  { en: "magmar", de: "Magmar" },
  { en: "pinsir", de: "Pinsir" },
  { en: "tauros", de: "Tauros" },
  { en: "magikarp", de: "Karpador" },
  { en: "gyarados", de: "Garados" },
  { en: "lapras", de: "Lapras" },
  { en: "ditto", de: "Ditto" },
  { en: "eevee", de: "Evoli" },
  { en: "vaporeon", de: "Aquana" },
  { en: "jolteon", de: "Blitza" },
  { en: "flareon", de: "Flamara" },
  { en: "porygon", de: "Porygon" },
  { en: "omanyte", de: "Amonitas" },
  { en: "omastar", de: "Amoroso" },
  { en: "kabuto", de: "Kabuto" },
  { en: "kabutops", de: "Kabutops" },
  { en: "aerodactyl", de: "Aerodactyl" },
  { en: "snorlax", de: "Relaxo" },
  { en: "articuno", de: "Arktos" },
  { en: "zapdos", de: "Zapdos" },
  { en: "moltres", de: "Lavados" },
  { en: "dratini", de: "Dratini" },
  { en: "dragonair", de: "Dragonir" },
  { en: "dragonite", de: "Dragoran" },
  { en: "mewtwo", de: "Mewtu" },
  { en: "mew", de: "Mew" },
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

const NORM_TO_EN: Record<string, string> = Object.fromEntries(
  POKEDEX_GEN1.flatMap((p) => {
    const pairs: Array<[string, string]> = [];
    pairs.push([normalize(p.en), p.en]);
    pairs.push([normalize(p.de), p.en]);

    // Zusätzliche Aliases
    if (p.en === "mr-mime") pairs.push([normalize("mr mime"), p.en]);
    if (p.en === "farfetchd") pairs.push([normalize("farfetch'd"), p.en]);

    return pairs;
  })
);

export function resolveGen1ToEn(input: string | null | undefined): string | null {
  const key = normalize(input ?? "");
  if (!key) return null;
  return NORM_TO_EN[key] ?? null;
}

export function searchGen1(query: string, limit = 8): PokedexEntry[] {
  const q = normalize(query);
  if (!q) return [];
  return POKEDEX_GEN1
    .filter((p) => normalize(p.en).includes(q) || normalize(p.de).includes(q))
    .slice(0, limit);
}
