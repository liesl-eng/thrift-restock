DROP TABLE IF EXISTS public.staged_snapshots CASCADE;
DROP TABLE IF EXISTS public.live_snapshots CASCADE;
DROP TABLE IF EXISTS public.import_runs CASCADE;

CREATE TABLE public.products (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  brand               TEXT NOT NULL,
  category            TEXT,
  image_url           TEXT,
  image_filename      TEXT,
  price               NUMERIC(10,2),
  msrp                NUMERIC(10,2),
  units_available     INTEGER NOT NULL DEFAULT 0,
  source_last_updated TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX products_brand_idx    ON public.products (brand);
CREATE INDEX products_category_idx ON public.products (category);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL    ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read products" ON public.products FOR SELECT USING (true);

CREATE TABLE public.product_import_runs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand                 TEXT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'pending_review',
  started_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at           TIMESTAMPTZ,
  fetched_count         INTEGER,
  new_count             INTEGER,
  changed_count         INTEGER,
  removed_count         INTEGER,
  unchanged_count       INTEGER,
  skipped_missing_price INTEGER,
  error_message         TEXT
);
GRANT ALL ON public.product_import_runs TO service_role;
ALTER TABLE public.product_import_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No client access to runs" ON public.product_import_runs FOR ALL USING (false) WITH CHECK (false);

CREATE TABLE public.product_import_staging (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id                    UUID NOT NULL REFERENCES public.product_import_runs(id) ON DELETE CASCADE,
  diff_type                 TEXT NOT NULL,
  name                      TEXT NOT NULL,
  brand                     TEXT NOT NULL,
  category                  TEXT,
  image_url                 TEXT,
  image_filename            TEXT,
  price                     NUMERIC(10,2),
  msrp                      NUMERIC(10,2),
  units_available           INTEGER NOT NULL DEFAULT 0,
  source_last_updated       TIMESTAMPTZ,
  previous_price            NUMERIC(10,2),
  previous_msrp             NUMERIC(10,2),
  previous_units_available  INTEGER,
  previous_image_url        TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX staging_run_id_idx ON public.product_import_staging (run_id);
CREATE INDEX staging_brand_idx  ON public.product_import_staging (brand);
CREATE INDEX staging_diff_idx   ON public.product_import_staging (diff_type);
GRANT ALL ON public.product_import_staging TO service_role;
ALTER TABLE public.product_import_staging ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No client access to staging" ON public.product_import_staging FOR ALL USING (false) WITH CHECK (false);