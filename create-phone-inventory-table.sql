-- Create PhoneNumberStatus enum
CREATE TYPE "PhoneNumberStatus" AS ENUM ('AVAILABLE', 'ASSIGNED', 'RESERVED', 'COOLDOWN', 'RETIRED');

-- Create phone_number_inventory table
CREATE TABLE IF NOT EXISTS "phone_number_inventory" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "ezTextingNumberId" TEXT,
    "areaCode" TEXT NOT NULL,
    "status" "PhoneNumberStatus" NOT NULL DEFAULT 'AVAILABLE',
    "currentBusinessId" TEXT,
    "previousBusinessId" TEXT,
    "assignedAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monthlyPrice" DOUBLE PRECISION,
    "source" TEXT NOT NULL DEFAULT 'eztexting',
    "notes" TEXT,
    "cooldownUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phone_number_inventory_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS "phone_number_inventory_phoneNumber_key" ON "phone_number_inventory"("phoneNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "phone_number_inventory_ezTextingNumberId_key" ON "phone_number_inventory"("ezTextingNumberId");

-- Create regular indexes for queries
CREATE INDEX IF NOT EXISTS "phone_number_inventory_status_idx" ON "phone_number_inventory"("status");
CREATE INDEX IF NOT EXISTS "phone_number_inventory_areaCode_idx" ON "phone_number_inventory"("areaCode");
CREATE INDEX IF NOT EXISTS "phone_number_inventory_currentBusinessId_idx" ON "phone_number_inventory"("currentBusinessId");
