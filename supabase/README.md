# Supabase Database Setup Status

## Current state

As of 2026-11-05, the live Supabase project (`gewanooofykqznuzrrno`) and the repository do not have a reconciled migration history or a complete, reviewed schema baseline.

- The live `public` schema has `properties`, `photos`, `inquiries`, and `site_settings`, plus the `properties_preview` view. RLS is enabled on the four tables.
- `site_settings` is not present in `src/database.types.ts`.
- The remote migration history has six entries from `20250709000` through `20250709005`. The local `supabase/migrations/` directory instead contains four migrations from August and September 2025/2026; none matches those remote entries.
- The `.docs/july_2025_schema_backup.sql` predates the live `inquiries` and `site_settings` objects and has obsolete trigger/function definitions. It is not a valid baseline or restore procedure.
- The live database has an `app_storage.populate_photos_table` trigger on storage inserts, while the property-creation server action also inserts photo rows. Verify their interaction before reproducing or changing this flow.
- The live `delete_photos_from_bucket` function catches errors, so storage cleanup failures may not be visible to callers.
- The Supabase security advisor reported `public.properties_preview` as a `SECURITY DEFINER` view (ERROR) and 12 mutable-function-search-path findings (WARN). The view is selectable by `anon` and `authenticated`.
- Storage policies include broad `public` upload/update/delete permissions for the public `photos` bucket. Do not copy these into a new environment without an explicit policy review.

These are inspection findings, not authorization to change production. No live schema or migration history was changed during this audit.

## Safe path to a canonical baseline

1. Use a Supabase CLI session with authorized database access and the project linked. Do not put database passwords in the repository or paste them into chat.
2. Capture a schema-only dump of the application-owned schemas to a temporary/review location:

   ```powershell
   npx supabase db dump --remote --schema public,app_storage --file supabase\schema-review.sql
   ```

   `db dump` is intended to export schema, not table data. Review its output and separately account for the Supabase-managed Storage bucket configuration and policies; do not treat a dump of application schemas alone as a complete fresh-project setup.
3. Compare the export with every checked-in migration and the live objects. Resolve the differences in views, functions, triggers, RLS policies, grants, indexes, constraints, storage policies, and bucket configuration. Regenerate `src/database.types.ts` from the reviewed schema.
4. Test a new-project setup and migration replay before designating any baseline canonical. Preserve the existing migration files until their effects and remote history are reconciled.
5. Only after review, agree on a production history-reconciliation plan. Do **not** run `supabase db pull` or `supabase migration repair` against production as an exploratory step: these commands can update the remote migration history.

The workspace has no database password and no Supabase CLI installed, so a complete `pg_dump`-style export could not be produced here. The read-only MCP inspection is insufficient to synthesize a reliable replacement baseline.
