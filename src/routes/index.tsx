import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Lightbulb,
  Square,
  Table as TableIcon,
  Package,
  Boxes,
  BadgeCheck,
  Recycle,
  Truck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import heroAsset from "@/assets/hero-boutique.jpg.asset.json";
const heroImg = heroAsset.url;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Comeback Restock — Tiny Imperfections. Huge Savings." },
      {
        name: "description",
        content:
          "Sustainably sourced furniture, lighting, and decor at a fraction of wholesale. Shop closeout inventory by category — Lighting, Mirrors, and Tables.",
      },
      { property: "og:title", content: "Comeback Restock — Almost Perfect." },
      {
        property: "og:description",
        content:
          "Sustainable sourcing at a fraction of wholesale. 9,000+ SKUs, 150K+ items in stock.",
      },
      { property: "og:image", content: heroImg },
      { name: "twitter:image", content: heroImg },
    ],
  }),
  component: HomePage,
});

const STATS = [
  { value: "Already 400+ tons", label: "diverted from landfill", icon: Recycle },
  { value: "Up to 60%", label: "below wholesale", icon: BadgeCheck },
  { value: "New", label: "inspected and floor ready", icon: ShieldCheck },
];

const CATEGORIES = [
  {
    name: "Tables",
    desc: "Coffee tables, side tables, dining tables, and consoles.",
    tags: "Coffee · Side · Dining",
    accent: "bg-coral",
    icon: TableIcon,
  },
  {
    name: "Lighting",
    desc: "Table lamps, floor lamps, sconces, pendants, and chandeliers.",
    tags: "Lamps · Sconces · Pendants",
    accent: "bg-gold",
    icon: Lightbulb,
  },
  {
    name: "Mirrors",
    desc: "Wall mirrors, floor mirrors, and statement pieces.",
    tags: "Wall · Floor · Accent",
    accent: "bg-mission",
    icon: Square,
  },
];

const FEATURES = [
  {
    title: "Real Savings, Zero Waste",
    body: "Small batches. Sustainably sourced.",
    icon: Recycle,
  },
  {
    title: "Curated for How You Actually Buy",
    body: "Room-ready kits and scheduled refresh programs.",
    icon: Sparkles,
  },
  {
    title: "Replenishment on Your Schedule",
    body: "Fast, reliable shipping. Procurement-ready and operationally easy.",
    icon: Truck,
  },
  {
    title: "Inspected by Comeback",
    body: "Every item is graded and display-ready.",
    icon: ShieldCheck,
  },
];

const FAQS = [
  {
    q: "What condition is the inventory in?",
    a: "Every item is inspected, graded, and display-ready. Most pieces have only tiny cosmetic imperfections — packaging dings, light scuffs, or open-box returns — that make them ineligible for full-price retail but perfect for resale.",
  },
  {
    q: "How does pricing work?",
    a: "Pricing is a fraction of wholesale and varies by category and condition grade. Your quote locks in pricing for 14 days.",
  },
  {
    q: "What are the order minimums?",
    a: "One pallet. No minimum order value and no annual commitment.",
  },
  {
    q: "Can I choose specific styles or categories?",
    a: "Yes — every SKU is listed individually so you pick exactly what fits your floor. No mystery pallets.",
  },
  {
    q: "What's the minimum commitment?",
    a: "None. Order a single pallet or set up a recurring drop — it's up to you.",
  },
  {
    q: "How often do I receive shipments?",
    a: "On your schedule — one-time, monthly, or weekly. We'll match cadence to your sell-through.",
  },
  {
    q: "What brands do you carry?",
    a: "Rotating selection from major national home, lighting, and lifestyle retailers. Brands shift weekly as new inventory lands.",
  },
];

function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 opacity-40">
          <img
            src={heroImg}
            alt="Curated boutique interior with vintage lamps, ceramics, and linen textiles"
            className="h-full w-full object-cover"
            width={1600}
            height={1024}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/75 to-primary/40" />
        <div className="container relative mx-auto px-4 md:px-6 pt-6 pb-8 md:pt-8 md:pb-10 text-center">
          <h1
            className="mx-auto max-w-5xl font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-[1.1]"
            style={{ textShadow: "3px 3px 0 oklch(0 0 0 / 0.35)" }}
          >
            SUSTAINABLE SOURCING.
            <br />
            <span className="mt-2 inline-block">
              <span className="relative inline-block">
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-[0.06em] h-[0.32em] bg-coral"
                />
                <span className="relative">PREMIUM</span>
              </span>{" "}
              RESULTS.
            </span>
          </h1>
          <p className="mt-5 mx-auto max-w-2xl text-xl md:text-2xl text-primary-foreground/85">
            Inventory with intention
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="hero" size="xl">
              <a href="#shop-by-category">
                Shop Catalog <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
            <Button
              asChild
              size="xl"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <a href="mailto:hello@comebackgoods.com?subject=Comeback%20Goods%20Inquiry">
                Get In Contact <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-border bg-cream" style={{ overflow: 'hidden' }}>
        <div className="container mx-auto px-4 md:px-6 py-10">
          <div className="flex flex-row justify-around items-center gap-4">
            <div className="flex flex-col items-center text-center">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/20 text-gold mb-3">
                <Recycle className="h-4 w-4" />
              </span>
              <h3 className="text-[40px] font-bold text-primary leading-tight whitespace-nowrap">100%</h3>
              <p className="text-lg text-muted-foreground leading-[1.35] mt-1">Kept out of landfill</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/20 text-gold mb-3">
                <BadgeCheck className="h-4 w-4" />
              </span>
              <h3 className="text-[40px] font-bold text-primary leading-tight whitespace-nowrap">Up to 60%</h3>
              <p className="text-lg text-muted-foreground leading-[1.35] mt-1">Below wholesale</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/20 text-gold mb-3">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <h3 className="text-[40px] font-bold text-primary leading-tight whitespace-nowrap">Always New</h3>
              <p className="text-lg text-muted-foreground leading-[1.35] mt-1">Inspected and floor ready</p>
            </div>
          </div>
        </div>
      </section>

      {/* SHOP BY CATEGORY */}
      <section id="shop-by-category" className="container mx-auto px-4 md:px-6 pt-10 md:pt-14 pb-10 md:pb-14 scroll-mt-20">
        <h2 className="text-center font-display text-4xl md:text-5xl font-black text-primary">
          Shop By Category
        </h2>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Rug Program — featured dark card, parity offering with a different buying experience */}
          <a
            href="https://comebackrugs.com?from=restock"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col overflow-hidden rounded-2xl bg-primary text-primary-foreground p-7 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
          >
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-coral to-gold" />
            <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-foreground/10 text-gold ring-1 ring-primary-foreground/15">
              <Boxes className="h-6 w-6" />
            </span>
            <h3 className="mt-5 font-display text-2xl font-black">Rug Program</h3>
            <p className="mt-3 text-sm text-primary-foreground/80 leading-relaxed">
              High quality, new rugs — curated and delivered on your schedule.
            </p>
            <div className="mt-5 inline-flex w-fit rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-semibold text-gold ring-1 ring-primary-foreground/15">
              Curated Rugs
            </div>
            <div className="mt-auto pt-6">
              <span className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-bold text-primary group-hover:bg-gold/90">
                Explore the Program <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </a>

          {CATEGORIES.map((c) => (
            <Link
              key={c.name}
              to="/catalog"
              search={{ category: c.name }}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
            >
              <div className={`absolute inset-x-0 top-0 h-1.5 ${c.accent}`} />
              <span className="grid h-12 w-12 place-items-center rounded-full bg-gold/15 text-gold">
                <c.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-2xl font-black text-primary">{c.name}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
              <div className="mt-5 inline-flex w-fit rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
                {c.tags}
              </div>
              <div className="mt-auto pt-6">
                <span className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-bold text-primary group-hover:bg-gold/90">
                  Shop {c.name} <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* STRETCH YOUR BUDGET */}
      <section className="bg-secondary/50 border-y border-border">
        <div className="container mx-auto px-4 md:px-6 pt-10 md:pt-14 pb-20 md:pb-28">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-4xl md:text-5xl font-black text-primary">
              Stretch Your Budget,{" "}
              <span className="marker-highlight marker-highlight-mission">Not</span>{" "}
              Your Standards.
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              Reliable, affordable inventory — without the sourcing headaches.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
              >
                <span className="grid h-12 w-12 place-items-center rounded-full bg-mission/15 text-mission">
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-primary">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 md:px-6 py-20 md:py-28">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center font-display text-4xl md:text-5xl font-black text-primary">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="mt-10">
            {FAQS.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="text-left font-display text-lg font-bold text-primary hover:no-underline py-5">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}
