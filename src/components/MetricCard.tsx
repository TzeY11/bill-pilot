import type { LucideIcon } from "lucide-react";

type MetricCardProps = {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
};

export function MetricCard({ title, value, detail, icon: Icon }: MetricCardProps) {
  return (
    <section className="rounded-lg border border-line bg-panel p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-2xl font-semibold tracking-normal text-ink">
            {value}
          </p>
          <p className="mt-2 text-sm text-slate-500">{detail}</p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-brand">
          <Icon size={21} />
        </div>
      </div>
    </section>
  );
}
