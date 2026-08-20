-- Add new columns to Escrow
ALTER TABLE "Escrow" ADD COLUMN IF NOT EXISTS "invoice_url" TEXT;
ALTER TABLE "Escrow" ADD COLUMN IF NOT EXISTS "webhook_url" TEXT;

-- Create SubTask table
CREATE TABLE IF NOT EXISTS "SubTask" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "milestone_id" UUID REFERENCES "Milestone"("id") ON DELETE CASCADE,
  "title" VARCHAR(255) NOT NULL,
  "is_completed" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create DeliverableRevision table
CREATE TABLE IF NOT EXISTS "DeliverableRevision" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "milestone_id" UUID REFERENCES "Milestone"("id") ON DELETE CASCADE,
  "url" TEXT NOT NULL,
  "notes" TEXT,
  "version" INTEGER NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS and configure policies for SubTask
ALTER TABLE "SubTask" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on SubTask" ON "SubTask" FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on SubTask" ON "SubTask" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on SubTask" ON "SubTask" FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on SubTask" ON "SubTask" FOR DELETE USING (true);

-- Enable RLS and configure policies for DeliverableRevision
ALTER TABLE "DeliverableRevision" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on DeliverableRevision" ON "DeliverableRevision" FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on DeliverableRevision" ON "DeliverableRevision" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on DeliverableRevision" ON "DeliverableRevision" FOR UPDATE USING (true);

-- Create invoices storage bucket in Supabase (if storage schema exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('invoices', 'invoices', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for invoices bucket
CREATE POLICY "Allow public read access on invoices" ON storage.objects FOR SELECT USING (bucket_id = 'invoices');
CREATE POLICY "Allow public insert access on invoices" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'invoices');
