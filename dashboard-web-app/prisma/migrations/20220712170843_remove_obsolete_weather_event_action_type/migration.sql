/*
  Warnings:

  - The values [ALERT_AUTHORITIES_BY_DEVICE_NOTIFICATION] on the enum `WeatherEventActionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "WeatherEventActionType_new" AS ENUM ('PLANNING_INCREASE_RISK_LEVEL', 'PLANNING_DECREASE_RISK_LEVEL', 'ALERT_LOCALS_BY_LIGHT', 'STOP_ALERT_LOCALS_BY_LIGHT', 'ALERT_LOCALS_BY_SOUND', 'STOP_ALERT_LOCALS_BY_SOUND', 'COUNTER_MEASURE_DRIVE_UP_WATER_PROTECTION_WALL', 'COUNTER_MEASURE_DRIVE_DOWN_WATER_PROTECTION_WALL', 'COUNTER_MEASURE_LOCK_DOWN_LOCATION', 'COUNTER_MEASURE_REOPEN_LOCATION', 'COUNTER_MEASURE_MOVE_UNITS_REQUEST', 'COUNTER_MEASURE_MOVE_UNITS_RESPONSE');
ALTER TABLE "WeatherEventAction" ALTER COLUMN "type" TYPE "WeatherEventActionType_new" USING ("type"::text::"WeatherEventActionType_new");
ALTER TYPE "WeatherEventActionType" RENAME TO "WeatherEventActionType_old";
ALTER TYPE "WeatherEventActionType_new" RENAME TO "WeatherEventActionType";
DROP TYPE "WeatherEventActionType_old";
COMMIT;
