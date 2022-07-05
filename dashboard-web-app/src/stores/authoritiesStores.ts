import type { Location, UnitStatus, UnitType } from '@prisma/client';
import { type Writable, writable } from 'svelte/store';

type UnitStatusKey = {
	location: Location;
	unitType: UnitType;
};

interface AuthoritiesUnitStatusStore extends Writable<Map<UnitStatusKey, UnitStatus>> {
	setStatus(value: UnitStatus): void;
	resetStatus(key: UnitStatusKey): void;
	reset(): void;
}

const createAuthoritiesUnitStatusStore = () => {
	const store: Writable<Map<UnitStatusKey, UnitStatus>> = writable(
		new Map<UnitStatusKey, UnitStatus>()
	);

	const authoritiesUnitStatusStore: AuthoritiesUnitStatusStore = {
		...store,
		setStatus: (value: UnitStatus) =>
			store.update((currentMap) =>
				currentMap.set({ location: value.location, unitType: value.unitType }, value)
			),
		resetStatus: (key: UnitStatusKey) =>
			store.update((currentMap) => {
				currentMap.delete(key);
				return currentMap;
			}),
		reset: () => store.set(new Map<UnitStatusKey, UnitStatus>())
	};

	return authoritiesUnitStatusStore;
};

// TODO DWA Use and test authoritiesUnitStatus

export const authoritiesUnitStatus: AuthoritiesUnitStatusStore = createAuthoritiesUnitStatusStore();
