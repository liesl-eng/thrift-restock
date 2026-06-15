import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useQuote } from "@/lib/quote-context";
import { useFavorites } from "@/lib/favorites-context";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingBag, Recycle, Heart, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import comebackLogo from "@/assets/comeback-logo.avif.asset.json";

type NavItem = {
  to: "/" | "/catalog" | "/about";
  label: string;
  search?: { category?: string };
  match?: string;
};

const NAV: NavItem[] = [
  { to: "/", label: "Home" },
  { to: "/catalog", label: "Tables", search: { category: "Tables" }, match: "tables" },
  { to: "/catalog", label: "Lighting", search: { category: "Lighting" }, match: "lighting" },
  { to: "/catalog", label: "Mirrors", search: { category: "Mirrors" }, match: "mirrors" },
  { to: "/about", label: "About" },
];

export function SiteHeader() {
  const { items, hydrated } = useQuote();
  const { items: favItems, hydrated: favHydrated } = useFavorites();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.search }) as {
    category?: string;
  };
  const count = items.length;
  const favCount = favItems.length;

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="w-full flex h-16 items-center justify-between gap-4 px-5 md:px-6">
        <Link to="/" className="flex items-center gap-2 group mr-6">
          <img
            src={comebackLogo.url}
            alt="Comeback Goods"
            className="h-9 w-9 rounded-full object-cover"
          />
          <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground transition-transform group-hover:rotate-12">
            <Recycle className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-black uppercase tracking-tighter">
            Comeback<span className="text-mission ml-1">Restock</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((n) => {
            const isCatalog = n.to === "/catalog";
            const active = isCatalog
              ? pathname.startsWith("/catalog") &&
                n.match != null &&
                (search?.category ?? "").toLowerCase() === n.match
              : n.to === "/"
                ? pathname === "/"
                : pathname === n.to || pathname.startsWith(n.to);
            return (
              <Link
                key={`${n.to}-${n.label}`}
                to={n.to}
                search={n.search as never}
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
          <Button asChild variant="ghost" size="sm" className="relative" aria-label="Favorites">
            <Link to="/favorites">
              <Heart className="h-4 w-4" />
              {favHydrated && favCount > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1.5 text-xs font-bold text-coral-foreground">
                  {favCount}
                </span>
              )}
            </Link>
          </Button>
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
          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-muted-foreground max-w-[160px] truncate" title={user.email ?? ""}>
                {user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          ) : (
            <Button asChild variant="hero" size="sm" className="hidden sm:inline-flex">
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
