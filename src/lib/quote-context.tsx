import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CATALOG, type Sku } from "./catalog";

interface QuoteItem {
  skuId: string;
  pallets: number;
}

interface QuoteContextValue {
  items: QuoteItem[];
  add: (skuId: string, pallets?: number) => void;
  setQty: (skuId: string, pallets: number) => void;
  remove: (skuId: string) => void;
  clear: () => void;
  totalUnits: number;
  totalPrice: number;
  totalRetail: number;
  hydrated: boolean;
}

const QuoteContext = createContext<QuoteContextValue | null>(null);
const STORAGE_KEY = "goodwill-quote-v1";

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
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

  const add = useCallback((skuId: string, pallets = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.skuId === skuId);
      if (existing) {
        return prev.map((i) => (i.skuId === skuId ? { ...i, pallets: i.pallets + pallets } : i));
      }
      return [...prev, { skuId, pallets }];
    });
  }, []);

  const setQty = useCallback((skuId: string, pallets: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.skuId === skuId ? { ...i, pallets: Math.max(0, pallets) } : i))
        .filter((i) => i.pallets > 0),
    );
  }, []);

  const remove = useCallback((skuId: string) => {
    setItems((prev) => prev.filter((i) => i.skuId !== skuId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const { totalUnits, totalPrice, totalRetail } = useMemo(() => {
    let units = 0;
    let price = 0;
    let retail = 0;
    for (const item of items) {
      const sku: Sku | undefined = CATALOG.find((s) => s.id === item.skuId);
      if (!sku) continue;
      const u = sku.unitsPerPallet * item.pallets;
      units += u;
      price += u * sku.pricePerUnit;
      retail += u * sku.retailPerUnit;
    }
    return { totalUnits: units, totalPrice: price, totalRetail: retail };
  }, [items]);

  const value: QuoteContextValue = {
    items,
    add,
    setQty,
    remove,
    clear,
    totalUnits,
    totalPrice,
    totalRetail,
    hydrated,
  };

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}

export function useQuote() {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error("useQuote must be used inside QuoteProvider");
  return ctx;
}
