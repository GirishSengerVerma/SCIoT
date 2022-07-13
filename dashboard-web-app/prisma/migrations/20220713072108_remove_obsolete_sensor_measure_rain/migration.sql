/*
  Warnings:

  - The values [RAIN] on the enum `SensorMeasure` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SensorMeasure_new" AS ENUM ('TEMPERATURE', 'WIND_SPEED', 'HUMIDITY', 'PRESSURE', 'VIBRATION', 'CO', 'CO2', 'WATER_LEVEL', 'LIGHT');
ALTER TABLE "SensorMetaData" ALTER COLUMN "measure" TYPE "SensorMeasure_new" USING ("measure"::text::"SensorMeasure_new");
ALTER TYPE "SensorMeasure" RENAME TO "SensorMeasure_old";
ALTER TYPE "SensorMeasure_new" RENAME TO "SensorMeasure";
DROP TYPE "SensorMeasure_old";
COMMIT;
