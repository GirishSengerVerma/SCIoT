/*
  Warnings:

  - A unique constraint covering the columns `[unitType,location,timestamp]` on the table `UnitStatus` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UnitStatus_unitType_location_key";

-- AlterTable
ALTER TABLE "UnitStatus" ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "WeatherEvent" ADD COLUMN     "end" TIMESTAMP(3),
ADD COLUMN     "start" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "UnitStatus_unitType_location_timestamp_key" ON "UnitStatus"("unitType", "location", "timestamp");
