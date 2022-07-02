-- CreateEnum
CREATE TYPE "ActuatorType" AS ENUM ('ALARM_LIGHT', 'ALARM_SOUND', 'WATER_PROTECTION_WALL', 'LOCKDOWN');

-- CreateTable
CREATE TABLE "Actuator" (
    "id" SERIAL NOT NULL,
    "instanceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPhysical" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Actuator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActuatorMetaData" (
    "id" SERIAL NOT NULL,
    "instanceId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "location" "Location" NOT NULL,
    "type" "ActuatorType" NOT NULL,

    CONSTRAINT "ActuatorMetaData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActuatorStatusData" (
    "id" SERIAL NOT NULL,
    "instanceId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "weatherEventActionId" INTEGER,

    CONSTRAINT "ActuatorStatusData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Actuator_instanceId_key" ON "Actuator"("instanceId");

-- AddForeignKey
ALTER TABLE "ActuatorMetaData" ADD CONSTRAINT "ActuatorMetaData_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Actuator"("instanceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActuatorStatusData" ADD CONSTRAINT "ActuatorStatusData_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Actuator"("instanceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActuatorStatusData" ADD CONSTRAINT "ActuatorStatusData_weatherEventActionId_fkey" FOREIGN KEY ("weatherEventActionId") REFERENCES "WeatherEventAction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
