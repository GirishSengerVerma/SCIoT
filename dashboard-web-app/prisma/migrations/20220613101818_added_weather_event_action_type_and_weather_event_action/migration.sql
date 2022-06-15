-- CreateEnum
CREATE TYPE "WeatherEventActionType" AS ENUM ('PLANNING_INCREASE_RISK_LEVEL', 'PLANNING_DECREASE_RISK_LEVEL', 'ALERT_LOCALS_BY_LIGHT', 'ALERT_LOCALS_BY_SOUND', 'ALERT_LOCALS_BY_DEVICE_NOTIFICATION', 'ALERT_AUTHORITIES_BY_DEVICE_NOTIFICATION', 'COUNTER_MEASURE_DRIVE_UP_WATER_PROTECTION_WALL', 'COUNTER_MEASURE_LOCK_DOWN_LOCATION', 'COUNTER_MEASURE_REOPEN_LOCATION', 'COUNTER_MEASURE_MOVE_UNITS_REQUEST', 'COUNTER_MEASURE_MOVE_UNITS_RESPONSE');

-- CreateTable
CREATE TABLE "WeatherEventAction" (
    "id" SERIAL NOT NULL,
    "weatherEventId" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "WeatherEventActionType" NOT NULL,
    "wasManuallyTaken" BOOLEAN NOT NULL DEFAULT false,
    "moveUnitsFromLocation" "SensorLocation",
    "moveUnitsToLocation" "SensorLocation",
    "moveUnitsAmount" INTEGER,

    CONSTRAINT "WeatherEventAction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WeatherEventAction" ADD CONSTRAINT "WeatherEventAction_weatherEventId_fkey" FOREIGN KEY ("weatherEventId") REFERENCES "WeatherEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;