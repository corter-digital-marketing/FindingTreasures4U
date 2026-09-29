-- AlterTable: add the new column first (default false for everything)
ALTER TABLE "Product" ADD COLUMN     "needsShippingQuote" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: carry over which products were CONTACT-tier before dropping
-- the old column that recorded it.
UPDATE "Product" SET "needsShippingQuote" = true WHERE "shippingTier" = 'CONTACT';

-- AlterTable: now safe to drop the old tier column
ALTER TABLE "Product" DROP COLUMN "shippingTier";

-- DropEnum
DROP TYPE "ShippingTier";
