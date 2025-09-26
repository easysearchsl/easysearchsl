import { ReactNode, ComponentType, useId } from 'react';

interface SectionShellProps {
  title: string;
  Icon?: ComponentType<{ className?: string }>;
  description?: string;
  actions?: ReactNode;
  className?: string;
  accent?: boolean;
  children: ReactNode;
}

export function SectionShell({ title, Icon, description, actions, className = '', accent = false, children }: SectionShellProps) {
  const headingId = useId();
  return (
    <section
      className={`space-y-4 rounded-2xl border p-4 md:p-6 shadow-sm ${accent ? 'border-primary/30 bg-primary/5 ring-1 ring-primary/10' : 'bg-muted/40'} ${className}`}
      role="region"
      aria-labelledby={headingId}
    >
      <div className="h-1 w-28 rounded-full bg-gradient-to-r from-[#29a2d4] via-[#e86625] to-[#2f2f2f]" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {Icon ? (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden="true">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
          ) : null}
          <div>
            <h2 id={headingId} className="text-xl font-semibold leading-tight">{title}</h2>
            {description ? (
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="shrink-0 print:hidden">{actions}</div> : null}
      </div>

      {children}
    </section>
  );
}
