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

function formatMoney(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n < 100 ? 2 : 0,
  }).format(n);
}

function skuId(sku: SheetRow): string {
  return `${sku.brand}::${sku.name}`;
}

const DISCOUNT_RATE = 0.8; // 80% off MSRP

function discountedPrice(sku: SheetRow): number {
  const msrp = sku.msrp ?? 0;
  return msrp > 0 ? Math.round(msrp * (1 - DISCOUNT_RATE) * 100) / 100 : sku.price ?? 0;
}

function percentOff(_sku: SheetRow): number {
  return 80;
}

// Manual image overrides — matched by case-insensitive substring against `${brand} ${name}`.
const IMAGE_OVERRIDES: { match: string[]; url?: string; imgClassName?: string }[] = [
  {
    match: ["meridian", "brushed steel"],
    url: meridianBrushedSteel.url,
  },
  {
    match: ["meridian", "black"],
    imgClassName: "scale-[1.6] -translate-y-10",
  },
];

function overrideForSku(sku: SheetRow) {
  const hay = `${sku.brand} ${sku.name}`.toLowerCase();
  for (const o of IMAGE_OVERRIDES) {
    if (o.match.every((m) => hay.includes(m.toLowerCase()))) return o;
  }
  return null;
}

type SortKey = "featured" | "price-asc" | "price-desc" | "savings" | "name";

export const Route = createFileRoute("/catalog")({
  head: () => ({
    meta: [
      { title: "Catalog — Pick the SKUs your store actually needs" },
      {
        name: "description",
        content:
          "Live, pick-by-SKU catalog of returned and overstock inventory. Filter by brand and category. Updated daily at noon ET.",
      },
      { property: "og:title", content: "Comeback Restock Catalog" },
      { property: "og:description", content: "Pick-by-SKU inventory for nonprofit thrift." },
    ],
  }),
  component: CatalogInner,
});

function matchesCategory(sku: SheetRow, cat: string): boolean {
  if (cat === "All") return true;
  return (sku.category ?? "").trim().toLowerCase() === cat.trim().toLowerCase();
}

function isHiddenBrand(sku: SheetRow): boolean {
  return (sku.brand ?? "").trim().toLowerCase() === "vesta";
}

function CatalogInner() {
  const { products: all, loading, error } = useCatalogProducts();
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(all.map((s) => s.category ?? "").filter(Boolean))).sort()],
    [all],
  );
  const [category, setCategory] = useState<string>("All");
  const [brand, setBrand] = useState<string>("All");
  const [sort, setSort] = useState<SortKey>("featured");
  const [query, setQuery] = useState("");
  const { add, items } = useQuote();

  const byCategory = useMemo(
    () => all.filter((s) => !isHiddenBrand(s) && matchesCategory(s, category)),
    [all, category],
  );

  const brands = useMemo(
    () => Array.from(new Set(byCategory.map((s) => s.brand))).sort(),
    [byCategory],
  );

  const filtered = useMemo(() => {
    const list = byCategory.filter((s) => {
      if (brand !== "All" && (s.brand ?? "").trim().toLowerCase() !== brand.trim().toLowerCase()) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.brand.toLowerCase().includes(q))
          return false;
      }
      return true;
    });
    const sorted = [...list];
    const p = (x: SheetRow) => discountedPrice(x);
    const m = (x: SheetRow) => x.msrp ?? 0;
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => p(a) - p(b));
        break;
      case "price-desc":
        sorted.sort((a, b) => p(b) - p(a));
        break;
      case "savings":
        sorted.sort((a, b) => (m(b) - p(b)) / (m(b) || 1) - (m(a) - p(a)) / (m(a) || 1));
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "featured":
      default:
        sorted.sort((a, b) => (b.unitsAvailable > 0 ? 1 : 0) - (a.unitsAvailable > 0 ? 1 : 0));
    }
    return sorted;
  }, [byCategory, brand, query, sort]);

  const inQuote = (id: string) => items.some((i) => i.id === id);

  const addSku = (sku: SheetRow) => {
    add({
      id: skuId(sku),
      name: sku.name,
      brand: sku.brand,
      category: sku.category ?? "",
      image: sku.imageUrl,
      price: discountedPrice(sku),
      msrp: sku.msrp ?? 0,
      units: sku.unitsAvailable,
    } as unknown as Parameters<typeof add>[0]);
  };

  const selectCategory = (c: string) => {
    setCategory(c);
    setBrand("All");
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
      {/* Hero */}
      <div className="container mx-auto px-4 md:px-6 pt-12 md:pt-16 pb-6">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 text-sm md:text-base font-bold uppercase tracking-widest text-mission">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mission opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-mission"></span>
            </span>
            Live catalog
          </span>
          <h1 className="mt-3 font-display text-4xl md:text-6xl font-black text-primary">
            Pick exactly what your{" "}
            <span className="marker-highlight marker-highlight-gold">floor needs</span>.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Every SKU below is pulled live from our warehouse sheet, refreshed
            daily at noon ET. Build a quote, hit send, and we'll confirm within
            one business day.
          </p>
        </div>
      </div>

      {/* Category tabs - navy bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-end gap-8 md:gap-12 overflow-x-auto">
            {categories.map((c) => {
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

      {/* Filter + Sort bar */}
      <div className="border-b border-border bg-muted/40">
      <div className="container mx-auto px-4 md:px-6 py-4 flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-3 flex-wrap flex-1">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Filter by Brand:
            </span>
            <BrandChip
              active={brand === "All"}
              onClick={() => setBrand("All")}
            >
              All Brands
            </BrandChip>
            {brands.map((b) => (
              <BrandChip
                key={b}
                active={brand === b}
                onClick={() => setBrand(b)}
              >
                {b}
              </BrandChip>
            ))}
            {brands.length === 0 && (
              <span className="text-xs text-muted-foreground italic">
                No brands in this category yet.
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Sort by:
            </span>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-[180px] bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="savings">Biggest savings</SelectItem>
                <SelectItem value="name">Name: A–Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8 md:py-10">
        {/* Search */}
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

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((sku) => {
            const id = skuId(sku);
            return (
              <SkuCard
                key={id}
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
              We confirm availability within one business day and arrange freight
              to your DC or store.
            </p>
          </div>
          <Button asChild variant="hero" size="xl">
            <Link to="/contact">
              <ShoppingBag className="h-5 w-5" /> Review your quote
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function SkuCard({ sku, added, onAdd }: { sku: SheetRow; added: boolean; onAdd: () => void }) {
  const override = overrideForSku(sku);
  const imgSrc = override?.url ?? sku.imageUrl;
  const salePrice = discountedPrice(sku);
  const off = percentOff(sku);
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={sku.name}
            loading="lazy"
            className={cn(
              "h-full w-full object-cover transition-transform duration-700 group-hover:scale-105",
              override?.imgClassName,
            )}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground">
            <ImageOff className="h-8 w-8" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold uppercase tracking-wider text-muted-foreground">
            {sku.brand}
          </span>
          <span className="rounded-full bg-mission/15 px-2 py-0.5 font-semibold text-mission">
            {sku.category}
          </span>
        </div>
        <h3 className="mt-2 font-display text-lg font-bold text-primary line-clamp-2">
          {sku.name}
        </h3>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-display text-3xl font-black text-primary">
            {formatMoney(salePrice)}
          </span>
          <span className="text-sm text-muted-foreground line-through">
            {formatMoney(sku.msrp ?? 0)}
          </span>
          {off > 0 && (
            <span className="ml-1 rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-gold-foreground">
              {off}% off
            </span>
          )}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {sku.unitsAvailable > 0 ? (
            <>
              <span className="font-semibold text-foreground">{sku.unitsAvailable}</span> units
              available
            </>
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
          {added ? (
            <>
              <Check className="h-4 w-4" /> Added — add another
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Add to quote
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function BrandChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
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
