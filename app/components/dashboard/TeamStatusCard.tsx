import { Activity, Heart, Dumbbell, Users } from "lucide-react";

import Card from "@/app/components/ui/Card";
import ProgressBar from "@/app/components/ui/ProgressBar";
import StatBadge from "@/app/components/ui/StatBadge";
import { dashboardData } from "@/app/lib/mock/dashboard";

export default function TeamStatusCard() {
  const team = dashboardData.team;

  const resultColor = {
    W: "bg-green-500",
    D: "bg-yellow-500",
    L: "bg-red-500",
  };

  return (
    <Card
      title="Stato Squadra"
      icon={<Activity size={18} className="text-green-400" />}
    >
      <div className="space-y-6">

        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-zinc-400">Forma</span>
          </div>

          <ProgressBar
            value={team.form}
            color="green"
          />
        </div>

        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-zinc-400">Morale</span>
          </div>

          <ProgressBar
            value={team.morale}
            color="yellow"
          />
        </div>

        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-zinc-400">Condizione</span>
          </div>

          <ProgressBar
            value={team.condition}
            color="blue"
          />
        </div>

        <StatBadge
          label="Affiatamento"
          value={`${team.chemistry}%`}
          icon={<Users size={16} />}
          color="green"
        />

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Ultime 5 partite
          </p>

          <div className="flex gap-2">
            {team.lastResults.map((result, index) => (
              <div
                key={index}
                className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold text-white ${
                  resultColor[result as keyof typeof resultColor]
                }`}
              >
                {result}
              </div>
            ))}
          </div>
        </div>

      </div>
    </Card>
  );
}