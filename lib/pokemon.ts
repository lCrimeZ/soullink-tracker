export async function fetchPokemon(name: string) {
  const res = await fetch(
    "https://pokeapi.co/api/v2/pokemon/" + name.toLowerCase()
  );

  if (!res.ok) return null;

  const data = await res.json();

  return {
    sprite:
      data.sprites.other["official-artwork"].front_default ??
      data.sprites.front_default,

    type1: data.types[0]?.type.name ?? null,
    type2: data.types[1]?.type.name ?? null,
  };
}
