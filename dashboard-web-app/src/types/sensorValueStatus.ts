import { SensorSimulationMode } from '@prisma/client';

export const SensorValueStatus = SensorSimulationMode;

export type SensorValueStatus = typeof SensorValueStatus[keyof typeof SensorValueStatus];
