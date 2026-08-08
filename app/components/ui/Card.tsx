import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

export default function Card({
  children,
  className = "",
  title,
  subtitle,
  icon,
  actions,
}: CardProps) {
  const hasHeader = title || subtitle || icon || actions;

  return (
    <section
      className={`overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-lg transition-all duration-200 ${className}`}
    >
      {hasHeader && (
        <header className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            {icon && (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600/15 text-emerald-400">
                {icon}
              </div>
            )}

            <div className="min-w-0">
              {title && (
                <h2 className="truncate text-base font-bold text-white">
                  {title}
                </h2>
              )}

              {subtitle && (
                <p className="mt-0.5 text-xs text-zinc-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {actions && <div className="shrink-0">{actions}</div>}
        </header>
      )}

      <div className={hasHeader ? "p-4" : ""}>
        {children}
      </div>
    </section>
  );
}
