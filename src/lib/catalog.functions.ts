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
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
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

async function fetchFromSheet(): Promise<Map<string, Sku[]>> {
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

  const byBrand = new Map<string, Sku[]>();
  json.valueRanges?.forEach((vr, tabIdx) => {
    const brand = TABS[tabIdx];
    const list: Sku[] = [];
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
      const id = `${slug(finalBrand)}-${hash(name + image)}`;
      list.push({
        id,
        name: String(name).trim(),
        brand: finalBrand,
        category: finalCat,
        image: img,
        price: priceN,
        msrp: msrpN || priceN,
        units: unitsN,
        lastUpdated: updated || "",
      });
    });
    byBrand.set(brand, list);
  });
  // Ensure every tab has an entry
  for (const t of TABS) if (!byBrand.has(t)) byBrand.set(t, []);
  return byBrand;
}

function diffSets(live: Sku[], staged: Sku[]) {
  const liveMap = new Map(live.map((s) => [s.id, s]));
  const stagedMap = new Map(staged.map((s) => [s.id, s]));
  let added = 0,
    removed = 0,
    changed = 0;
  for (const [id, s] of stagedMap) {
    const l = liveMap.get(id);
    if (!l) added++;
    else if (
      l.price !== s.price ||
      l.units !== s.units ||
      l.name !== s.name ||
      l.image !== s.image ||
      l.category !== s.category ||
      l.msrp !== s.msrp
    )
      changed++;
  }
  for (const id of liveMap.keys()) if (!stagedMap.has(id)) removed++;
  return { added, removed, changed };
}

// PUBLIC: read live catalog from DB
export const getCatalog = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ items: Sku[]; fetchedAt: string }> => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data, error } = await supabaseAdmin
      .from("live_snapshots")
      .select("items, approved_at");
    if (error) throw new Error(error.message);
    const items: Sku[] = [];
    let latest = 0;
    for (const row of data ?? []) {
      const list = (row.items as unknown as Sku[]) ?? [];
      items.push(...list);
      const t = new Date(row.approved_at as string).getTime();
      if (t > latest) latest = t;
    }
    return {
      items,
      fetchedAt: latest ? new Date(latest).toISOString() : new Date(0).toISOString(),
    };
  },
);

// ADMIN: verify password
export const verifyAdmin = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    return { ok: checkPassword(data.password) };
  });

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

// ADMIN: get per-brand status (live vs staged)
export const getAdminStatus = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => d)
  .handler(
    async ({
      data,
    }): Promise<{ brands: BrandStatus[]; runs: any[] }> => {
      if (!checkPassword(data.password)) throw new Error("Unauthorized");
      const { supabaseAdmin } = await import(
        "@/integrations/supabase/client.server"
      );
      const [{ data: live }, { data: staged }, { data: runs }] = await Promise.all([
        supabaseAdmin.from("live_snapshots").select("*"),
        supabaseAdmin.from("staged_snapshots").select("*"),
        supabaseAdmin
          .from("import_runs")
          .select("*")
          .order("started_at", { ascending: false })
          .limit(10),
      ]);
      const liveMap = new Map((live ?? []).map((r: any) => [r.brand, r]));
      const stagedMap = new Map((staged ?? []).map((r: any) => [r.brand, r]));
      const brands: BrandStatus[] = TABS.map((brand) => {
        const l = liveMap.get(brand);
        const s = stagedMap.get(brand);
        const liveItems: Sku[] = (l?.items as unknown as Sku[]) ?? [];
        const stagedItems: Sku[] | null = s ? ((s.items as unknown as Sku[]) ?? []) : null;
        const diff = stagedItems
          ? diffSets(liveItems, stagedItems)
          : { added: 0, removed: 0, changed: 0 };
        return {
          brand,
          liveCount: liveItems.length,
          liveApprovedAt: l?.approved_at ?? null,
          stagedCount: stagedItems?.length ?? null,
          stagedFetchedAt: s?.fetched_at ?? null,
          ...diff,
          hasStaged: !!s,
        };
      });
      return { brands, runs: runs ?? [] };
    },
  );

// ADMIN: get staged items for a brand (preview)
export const getStagedBrand = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; brand: string }) => d)
  .handler(
    async ({
      data,
    }): Promise<{ live: Sku[]; staged: Sku[] | null }> => {
      if (!checkPassword(data.password)) throw new Error("Unauthorized");
      const { supabaseAdmin } = await import(
        "@/integrations/supabase/client.server"
      );
      const [{ data: l }, { data: s }] = await Promise.all([
        supabaseAdmin
          .from("live_snapshots")
          .select("items")
          .eq("brand", data.brand)
          .maybeSingle(),
        supabaseAdmin
          .from("staged_snapshots")
          .select("items")
          .eq("brand", data.brand)
          .maybeSingle(),
      ]);
      return {
        live: ((l?.items as unknown as Sku[]) ?? []),
        staged: s ? ((s.items as unknown as Sku[]) ?? []) : null,
      };
    },
  );

// ADMIN: run sync — fetch sheet, stage per brand (auto-promote if no live yet)
export const runImportSync = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    if (!checkPassword(data.password)) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: run, error: runErr } = await supabaseAdmin
      .from("import_runs")
      .insert({ status: "running" })
      .select()
      .single();
    if (runErr || !run) throw new Error(runErr?.message ?? "run create failed");

    try {
      const byBrand = await fetchFromSheet();
      const { data: liveRows } = await supabaseAdmin
        .from("live_snapshots")
        .select("brand, items");
      const liveMap = new Map(
        (liveRows ?? []).map((r: any) => [r.brand, (r.items as unknown as Sku[]) ?? []]),
      );

      const summary: Record<
        string,
        { added: number; removed: number; changed: number; total: number; autoApproved: boolean }
      > = {};

      for (const [brand, items] of byBrand) {
        const live = liveMap.get(brand) ?? [];
        const d = diffSets(live, items);
        const autoApprove = !liveMap.has(brand) || live.length === 0;

        if (autoApprove) {
          await supabaseAdmin
            .from("live_snapshots")
            .upsert({ brand, items: items as any, approved_at: new Date().toISOString() });
          await supabaseAdmin
            .from("staged_snapshots")
            .delete()
            .eq("brand", brand);
        } else {
          await supabaseAdmin.from("staged_snapshots").upsert({
            brand,
            items: items as any,
            fetched_at: new Date().toISOString(),
            run_id: run.id,
          });
        }
        summary[brand] = { ...d, total: items.length, autoApproved: autoApprove };
      }


      await supabaseAdmin
        .from("import_runs")
        .update({
          status: "succeeded",
          finished_at: new Date().toISOString(),
          summary,
        })
        .eq("id", run.id);

      return { runId: run.id, summary };
    } catch (err: any) {
      await supabaseAdmin
        .from("import_runs")
        .update({
          status: "failed",
          finished_at: new Date().toISOString(),
          error: String(err?.message ?? err),
        })
        .eq("id", run.id);
      throw err;
    }
  });

// ADMIN: approve staged for a brand → replace live
export const approveBrand = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; brand: string }) => d)
  .handler(async ({ data }) => {
    if (!checkPassword(data.password)) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: s, error } = await supabaseAdmin
      .from("staged_snapshots")
      .select("items")
      .eq("brand", data.brand)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!s) throw new Error("Nothing staged for this brand");
    await supabaseAdmin
      .from("live_snapshots")
      .upsert({
        brand: data.brand,
        items: s.items as any,
        approved_at: new Date().toISOString(),
      });

    await supabaseAdmin
      .from("staged_snapshots")
      .delete()
      .eq("brand", data.brand);
    return { ok: true };
  });

// ADMIN: discard staged for a brand
export const discardStaged = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; brand: string }) => d)
  .handler(async ({ data }) => {
    if (!checkPassword(data.password)) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    await supabaseAdmin
      .from("staged_snapshots")
      .delete()
      .eq("brand", data.brand);
    return { ok: true };
  });
