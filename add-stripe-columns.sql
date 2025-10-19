-- Add Stripe Connect columns to business_customers table
ALTER TABLE business_customers
ADD COLUMN IF NOT EXISTS "stripeConnectAccountId" TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS "stripeAccountStatus" TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS "stripeOnboardingComplete" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "stripeDashboardEnabled" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "stripePayoutsEnabled" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "stripeChargesEnabled" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "stripeDetailsSubmitted" BOOLEAN DEFAULT false;
