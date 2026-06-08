
CREATE TABLE public.live_snapshots (
  brand TEXT PRIMARY KEY,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  approved_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.live_snapshots TO anon, authenticated;
GRANT ALL ON public.live_snapshots TO service_role;
ALTER TABLE public.live_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read live snapshots" ON public.live_snapshots FOR SELECT USING (true);

CREATE TABLE public.staged_snapshots (
  brand TEXT PRIMARY KEY,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  run_id UUID
);
GRANT ALL ON public.staged_snapshots TO service_role;
ALTER TABLE public.staged_snapshots ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.import_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running',
  error TEXT,
  summary JSONB NOT NULL DEFAULT '{}'::jsonb
);
GRANT ALL ON public.import_runs TO service_role;
ALTER TABLE public.import_runs ENABLE ROW LEVEL SECURITY;
