-- DropForeignKey
ALTER TABLE "WeatherEventAction" DROP CONSTRAINT "WeatherEventAction_weatherEventId_fkey";

-- AlterTable
ALTER TABLE "WeatherEventAction" ALTER COLUMN "weatherEventId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "WeatherEventAction" ADD CONSTRAINT "WeatherEventAction_weatherEventId_fkey" FOREIGN KEY ("weatherEventId") REFERENCES "WeatherEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
