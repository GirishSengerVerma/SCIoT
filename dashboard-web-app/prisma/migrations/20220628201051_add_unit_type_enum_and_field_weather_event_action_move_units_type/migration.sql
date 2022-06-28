-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('AMBULANCE', 'POLICE_CAR', 'FIRE_TRUCK');

-- AlterTable
ALTER TABLE "WeatherEventAction" ADD COLUMN     "moveUnitsType" "UnitType";
