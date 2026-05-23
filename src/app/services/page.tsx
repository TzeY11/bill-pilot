import { Suspense } from "react";
import { ServicesView } from "@/components/ServicesView";

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <section className="rounded-lg border border-line bg-panel p-8 text-sm text-slate-500 shadow-soft">
          Loading services...
        </section>
      }
    >
      <ServicesView />
    </Suspense>
  );
}
