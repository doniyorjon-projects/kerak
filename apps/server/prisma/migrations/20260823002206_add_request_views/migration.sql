-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "viewsCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "RequestView" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "viewerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RequestView_requestId_viewerId_key" ON "RequestView"("requestId", "viewerId");

-- AddForeignKey
ALTER TABLE "RequestView" ADD CONSTRAINT "RequestView_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;
