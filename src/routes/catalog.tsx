import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATALOG, CATEGORIES, CONDITIONS, formatMoney, type Category, type Condition } from "@/lib/catalog";
import { useQuote } from "@/lib/quote-context";
import { Check, Plus, Search, ShoppingBag, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/catalog")({
  head: () => ({
    meta: [
      { title: "Catalog — Pick the pallets your store actually needs" },
      { name: "description", content: "Pick-by-SKU catalog of returned and overstock inventory pallets. Filter by category and condition." },
      { property: "og:title", content: "Comeback Goods Catalog" },
      { property: "og:description", content: "Pick-by-SKU pallets for nonprofit thrift." },
    ],
  }),
  component: CatalogPage,
});

function CatalogPage() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<Category | "All">("All");
  const [cond, setCond] = useState<Condition | "All">("All");
  const { add, items } = useQuote();

  const filtered = useMemo(() => {
    return CATALOG.filter((s) => {
      if (cat !== "All" && s.category !== cat) return false;
      if (cond !== "All" && s.condition !== cond) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.id.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [query, cat, cond]);

  const inQuote = (id: string) => items.some((i) => i.skuId === id);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
      <div className="max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-widest text-mission">Live catalog</span>
        <h1 className="mt-3 font-display text-4xl md:text-6xl font-black text-primary">
          Pick exactly what your <span className="marker-highlight marker-highlight-gold">floor needs</span>.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Every pallet below is in our warehouse right now. Build a quote, hit
          send, and we'll confirm availability within one business day.
        </p>
      </div>

      {/* Filters */}
      <div className="mt-10 rounded-2xl border border-border bg-card p-4 md:p-5">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or SKU code"
              className="pl-9 h-11"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Filter className="h-3.5 w-3.5" /> Category
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Chip active={cat === "All"} onClick={() => setCat("All")}>All</Chip>
            {CATEGORIES.map((c) => (
              <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Condition</span>
          <Chip active={cond === "All"} onClick={() => setCond("All")}>All</Chip>
          {CONDITIONS.map((c) => (
            <Chip key={c} active={cond === c} onClick={() => setCond(c)}>{c}</Chip>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((sku) => {
          const added = inQuote(sku.id);
          const savings = Math.round((1 - sku.pricePerUnit / sku.retailPerUnit) * 100);
          return (
            <div
              key={sku.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={sku.image}
                  alt={sku.name}
                  loading="lazy"
                  width={800}
                  height={600}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 rounded-full bg-coral px-2.5 py-1 text-xs font-bold text-coral-foreground">
                  {savings}% off retail
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-muted-foreground">{sku.id}</span>
                  <span className="rounded-full bg-mission/15 px-2 py-0.5 font-semibold text-mission">
                    {sku.condition}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-xl font-bold text-primary">{sku.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground flex-1">{sku.blurb}</p>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-3xl font-black text-primary">
                    {formatMoney(sku.pricePerUnit)}
                  </span>
                  <span className="text-sm text-muted-foreground">/ unit</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {sku.unitsPerPallet} per pallet
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Pallet price{" "}
                  <span className="font-semibold text-foreground">
                    {formatMoney(sku.pricePerUnit * sku.unitsPerPallet)}
                  </span>
                </div>

                <Button
                  onClick={() => add(sku.id)}
                  variant={added ? "mission" : "default"}
                  className="mt-5 w-full"
                >
                  {added ? (
                    <>
                      <Check className="h-4 w-4" /> Added — add another
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" /> Add pallet to quote
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
            <p className="font-display text-xl text-primary">No SKUs match those filters.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try clearing a filter, or{" "}
              <Link to="/contact" className="underline underline-offset-4 hover:text-primary">
                ask us what's coming this week
              </Link>
              .
            </p>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="mt-14 rounded-3xl bg-primary text-primary-foreground p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-black">
            Ready to send your quote?
          </h2>
          <p className="mt-2 text-primary-foreground/75 max-w-xl">
            We confirm availability within one business day and arrange freight to your DC or store.
          </p>
        </div>
        <Button asChild variant="hero" size="xl">
          <Link to="/contact">
            <ShoppingBag className="h-5 w-5" /> Review your quote
          </Link>
        </Button>
      </div>
    </div>
  );
}

function Chip({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors border",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card text-muted-foreground border-border hover:text-primary hover:border-primary/40",
      )}
    >
      {children}
    </button>
  );
}
