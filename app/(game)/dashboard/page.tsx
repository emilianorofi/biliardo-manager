import DashboardHeader from "../../components/dashboard/DashboardHeader";
import FinancesCard from "../../components/dashboard/FinancesCard";
import NewsCard from "../../components/dashboard/NewsCard";
import NextMatchCard from "../../components/dashboard/NextMatchCard";
import StandingsCard from "../../components/dashboard/StandingsCard";
import TeamStatusCard from "../../components/dashboard/TeamStatusCard";
import UpcomingEventsCard from "../../components/dashboard/AgendaCard";

export default function DashboardPage() {

  return (
    <div className="space-y-4">
      <DashboardHeader />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <NextMatchCard />
        </div>

        <div className="xl:col-span-4">
          <TeamStatusCard />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <NewsCard />
        </div>

        <div className="xl:col-span-5">
          <StandingsCard />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <FinancesCard />
        </div>

        <div className="xl:col-span-7">
          <UpcomingEventsCard />
        </div>
      </section>
    </div>
  );
}
