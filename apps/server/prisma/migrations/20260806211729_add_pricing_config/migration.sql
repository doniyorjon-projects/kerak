-- CreateTable
CREATE TABLE "PricingConfig" (
    "id" TEXT NOT NULL,
    "boostDays3" INTEGER NOT NULL DEFAULT 10000,
    "boostDays7" INTEGER NOT NULL DEFAULT 20000,
    "boostDays30" INTEGER NOT NULL DEFAULT 50000,
    "planStandard" INTEGER NOT NULL DEFAULT 25000,
    "planBusiness" INTEGER NOT NULL DEFAULT 60000,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingConfig_pkey" PRIMARY KEY ("id")
);
