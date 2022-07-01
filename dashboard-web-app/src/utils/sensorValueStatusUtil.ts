import { SensorValueStatus } from '$root/types/sensorValueStatus';
import type { SensorMeasure } from '@prisma/client';
import type { Decimal } from '@prisma/client/runtime';

export const getSensorValueStatus = (
	measure: SensorMeasure,
	value: Decimal | undefined
): SensorValueStatus => {
	// TODO DWA Implement!
	return SensorValueStatus.MEDIUM;
};

export const getSensorValueStatusBgColor = (valueStatus: SensorValueStatus): string => {
	if (valueStatus === SensorValueStatus.EXTREMELY_LOW) {
		return 'bg-blue-300';
	} else if (valueStatus === SensorValueStatus.LOW) {
		return 'bg-cyan-300';
	} else if (valueStatus === SensorValueStatus.MEDIUM) {
		return 'bg-green-300';
	} else if (valueStatus === SensorValueStatus.HIGH) {
		return 'bg-yellow-300';
	} else if (valueStatus === SensorValueStatus.EXTREMELY_HIGH) {
		return 'bg-red-300';
	} else {
		return 'bg-accentLight';
	}
};

export const getSensorValueStatusBorderColor = (valueStatus: SensorValueStatus): string => {
	if (valueStatus === SensorValueStatus.EXTREMELY_LOW) {
		return 'border-blue-300';
	} else if (valueStatus === SensorValueStatus.LOW) {
		return 'border-cyan-300';
	} else if (valueStatus === SensorValueStatus.MEDIUM) {
		return 'border-green-300';
	} else if (valueStatus === SensorValueStatus.HIGH) {
		return 'border-yellow-300';
	} else if (valueStatus === SensorValueStatus.EXTREMELY_HIGH) {
		return 'border-red-300';
	} else {
		return 'border-accentLight';
	}
};
