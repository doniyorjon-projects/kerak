-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'PRICE_OFFER_RECEIVED';
ALTER TYPE "NotificationType" ADD VALUE 'PRICE_OFFER_RESOLVED';

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "previousPrice" DOUBLE PRECISION,
ADD COLUMN     "isFree" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isUrgent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasDelivery" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "BotSettings" ADD COLUMN     "telegramChannelUrl" TEXT,
ADD COLUMN     "supportUrl" TEXT;

-- CreateEnum
CREATE TYPE "PriceOfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "PriceOffer" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "PriceOfferStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceOffer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PriceOffer_listingId_idx" ON "PriceOffer"("listingId");

-- CreateIndex
CREATE INDEX "PriceOffer_buyerId_idx" ON "PriceOffer"("buyerId");

-- AddForeignKey
ALTER TABLE "PriceOffer" ADD CONSTRAINT "PriceOffer_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceOffer" ADD CONSTRAINT "PriceOffer_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
