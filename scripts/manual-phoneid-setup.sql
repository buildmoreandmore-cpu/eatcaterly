-- Manual PhoneID Setup Script
-- Fill in the values from your EZTexting dashboard and run this

-- Step 1: Add phone numbers to inventory (if not already there)
-- Replace with actual values from EZTexting dashboard

INSERT INTO "phone_number_inventory"
  ("id", "phoneNumber", "ezTextingNumberId", "areaCode", "status", "source", "purchasedAt")
VALUES
  (gen_random_uuid(), '+14045551234', 'REPLACE_WITH_PHONEID_1', '404', 'AVAILABLE', 'eztexting', NOW()),
  (gen_random_uuid(), '+14045555678', 'REPLACE_WITH_PHONEID_2', '404', 'AVAILABLE', 'eztexting', NOW())
ON CONFLICT ("ezTextingNumberId") DO UPDATE
  SET "phoneNumber" = EXCLUDED."phoneNumber";

-- Step 2: List all businesses to see which ones need PhoneIDs
SELECT
  id,
  "businessName",
  "assignedPhoneNumber",
  "ezTextingNumberId",
  CASE
    WHEN "ezTextingNumberId" IS NOT NULL THEN '✅ HAS PhoneID'
    ELSE '❌ NEEDS PhoneID'
  END as status
FROM "business_customers"
ORDER BY "businessName";

-- Step 3: Assign PhoneID to a specific business
-- Replace BUSINESS_ID and PHONE_NUMBER with actual values

UPDATE "business_customers"
SET
  "ezTextingNumberId" = (
    SELECT "ezTextingNumberId"
    FROM "phone_number_inventory"
    WHERE "phoneNumber" = 'REPLACE_WITH_PHONE_NUMBER'
  ),
  "numberProvisionedAt" = NOW()
WHERE id = 'REPLACE_WITH_BUSINESS_ID';

-- Step 4: Mark phone as assigned in inventory
UPDATE "phone_number_inventory"
SET
  "status" = 'ASSIGNED',
  "currentBusinessId" = 'REPLACE_WITH_BUSINESS_ID',
  "assignedAt" = NOW()
WHERE "phoneNumber" = 'REPLACE_WITH_PHONE_NUMBER';

-- Step 5: Verify the setup
SELECT
  bc."businessName",
  bc."assignedPhoneNumber",
  bc."ezTextingNumberId",
  pni."status" as "phoneStatus"
FROM "business_customers" bc
LEFT JOIN "phone_number_inventory" pni
  ON bc."assignedPhoneNumber" = pni."phoneNumber"
WHERE bc."ezTextingNumberId" IS NOT NULL;
