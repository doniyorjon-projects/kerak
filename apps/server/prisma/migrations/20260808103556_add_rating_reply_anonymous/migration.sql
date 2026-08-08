-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'NEW_RATING';

-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sellerRepliedAt" TIMESTAMP(3),
ADD COLUMN     "sellerReply" TEXT;
