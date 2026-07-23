import { ReactNode } from "react";

type SectionTitleProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
};

export default function SectionTitle({
  title,
  subtitle,
  icon,
}: SectionTitleProps) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400">
            {icon}
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold text-white">
            {title}
          </h2>

          {subtitle && (
            <p className="text-sm text-zinc-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}