export type Run = { id: string; slug: string; title: string; game: string; gen: number };

export type Player = {
  id: string;
  run_id: string;
  idx: 1 | 2;
  name: string;
  avatar_url: string | null;
  deaths: number;
  wipes: number;
};

export type Cap = { id: string; run_id: string; label: string; cap_p1: number; cap_p2: number; sort: number };

export type Route = { id: string; run_id: string; name: string; sort: number };

export type Encounter = {
  id: string;
  run_id: string;
  route_id: string;
  player_id: string;
  pokemon_name: string | null;
  sprite_url: string | null;
  type1: string | null;
  type2: string | null;
  status: "alive" | "dead" | "lost";
  team_slot: number | null;
  notes: string | null;
};
