-- CreateTable
CREATE TABLE "UnitStatus" (
    "id" SERIAL NOT NULL,
    "unitType" "UnitType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "weatherEventActionId" INTEGER,

    CONSTRAINT "UnitStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UnitStatus_unitType_key" ON "UnitStatus"("unitType");

-- AddForeignKey
ALTER TABLE "UnitStatus" ADD CONSTRAINT "UnitStatus_weatherEventActionId_fkey" FOREIGN KEY ("weatherEventActionId") REFERENCES "WeatherEventAction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
