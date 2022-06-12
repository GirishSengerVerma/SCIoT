/*
  Warnings:

  - Added the required column `measure` to the `SensorMetaData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SensorMetaData" ADD COLUMN     "measure" "SensorMeasure" NOT NULL;
