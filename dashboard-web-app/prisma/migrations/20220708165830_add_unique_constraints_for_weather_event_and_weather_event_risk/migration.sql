/*
  Warnings:

  - A unique constraint covering the columns `[location,type,start]` on the table `WeatherEvent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[weatherEventId,start]` on the table `WeatherEventRisk` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "WeatherEvent_location_type_start_key" ON "WeatherEvent"("location", "type", "start");

-- CreateIndex
CREATE UNIQUE INDEX "WeatherEventRisk_weatherEventId_start_key" ON "WeatherEventRisk"("weatherEventId", "start");
