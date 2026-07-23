import { Trophy } from "lucide-react";

import Card from "@/app/components/ui/Card";
import { dashboardData } from "@/app/lib/mock/dashboard";

export default function StandingsCard() {
  return (
    <Card
      title="Classifica"
      icon={<Trophy size={18} className="text-yellow-400" />}
    >
      <div className="space-y-2">
        {dashboardData.standings.map((team) => (
          <div
            key={team.pos}
            className={`flex items-center justify-between rounded-lg px-3 py-2 transition
              ${
                team.pos === 1
                  ? "bg-yellow-500/10 border border-yellow-500/30"
                  : team.team === "Accademia Pontedera"
                  ? "bg-green-500/10 border border-green-500/30"
                  : "bg-zinc-800/60 border border-zinc-800"
              }`}
          >
            <div className="flex items-center gap-3">

              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold
                ${
                  team.pos === 1
                    ? "bg-yellow-500 text-black"
                    : "bg-zinc-700 text-zinc-200"
                }`}
              >
                {team.pos}
              </div>

              <span className="text-sm font-medium text-white">
                {team.team}
              </span>
            </div>

            <span className="font-bold text-yellow-400">
              {team.pts}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}