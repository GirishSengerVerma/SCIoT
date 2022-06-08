-- CreateEnum
CREATE TYPE "SensorLocation" AS ENUM ('STUTTGART_VAIHINGEN_OFFICE', 'STUTTGART_KILLESBERG_PARK', 'STUTTGART_MAX_EYTH_SEE');

-- CreateEnum
CREATE TYPE "SensorMode" AS ENUM ('PHYSICAL', 'EXTREMELY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'EXTREMELY_HIGH');

-- CreateEnum
CREATE TYPE "SensorMeasure" AS ENUM ('TEMPERATURE', 'WIND_SPEED', 'HUMIDITY', 'PRESSURE', 'VIBRATION', 'CO', 'CO2', 'SOUND');

-- CreateEnum
CREATE TYPE "SensorUnit" AS ENUM ('DEGREES_CELSIUS', 'KILOMETERS_PER_HOUR', 'PERCENTAGE', 'HPA', 'RICHTER_MAGNITUDE', 'PPM', 'DB');

-- CreateEnum
CREATE TYPE "WeatherEventType" AS ENUM ('STORM', 'TORNADO', 'HAIL_STORM', 'THUNDER_STORM', 'HURRICANE', 'BLIZZARD', 'HIGH_WATER', 'FLOOD', 'COLD', 'HEAT', 'WILD_FIRE', 'EARTH_QUAKE', 'BAD_AIR');

-- CreateEnum
CREATE TYPE "WeatherEventRiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'EXTREME');

-- CreateTable
CREATE TABLE "Sensor" (
    "id" SERIAL NOT NULL,
    "instanceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPhysical" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Sensor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensorMetaData" (
    "id" SERIAL NOT NULL,
    "instanceId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "location" "SensorLocation" NOT NULL,
    "mode" "SensorMode" NOT NULL,

    CONSTRAINT "SensorMetaData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensorTelemetryData" (
    "id" SERIAL NOT NULL,
    "instanceId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "unit" "SensorUnit" NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "SensorTelemetryData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeatherEvent" (
    "id" SERIAL NOT NULL,
    "location" "SensorLocation" NOT NULL,
    "type" "WeatherEventType" NOT NULL,

    CONSTRAINT "WeatherEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeatherEventRisk" (
    "id" SERIAL NOT NULL,
    "weatherEventId" INTEGER NOT NULL,
    "riskLevel" "WeatherEventRiskLevel" NOT NULL DEFAULT E'LOW',
    "start" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end" TIMESTAMP(3),

    CONSTRAINT "WeatherEventRisk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sensor_instanceId_key" ON "Sensor"("instanceId");

-- AddForeignKey
ALTER TABLE "SensorMetaData" ADD CONSTRAINT "SensorMetaData_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Sensor"("instanceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensorTelemetryData" ADD CONSTRAINT "SensorTelemetryData_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Sensor"("instanceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeatherEventRisk" ADD CONSTRAINT "WeatherEventRisk_weatherEventId_fkey" FOREIGN KEY ("weatherEventId") REFERENCES "WeatherEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
