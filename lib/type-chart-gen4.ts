export const GEN4_TYPES = [
  "normal",
  "fire",
  "water",
  "grass",
  "electric",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
] as const;

export type Gen4Type = (typeof GEN4_TYPES)[number];

export const TYPE_LABEL_DE: Record<Gen4Type, string> = {
  normal: "Normal",
  fire: "Feuer",
  water: "Wasser",
  grass: "Pflanze",
  electric: "Elektro",
  ice: "Eis",
  fighting: "Kampf",
  poison: "Gift",
  ground: "Boden",
  flying: "Flug",
  psychic: "Psycho",
  bug: "Käfer",
  rock: "Gestein",
  ghost: "Geist",
  dragon: "Drache",
  dark: "Unlicht",
  steel: "Stahl",
};

type Chart = Record<Gen4Type, Partial<Record<Gen4Type, number>>>;

export const TYPE_CHART_GEN4: Chart = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 2,
    bug: 2,
    rock: 0.5,
    dragon: 0.5,
    steel: 2,
  },
  water: {
    fire: 2,
    water: 0.5,
    grass: 0.5,
    ground: 2,
    rock: 2,
    dragon: 0.5,
  },
  grass: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    bug: 0.5,
    rock: 2,
    dragon: 0.5,
    steel: 0.5,
  },
  electric: {
    water: 2,
    grass: 0.5,
    electric: 0.5,
    ground: 0,
    flying: 2,
    dragon: 0.5,
  },
  ice: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ground: 2,
    flying: 2,
    dragon: 2,
    ice: 0.5,
    steel: 0.5,
  },
  fighting: {
    normal: 2,
    ice: 2,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2,
    ghost: 0,
    dark: 2,
    steel: 2,
  },
  poison: {
    grass: 2,
    poison: 0.5,
    ground: 0.5,
    rock: 0.5,
    ghost: 0.5,
    steel: 0,
  },
  ground: {
    fire: 2,
    electric: 2,
    grass: 0.5,
    poison: 2,
    flying: 0,
    bug: 0.5,
    rock: 2,
    steel: 2,
  },
  flying: {
    grass: 2,
    electric: 0.5,
    fighting: 2,
    bug: 2,
    rock: 0.5,
    steel: 0.5,
  },
  psychic: {
    fighting: 2,
    poison: 2,
    psychic: 0.5,
    dark: 0,
    steel: 0.5,
  },
  bug: {
    fire: 0.5,
    grass: 2,
    fighting: 0.5,
    poison: 0.5,
    flying: 0.5,
    psychic: 2,
    ghost: 0.5,
    dark: 2,
    steel: 0.5,
  },
  rock: {
    fire: 2,
    ice: 2,
    fighting: 0.5,
    ground: 0.5,
    flying: 2,
    bug: 2,
    steel: 0.5,
  },
  ghost: {
    normal: 0,
    psychic: 2,
    ghost: 2,
    dark: 0.5,
    steel: 0.5,
  },
  dragon: {
    dragon: 2,
    steel: 0.5,
  },
  dark: {
    fighting: 0.5,
    psychic: 2,
    ghost: 2,
    dark: 0.5,
    steel: 0.5,
  },
  steel: {
    fire: 0.5,
    water: 0.5,
    electric: 0.5,
    ice: 2,
    rock: 2,
    steel: 0.5,
  },
};

export function getTypeMultiplier(
  attacking: Gen4Type,
  defenders: Gen4Type[]
): number {
  return defenders.reduce((total, def) => {
    const value = TYPE_CHART_GEN4[attacking][def] ?? 1;
    return total * value;
  }, 1);
}

export function getAttackSummary(attacking: Gen4Type) {
  const strong: Gen4Type[] = [];
  const weak: Gen4Type[] = [];
  const immune: Gen4Type[] = [];

  for (const def of GEN4_TYPES) {
    const value = TYPE_CHART_GEN4[attacking][def] ?? 1;
    if (value === 0) immune.push(def);
    else if (value > 1) strong.push(def);
    else if (value < 1) weak.push(def);
  }

  return { strong, weak, immune };
}

export function getDefenseSummary(defenders: Gen4Type[]) {
  const weak: Array<{ type: Gen4Type; mult: number }> = [];
  const resist: Array<{ type: Gen4Type; mult: number }> = [];
  const immune: Array<{ type: Gen4Type; mult: number }> = [];
  const neutral: Array<{ type: Gen4Type; mult: number }> = [];

  for (const atk of GEN4_TYPES) {
    const mult = getTypeMultiplier(atk, defenders);

    if (mult === 0) immune.push({ type: atk, mult });
    else if (mult > 1) weak.push({ type: atk, mult });
    else if (mult < 1) resist.push({ type: atk, mult });
    else neutral.push({ type: atk, mult });
  }

  weak.sort((a, b) => b.mult - a.mult);
  resist.sort((a, b) => a.mult - b.mult);

  return { weak, resist, immune, neutral };
}

export function formatMultiplier(mult: number) {
  if (mult === 0) return "0×";
  if (mult === 0.25) return "0.25×";
  if (mult === 0.5) return "0.5×";
  if (mult === 1) return "1×";
  if (mult === 2) return "2×";
  if (mult === 4) return "4×";
  return `${mult}×`;
}
