-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "needsShippingQuote" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shippingQuoteCents" INTEGER,
ADD COLUMN     "shippingQuoteCheckoutSessionId" TEXT,
ADD COLUMN     "shippingQuotePaidAt" TIMESTAMP(3),
ADD COLUMN     "shippingQuoteSentAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Order_shippingQuoteCheckoutSessionId_key" ON "Order"("shippingQuoteCheckoutSessionId");
