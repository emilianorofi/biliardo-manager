export type SpecialtyCupType = "ITALIANA" | "GORIZIANA" | "TUTTI_DOPPI";

export type SpecialtyCupPlayerSnapshot = {
  id: number | string;
  specialties: {
    italiana: number;
    goriziana: number;
    tuttiDoppi: number;
  };
  attributes: {
    precisione: number;
    diretto: number;
    sponde: number;
  };
};

/**
 * Determina la Coppa Specialità della stagione usando esclusivamente i valori
 * correnti del giocatore. Va quindi ricalcolata ogni stagione: se cambiano le
 * specialità, può cambiare anche la coppa di iscrizione.
 */
export function getSpecialtyCupAssignment(
  player: SpecialtyCupPlayerSnapshot
): SpecialtyCupType {
  const { italiana, goriziana, tuttiDoppi } = player.specialties;
  const maxValue = Math.max(italiana, goriziana, tuttiDoppi);

  const tied = [
    italiana === maxValue ? "ITALIANA" : null,
    goriziana === maxValue ? "GORIZIANA" : null,
    tuttiDoppi === maxValue ? "TUTTI_DOPPI" : null,
  ].filter((value): value is SpecialtyCupType => value !== null);

  if (tied.length === 1) return tied[0];

  const { precisione, diretto, sponde } = player.attributes;

  if (tied.length === 2) {
    const first = tied[0];
    const second = tied[1];

    if (hasPair(first, second, "ITALIANA", "GORIZIANA")) {
      if (diretto !== sponde) return diretto > sponde ? "ITALIANA" : "GORIZIANA";
    }

    if (hasPair(first, second, "ITALIANA", "TUTTI_DOPPI")) {
      if (precisione !== sponde) return precisione > sponde ? "ITALIANA" : "TUTTI_DOPPI";
    }

    if (hasPair(first, second, "GORIZIANA", "TUTTI_DOPPI")) {
      if (precisione !== diretto) return precisione > diretto ? "GORIZIANA" : "TUTTI_DOPPI";
    }
  }

  if (tied.length === 3) {
    const bestAttribute = Math.max(precisione, diretto, sponde);
    const attributeLeaders = [
      precisione === bestAttribute ? "GORIZIANA" : null,
      diretto === bestAttribute ? "ITALIANA" : null,
      sponde === bestAttribute ? "TUTTI_DOPPI" : null,
    ].filter((value): value is SpecialtyCupType => value !== null);

    if (attributeLeaders.length === 1) return attributeLeaders[0];
  }

  return deterministicFallback(player.id, tied);
}

function hasPair(
  first: SpecialtyCupType,
  second: SpecialtyCupType,
  a: SpecialtyCupType,
  b: SpecialtyCupType
) {
  return (first === a && second === b) || (first === b && second === a);
}

function deterministicFallback(
  id: number | string,
  tied: SpecialtyCupType[]
): SpecialtyCupType {
  const source = String(id);
  let hash = 0;

  for (let index = 0; index < source.length; index++) {
    hash = (hash * 31 + source.charCodeAt(index)) >>> 0;
  }

  return tied[hash % tied.length];
}
