-- Grant authenticated full access to all public tables.
-- RLS policies (defined in 001_schema.sql) are the gatekeeper that controls
-- what each authenticated user can actually read/write.
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant anon minimal access needed for public forms.
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON quote_requests TO anon;

-- Default privileges so future migrations also get these grants.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT ALL ON FUNCTIONS TO authenticated;
