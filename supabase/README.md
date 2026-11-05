# Supabase Database Status

## Current state

The live Supabase database is the source of truth. The user is not using a local database.

- The current schema and data have been dumped outside this repository under the user's private backup folder. The schema dump includes the current `public` and custom `app_storage` objects, including inquiries, photo-related functions, and MSL reservation objects. The data dump contains application data; Storage photo bytes are intentionally excluded.
- The dumps have not yet been restored and verified on a separate Supabase project. Treat them as recovery inputs, not a proven turnkey restore.
- The remote migration history contains six legacy versions (`20250709000`–`20250709005`) and the applied MSL migration (`20261105150257`).
- The repository retains the MSL migration because it is part of the deployed feature and is recorded remotely. Older local SQL drafts that did not match the remote migration ledger were removed; the current schema dump is the snapshot for recovery.
- The old `.docs/july_2025_schema_backup.sql` was stale and has been removed.

The schema/data dumps do not by themselves copy Supabase-managed Auth configuration/users, Storage bucket configuration, or Storage object bytes. Review those separately when moving to another Supabase project. The current dump has not been restore-tested, so verify recovery on a disposable destination before relying on it.

## Migration safety

The application is deployed against the current live database. Its migration history is still not a complete, reproducible history in this repository. Do **not** run `supabase db push` or `supabase migration repair` against production until we have reviewed a deliberate migration/baseline plan. `supabase db pull` does not apply schema changes to production, but it creates local migration files; it is not part of the current backup workflow. Do not mark legacy versions applied merely to silence history differences.

The SQL dump is a current-state backup, not a migration baseline. A future new-project setup should be tested from the dump before choosing whether to adopt a baseline migration workflow.

## MSL allocation

Migration `20261105150257_reserve_property_msl.sql` is applied in production and recorded in the remote migration history. It adds atomic lowest-available MSL reservations and database enforcement; abandoned reservations expire after two hours so deleted numbers can be reused. The deployed add-property flow was tested by adding and removing a property.
