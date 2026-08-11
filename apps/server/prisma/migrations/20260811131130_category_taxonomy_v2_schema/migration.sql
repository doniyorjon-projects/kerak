-- CreateEnum
CREATE TYPE "SellerType" AS ENUM ('PRIVATE', 'BUSINESS');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "nameRu" TEXT,
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "sellerType" "SellerType",
ADD COLUMN     "contactTelegram" BOOLEAN NOT NULL DEFAULT true;
