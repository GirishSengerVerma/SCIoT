// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { localStorageStore } from '@babichjacob/svelte-localstorage/svelte-kit';
import { writable, type Writable } from 'svelte/store';

import type { Actuator, ActuatorMetaData, ActuatorStatusData } from '@prisma/client';

interface ActuatorStore extends Writable<Map<string, Actuator>> {
	add(value: Actuator): void;
	remove(actuatorInstanceId: string): void;
	reset(): void;
}

const createActuatorStore = () => {
	const store: Writable<Map<string, Actuator>> = writable(new Map<string, Actuator>());

	const actuatorStore: ActuatorStore = {
		...store,
		add: (value: Actuator) => store.update((currentMap) => currentMap.set(value.instanceId, value)),
		remove: (actuatorInstanceId: string) =>
			store.update((currentMap) => {
				currentMap.delete(actuatorInstanceId);
				return currentMap;
			}),
		reset: () => store.set(new Map<string, Actuator>())
	};

	return actuatorStore;
};

export const actuators: ActuatorStore = createActuatorStore();

// TODO DWA ActuatorMetaDataStore, LiveActuatorDataStore : Automatically remove old values

interface ActuatorMetaDataStore extends Writable<Map<string, ActuatorMetaData>> {
	addValue(value: ActuatorMetaData): void;
	resetActuator(actuatorInstanceId: string): void;
	reset(): void;
}

const createActuatorMetaDataStore = () => {
	const store: Writable<Map<string, ActuatorMetaData>> = writable(
		new Map<string, ActuatorMetaData>()
	);

	const actuatorMetaDataStore: ActuatorMetaDataStore = {
		...store,
		addValue: (value: ActuatorMetaData) =>
			store.update((currentMap) => currentMap.set(value.instanceId, value)),
		resetActuator: (actuatorInstanceId: string) =>
			store.update((currentMap) => {
				currentMap.delete(actuatorInstanceId);
				return currentMap;
			}),
		reset: () => store.set(new Map<string, ActuatorMetaData>())
	};

	return actuatorMetaDataStore;
};

export const actuatorMetaData: ActuatorMetaDataStore = createActuatorMetaDataStore();

interface ActuatorStatusDataStore extends Writable<Map<string, ActuatorStatusData[]>> {
	addValue(value: ActuatorStatusData): void;
	resetActuator(actuatorInstanceId: string): void;
	reset(): void;
}

const createActuatorStatusDataStore = () => {
	const store: Writable<Map<string, ActuatorStatusData[]>> = writable(
		new Map<string, ActuatorStatusData[]>()
	);

	const actuatorStatusDataStore: ActuatorStatusDataStore = {
		...store,
		addValue: (value: ActuatorStatusData) =>
			store.update((currentMap) =>
				currentMap.set(value.instanceId, [...(currentMap.get(value.instanceId) ?? []), value])
			),
		resetActuator: (actuatorInstanceId: string) =>
			store.update((currentMap) => {
				currentMap.delete(actuatorInstanceId);
				return currentMap;
			}),
		reset: () => store.set(new Map<string, ActuatorStatusData[]>())
	};

	return actuatorStatusDataStore;
};

export const selectedActuatorInstanceId: Writable<string> = localStorageStore(
	'selectedActuatorInstanceId',
	''
);

export const actuatorStatusData: ActuatorStatusDataStore = createActuatorStatusDataStore();
