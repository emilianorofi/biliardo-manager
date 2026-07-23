import {
  Newspaper,
  Trophy,
  TrendingUp,
  Search,
} from "lucide-react";

import Card from "@/app/components/ui/Card";
import { dashboardData } from "@/app/lib/mock/dashboard";

const icons = {
  Allenamento: <TrendingUp size={16} />,
  Mercato: <Search size={16} />,
  Lega: <Trophy size={16} />,
};

const colors = {
  Allenamento:
    "bg-green-500/15 text-green-400 border-green-500/20",
  Mercato:
    "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  Lega:
    "bg-sky-500/15 text-sky-400 border-sky-500/20",
};

export default function NewsCard() {
  return (
    <Card
      title="News"
      icon={<Newspaper size={18} className="text-sky-400" />}
    >
      <div className="space-y-4">
        {dashboardData.news.map((news, index) => (
          <div
            key={index}
            className="rounded-xl border border-zinc-800 bg-zinc-800/40 p-4 transition hover:border-zinc-700 hover:bg-zinc-800"
          >
            <div className="mb-3 flex items-center justify-between">

              <div
                className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                  colors[news.type as keyof typeof colors]
                }`}
              >
                {icons[news.type as keyof typeof icons]}

                {news.type}
              </div>

              <span className="text-xs text-zinc-500">
                {news.time}
              </span>
            </div>

            <p className="text-sm leading-6 text-zinc-200">
              {news.title}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}