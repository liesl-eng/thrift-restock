import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowRight, Recycle, Truck, HeartHandshake, Sparkles, Leaf, Users } from "lucide-react";
import heroImg from "@/assets/hero-goodwill.jpg";
import { catalogQueryOptions, formatMoney } from "@/lib/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Comeback Goods × Goodwill — Returned inventory, mission-priced" },
      { name: "description", content: "Pallets of returned, overstock and gently-used inventory for Goodwill stores and nonprofit thrift retailers. Better margins, less landfill, more community jobs." },
      { property: "og:title", content: "Comeback Goods × Goodwill" },
      { property: "og:description", content: "Pallets of returned, overstock and gently-used inventory for nonprofit thrift retailers." },
      { property: "og:image", content: heroImg },
      { name: "twitter:image", content: heroImg },
    ],
  }),
  component: HomePage,
});

const STATS = [
  { value: "2.4M", label: "lbs diverted from landfill in 2025", icon: Leaf },
  { value: "$0.18", label: "average wholesale price per dollar of retail", icon: Sparkles },
  { value: "140+", label: "nonprofit thrift partners served", icon: HeartHandshake },
  { value: "Weekly", label: "fresh inventory drops, by category", icon: Truck },
];

const OFFERINGS = [
  {
    title: "Pick-by-SKU pallets",
    body: "Choose exactly the categories you need — lighting, textiles, housewares, decor. No mystery pallets, no surprises.",
    accent: "gold" as const,
  },
  {
    title: "Mission-friendly pricing",
    body: "Nonprofit rates start at $0.04 on the dollar. We price for your margin, not against it.",
    accent: "mission" as const,
  },
  {
    title: "Landfill-diversion reporting",
    body: "Every pallet ships with a diversion report you can hand to your board, your donors, and your community.",
    accent: "coral" as const,
  },
];

function HomePage() {
  const { data } = useQuery(catalogQueryOptions);
  const featured = (data?.items ?? []).slice(0, 3);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 opacity-25">
          <img
            src={heroImg}
            alt="Thrift warehouse with shelves of returned goods"
            className="h-full w-full object-cover"
            width={1600}
            height={1024}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/75 to-primary/40" />
        <div className="container relative mx-auto px-4 md:px-6 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold ring-1 ring-gold/30">
              <Recycle className="h-3.5 w-3.5" />
              Built for Goodwill & nonprofit thrift
            </span>
            <h1
              className="mt-6 font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.95]"
              style={{ textShadow: "3px 3px 0 oklch(0 0 0 / 0.35)" }}
            >
              Returns become{" "}
              <span className="marker-highlight marker-highlight-coral">revenue</span>.<br />
              Landfill becomes{" "}
              <span className="marker-highlight marker-highlight-gold">livelihood</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-lg md:text-xl text-primary-foreground/85">
              We route customer returns and store overstock from national retailers
              straight to Goodwill stores and similar nonprofit thrift operations —
              by the pallet, priced for your mission, sorted to your floor plan.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="xl">
                <Link to="/catalog">
                  Browse the catalog <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="xl"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                <Link to="/contact">
                  Request a quote
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-border bg-cream">
        <div className="container mx-auto px-4 md:px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {STATS.map((s) => (
              <div key={s.label} className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-mission/15 text-mission">
                  <s.icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-display text-2xl md:text-3xl font-black text-primary leading-none">
                    {s.value}
                  </div>
                  <div className="mt-1 text-xs md:text-sm text-muted-foreground leading-snug">
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT WE OFFER */}
      <section className="container mx-auto px-4 md:px-6 py-20 md:py-28">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-mission">What we offer</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-black text-primary">
            Inventory built around <span className="marker-highlight marker-highlight-mission">your mission</span>, not ours.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Every thrift store is different. We let you pick exactly what hits your
            floor, so you spend less time sorting donations that never sell — and
            more time serving your community.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {OFFERINGS.map((o) => (
            <div
              key={o.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
            >
              <div
                className={
                  o.accent === "gold"
                    ? "h-1.5 w-12 rounded-full bg-gold mb-5"
                    : o.accent === "mission"
                      ? "h-1.5 w-12 rounded-full bg-mission mb-5"
                      : "h-1.5 w-12 rounded-full bg-coral mb-5"
                }
              />
              <h3 className="font-display text-xl font-bold text-primary">{o.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{o.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED CATALOG */}
      <section className="bg-secondary/50 border-y border-border">
        <div className="container mx-auto px-4 md:px-6 py-20 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-mission">In stock now</span>
              <h2 className="mt-2 font-display text-3xl md:text-4xl font-black text-primary">
                This week's pallets
              </h2>
            </div>
            <Button asChild variant="outline">
              <Link to="/catalog">See all SKUs <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((sku) => (
              <Link
                key={sku.id}
                to="/catalog"
                className="group block overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={sku.image}
                    alt={sku.name}
                    loading="lazy"
                    width={800}
                    height={600}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold uppercase tracking-wider text-muted-foreground">{sku.brand}</span>
                    <span className="rounded-full bg-mission/15 px-2 py-0.5 font-semibold text-mission">
                      {sku.category}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-lg font-bold text-primary line-clamp-2">{sku.name}</h3>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-display text-2xl font-black text-primary">
                      {formatMoney(sku.price)}
                    </span>
                    <span className="text-xs text-muted-foreground line-through">
                      {formatMoney(sku.msrp)} MSRP
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {sku.units} units available
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* MISSION QUOTE */}
      <section className="container mx-auto px-4 md:px-6 py-20 md:py-28">
        <div className="relative max-w-4xl mx-auto rounded-3xl bg-primary text-primary-foreground p-10 md:p-16 overflow-hidden">
          <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gold/20 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-mission/30 blur-3xl" />
          <Users className="relative h-10 w-10 text-gold" />
          <blockquote className="relative mt-6 font-display text-2xl md:text-4xl font-bold leading-tight">
            "Every pallet we route through Comeback Goods is a pallet that funds
            another job in our community — and one less truck pulling into a
            landfill."
          </blockquote>
          <div className="relative mt-6 text-sm text-primary-foreground/70">
            — Regional Director, Goodwill member organization
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 md:px-6 pb-20">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-card to-secondary p-10 md:p-14 text-center">
          <h2 className="font-display text-3xl md:text-5xl font-black text-primary">
            Ready to see what's on the truck this week?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse live SKUs, build a quote, and we'll confirm availability within one business day.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="hero" size="xl">
              <Link to="/catalog">Browse catalog</Link>
            </Button>
            <Button asChild variant="outline" size="xl">
              <Link to="/contact">Talk to a partnerships lead</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
