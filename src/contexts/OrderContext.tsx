import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const ORDER_MOQ = 8000;
const STORAGE_KEY = "comeback_restock_order";

export type OrderItem = {
  id: string;
  productName: string;
  brand: string;
  imageUrl: string;
  msrp: number;
  yourPrice: number;
  quantity: number;
  unitsAvailable: number;
};

export type BuyerInfo = {
  storeName: string;
  contactName: string;
  email: string;
  phone: string;
  notes: string;
};

const emptyBuyer: BuyerInfo = {
  storeName: "",
  contactName: "",
  email: "",
  phone: "",
  notes: "",
};

type OrderTotals = {
  itemCount: number;
  grandTotal: number;
  grandMsrp: number;
  savings: number;
  moqMet: boolean;
  moqRemaining: number;
};

type OrderContextValue = {
  items: OrderItem[];
  buyerInfo: BuyerInfo;
  addItem: (item: Omit<OrderItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  setBuyerInfo: (info: BuyerInfo) => void;
  clearOrder: () => void;
  totals: OrderTotals;
};

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [buyerInfo, setBuyerInfoState] = useState<BuyerInfo>(emptyBuyer);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined"
          ? window.localStorage.getItem(STORAGE_KEY)
          : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
        else if (parsed && Array.isArray(parsed.items)) {
          setItems(parsed.items);
          if (parsed.buyerInfo) setBuyerInfoState({ ...emptyBuyer, ...parsed.buyerInfo });
        }
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, hydrated]);

  const addItem: OrderContextValue["addItem"] = useCallback((incoming) => {
    setItems((prev) => {
      const qty = incoming.quantity ?? 1;
      const existing = prev.find((i) => i.id === incoming.id);
      if (existing) {
        const cap = incoming.unitsAvailable || existing.unitsAvailable || 9999;
        const next = Math.min(existing.quantity + qty, cap);
        return prev.map((i) =>
          i.id === incoming.id ? { ...i, quantity: next, unitsAvailable: cap } : i,
        );
      }
      const cap = incoming.unitsAvailable || 9999;
      return [
        ...prev,
        {
          id: incoming.id,
          productName: incoming.productName,
          brand: incoming.brand,
          imageUrl: incoming.imageUrl,
          msrp: incoming.msrp,
          yourPrice: incoming.yourPrice,
          unitsAvailable: cap,
          quantity: Math.min(qty, cap),
        },
      ];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, quantity: Math.max(1, Math.min(qty, i.unitsAvailable || 9999)) }
          : i,
      ),
    );
  }, []);

  const setBuyerInfo = useCallback((info: BuyerInfo) => {
    setBuyerInfoState(info);
  }, []);

  const clearOrder = useCallback(() => {
    setItems([]);
    setBuyerInfoState(emptyBuyer);
  }, []);

  const totals: OrderTotals = useMemo(() => {
    let itemCount = 0;
    let grandTotal = 0;
    let grandMsrp = 0;
    for (const i of items) {
      itemCount += i.quantity;
      grandTotal += i.yourPrice * i.quantity;
      grandMsrp += i.msrp * i.quantity;
    }
    const savings = grandMsrp - grandTotal;
    const moqMet = grandTotal >= ORDER_MOQ;
    const moqRemaining = Math.max(0, ORDER_MOQ - grandTotal);
    return { itemCount, grandTotal, grandMsrp, savings, moqMet, moqRemaining };
  }, [items]);

  const value: OrderContextValue = {
    items,
    buyerInfo,
    addItem,
    removeItem,
    updateQty,
    setBuyerInfo,
    clearOrder,
    totals,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used within OrderProvider");
  return ctx;
}
