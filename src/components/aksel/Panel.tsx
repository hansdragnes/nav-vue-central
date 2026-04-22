import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PanelProps {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export const Panel = ({ title, description, actions, children, className, contentClassName }: PanelProps) => (
  <section className={cn("rounded-sm border border-border bg-card shadow-sm", className)}>
    {(title || actions) && (
      <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          {title && <h2 className="text-base font-semibold text-foreground">{title}</h2>}
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </header>
    )}
    <div className={cn("p-5", contentClassName)}>{children}</div>
  </section>
);
