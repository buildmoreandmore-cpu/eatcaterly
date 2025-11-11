-- Update the business phone number to the new local number
UPDATE business_customers
SET
  "assignedPhoneNumber" = '+16788120099',
  "numberProvisionedAt" = NOW(),
  "updatedAt" = NOW()
WHERE "contactEmail" = 'mfessbar@gmail.com';

-- Show the updated record
SELECT
  "businessName",
  "contactEmail",
  "assignedPhoneNumber",
  "numberProvisionedAt"
FROM business_customers
WHERE "contactEmail" = 'mfessbar@gmail.com';
