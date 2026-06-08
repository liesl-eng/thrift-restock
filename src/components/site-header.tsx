import { Link, useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useQuote } from "@/lib/quote-context";
import { ShoppingBag, Recycle } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/catalog", label: "Catalog" },
  { to: "/impact", label: "Impact" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/faq", label: "FAQ" },
] as const;

export function SiteHeader() {
  const { items, hydrated } = useQuote();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const count = items.reduce((sum, i) => sum + i.pallets, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground transition-transform group-hover:rotate-12">
            <Recycle className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-black uppercase tracking-tight">
            Comeback <span className="text-mission">×</span> Goodwill
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((n) => {
            const active = pathname === n.to || (n.to !== "/" && pathname.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  active
                    ? "text-primary bg-secondary"
                    : "text-muted-foreground hover:text-primary hover:bg-secondary/60",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="relative">
            <Link to="/contact">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Quote</span>
              {hydrated && count > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1.5 text-xs font-bold text-coral-foreground">
                  {count}
                </span>
              )}
            </Link>
          </Button>
          <Button asChild variant="hero" size="sm" className="hidden sm:inline-flex">
            <Link to="/contact">Talk to us</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
