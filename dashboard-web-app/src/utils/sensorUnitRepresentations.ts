import { SensorUnit } from '@prisma/client';

export const SENSOR_UNIT_REPRESENTATION_MAP: Map<SensorUnit, string> = new Map<SensorUnit, string>([
	[SensorUnit.DEGREES_CELSIUS, '°C'],
	[SensorUnit.KILOMETERS_PER_HOUR, 'km/h'],
	[SensorUnit.PERCENTAGE, '%'],
	[SensorUnit.HPA, 'hPa'],
	[SensorUnit.RICHTER_MAGNITUDE, 'Ri.'],
	[SensorUnit.PPM, 'ppm'],
	[SensorUnit.DB, 'dB'],
	[SensorUnit.METERS, 'm']
]);
