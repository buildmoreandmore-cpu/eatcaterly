-- Add businessId column to menu_items table (nullable first for backfill)one
-- Verify the migration
SELECT
    COUNT(*) as total_items,
    COUNT("businessId") as items_with_business_id,
    COUNT(*) - COUNT("businessId") as items_missing_business_id
FROM "menu_items";
