import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCatalogProducts } from "@/hooks/useCatalogProducts";
import type { SheetRow } from "@/lib/productSheet";
import { useQuote } from "@/lib/quote-context";
import { Check, Plus, Search, ShoppingBag, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import meridianBrushedSteel from "@/assets/meridian-brushed-steel.webp.asset.json";

function formatMoney(n: number | null): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n < 100 ? 2 : 0,
  }).format(n);
}

function skuId(sku: SheetRow): string {
  return `${sku.brand}::${sku.name}`;
}

const IMAGE_OVERRIDES: { match: string[]; url: string }[] = [
  { match: ["meridian", "brushed steel"], url: meridianBrushedSteel.url },
];

function imageForSku(sku: SheetRow): string | null {
  const hay = `${sku.brand} ${sku.name}`.toLowerCase();
  for (const o of IMAGE_OVERRIDES) {
    if (o.match.every((m) => hay.includes(m.toLowerCase()))) return o.url;
  }
  return sku.imageUrl ?? null;
}

const CATEGORY_TABS = ["All", "Lighting", "Mirrors", "Tables"] as const;
type Category = (typeof CATEGORY_TABS)[number];

type SortKey = "featured" | "price-asc" | "price-desc" | "name" | "qty-asc" | "qty-desc";

export const Route = createFileRoute("/catalog")({
  head: () => ({
    meta: [
      { title: "Catalog — Comeback Restock" },
      {
        name: "description",
        content: "Live thrift inventory — Lighting, Mirrors, Tables and more. Updated daily.",
      },
    ],
  }),
  component: CatalogPage,
});

function CatalogPage() {
  const { products, loading, error } = useCatalogProducts();
  const VISIBLE_CATEGORIES = ["Lighting", "Mirrors", "Tables"];
  const visibleProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          VISIBLE_CATEGORIES.includes((p.category ?? "").trim()) &&
          (p.brand ?? "").trim().toLowerCase() !== "vesta",
      ),
    [products],
  );
  const [category, setCategory] = useState<Category>("All");
  const [brand, setBrand] = useState<string>("All");
  const [sort, setSort] = useState<SortKey>("qty-desc");
  const [query, setQuery] = useState("");
  const { add, items } = useQuote();

  const inCategory = useMemo(
    () =>
      category === "All"
        ? visibleProducts
        : visibleProducts.filter(
            (p) =>
              (p.category ?? "").trim().toLowerCase() ===
              category.toLowerCase(),
          ),
    [visibleProducts, category],
  );

  const brands = useMemo(
    () =>
      Array.from(new Set(inCategory.map((s) => s.brand).filter(Boolean))).sort(),
    [inCategory],
  );

  const filtered = useMemo(() => {
    const list = inCategory.filter((s) => {
      if (brand !== "All" && s.brand !== brand) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !s.name.toLowerCase().includes(q) &&
          !(s.brand ?? "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });

    const sorted = [...list];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case "price-desc":
        sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case "name":
        sorted.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
        break;
      case "qty-asc":
        sorted.sort((a, b) => a.unitsAvailable - b.unitsAvailable);
        break;
      case "qty-desc":
        sorted.sort((a, b) => b.unitsAvailable - a.unitsAvailable);
        break;
      case "featured":
      default:
        sorted.sort(
          (a, b) =>
            (b.unitsAvailable > 0 ? 1 : 0) - (a.unitsAvailable > 0 ? 1 : 0),
        );
    }
    return sorted;
  }, [inCategory, brand, query, sort]);

  const inQuote = (id: string) => items.some((i) => i.id === id);

  const selectCategory = (c: Category) => {
    setCategory(c);
    setBrand("All");
  };

  const addSku = (sku: SheetRow) => {
    add({
      id: skuId(sku),
      name: sku.name,
      brand: sku.brand ?? "",
      category: sku.category ?? "",
      image: sku.imageUrl ?? "",
      price: sku.price ?? 0,
      msrp: sku.msrp ?? sku.price ?? 0,
      units: sku.unitsAvailable,
      lastUpdated: sku.sourceLastUpdated ?? "",
    });
  };

  if (loading)
    return (
      <div className="container mx-auto px-4 md:px-6 py-20 text-center">
        <p className="font-display text-2xl text-primary">Loading live inventory…</p>
      </div>
    );

  if (error)
    return (
      <div className="container mx-auto px-4 md:px-6 py-20 text-center">
        <p className="text-destructive">{error}</p>
      </div>
    );

  return (
    <div>
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-end gap-8 md:gap-12 overflow-x-auto">
            {CATEGORY_TABS.map((c) => {
              const active = category === c;
              return (
                <button
                  key={c}
                  onClick={() => selectCategory(c)}
                  className={cn(
                    "relative py-5 font-display text-base md:text-lg font-black uppercase tracking-wider whitespace-nowrap transition-colors",
                    active
                      ? "text-gold"
                      : "text-primary-foreground/70 hover:text-primary-foreground",
                  )}
                >
                  {c}
                  {active && (
                    <span className="absolute left-0 right-0 -bottom-px h-1 bg-gold rounded-t" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-b border-border bg-muted/40">
        <div className="container mx-auto px-4 md:px-6 py-4 flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-3 flex-wrap flex-1">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Filter by Brand:</span>
            <BrandChip active={brand === "All"} onClick={() => setBrand("All")}>All Brands</BrandChip>
            {brands.map((b) => (
              <BrandChip key={b} active={brand === b} onClick={() => setBrand(b)}>{b}</BrandChip>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-[180px] bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
                <SelectItem value="qty-desc">Quantity: High to Low</SelectItem>
                <SelectItem value="qty-asc">Quantity: Low to High</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="name">Name: A–Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8 md:py-10">
        <div className="mb-6 max-w-md">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={category === "All" ? "Search catalog…" : `Search ${category.toLowerCase()}…`}
              className="pl-9 h-11"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((sku, i) => {
            const id = skuId(sku);
            return (
              <SkuCard
                key={`${id}-${i}`}
                sku={sku}
                added={inQuote(id)}
                onAdd={() => addSku(sku)}
              />
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
              <p className="font-display text-xl text-primary">
                No {category === "All" ? "items" : category.toLowerCase()} match those filters.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try clearing a filter, or{" "}
                <Link to="/contact" className="underline underline-offset-4 hover:text-primary">
                  ask us what's coming this week
                </Link>.
              </p>
            </div>
          )}
        </div>

        <div className="mt-14 rounded-3xl bg-primary text-primary-foreground p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-black">Ready to send your quote?</h2>
            <p className="mt-2 text-primary-foreground/75 max-w-xl">
              We confirm availability within one business day and arrange freight to your DC or store.
            </p>
          </div>
          <Button asChild variant="hero" size="xl">
            <Link to="/contact"><ShoppingBag className="h-5 w-5" /> Review your quote</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function SkuCard({ sku, added, onAdd }: { sku: SheetRow; added: boolean; onAdd: () => void }) {
  const imgSrc = imageForSku(sku);
  const salePrice = sku.msrp != null ? Math.round(sku.msrp * 0.2 * 100) / 100 : sku.price;
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={sku.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground">
            <ImageOff className="h-8 w-8" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold uppercase tracking-wider text-muted-foreground">{sku.brand}</span>
          <span className="rounded-full bg-mission/15 px-2 py-0.5 font-semibold text-mission">{sku.category}</span>
        </div>
        <h3 className="mt-2 font-display text-lg font-bold text-primary line-clamp-2">{sku.name}</h3>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-display text-3xl font-black text-primary">{formatMoney(salePrice)}</span>
          <span className="text-sm text-muted-foreground line-through">{formatMoney(sku.msrp)}</span>
          <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-gold-foreground">80% off</span>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {sku.unitsAvailable > 0 ? (
            <><span className="font-semibold text-foreground">{sku.unitsAvailable}</span> units available</>
          ) : (
            <span className="text-destructive">Out of stock</span>
          )}
        </div>
        <Button
          onClick={onAdd}
          disabled={sku.unitsAvailable === 0}
          variant={added ? "mission" : "default"}
          className="mt-5 w-full"
        >
          {added ? <><Check className="h-4 w-4" /> Added — add another</> : <><Plus className="h-4 w-4" /> Add to quote</>}
        </Button>
      </div>
    </div>
  );
}

function BrandChip({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md px-4 py-2 text-sm font-medium transition-colors border",
        active
          ? "bg-gold text-gold-foreground border-gold shadow-sm"
          : "bg-card border-border text-foreground hover:border-primary/40 hover:text-primary",
      )}
    >
      {children}
    </button>
  );
}
