-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('STANDARD', 'BUSINESS');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "listingsLimit" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "PlanOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "PlanTier" NOT NULL,
    "amount" INTEGER NOT NULL,
    "listingsLimit" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'CREATED',
    "clickTransId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "PlanOrder_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlanOrder" ADD CONSTRAINT "PlanOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
