/*
  Warnings:

  - You are about to drop the column `mode` on the `SensorMetaData` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SensorSimulationMode" AS ENUM ('EXTREMELY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'EXTREMELY_HIGH');

-- CreateEnum
CREATE TYPE "SensorSimulationBehavior" AS ENUM ('NORMAL_DISTRIBUTED', 'INCREASING', 'DECREASING');

-- AlterTable
ALTER TABLE "SensorMetaData" DROP COLUMN "mode",
ADD COLUMN     "simulationBehavior" "SensorSimulationBehavior",
ADD COLUMN     "simulationMode" "SensorSimulationMode";

-- DropEnum
DROP TYPE "SensorMode";
