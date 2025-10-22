-- Add businessId column to menu_items table (nullable first for backfill)
ALTER TABLE "menu_items" ADD COLUMN "businessId" TEXT;

-- Backfill businessId from the parent menu's businessId
UPDATE "menu_items"
SET "businessId" = "menus"."businessId"
FROM "menus"
WHERE "menu_items"."menuId" = "menus"."id";

-- Make businessId required now that it's backfilled
ALTER TABLE "menu_items" ALTER COLUMN "businessId" SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business_customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add index for better query performance
CREATE INDEX "menu_items_businessId_idx" ON "menu_items"("businessId");
