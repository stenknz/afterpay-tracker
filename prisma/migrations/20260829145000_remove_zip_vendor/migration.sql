-- Remove ZIP vendor (shutdown, no longer in business)
-- PaymentPlan.vendorId has ON DELETE SET NULL, so any plans referencing ZIP will have vendorId nulled
DELETE FROM "Vendor" WHERE "name" = 'ZIP';
