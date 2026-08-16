-- Enable Realtime on tables
BEGIN;
-- Drop publication if exists just in case
DROP PUBLICATION IF EXISTS supabase_realtime;
-- Recreate publication
CREATE PUBLICATION supabase_realtime;
-- Add tables to publication
ALTER PUBLICATION supabase_realtime ADD TABLE "Escrow";
ALTER PUBLICATION supabase_realtime ADD TABLE "Milestone";
ALTER PUBLICATION supabase_realtime ADD TABLE "ActivityLog";
COMMIT;
