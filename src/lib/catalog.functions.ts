import { createServerFn } from "@tanstack/react-start";
import type { Sku } from "./catalog-types";

const SPREADSHEET_ID = "1ItM29QVpYh85ESpMLWVJjg13RP-ACHkSPRcGtL21yl8";
const TABS = [
  "Modus Furniture",
  "Ferm Living",
  "Arteriors Home",
  "Havenly",
  "Hem",
  "Vesta",
  "Castlery",
];

// ---------- helpers ----------

function parseMoney(v: string | undefined): number {
  if (!v) return 0;
  const n = Number(String(v).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function parseInt0(v: string | undefined): number {
  if (!v) return 0;
  const n = parseInt(String(v).replace(/[^0-9-]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

function stableId(brand: string, name: string): string {
  return `${slug(brand)}-${hash(brand + "|" + name)}`;
}

function checkPassword(pw: string | undefined): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !pw) return false;
  if (pw.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= pw.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

// Internal "fetched row" shape (what we got from the sheet)
type FetchedRow = {
  name: string;
  brand: string;
  category: string;
  image_url: string;
  image_filename: string | null;
  price: number;
  msrp: number;
  units_available: number;
  source_last_updated: string | null;
};

async function fetchFromSheet(): Promise<Map<string, FetchedRow[]>> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const sheetKey = process.env.GOOGLE_SHEETS_API_KEY;
  if (!lovableKey || !sheetKey) {
    throw new Error("Google Sheets connector not configured");
  }
  const params = TABS.map(
    (t) => `ranges=${encodeURIComponent(`'${t}'!A2:I`)}`,
  ).join("&");
  const url = `https://connector-gateway.lovable.dev/google_sheets/v4/spreadsheets/${SPREADSHEET_ID}/values:batchGet?${params}&majorDimension=ROWS`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": sheetKey,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Sheets gateway ${res.status}: ${body.slice(0, 200)}`);
  }
  const json = (await res.json()) as {
    valueRanges?: { values?: string[][] }[];
  };

  const byBrand = new Map<string, FetchedRow[]>();
  json.valueRanges?.forEach((vr, tabIdx) => {
    const brand = TABS[tabIdx];
    const list: FetchedRow[] = [];
    vr.values?.forEach((row) => {
      const [name, sheetBrand, category, image, price, msrp, , units, updated] =
        row;
      if (!name) return;
      const priceN = parseMoney(price);
      const msrpN = parseMoney(msrp);
      if (!priceN) return;
      const unitsN = parseInt0(units);
      const finalBrand = (sheetBrand || brand || "").trim();
      const finalCat = (category || "Uncategorized").trim();
      const img =
        image && image !== "N/A" && image.startsWith("http") ? image : "";
      list.push({
        name: String(name).trim(),
        brand: finalBrand,
        category: finalCat,
        image_url: img,
        image_filename: null,
        price: priceN,
        msrp: msrpN || priceN,
        units_available: unitsN,
        source_last_updated: updated ? new Date(updated).toISOString() : null,
      });
    });
    byBrand.set(brand, list);
  });
  for (const t of TABS) if (!byBrand.has(t)) byBrand.set(t, []);
  return byBrand;
}

function productToSku(p: any): Sku {
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category ?? "",
    image: p.image_url ?? "",
    price: Number(p.price ?? 0),
    msrp: Number(p.msrp ?? p.price ?? 0),
    units: p.units_available ?? 0,
    lastUpdated: p.source_last_updated ?? p.updated_at ?? "",
  };
}

function fetchedToSku(f: FetchedRow): Sku {
  return {
    id: stableId(f.brand, f.name),
    name: f.name,
    brand: f.brand,
    category: f.category,
    image: f.image_url,
    price: f.price,
    msrp: f.msrp,
    units: f.units_available,
    lastUpdated: f.source_last_updated ?? "",
  };
}

// ---------- PUBLIC: live catalog ----------

export const getCatalog = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ items: Sku[]; fetchedAt: string }> => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(
        "id, name, brand, category, image_url, price, msrp, units_available, source_last_updated, updated_at",
      );
    if (error) throw new Error(error.message);
    const items = (data ?? []).map(productToSku);
    let latest = 0;
    for (const p of data ?? []) {
      const t = new Date((p as any).updated_at as string).getTime();
      if (t > latest) latest = t;
    }
    return {
      items,
      fetchedAt: latest
        ? new Date(latest).toISOString()
        : new Date(0).toISOString(),
    };
  },
);

// ---------- ADMIN ----------

export const verifyAdmin = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => d)
  .handler(async ({ data }) => ({ ok: checkPassword(data.password) }));

type BrandStatus = {
  brand: string;
  liveCount: number;
  liveApprovedAt: string | null;
  stagedCount: number | null;
  stagedFetchedAt: string | null;
  added: number;
  removed: number;
  changed: number;
  hasStaged: boolean;
};

type RunRow = {
  id: string;
  brand: string;
  status: string;
  started_at: string;
  finished_at: string | null;
  fetched_count: number | null;
  new_count: number | null;
  changed_count: number | null;
  removed_count: number | null;
  error_message: string | null;
};

export const getAdminStatus = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => d)
  .handler(
    async ({
      data,
    }): Promise<{ brands: BrandStatus[]; runs: RunRow[] }> => {
      if (!checkPassword(data.password)) throw new Error("Unauthorized");
      const { supabaseAdmin } = await import(
        "@/integrations/supabase/client.server"
      );

      const [{ data: products }, { data: runs }] = await Promise.all([
        supabaseAdmin
          .from("products")
          .select("brand, updated_at"),
        supabaseAdmin
          .from("product_import_runs")
          .select("*")
          .order("started_at", { ascending: false })
          .limit(50),
      ]);

      // Live counts + last-updated by brand
      const liveCount = new Map<string, number>();
      const liveLatest = new Map<string, string>();
      for (const p of products ?? []) {
        const b = (p as any).brand as string;
        liveCount.set(b, (liveCount.get(b) ?? 0) + 1);
        const u = (p as any).updated_at as string;
        const prev = liveLatest.get(b);
        if (!prev || new Date(u) > new Date(prev)) liveLatest.set(b, u);
      }

      // Last approved/auto_approved run per brand
      const lastApproved = new Map<string, string>();
      // Latest pending_review run per brand
      const pending = new Map<string, RunRow>();
      for (const r of (runs ?? []) as RunRow[]) {
        if (
          (r.status === "approved" || r.status === "auto_approved") &&
          r.finished_at &&
          !lastApproved.has(r.brand)
        ) {
          lastApproved.set(r.brand, r.finished_at);
        }
        if (r.status === "pending_review" && !pending.has(r.brand)) {
          pending.set(r.brand, r);
        }
      }

      const brands: BrandStatus[] = TABS.map((brand) => {
        const p = pending.get(brand);
        return {
          brand,
          liveCount: liveCount.get(brand) ?? 0,
          liveApprovedAt: lastApproved.get(brand) ?? liveLatest.get(brand) ?? null,
          stagedCount: p
            ? (p.new_count ?? 0) + (p.changed_count ?? 0) + (p.removed_count ?? 0)
            : null,
          stagedFetchedAt: p?.started_at ?? null,
          added: p?.new_count ?? 0,
          removed: p?.removed_count ?? 0,
          changed: p?.changed_count ?? 0,
          hasStaged: !!p,
        };
      });

      return { brands, runs: (runs ?? []) as RunRow[] };
    },
  );

// Diff rows ready-to-render for the preview modal
export type StagedDiffRow = {
  kind: "added" | "removed" | "changed";
  item: Sku;
  prev?: { price: number; units: number; image: string; msrp: number };
};

export const getStagedBrand = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; brand: string }) => d)
  .handler(
    async ({
      data,
    }): Promise<{
      added: number;
      removed: number;
      changed: number;
      rows: StagedDiffRow[];
    }> => {
      if (!checkPassword(data.password)) throw new Error("Unauthorized");
      const { supabaseAdmin } = await import(
        "@/integrations/supabase/client.server"
      );

      const { data: run } = await supabaseAdmin
        .from("product_import_runs")
        .select("id")
        .eq("brand", data.brand)
        .eq("status", "pending_review")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!run) return { added: 0, removed: 0, changed: 0, rows: [] };

      const { data: staged, error } = await supabaseAdmin
        .from("product_import_staging")
        .select("*")
        .eq("run_id", (run as any).id);
      if (error) throw new Error(error.message);

      const rows: StagedDiffRow[] = [];
      let added = 0,
        removed = 0,
        changed = 0;
      for (const s of (staged ?? []) as any[]) {
        const sku: Sku = {
          id: stableId(s.brand, s.name),
          name: s.name,
          brand: s.brand,
          category: s.category ?? "",
          image: s.image_url ?? "",
          price: Number(s.price ?? 0),
          msrp: Number(s.msrp ?? s.price ?? 0),
          units: s.units_available ?? 0,
          lastUpdated: s.source_last_updated ?? "",
        };
        const kind = s.diff_type as "new" | "changed" | "removed";
        if (kind === "new") {
          rows.push({ kind: "added", item: sku });
          added++;
        } else if (kind === "removed") {
          rows.push({ kind: "removed", item: sku });
          removed++;
        } else {
          rows.push({
            kind: "changed",
            item: sku,
            prev: {
              price: Number(s.previous_price ?? sku.price),
              units: s.previous_units_available ?? sku.units,
              image: s.previous_image_url ?? sku.image,
              msrp: Number(s.previous_msrp ?? sku.msrp),
            },
          });
          changed++;
        }
      }
      rows.sort((a, b) => {
        const order = { added: 0, changed: 1, removed: 2 } as const;
        return order[a.kind] - order[b.kind];
      });
      return { added, removed, changed, rows };
    },
  );

// Diff (brand, name) keyed
function diffBrand(
  live: { name: string; price: number; msrp: number; units_available: number; image_url: string; category: string | null }[],
  fetched: FetchedRow[],
) {
  const liveMap = new Map(live.map((l) => [l.name.trim(), l]));
  const fetchedMap = new Map(fetched.map((f) => [f.name.trim(), f]));
  const news: FetchedRow[] = [];
  const changes: { row: FetchedRow; prev: typeof live[number] }[] = [];
  const removes: typeof live = [];
  let unchanged = 0;
  for (const f of fetched) {
    const l = liveMap.get(f.name.trim());
    if (!l) news.push(f);
    else if (
      Number(l.price) !== f.price ||
      Number(l.msrp) !== f.msrp ||
      l.units_available !== f.units_available ||
      (l.image_url ?? "") !== f.image_url ||
      (l.category ?? "") !== f.category
    ) {
      changes.push({ row: f, prev: l });
    } else {
      unchanged++;
    }
  }
  for (const l of live) {
    if (!fetchedMap.has(l.name.trim())) removes.push(l);
  }
  return { news, changes, removes, unchanged };
}

export const runImportSync = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    if (!checkPassword(data.password)) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const byBrand = await fetchFromSheet();

    const summary: Record<
      string,
      {
        total: number;
        added: number;
        removed: number;
        changed: number;
        unchanged: number;
        autoApproved: boolean;
      }
    > = {};

    for (const [brand, fetched] of byBrand) {
      // Discard any prior pending_review run for this brand (overwrite)
      const { data: prior } = await supabaseAdmin
        .from("product_import_runs")
        .select("id")
        .eq("brand", brand)
        .eq("status", "pending_review");
      for (const p of prior ?? []) {
        await supabaseAdmin
          .from("product_import_runs")
          .delete()
          .eq("id", (p as any).id);
      }

      const { data: liveRows, error: liveErr } = await supabaseAdmin
        .from("products")
        .select("id, name, brand, category, image_url, price, msrp, units_available")
        .eq("brand", brand);
      if (liveErr) throw new Error(liveErr.message);

      const { news, changes, removes, unchanged } = diffBrand(
        (liveRows ?? []) as any[],
        fetched,
      );

      const autoApprove = (liveRows ?? []).length === 0;

      // Create run row
      const { data: run, error: runErr } = await supabaseAdmin
        .from("product_import_runs")
        .insert({
          brand,
          status: autoApprove ? "running" : "pending_review",
          fetched_count: fetched.length,
          new_count: news.length,
          changed_count: changes.length,
          removed_count: removes.length,
          unchanged_count: unchanged,
          skipped_missing_price: 0,
        })
        .select()
        .single();
      if (runErr || !run) throw new Error(runErr?.message ?? "run create failed");

      if (autoApprove) {
        // Direct write into products, no staging
        if (fetched.length > 0) {
          const { error: insErr } = await supabaseAdmin
            .from("products")
            .insert(
              fetched.map((f) => ({
                name: f.name,
                brand: f.brand,
                category: f.category,
                image_url: f.image_url,
                image_filename: f.image_filename,
                price: f.price,
                msrp: f.msrp,
                units_available: f.units_available,
                source_last_updated: f.source_last_updated,
              })),
            );
          if (insErr) throw new Error(insErr.message);
        }
        await supabaseAdmin
          .from("product_import_runs")
          .update({
            status: "auto_approved",
            finished_at: new Date().toISOString(),
          })
          .eq("id", (run as any).id);
      } else {
        // Stage diffs
        const stagingRows: any[] = [];
        for (const f of news) {
          stagingRows.push({
            run_id: (run as any).id,
            diff_type: "new",
            name: f.name,
            brand: f.brand,
            category: f.category,
            image_url: f.image_url,
            image_filename: f.image_filename,
            price: f.price,
            msrp: f.msrp,
            units_available: f.units_available,
            source_last_updated: f.source_last_updated,
          });
        }
        for (const { row: f, prev } of changes) {
          stagingRows.push({
            run_id: (run as any).id,
            diff_type: "changed",
            name: f.name,
            brand: f.brand,
            category: f.category,
            image_url: f.image_url,
            image_filename: f.image_filename,
            price: f.price,
            msrp: f.msrp,
            units_available: f.units_available,
            source_last_updated: f.source_last_updated,
            previous_price: prev.price,
            previous_msrp: prev.msrp,
            previous_units_available: prev.units_available,
            previous_image_url: prev.image_url,
          });
        }
        for (const l of removes) {
          stagingRows.push({
            run_id: (run as any).id,
            diff_type: "removed",
            name: l.name,
            brand,
            category: l.category,
            image_url: l.image_url,
            price: l.price,
            msrp: l.msrp,
            units_available: l.units_available,
          });
        }
        if (stagingRows.length > 0) {
          const { error: stErr } = await supabaseAdmin
            .from("product_import_staging")
            .insert(stagingRows);
          if (stErr) throw new Error(stErr.message);
        }
      }

      summary[brand] = {
        total: fetched.length,
        added: news.length,
        removed: removes.length,
        changed: changes.length,
        unchanged,
        autoApproved: autoApprove,
      };
    }

    return { summary };
  });

export const approveBrand = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; brand: string }) => d)
  .handler(async ({ data }) => {
    if (!checkPassword(data.password)) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const { data: run, error } = await supabaseAdmin
      .from("product_import_runs")
      .select("id")
      .eq("brand", data.brand)
      .eq("status", "pending_review")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!run) throw new Error("Nothing staged for this brand");
    const runId = (run as any).id as string;

    const { data: staged, error: stErr } = await supabaseAdmin
      .from("product_import_staging")
      .select("*")
      .eq("run_id", runId);
    if (stErr) throw new Error(stErr.message);

    for (const s of (staged ?? []) as any[]) {
      if (s.diff_type === "new") {
        await supabaseAdmin.from("products").insert({
          name: s.name,
          brand: s.brand,
          category: s.category,
          image_url: s.image_url,
          image_filename: s.image_filename,
          price: s.price,
          msrp: s.msrp,
          units_available: s.units_available,
          source_last_updated: s.source_last_updated,
        });
      } else if (s.diff_type === "changed") {
        await supabaseAdmin
          .from("products")
          .update({
            category: s.category,
            image_url: s.image_url,
            image_filename: s.image_filename,
            price: s.price,
            msrp: s.msrp,
            units_available: s.units_available,
            source_last_updated: s.source_last_updated,
            updated_at: new Date().toISOString(),
          })
          .eq("brand", s.brand)
          .eq("name", s.name);
      } else if (s.diff_type === "removed") {
        await supabaseAdmin
          .from("products")
          .delete()
          .eq("brand", s.brand)
          .eq("name", s.name);
      }
    }

    await supabaseAdmin
      .from("product_import_runs")
      .update({
        status: "approved",
        finished_at: new Date().toISOString(),
      })
      .eq("id", runId);

    // Staging rows cascade-delete via FK, but delete explicitly for safety
    await supabaseAdmin
      .from("product_import_staging")
      .delete()
      .eq("run_id", runId);

    return { ok: true };
  });

export const discardStaged = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; brand: string }) => d)
  .handler(async ({ data }) => {
    if (!checkPassword(data.password)) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const { data: runs } = await supabaseAdmin
      .from("product_import_runs")
      .select("id")
      .eq("brand", data.brand)
      .eq("status", "pending_review");

    for (const r of runs ?? []) {
      await supabaseAdmin
        .from("product_import_runs")
        .update({
          status: "discarded",
          finished_at: new Date().toISOString(),
        })
        .eq("id", (r as any).id);
      await supabaseAdmin
        .from("product_import_staging")
        .delete()
        .eq("run_id", (r as any).id);
    }
    return { ok: true };
  });
