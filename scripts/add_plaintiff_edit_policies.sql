-- Migration: Allow plaintiffs to edit their own related case data
-- Run in: Supabase Dashboard → SQL Editor
-- Purpose: Enables the case edit form to save changes to financial_impacts,
--          timeline_events, witnesses, and case_versions

-- ── financial_impacts ──────────────────────────────────────────────────────────

CREATE POLICY IF NOT EXISTS "plaintiff_insert_own_financial_impacts"
ON public.financial_impacts
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.cases
        WHERE cases.id = financial_impacts.case_id
          AND cases.plaintiff_id = auth.uid()
    )
);

CREATE POLICY IF NOT EXISTS "plaintiff_update_own_financial_impacts"
ON public.financial_impacts
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.cases
        WHERE cases.id = financial_impacts.case_id
          AND cases.plaintiff_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.cases
        WHERE cases.id = financial_impacts.case_id
          AND cases.plaintiff_id = auth.uid()
    )
);

-- ── timeline_events ────────────────────────────────────────────────────────────

CREATE POLICY IF NOT EXISTS "plaintiff_insert_own_timeline_events"
ON public.timeline_events
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.cases
        WHERE cases.id = timeline_events.case_id
          AND cases.plaintiff_id = auth.uid()
    )
);

CREATE POLICY IF NOT EXISTS "plaintiff_delete_own_timeline_events"
ON public.timeline_events
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.cases
        WHERE cases.id = timeline_events.case_id
          AND cases.plaintiff_id = auth.uid()
    )
);

-- ── witnesses ──────────────────────────────────────────────────────────────────

CREATE POLICY IF NOT EXISTS "plaintiff_insert_own_witnesses"
ON public.witnesses
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.cases
        WHERE cases.id = witnesses.case_id
          AND cases.plaintiff_id = auth.uid()
    )
);

CREATE POLICY IF NOT EXISTS "plaintiff_delete_own_witnesses"
ON public.witnesses
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.cases
        WHERE cases.id = witnesses.case_id
          AND cases.plaintiff_id = auth.uid()
    )
);

-- ── case_versions (audit trail) ────────────────────────────────────────────────

CREATE POLICY IF NOT EXISTS "plaintiff_insert_own_case_versions"
ON public.case_versions
FOR INSERT
TO authenticated
WITH CHECK (
    edited_by = auth.uid()
    AND EXISTS (
        SELECT 1 FROM public.cases
        WHERE cases.id = case_versions.case_id
          AND cases.plaintiff_id = auth.uid()
    )
);
