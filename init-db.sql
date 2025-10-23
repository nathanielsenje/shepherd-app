-- Initialize database with required extensions
-- This script runs automatically when the container is first created

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for encryption functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schema for extensions if needed (for Supabase compatibility)
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage on extensions schema
GRANT USAGE ON SCHEMA extensions TO postgres;
GRANT ALL ON SCHEMA extensions TO postgres;

-- Log initialization
DO $$
BEGIN
  RAISE NOTICE 'Database initialized with UUID and encryption extensions';
END $$;
