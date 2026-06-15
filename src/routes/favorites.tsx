import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/lib/favorites-context";
import { Heart, ImageOff, ArrowLeft, X } from "lucide-react";

function formatMoney(n: number | null): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n < 100 ? 2 : 0,
  }).format(n);
}

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Your Favorites — Comeback Restock" },
      {
        name: "description",
        content: "Items you've saved from the Comeback Restock catalog.",
      },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { items, remove, hydrated } = useFavorites();

  return (
    <div className="container mx-auto max-w-6xl px-4 md:px-6 py-10 md:py-14">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link to="/catalog">
          <ArrowLeft className="h-4 w-4" /> Back to Catalog
        </Link>
      </Button>

      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-coral/15 text-coral">
          <Heart className="h-6 w-6 fill-current" />
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-black text-primary">
          Your Favorites
        </h1>
      </div>
      <p className="mt-3 text-muted-foreground">
        Saved items live here on this device. Send them over when you're ready
        for a quote.
      </p>

      {hydrated && items.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <Heart className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 font-display text-xl text-primary">
            No favorites yet.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Tap the heart on any catalog item to save it for later.
          </p>
          <Button asChild variant="hero" size="lg" className="mt-6">
            <Link to="/catalog">Browse Catalog</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((it) => (
            <div
              key={it.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                {it.image ? (
                  <img
                    src={it.image}
                    alt={it.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-muted-foreground">
                    <ImageOff className="h-8 w-8" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => remove(it.id)}
                  aria-label="Remove from favorites"
                  className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-background/85 backdrop-blur text-muted-foreground shadow-sm hover:bg-background hover:text-destructive"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {it.brand}
                  </span>
                  <span className="rounded-full bg-mission/15 px-2 py-0.5 text-xs font-semibold text-mission">
                    {it.category}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-lg font-bold text-primary line-clamp-2">
                  {it.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-display text-3xl font-black text-primary">
                    {formatMoney(it.price)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatMoney(it.msrp)}
                  </span>
                </div>
                <Button asChild variant="default" className="mt-5 w-full">
                  <Link to="/catalog">View in Catalog</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
