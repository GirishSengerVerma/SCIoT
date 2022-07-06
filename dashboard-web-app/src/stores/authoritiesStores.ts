// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { localStorageStore } from '@babichjacob/svelte-localstorage/svelte-kit';
import type { Location, UnitStatus, UnitType } from '@prisma/client';
import { type Writable, writable } from 'svelte/store';

export type UnitStatusKey = {
	location: Location;
	unitType: UnitType;
};

export const parseUnitStatusKeyFromString = (s: string): UnitStatusKey => {
	return {
		location: s.split('|')[0] as Location,
		unitType: s.split('|')[1] as UnitType
	};
};

export const unitStatusKeyToString = (unitStatusKey: UnitStatusKey): string => {
	return unitStatusKey.location + '|' + unitStatusKey.unitType;
};

interface AuthoritiesUnitStatusStore extends Writable<Map<string, UnitStatus>> {
	setStatus(value: UnitStatus): void;
	resetStatus(key: UnitStatusKey): void;
	reset(): void;
}

const createAuthoritiesUnitStatusStore = () => {
	const store: Writable<Map<string, UnitStatus>> = writable(new Map<string, UnitStatus>());

	const authoritiesUnitStatusStore: AuthoritiesUnitStatusStore = {
		...store,
		setStatus: (value: UnitStatus) =>
			store.update((currentMap) => currentMap.set(value.location + '|' + value.unitType, value)),
		resetStatus: (key: UnitStatusKey) =>
			store.update((currentMap) => {
				currentMap.delete(unitStatusKeyToString(key));
				return currentMap;
			}),
		reset: () => store.set(new Map<string, UnitStatus>())
	};

	return authoritiesUnitStatusStore;
};

export const selectedAuthorityLocationAndUnitType: Writable<string> = localStorageStore(
	'selectedAuthorityLocationAndUnitType',
	''
);

export const authoritiesUnitStatus: AuthoritiesUnitStatusStore = createAuthoritiesUnitStatusStore();
