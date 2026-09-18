-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingCents" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "shippingCents" INTEGER NOT NULL DEFAULT 0;
