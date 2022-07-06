// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { localStorageStore } from '@babichjacob/svelte-localstorage/svelte-kit';
import { writable, type Writable } from 'svelte/store';

import type { WeatherEvent, WeatherEventRisk } from '@prisma/client';

interface WeatherEventStore extends Writable<Map<number, WeatherEvent>> {
    add(value: WeatherEvent): void;
    remove(id: number): void;
    reset(): void;
}

const createWeatherEventStore = () => {
    const store: Writable<Map<number, WeatherEvent>> = writable(new Map<number, WeatherEvent>());

    const weatherEventStore: WeatherEventStore = {
        ...store,
        add: (value: WeatherEvent) => store.update((currentMap) => currentMap.set(value.id, value)),
        remove: (id: number) =>
            store.update((currentMap) => {
                currentMap.delete(id);
                return currentMap;
            }),
        reset: () => store.set(new Map<number, WeatherEvent>())
    };

    return weatherEventStore;
};

export const weatherEvents: WeatherEventStore = createWeatherEventStore();

interface CurrentWeatherEventRiskStore extends Writable<Map<number, WeatherEventRisk>> {
    addValue(value: WeatherEventRisk): void;
    resetForWeatherEvent(weatherEventId: number): void;
    reset(): void;
}

const createCurrentWeatherEventRiskStore = () => {
    const store: Writable<Map<number, WeatherEventRisk>> = writable(
        new Map<number, WeatherEventRisk>()
    );

    const currentWeatherEventRiskStore: CurrentWeatherEventRiskStore = {
        ...store,
        addValue: (value: WeatherEventRisk) =>
            store.update((currentMap) => currentMap.set(value.weatherEventId, value)),
        resetForWeatherEvent: (weatherEventId: number) =>
            store.update((currentMap) => {
                currentMap.delete(weatherEventId);
                return currentMap;
            }),
        reset: () => store.set(new Map<number, WeatherEventRisk>())
    };

    return currentWeatherEventRiskStore;
};

export const currentWeatherEventRisk: CurrentWeatherEventRiskStore = createCurrentWeatherEventRiskStore();

export const selectedWeatherEventId: Writable<number> = localStorageStore(
    'selectedWeatherEventId',
    -1
);