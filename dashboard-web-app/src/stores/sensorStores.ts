/* eslint-disable @typescript-eslint/no-non-null-assertion */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { localStorageStore } from '@babichjacob/svelte-localstorage/svelte-kit';
import type { Sensor, SensorMetaData, SensorTelemetryData } from '@prisma/client';
import { writable, type Writable } from 'svelte/store';

import { DataPeriod } from '$root/types/dataPeriod';
import { enumValueToString } from '$root/utils/enumUtil';

const initialSensorDataPeriod = enumValueToString(DataPeriod.LIVE_DATA);
export const sensorDataPeriod: Writable<string> = localStorageStore(
	'sensorDataPeriod',
	initialSensorDataPeriod
);

interface SensorStore extends Writable<Map<string, Sensor>> {
	add(value: Sensor): void;
	remove(sensorInstanceId: string): void;
	reset(): void;
}

const createSensorStore = () => {
	const store: Writable<Map<string, Sensor>> = writable(new Map<string, Sensor>());

	const sensorStore: SensorStore = {
		...store,
		add: (value: Sensor) => store.update((currentMap) => currentMap.set(value.instanceId, value)),
		remove: (sensorInstanceId: string) =>
			store.update((currentMap) => {
				currentMap.delete(sensorInstanceId);
				return currentMap;
			}),
		reset: () => store.set(new Map<string, Sensor>())
	};

	return sensorStore;
};

export const sensors: SensorStore = createSensorStore();

// TODO DWA SensorMetaDataStore, LiveSensorDataStore : Automatically remove old values

interface SensorMetaDataStore extends Writable<Map<string, SensorMetaData>> {
	addValue(value: SensorMetaData): void;
	resetSensor(sensorInstanceId: string): void;
	reset(): void;
}

const createSensorMetaDataStore = () => {
	const store: Writable<Map<string, SensorMetaData>> = writable(new Map<string, SensorMetaData>());

	const sensorMetaDataStore: SensorMetaDataStore = {
		...store,
		addValue: (value: SensorMetaData) =>
			store.update((currentMap) => {
				if (currentMap.has(value.instanceId) && currentMap.get(value.instanceId)!.timestamp > value.timestamp) {
					console.log('Reject older sensor metadata value');
					return currentMap; // reject older value
				}
				return currentMap.set(value.instanceId, value);
			}),
		resetSensor: (sensorInstanceId: string) =>
			store.update((currentMap) => {
				currentMap.delete(sensorInstanceId);
				return currentMap;
			}),
		reset: () => store.set(new Map<string, SensorMetaData>())
	};

	return sensorMetaDataStore;
};

export const sensorMetaData: SensorMetaDataStore = createSensorMetaDataStore();

interface LiveSensorDataStore extends Writable<Map<string, SensorTelemetryData[]>> {
	addValue(value: SensorTelemetryData): void;
	resetSensor(sensorInstanceId: string): void;
	reset(): void;
}

const createLiveSensorDataStore = () => {
	const store: Writable<Map<string, SensorTelemetryData[]>> = writable(
		new Map<string, SensorTelemetryData[]>()
	);

	const liveSensorDataStore: LiveSensorDataStore = {
		...store,
		addValue: (value: SensorTelemetryData) =>
			store.update((currentMap) => {
				if (currentMap.has(value.instanceId)
					&& currentMap.get(value.instanceId)!.length > 0
					&& currentMap.get(value.instanceId)![currentMap.get(value.instanceId)!.length - 1].timestamp > value.timestamp) {
					console.log('Reject older sensor telemetry value');
					return currentMap; // reject older value
				}
				return currentMap.set(value.instanceId, [...(currentMap.get(value.instanceId) ?? []), value]);
			}),
		resetSensor: (sensorInstanceId: string) =>
			store.update((currentMap) => {
				currentMap.delete(sensorInstanceId);
				return currentMap;
			}),
		reset: () => store.set(new Map<string, SensorTelemetryData[]>())
	};

	return liveSensorDataStore;
};

export const selectedSensorInstanceId: Writable<string> = localStorageStore(
	'selectedSensorInstanceId',
	''
);

export const liveSensorData: LiveSensorDataStore = createLiveSensorDataStore();
