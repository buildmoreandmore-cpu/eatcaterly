-- Migration: Rename ezTextingNumberId to providerNumberId and update source default
-- This migration renames EZTexting-specific fields to generic provider fields for Twilio integration

-- Rename ezTextingNumberId to providerNumberId in business_customers table
ALTER TABLE "business_customers" RENAME COLUMN "ezTextingNumberId" TO "providerNumberId";

-- Rename ezTextingNumberId to providerNumberId in phone_number_inventory table
ALTER TABLE "phone_number_inventory" RENAME COLUMN "ezTextingNumberId" TO "providerNumberId";

-- Update the default value for source column from 'eztexting' to 'twilio'
ALTER TABLE "phone_number_inventory" ALTER COLUMN "source" SET DEFAULT 'twilio';

-- Update existing records with source 'eztexting' to 'twilio' (optional - uncomment if you want to update existing data)
-- UPDATE "phone_number_inventory" SET "source" = 'twilio' WHERE "source" = 'eztexting';
