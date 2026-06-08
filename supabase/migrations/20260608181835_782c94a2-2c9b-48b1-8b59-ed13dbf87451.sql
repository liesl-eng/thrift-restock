
CREATE POLICY "No client access to staged" ON public.staged_snapshots FOR ALL USING (false) WITH CHECK (false);
CREATE POLICY "No client access to runs" ON public.import_runs FOR ALL USING (false) WITH CHECK (false);
