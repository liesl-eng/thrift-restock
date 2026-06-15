import { useEffect, useState } from "react";
import { fetchAllProducts, SheetRow } from "@/lib/productSheet";

import meridianBrushedSteel from "@/assets/meridian-brushed-steel.webp.asset.json";

// Manual image overrides for specific products (matched by name substring).
const IMAGE_OVERRIDES: { match: RegExp; url: string }[] = [

  { match: /meridian.*brushed\s*steel/i, url: meridianBrushedSteel.url },

  { match: /^Chloe Sofa Bed, Dark Gray Component 1 &2$/i, url: "https://storage.googleapis.com/floorfound-prod-cdn/castlery/products/images/b6120352-48cb-4611-8526-cafd4d01f91a.png" },

  { match: /^Logan 45" Solid Wood Console Table$/i, url: "https://mopio.com/cdn/shop/files/08_Lifestyle_Image_1c2e46d8-fe12-47ea-a304-35b947e9febc.jpg" },

  { match: /^Logan Round Solid Wood Coffee Table$/i, url: "https://mopio.com/cdn/shop/files/01a_MainImage_Round_PNG.png" },

  { match: /^Logan Rectangle Solid Wood Coffee Table$/i, url: "https://mopio.com/cdn/shop/files/01a_MainImage_Rectangle_PNG.png" },

  { match: /^Logan 72"-103" Solid Wood Extendable Dining Table$/i, url: "https://mopio.com/cdn/shop/files/01a_Main_Image_59_Inch_PNG_ee26ba7c-4f6a-4190-a40e-814beb53d11d.png" },

  { match: /^Sterling Table Top 53"/i, url: "https://mopio.com/cdn/shop/files/Oak_PNG.jpg" },

  { match: /^Blake Chest Coffee Table, White Oak$/i, url: "https://mopio.com/cdn/shop/files/01b_Main_Image_PNG__dotcom_d65099d8-d8b9-4c45-aec8-a3d9fdbc3818.png" },

  { match: /^Blake Chest Coffee Table, Black Oak$/i, url: "https://mopio.com/cdn/shop/files/01b_Main_Image_PNG__dotcom.png" },

  { match: /^Hannah Floating Nightstand, Oak$/i, url: "https://mopio.com/cdn/shop/files/01-Main_Image_HannahFloatingNightstand_88041e74-8477-42a1-9c90-e94d20c76e00.png" },

  { match: /^Quin Side Table, Light Oak$/i, url: "https://mopio.com/cdn/shop/files/01a-MainImage_3d34e815-9381-41e3-a0e4-011620f47e57.jpg" },

  { match: /^Quin Side Table, Black$/i, url: "https://mopio.com/cdn/shop/files/01a-MainImage_7fbd583b-fb43-4eac-8dc4-a16c2097f296.jpg?v=1716199941&width=1500" },

  { match: /^Quin Coffee Table, Light Oak$/i, url: "https://mopio.com/cdn/shop/files/01a-MainImage_de8d744b-0a0e-4acd-a5b6-64f8e5e0ddee.jpg" },

  { match: /^Quin Coffee Table, Black$/i, url: "https://mopio.com/cdn/shop/files/Quinn-Coffee-Table-Black-Angle_1.png" },

  { match: /^Quin 59" Tambour TV Stand, Walnut$/i, url: "https://mopio.com/cdn/shop/files/Quinn-TV-Stand-Walnut-Angle.png" },

  { match: /^Quin 59" Tambour TV Stand, Black$/i, url: "https://mopio.com/cdn/shop/files/Quinn-TV-Stand-Black-Angle.png" },

  { match: /^Odelia Counter Stool Set of 2, Pearl White Boucle$/i, url: "https://mopio.com/cdn/shop/files/01.2c-MainImage_PNG_PWB.jpg" },

  { match: /^Odelia Counter Stool Set of 2, Outdoor Beige$/i, url: "https://mopio.com/cdn/shop/files/01.2b-MainImage_PNG_Beige_fbfeda1f-dbab-4560-812a-ff7d07795463.jpg" },

  { match: /^Odelia Bistro Dining Table$/i, url: "https://mopio.com/cdn/shop/files/01b-MainImage_PNG.jpg" },

  { match: /^Odelia Dining Chair Set of 2, Olive Green Velvet$/i, url: "https://mopio.com/cdn/shop/files/01.2a-MainImage_x2PNG_OliveGreen.jpg" },

  { match: /^Odelia Dining Chair Set of 2, Pearl White Boucle$/i, url: "https://mopio.com/cdn/shop/files/01.2c_-_Main_Image_x2_PNG_PWB.jpg" },

];

const CATEGORY_OVERRIDES: { match: RegExp; category: string }[] = [
  { match: /^Quin Side Table, Light Oak$/, category: "Tables" },
  { match: /^Quin Coffee Table, Light Oak$/, category: "Tables" },
];

function applyOverrides(rows: SheetRow[]): SheetRow[] {
  return rows.map((r) => {
    const imgOv = IMAGE_OVERRIDES.find((o) => o.match.test(r.name));
    const catOv = CATEGORY_OVERRIDES.find((o) => o.match.test(r.name));
    return {
      ...r,
      imageUrl: imgOv ? imgOv.url : r.imageUrl,
      category: catOv ? catOv.category : r.category,
    };
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
    const start = Date.now();
    if (!inflight) inflight = fetchAllProducts().then(applyOverrides);
    inflight
      .then((rows) => {
        cache = rows;
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, 700 - elapsed);
        setTimeout(() => {
          if (!cancelled) setState({ products: rows, loading: false, error: null });
        }, remaining);
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
