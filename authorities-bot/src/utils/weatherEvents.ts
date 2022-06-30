export const weatherEventIds = new Set<number>();
const weatherEventLocationsById = new Map<number, string>();
const weatherEventTypesById = new Map<number, string>();

export const hasWeatherEventWithId = (id: number): boolean => {
  return weatherEventIds.has(id);
};

export const addWeatherEvent = (id: number, location: string, type: string) => {
  weatherEventIds.add(id);
  weatherEventLocationsById.set(id, location);
  weatherEventTypesById.set(id, type);
};

export const getWeatherEventLocationById = (id: number): string | undefined => {
  return weatherEventLocationsById.get(id);
};

export const getWeatherEventTypeById = (id: number): string | undefined => {
  return weatherEventTypesById.get(id);
};
