-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "isBargainable" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "referralPromptSent" BOOLEAN NOT NULL DEFAULT false;
