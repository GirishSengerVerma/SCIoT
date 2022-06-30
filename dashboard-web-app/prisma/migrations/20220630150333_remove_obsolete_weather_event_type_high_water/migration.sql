/*
  Warnings:

  - The values [HIGH_WATER] on the enum `WeatherEventType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "WeatherEventType_new" AS ENUM ('STORM', 'TORNADO', 'HAIL_STORM', 'THUNDER_STORM', 'HURRICANE', 'BLIZZARD', 'FLOOD', 'COLD', 'HEAT', 'WILD_FIRE', 'EARTH_QUAKE', 'BAD_AIR');
ALTER TABLE "WeatherEvent" ALTER COLUMN "type" TYPE "WeatherEventType_new" USING ("type"::text::"WeatherEventType_new");
ALTER TYPE "WeatherEventType" RENAME TO "WeatherEventType_old";
ALTER TYPE "WeatherEventType_new" RENAME TO "WeatherEventType";
DROP TYPE "WeatherEventType_old";
COMMIT;
