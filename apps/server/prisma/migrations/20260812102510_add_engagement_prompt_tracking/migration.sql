-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "boostPromptSentAt" TIMESTAMP(3),
ADD COLUMN     "staleReminderSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "inactivityPromptSentAt" TIMESTAMP(3),
ADD COLUMN     "neverPostedPromptSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "walletPromptSentAt" TIMESTAMP(3);
