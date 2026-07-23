"use client";

import {
  Activity,
  Bell,
 CalendarDays,
  Menu,
  Smile,
  Star,
  Users,
  Wallet,
} from "lucide-react";

type Props = {
  onMenuClick: () => void;
};

export default function TopBar({ onMenuClick }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-emerald-900/50 bg-[#10231c]/95 backdrop-blur">

      <div className="flex h-20 items-center justify-between px-6">

        <div className="flex items-center gap-5">

          <button
            onClick={onMenuClick}
            className="rounded-xl border border-emerald-800 p-2 lg:hidden"
          >
            <Menu size={22} />
          </button>

          <div>
            <h2 className="text-xl font-bold text-white">
              Accademia Biliardo Pontedera
            </h2>

            <p className="text-sm text-emerald-300">
              Serie Regionale • Stagione 1
            </p>
          </div>

        </div>

        <div className="hidden xl:flex items-center gap-3">

          <Stat
            icon={<Wallet size={17} />}
            value="125.000€"
            color="text-yellow-300"
          />

          <Stat
            icon={<Star size={17} />}
            value="42"
          />

          <Stat
            icon={<Smile size={17} />}
            value="84"
          />

          <Stat
            icon={<Activity size={17} />}
            value="87"
          />

          <Stat
            icon={<Users size={17} />}
            value="10/10"
          />

          <Stat
            icon={<CalendarDays size={17} />}
            value="G5"
          />

        </div>

        <button className="relative rounded-xl border border-emerald-800 p-2">

          <Bell size={20} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-yellow-400"/>

        </button>

      </div>

    </header>
  );
}

function Stat({
  icon,
  value,
  color = "text-white",
}:{
  icon: React.ReactNode;
  value:string;
  color?:string;
}){

  return(

    <div className="flex items-center gap-2 rounded-xl border border-emerald-800 bg-[#183129] px-3 py-2">

      <div className={color}>
        {icon}
      </div>

      <span className="font-bold text-white">
        {value}
      </span>

    </div>

  )

}