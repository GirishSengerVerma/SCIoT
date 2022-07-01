// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { localStorageStore } from '@babichjacob/svelte-localstorage/svelte-kit';
import { Location, type SensorMetaData, type SensorTelemetryData } from '@prisma/client';
import { derived, writable, type Readable, type Writable } from 'svelte/store';

import { DataPeriod } from '$root/types/dataPeriod';
import { socket } from '$root/utils/socketio';
import { enumValueToString } from '$root/utils/enumUtil';

const initialSensorLocation = enumValueToString(Location.STUTTGART_KILLESBERG_PARK);
export const sensorLocation: Writable<string> = localStorageStore(
	'sensorLocation',
	initialSensorLocation
);

const initialSensorDataPeriod = enumValueToString(DataPeriod.LIVE_DATA);
export const sensorDataPeriod: Writable<string> = localStorageStore(
	'sensorDatPeriod',
	initialSensorDataPeriod
);

// TODO DWA SensorMetaDataStore, LiveSensorDataStore : Automatically remove old values

interface SensorMetaDataStore extends Writable<Map<string, SensorMetaData>> {
	addValue(value: SensorMetaData): void;
	resetSensor(sensorId: string): void;
	reset(): void;
}

const createSensorMetaDataStore = () => {
	const store: Writable<Map<string, SensorMetaData>> = writable(new Map<string, SensorMetaData>());

	const sensorMetaDataStore: SensorMetaDataStore = {
		...store,
		addValue: (value: SensorMetaData) =>
			store.update((currentMap) => currentMap.set(value.instanceId, value)),
		resetSensor: (sensorId: string) =>
			store.update((currentMap) => {
				currentMap.delete(sensorId);
				return currentMap;
			}),
		reset: () => store.set(new Map<string, SensorMetaData>())
	};

	return sensorMetaDataStore;
};

export const sensorMetaData: SensorMetaDataStore = createSensorMetaDataStore();

interface LiveSensorDataStore extends Writable<Map<string, SensorTelemetryData[]>> {
	addValue(value: SensorTelemetryData): void;
	resetSensor(sensorId: string): void;
	reset(): void;
}

const createLiveSensorDataStore = () => {
	const store: Writable<Map<string, SensorTelemetryData[]>> = writable(
		new Map<string, SensorTelemetryData[]>()
	);

	const liveSensorDataStore: LiveSensorDataStore = {
		...store,
		addValue: (value: SensorTelemetryData) =>
			store.update((currentMap) =>
				currentMap.set(value.instanceId, [...(currentMap.get(value.instanceId) ?? []), value])
			),
		resetSensor: (sensorId: string) =>
			store.update((currentMap) => {
				currentMap.delete(sensorId);
				return currentMap;
			}),
		reset: () => store.set(new Map<string, SensorTelemetryData[]>())
	};

	return liveSensorDataStore;
};

export const liveSensorData: LiveSensorDataStore = createLiveSensorDataStore();

const sensorTelemetryTopicPrefix = 'sensors/telemetry';
const sensorMetadataTopicPrefix = 'sensors/metadata';

socket.on(sensorTelemetryTopicPrefix, (message) => {
	try {
		const messageJSON = JSON.parse(message.toString());
		liveSensorData.addValue(messageJSON as SensorTelemetryData);
	} catch (error) {
		console.error(
			'Web App: Error processing incoming Sensor Telemetry Data Socket IO message: ',
			error
		);
	}
});

socket.on(sensorMetadataTopicPrefix, (message) => {
	try {
		const messageJSON = JSON.parse(message.toString());
		sensorMetaData.addValue(messageJSON as SensorMetaData);
	} catch (error) {
		console.error('Web App: Error processing incoming Sensor MetaData Socket IO message: ', error);
	}
});
