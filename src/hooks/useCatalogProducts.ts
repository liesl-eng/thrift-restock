import { useEffect, useState } from "react";
import { fetchAllProducts, SheetRow } from "@/lib/productSheet";
import meridianBlack from "@/assets/meridian-black.webp.asset.json";
import meridianBrushedSteel from "@/assets/meridian-brushed-steel.webp.asset.json";

// Manual image overrides for specific products (matched by name substring).
const IMAGE_OVERRIDES: { match: RegExp; url: string }[] = [
  { match: /meridian.*brushed\s*steel/i, url: meridianBrushedSteel.url },
  { match: /meridian.*black/i,           url: meridianBlack.url },
];

function applyOverrides(rows: SheetRow[]): SheetRow[] {
  return rows.map((r) => {
    const ov = IMAGE_OVERRIDES.find((o) => o.match.test(r.name));
    return ov ? { ...r, imageUrl: ov.url } : r;
  });
}

type State = {
  products: SheetRow[];
  loading: boolean;
  error: string | null;
};

// Module-level cache so all category pages share one fetch per session.
let cache: SheetRow[] | null = null;
let inflight: Promise<SheetRow[]> | null = null;

export function useCatalogProducts(): State {
  const [state, setState] = useState<State>({
    products: cache ?? [],
    loading: !cache,
    error: null,
  });

  useEffect(() => {
    if (cache) return;
    let cancelled = false;
    if (!inflight) inflight = fetchAllProducts().then(applyOverrides);
    inflight
      .then((rows) => {
        cache = rows;
        if (!cancelled) setState({ products: rows, loading: false, error: null });
      })
      .catch((e) => {
        if (!cancelled)
          setState({
            products: [],
            loading: false,
            error: e instanceof Error ? e.message : "Failed to load products",
          });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
