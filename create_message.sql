CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "escrow_id" TEXT NOT NULL,
    "sender_address" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- Attempt UUID cast if needed
ALTER TABLE "Message" ALTER COLUMN "escrow_id" TYPE uuid USING ("escrow_id"::uuid);

ALTER TABLE "Message" ADD CONSTRAINT "Message_escrow_id_fkey" FOREIGN KEY ("escrow_id") REFERENCES "Escrow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Message" DISABLE ROW LEVEL SECURITY;
GRANT ALL ON "Message" TO anon, authenticated;

BEGIN;
ALTER PUBLICATION supabase_realtime ADD TABLE "Message";
COMMIT;
