const TYPE_DE: Record<string, string> = {
  normal: "Normal",
  fire: "Feuer",
  water: "Wasser",
  electric: "Elektro",
  grass: "Pflanze",
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
  fairy: "Fee",
};

export function TypePill({ t }: { t: string }) {
  const label = TYPE_DE[t] ?? t;

  return (
    <span className="px-2 py-1 rounded-full text-xs bg-zinc-800 border border-zinc-700">
      {label}
    </span>
  );
}
