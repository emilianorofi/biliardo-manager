export type FormationSlot =
  | "A"
  | "B"
  | "C";

export type MatchSpecialty =
  | "ITALIANA"
  | "GORIZIANA"
  | "TUTTI_DOPPI";

export type LeagueMatchDefinition = {
  order: number;

  specialty:
    MatchSpecialty;

  targetPoints: number;

  homeSlots:
    FormationSlot[];

  awaySlots:
    FormationSlot[];
};

export const LEAGUE_MATCH_DEFINITIONS:
  LeagueMatchDefinition[] = [
  {
    order: 1,

    specialty:
      "ITALIANA",

    targetPoints: 80,

    homeSlots: [
      "A",
    ],

    awaySlots: [
      "A",
    ],
  },

  {
    order: 2,

    specialty:
      "ITALIANA",

    targetPoints: 80,

    homeSlots: [
      "B",
      "C",
    ],

    awaySlots: [
      "B",
      "C",
    ],
  },

  {
    order: 3,

    specialty:
      "GORIZIANA",

    targetPoints: 400,

    homeSlots: [
      "B",
    ],

    awaySlots: [
      "B",
    ],
  },

  {
    order: 4,

    specialty:
      "GORIZIANA",

    targetPoints: 400,

    homeSlots: [
      "A",
      "C",
    ],

    awaySlots: [
      "A",
      "C",
    ],
  },

  {
    order: 5,

    specialty:
      "TUTTI_DOPPI",

    targetPoints: 600,

    homeSlots: [
      "C",
    ],

    awaySlots: [
      "C",
    ],
  },

  {
    order: 6,

    specialty:
      "TUTTI_DOPPI",

    targetPoints: 600,

    homeSlots: [
      "A",
      "B",
    ],

    awaySlots: [
      "A",
      "B",
    ],
  },
];

export function getLeagueMatchDefinitions() {
  return LEAGUE_MATCH_DEFINITIONS.map(
    (match) => ({
      ...match,

      homeSlots: [
        ...match.homeSlots,
      ],

      awaySlots: [
        ...match.awaySlots,
      ],
    })
  );
}