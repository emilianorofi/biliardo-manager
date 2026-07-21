import Link from "next/link";

import {
  GamePlayer,
  getPlayerOverall,
  getItalianaScore,
  getGorizianaScore,
  getTuttiDoppiScore,
} from "@/lib/game-data";

import PlayerInfo from "./PlayerInfo";
import AttributeBar from "./AttributeBar";
import OverallBadge from "./OverallBadge";
import SpecialityScores from "./SpecialityScores";

type Props = {
  player: GamePlayer;
};

const skills = [
  { key: "direct", label: "Diretto" },
  { key: "banks", label: "Sponde" },
  { key: "defense", label: "Difesa" },
  { key: "finishing", label: "Realizzazione" },
  { key: "precision", label: "Precisione" },
  { key: "measure", label: "Misura" },
  { key: "creativity", label: "Creatività" },
  { key: "tactics", label: "Tattica" },
  { key: "mentality", label: "Mentalità" },
] as const;

export default function PlayerListCard({ player }: Props) {
  const overall = getPlayerOverall(player);

  const italiana = getItalianaScore(player);
  const goriziana = getGorizianaScore(player);
  const tuttiDoppi = getTuttiDoppiScore(player);

  return (
    <Link
      href={`/players/${player.id}`}
      className="group block"
    >
      <div className="rounded-xl border border-zinc-800 bg-[#171717] transition-all duration-200 hover:border-green-500 hover:bg-[#1b1b1b]">

        <div className="flex items-stretch">

          {/* FOTO + INFO + STATO */}

          <div className="w-[340px] border-r border-zinc-800 p-4">

  <PlayerInfo player={player} />

</div>

          {/* CARATTERISTICHE */}

          <div className="flex-1 border-r border-zinc-800 p-4">

            <div className="space-y-1">

              {skills.map((skill) => (

                <AttributeBar
                  key={skill.key}
                  label={skill.label}
                  value={player.skills[skill.key]}
                />

              ))}

            </div>

          </div>

          {/* OVERALL */}
                    <div className="flex w-56 flex-col items-center justify-between p-4">

            <OverallBadge value={overall} />

            <SpecialityScores
              italiana={italiana}
              goriziana={goriziana}
              tuttiDoppi={tuttiDoppi}
            />

          </div>

        </div>

      </div>

    </Link>

  );
}