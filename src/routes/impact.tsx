import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Leaf, Users, Recycle, Heart, TrendingUp, Building2 } from "lucide-react";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Impact — Landfill diverted, jobs funded, communities served" },
      { name: "description", content: "Goodwill stores fund jobs through resale. We help them stretch every dollar further while keeping more goods out of landfill." },
      { property: "og:title", content: "Our Impact — Comeback Restock" },
      { property: "og:description", content: "Landfill diverted. Jobs funded. Communities served." },
    ],
  }),
  component: ImpactPage,
});

const NUMBERS = [
  { value: "2.4M lbs", label: "Diverted from landfill in 2025", icon: Leaf, color: "mission" },
  { value: "$8.7M", label: "Margin returned to nonprofit partners", icon: TrendingUp, color: "gold" },
  { value: "1,200+", label: "Job-hours funded through partner stores", icon: Users, color: "coral" },
  { value: "94%", label: "Of pallet contents resold within 60 days", icon: Recycle, color: "mission" },
];

const PILLARS = [
  {
    icon: Leaf,
    title: "Less landfill, by design",
    body: "Customer returns from national retailers used to default to disposal. We re-route them to thrift stores where they get a second life on the floor — and a diversion report to back it up.",
  },
  {
    icon: Heart,
    title: "Mission-priced, always",
    body: "Nonprofit thrift gets our lowest tier. Period. No volume gates, no minimum commitments. We price for your margin so you can price for your community.",
  },
  {
    icon: Building2,
    title: "Sized for any store",
    body: "From a single Goodwill outlet to a full regional network, we ship by the pallet, the truckload, or the standing weekly drop — whatever fits your dock.",
  },
];

function ImpactPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-mission text-mission-foreground">
        <div className="container mx-auto px-4 md:px-6 py-20 md:py-28">
          <span className="inline-flex items-center gap-2 rounded-full bg-mission-foreground/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider ring-1 ring-mission-foreground/20">
            <Leaf className="h-3.5 w-3.5" /> Impact
          </span>
          <h1 className="mt-6 font-display text-5xl md:text-7xl font-black leading-[0.95]">
            A pallet is never just a pallet.
          </h1>
          <p className="mt-6 max-w-2xl text-lg md:text-xl text-mission-foreground/85">
            It's a truck that didn't go to the landfill. It's an hour of paid
            work for someone earning their footing. It's a family furnishing a
            new apartment for under a hundred bucks.
          </p>
        </div>
      </section>

      {/* Numbers */}
      <section className="container mx-auto px-4 md:px-6 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {NUMBERS.map((n) => (
            <div
              key={n.label}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <span
                className={
                  n.color === "mission"
                    ? "grid h-12 w-12 place-items-center rounded-xl bg-mission/15 text-mission"
                    : n.color === "gold"
                      ? "grid h-12 w-12 place-items-center rounded-xl bg-gold/20 text-primary"
                      : "grid h-12 w-12 place-items-center rounded-xl bg-coral/20 text-primary"
                }
              >
                <n.icon className="h-6 w-6" />
              </span>
              <div className="mt-5 font-display text-3xl md:text-4xl font-black text-primary leading-none">
                {n.value}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{n.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section className="bg-secondary/50 border-y border-border">
        <div className="container mx-auto px-4 md:px-6 py-20 md:py-24">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-mission">Three pillars</span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-black text-primary">
              Why thrift retailers partner with us
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {PILLARS.map((p) => (
              <div key={p.title} className="rounded-2xl bg-card border border-border p-7">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <p.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold text-primary">{p.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="container mx-auto px-4 md:px-6 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-mission">From the field</span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl font-black text-primary">
              A standing weekly drop, built for one regional Goodwill.
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Last spring, a member organization piloted a weekly mixed-pallet
              program across four stores. Within a quarter, their average
              transaction value lifted 18%, donor-sort hours dropped by a third,
              and 96% of routed inventory cleared the floor in under 45 days.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              The pilot is now a permanent line item — and the diversion report
              they hand to their board has become a fundraising tool.
            </p>
            <div className="mt-8">
              <Button asChild variant="hero" size="lg">
                <Link to="/contact">Talk to partnerships</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-3xl bg-primary text-primary-foreground p-8 md:p-10">
              <div className="text-xs uppercase tracking-widest text-gold font-bold">Quarterly snapshot</div>
              <ul className="mt-6 space-y-5">
                {[
                  ["+18%", "Average basket size across pilot stores"],
                  ["-33%", "Sort hours on donated goods"],
                  ["96%", "Routed inventory cleared in <45 days"],
                  ["41 tons", "Diverted from landfill in Q1 alone"],
                ].map(([v, l]) => (
                  <li key={l} className="flex items-baseline gap-4 border-b border-primary-foreground/15 pb-4 last:border-b-0 last:pb-0">
                    <span className="font-display text-3xl font-black text-gold w-24 shrink-0">{v}</span>
                    <span className="text-sm text-primary-foreground/85">{l}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="absolute -bottom-6 -right-6 -z-10 h-full w-full rounded-3xl bg-coral/40 blur-2xl" />
          </div>
        </div>
      </section>
    </div>
  );
}
