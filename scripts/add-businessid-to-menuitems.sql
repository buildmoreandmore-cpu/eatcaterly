-- Add businessId column to menu_items table (nullable first for backfill)
ALTER TABLE "menu_items" ADD COLUMN IF NOT EXISTS "businessId" TEXT;

-- Backfill businessId from the parent menu's businessId
UPDATE "menu_items"
SET "businessId" = "menus"."businessId"
FROM "menus"
WHERE "menu_items"."menuId" = "menus"."id"
AND "menu_items"."businessId" IS NULL;

-- Make businessId required now that it's backfilled
ALTER TABLE "menu_items" ALTER COLUMN "businessId" SET NOT NULL;

-- Add foreign key constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'menu_items_businessId_fkey'
        AND table_name = 'menu_items'
    ) THEN
        ALTER TABLE "menu_items"
        ADD CONSTRAINT "menu_items_businessId_fkey"
        FOREIGN KEY ("businessId")
        REFERENCES "business_customers"("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;
END$$;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS "menu_items_businessId_idx" ON "menu_items"("businessId");

-- Verify the migration
SELECT
    COUNT(*) as total_items,
    COUNT("businessId") as items_with_business_id,
    COUNT(*) - COUNT("businessId") as items_missing_business_id
FROM "menu_items";
