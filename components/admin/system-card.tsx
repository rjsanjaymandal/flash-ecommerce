import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SystemCardProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  action?: ReactNode;
}

export function SystemCard({
  title,
  subtitle,
  icon,
  children,
  className,
  headerClassName,
  action,
}: SystemCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-slate-200 bg-white/40 backdrop-blur-xl transition-all duration-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/40",
        "hover:border-indigo-500/30 dark:hover:border-indigo-400/30",
        className,
      )}
    >
      {/* Neo-Industrial Header */}
      {(title || icon) && (
        <div
          className={cn(
            "flex items-center justify-between border-b border-slate-100/50 bg-slate-50/30 px-6 py-4 dark:border-slate-800/50 dark:bg-slate-900/20",
            headerClassName,
          )}
        >
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors group-hover:border-indigo-200 group-hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:group-hover:border-indigo-900 dark:group-hover:text-indigo-400">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-200">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}

      {/* Content */}
      <div className="p-6">{children}</div>

      {/* Decorative Corner Accents */}
      <div className="absolute -top-1 -right-1 h-3 w-3 border-r-2 border-t-2 border-transparent transition-colors group-hover:border-indigo-400/50" />
      <div className="absolute -bottom-1 -left-1 h-3 w-3 border-b-2 border-l-2 border-transparent transition-colors group-hover:border-indigo-400/50" />
    </div>
  );
}
