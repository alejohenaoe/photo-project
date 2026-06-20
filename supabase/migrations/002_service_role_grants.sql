-- Grant service_role full access to all public tables, sequences, and functions.
-- Required by Edge Functions which connect using SUPABASE_SERVICE_ROLE_KEY.
-- In production Supabase this is the default, but local Supabase (PG16+) does not
-- automatically grant INSERT/UPDATE/DELETE to service_role.
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- Also update default privileges so any new tables/sequences/functions created in
-- future migrations also get full service_role access.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT ALL ON FUNCTIONS TO service_role;
