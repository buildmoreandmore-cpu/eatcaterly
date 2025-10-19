-- Create DiscountType enum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- Create promo_codes table
CREATE TABLE IF NOT EXISTS "promo_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountType" "DiscountType" NOT NULL DEFAULT 'PERCENTAGE',
    "discountValue" INTEGER NOT NULL,
    "freePhoneNumber" BOOLEAN NOT NULL DEFAULT false,
    "freeSubscription" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxUses" INTEGER,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id")
);

-- Create unique index on code
CREATE UNIQUE INDEX IF NOT EXISTS "promo_codes_code_key" ON "promo_codes"("code");

-- Add promo code fields to business_customers table
ALTER TABLE "business_customers" ADD COLUMN IF NOT EXISTS "promoCodeId" TEXT;
ALTER TABLE "business_customers" ADD COLUMN IF NOT EXISTS "promoCodeUsed" TEXT;
ALTER TABLE "business_customers" ADD COLUMN IF NOT EXISTS "phoneNumberFeeWaived" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "business_customers" ADD COLUMN IF NOT EXISTS "subscriptionTier" TEXT;

-- Add foreign key constraint
ALTER TABLE "business_customers"
ADD CONSTRAINT "business_customers_promoCodeId_fkey"
FOREIGN KEY ("promoCodeId") REFERENCES "promo_codes"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- Make assignedPhoneNumber nullable (for promo users waiting for manual assignment)
ALTER TABLE "business_customers" ALTER COLUMN "assignedPhoneNumber" DROP NOT NULL;
