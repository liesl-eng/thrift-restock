import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Search, ClipboardCheck, Truck, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — From returns to your sales floor in four steps" },
      { name: "description", content: "How Comeback Goods routes returned and overstock inventory to Goodwill and other nonprofit thrift stores, by the pallet." },
      { property: "og:title", content: "How It Works — Comeback Goods × Goodwill" },
      { property: "og:description", content: "From returns to your floor in four steps." },
    ],
  }),
  component: HowPage,
});

const STEPS = [
  {
    n: "01",
    icon: Search,
    title: "Browse the live catalog",
    body: "Every SKU you see is in our warehouse right now. Filter by category, condition, and pallet size to match what your floor actually needs.",
  },
  {
    n: "02",
    icon: ClipboardCheck,
    title: "Build & send your quote",
    body: "Stack as many pallets as you want into your quote. We confirm availability and lock pricing within one business day.",
  },
  {
    n: "03",
    icon: Truck,
    title: "We arrange freight",
    body: "LTL, full truckload, or recurring weekly drops — we handle the logistics straight to your DC or individual store dock.",
  },
  {
    n: "04",
    icon: BarChart3,
    title: "You get a diversion report",
    body: "Every shipment includes a landfill-diversion report you can share with your board, your donors, and your community.",
  },
];

function HowPage() {
  return (
    <div>
      <section className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-widest text-mission">How it works</span>
          <h1 className="mt-3 font-display text-5xl md:text-7xl font-black text-primary leading-[0.95]">
            From returns to your <span className="marker-highlight marker-highlight-coral">sales floor</span> in four steps.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            No mystery boxes. No hidden fees. No commitments. Just a clean
            pipeline from national-retailer returns to your store's pricing gun.
          </p>
        </div>

        <ol className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="relative rounded-2xl border border-border bg-card p-8 overflow-hidden"
            >
              <span className="absolute right-6 top-6 font-display text-7xl font-black text-secondary leading-none select-none">
                {s.n}
              </span>
              <span className="relative grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground">
                <s.icon className="h-6 w-6" />
              </span>
              <h2 className="relative mt-5 font-display text-2xl font-bold text-primary">{s.title}</h2>
              <p className="relative mt-3 text-muted-foreground leading-relaxed">{s.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-16 rounded-3xl bg-gold/15 border border-gold/30 p-8 md:p-12 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-black text-primary">
            That's it. Genuinely.
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            No onboarding fee. No annual contract. Your first pallet can be on
            the truck within a week of your first call.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="hero" size="xl">
              <Link to="/catalog">Browse the catalog</Link>
            </Button>
            <Button asChild variant="outline" size="xl">
              <Link to="/contact">Talk to us first</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
