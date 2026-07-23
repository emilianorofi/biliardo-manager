import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

export default function DashboardCard({
  title,
  subtitle,
  icon,
  children,
  className = "",
  actions,
}: DashboardCardProps) {
  return (
    <div
      className={`flex h-full flex-col rounded-2xl border border-zinc-700 bg-zinc-900 shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600/15 text-xl text-emerald-400">
              {icon}
            </div>
          )}

          <div>
            <h2 className="text-lg font-bold text-white">
              {title}
            </h2>

            {subtitle && (
              <p className="text-sm text-zinc-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions}
      </div>

      {/* Body */}

      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
}