/*
  Warnings:

  - A unique constraint covering the columns `[unitType,location]` on the table `UnitStatus` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `location` to the `UnitStatus` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "UnitStatus_unitType_key";

-- AlterTable
ALTER TABLE "UnitStatus" ADD COLUMN     "location" "Location" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UnitStatus_unitType_location_key" ON "UnitStatus"("unitType", "location");
