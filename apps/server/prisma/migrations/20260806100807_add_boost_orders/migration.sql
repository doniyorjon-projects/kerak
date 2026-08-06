-- CreateEnum
CREATE TYPE "BoostDuration" AS ENUM ('DAYS_3', 'DAYS_7', 'DAYS_30');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('CREATED', 'WAITING', 'PAID', 'CANCELLED');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "boostedUntil" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "BoostOrder" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "duration" "BoostDuration" NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'CREATED',
    "clickTransId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "BoostOrder_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BoostOrder" ADD CONSTRAINT "BoostOrder_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoostOrder" ADD CONSTRAINT "BoostOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
