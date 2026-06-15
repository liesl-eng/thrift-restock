import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SheetRow } from "@/lib/productSheet";

export interface FavoriteItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  price: number;
  msrp: number;
  unitsAvailable: number;
}

interface FavoritesContextValue {
  items: FavoriteItem[];
  ids: Set<string>;
  toggle: (item: FavoriteItem) => void;
  remove: (id: string) => void;
  isFavorite: (id: string) => boolean;
  hydrated: boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);
const STORAGE_KEY = "comeback-favorites-v1";

export function favoriteIdFor(sku: Pick<SheetRow, "brand" | "name">) {
  return `${sku.brand}::${sku.name}`;
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined"
          ? window.localStorage.getItem(STORAGE_KEY)
          : null;
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, hydrated]);

  const toggle = useCallback((item: FavoriteItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === item.id)) {
        return prev.filter((i) => i.id !== item.id);
      }
      return [...prev, item];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const ids = useMemo(() => new Set(items.map((i) => i.id)), [items]);
  const isFavorite = useCallback((id: string) => ids.has(id), [ids]);

  return (
    <FavoritesContext.Provider
      value={{ items, ids, toggle, remove, isFavorite, hydrated }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used inside FavoritesProvider");
  return ctx;
}
