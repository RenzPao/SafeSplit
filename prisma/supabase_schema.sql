-- Create Escrow table
CREATE TABLE IF NOT EXISTS "Escrow" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "contract_address" VARCHAR(255) UNIQUE NOT NULL,
  "client_address" VARCHAR(255) NOT NULL,
  "freelancer_address" VARCHAR(255) NOT NULL,
  "arbiter_address" VARCHAR(255) NOT NULL,
  "total_xlm" DECIMAL(20, 7) NOT NULL,
  "status" VARCHAR(50) NOT NULL DEFAULT 'Initialized',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Milestone table
CREATE TABLE IF NOT EXISTS "Milestone" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "escrow_id" UUID REFERENCES "Escrow"("id") ON DELETE CASCADE,
  "milestone_index" INTEGER NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "amount_xlm" DECIMAL(20, 7) NOT NULL,
  "status" VARCHAR(50) NOT NULL DEFAULT 'Pending',
  "deliverable_url" TEXT,
  "submission_cid" TEXT,
  UNIQUE("escrow_id", "milestone_index")
);

-- Create ActivityLog table
CREATE TABLE IF NOT EXISTS "ActivityLog" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "escrow_id" UUID REFERENCES "Escrow"("id") ON DELETE CASCADE,
  "tx_hash" VARCHAR(255) NOT NULL,
  "event_name" VARCHAR(100) NOT NULL,
  "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "details" TEXT
);

-- Enable RLS (Row Level Security) and configure public access policies
ALTER TABLE "Escrow" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Milestone" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ActivityLog" ENABLE ROW LEVEL SECURITY;

-- Escrow policies
CREATE POLICY "Allow public read access on Escrow" ON "Escrow" FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on Escrow" ON "Escrow" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on Escrow" ON "Escrow" FOR UPDATE USING (true);

-- Milestone policies
CREATE POLICY "Allow public read access on Milestone" ON "Milestone" FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on Milestone" ON "Milestone" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on Milestone" ON "Milestone" FOR UPDATE USING (true);

-- ActivityLog policies
CREATE POLICY "Allow public read access on ActivityLog" ON "ActivityLog" FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on ActivityLog" ON "ActivityLog" FOR INSERT WITH CHECK (true);

-- Create deliverables storage bucket in Supabase (if storage schema exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('deliverables', 'deliverables', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for deliverables bucket
CREATE POLICY "Allow public read access on deliverables" ON storage.objects FOR SELECT USING (bucket_id = 'deliverables');
CREATE POLICY "Allow public insert access on deliverables" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'deliverables');
