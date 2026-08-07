-- CreateEnum
CREATE TYPE "TopupMethod" AS ENUM ('CLICK', 'STARS');

-- CreateEnum
CREATE TYPE "WalletTransactionType" AS ENUM ('TOPUP_CLICK', 'TOPUP_STARS', 'REFERRAL_BONUS', 'BOOST_PURCHASE', 'PLAN_PURCHASE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'SAVED_SEARCH_MATCH';
ALTER TYPE "NotificationType" ADD VALUE 'REFERRAL_BONUS';
ALTER TYPE "NotificationType" ADD VALUE 'WALLET_TOPUP';

-- AlterTable
ALTER TABLE "BotSettings" ADD COLUMN     "starsRate" INTEGER NOT NULL DEFAULT 200;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "balance" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "referredById" TEXT;

-- CreateTable
CREATE TABLE "SavedSearch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "categoryId" TEXT,
    "regionId" INTEGER,
    "districtId" INTEGER,
    "minPrice" INTEGER,
    "maxPrice" INTEGER,
    "condition" "ListingCondition",
    "q" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "WalletTransactionType" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTopupOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "method" "TopupMethod" NOT NULL,
    "starsAmount" INTEGER,
    "status" "PaymentStatus" NOT NULL DEFAULT 'CREATED',
    "clickTransId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "WalletTopupOrder_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedSearch" ADD CONSTRAINT "SavedSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTopupOrder" ADD CONSTRAINT "WalletTopupOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
