import {
  GEN4_TYPES,
  Gen4Type,
  TYPE_LABEL_DE,
  getTypeMultiplier,
} from "@/lib/type-chart-gen4";

export type TeamAnalysisMember = {
  pokemon_name: string | null;
  type1: string | null;
  type2: string | null;
  status: "alive" | "dead" | "lost";
  team_slot: number | null;
  routeName?: string;
};

export type TeamAnalysisPlayer = {
  name: string;
  team: TeamAnalysisMember[];
};

function isGen4Type(value: string | null | undefined): value is Gen4Type {
  return !!value && (GEN4_TYPES as readonly string[]).includes(value);
}

export function getAliveMembers(team: TeamAnalysisMember[]) {
  return team.filter(
    (m) =>
      m.status === "alive" &&
      m.team_slot != null &&
      (isGen4Type(m.type1) || isGen4Type(m.type2))
  );
}

function getMemberTypes(member: TeamAnalysisMember): Gen4Type[] {
  return [member.type1, member.type2].filter(isGen4Type);
}

export function getTeamPresentTypes(team: TeamAnalysisMember[]) {
  const alive = getAliveMembers(team);
  const set = new Set<Gen4Type>();

  for (const mon of alive) {
    for (const t of getMemberTypes(mon)) {
      set.add(t);
    }
  }

  return [...set];
}

export function getOffensiveCoverage(team: TeamAnalysisMember[]) {
  const presentTypes = getTeamPresentTypes(team);

  const strongInto = GEN4_TYPES.filter((defType) =>
    presentTypes.some((atkType) => getTypeMultiplier(atkType, [defType]) > 1)
  );

  const missingInto = GEN4_TYPES.filter(
    (defType) =>
      !presentTypes.some((atkType) => getTypeMultiplier(atkType, [defType]) > 1)
  );

  return {
    presentTypes,
    strongInto,
    missingInto,
  };
}

export function getDefensiveCoverage(team: TeamAnalysisMember[]) {
  const alive = getAliveMembers(team);

  return GEN4_TYPES.map((incomingType) => {
    const weak: TeamAnalysisMember[] = [];
    const resist: TeamAnalysisMember[] = [];
    const immune: TeamAnalysisMember[] = [];
    const neutral: TeamAnalysisMember[] = [];

    for (const mon of alive) {
      const types = getMemberTypes(mon);
      const mult = types.length ? getTypeMultiplier(incomingType, types) : 1;

      if (mult === 0) immune.push(mon);
      else if (mult > 1) weak.push(mon);
      else if (mult < 1) resist.push(mon);
      else neutral.push(mon);
    }

    return {
      type: incomingType,
      weak,
      resist,
      immune,
      neutral,
      answerCount: resist.length + immune.length,
      weakCount: weak.length,
    };
  });
}

export function getSharedWeaknesses(team: TeamAnalysisMember[]) {
  return getDefensiveCoverage(team)
    .filter((entry) => entry.weakCount >= 2)
    .sort((a, b) => {
      if (b.weakCount !== a.weakCount) return b.weakCount - a.weakCount;
      return a.answerCount - b.answerCount;
    });
}

export function getDangerousTypes(team: TeamAnalysisMember[]) {
  return getDefensiveCoverage(team)
    .filter((entry) => entry.weakCount >= 2 && entry.answerCount === 0)
    .sort((a, b) => b.weakCount - a.weakCount);
}

export function getFragileAnswerTypes(team: TeamAnalysisMember[]) {
  return getDefensiveCoverage(team)
    .filter((entry) => entry.weakCount >= 2 && entry.answerCount === 1)
    .sort((a, b) => b.weakCount - a.weakCount);
}

export function getBestDefensiveTypes(team: TeamAnalysisMember[]) {
  return getDefensiveCoverage(team)
    .filter((entry) => entry.answerCount >= 2 && entry.weakCount === 0)
    .sort((a, b) => b.answerCount - a.answerCount);
}

export function getTopWeakTypesForPlayer(team: TeamAnalysisMember[]) {
  return getDefensiveCoverage(team)
    .filter((entry) => entry.weakCount >= 1)
    .sort((a, b) => {
      if (b.weakCount !== a.weakCount) return b.weakCount - a.weakCount;
      return a.answerCount - b.answerCount;
    })
    .slice(0, 4);
}

export function getTopStrongIntoForPlayer(team: TeamAnalysisMember[]) {
  const offensive = getOffensiveCoverage(team);

  return offensive.strongInto.slice(0, 8);
}

export function buildCoachSummary(players: TeamAnalysisPlayer[]) {
  const combined = players.flatMap((p) => p.team);

  const sharedWeak = getSharedWeaknesses(combined);
  const dangerous = getDangerousTypes(combined);
  const fragile = getFragileAnswerTypes(combined);
  const offensive = getOffensiveCoverage(combined);

  const summary: string[] = [];

  if (dangerous[0]) {
    summary.push(
      `Achtung: Gegen ${TYPE_LABEL_DE[dangerous[0].type]} seid ihr aktuell besonders anfällig.`
    );
  } else if (sharedWeak[0]) {
    summary.push(
      `Gemeinsame Schwäche: ${TYPE_LABEL_DE[sharedWeak[0].type]} setzt beide Teams unter Druck.`
    );
  }

  if (fragile[0]) {
    const entry = fragile[0];
    const answerMon =
      entry.resist[0]?.pokemon_name || entry.immune[0]?.pokemon_name || "ein einzelnes Pokémon";

    summary.push(
      `Single Point of Failure: Gegen ${TYPE_LABEL_DE[entry.type]} habt ihr praktisch nur eine echte Antwort (${answerMon}).`
    );
  }

  if (offensive.missingInto[0]) {
    const names = offensive.missingInto
      .slice(0, 3)
      .map((t) => TYPE_LABEL_DE[t])
      .join(", ");

    summary.push(
      `Offensiv fehlt euch per STAB aktuell guter Druck gegen: ${names}.`
    );
  }

  if (summary.length === 0) {
    summary.push("Eure aktuelle Teamstruktur wirkt insgesamt ziemlich stabil.");
  }

  return summary;
}
