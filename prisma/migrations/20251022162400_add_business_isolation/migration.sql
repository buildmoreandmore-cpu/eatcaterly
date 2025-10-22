-- Add businessId to customers table (nullable first for existing data)
ALTER TABLE "customers" ADD COLUMN "businessId" TEXT;

-- Add businessId to menus table (nullable first for existing data)
ALTER TABLE "menus" ADD COLUMN "businessId" TEXT;

-- Assign all existing customers to the first business (if any exist)
UPDATE "customers"
SET "businessId" = (SELECT id FROM "business_customers" ORDER BY "createdAt" LIMIT 1)
WHERE "businessId" IS NULL;

-- Assign all existing menus to the first business (if any exist)
UPDATE "menus"
SET "businessId" = (SELECT id FROM "business_customers" ORDER BY "createdAt" LIMIT 1)
WHERE "businessId" IS NULL;

-- Make businessId non-nullable
ALTER TABLE "customers" ALTER COLUMN "businessId" SET NOT NULL;
ALTER TABLE "menus" ALTER COLUMN "businessId" SET NOT NULL;

-- Add foreign key constraints
ALTER TABLE "customers" ADD CONSTRAINT "customers_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "business_customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "menus" ADD CONSTRAINT "menus_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "business_customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop the old unique constraint on menus.date (if it exists)
ALTER TABLE "menus" DROP CONSTRAINT IF EXISTS "menus_date_key";

-- Add new unique constraint for businessId + date combination
ALTER TABLE "menus" ADD CONSTRAINT "menus_businessId_date_key" UNIQUE ("businessId", "date");
