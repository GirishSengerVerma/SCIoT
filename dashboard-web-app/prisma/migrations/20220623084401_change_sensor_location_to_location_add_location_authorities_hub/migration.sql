/*
  Warnings:

  - The `moveUnitsFromLocation` column on the `WeatherEventAction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `moveUnitsToLocation` column on the `WeatherEventAction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `location` on the `SensorMetaData` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `location` on the `WeatherEvent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Location" AS ENUM ('STUTTGART_VAIHINGEN_OFFICE', 'STUTTGART_KILLESBERG_PARK', 'STUTTGART_MAX_EYTH_SEE', 'AUTHORITIES_HUB');

-- AlterTable
ALTER TABLE "SensorMetaData" DROP COLUMN "location",
ADD COLUMN     "location" "Location" NOT NULL;

-- AlterTable
ALTER TABLE "WeatherEvent" DROP COLUMN "location",
ADD COLUMN     "location" "Location" NOT NULL;

-- AlterTable
ALTER TABLE "WeatherEventAction" DROP COLUMN "moveUnitsFromLocation",
ADD COLUMN     "moveUnitsFromLocation" "Location",
DROP COLUMN "moveUnitsToLocation",
ADD COLUMN     "moveUnitsToLocation" "Location";

-- DropEnum
DROP TYPE "SensorLocation";
