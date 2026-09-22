-- CreateEnum
CREATE TYPE "ShippingTier" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'CONTACT');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "shippingTier" "ShippingTier" NOT NULL DEFAULT 'SMALL';
