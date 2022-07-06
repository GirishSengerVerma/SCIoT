import pg from 'pg';
const { Client } = pg;

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

if (!process.env.DATABASE_URL) {
  throw 'DATABASE_URL Environment Variable is not set!';
}

const connectionString: string = process.env.DATABASE_URL;
const client = new Client({ connectionString });
client.connect().then(async (reason: any) => {
  try {
    const res = await client.query(
      'SELECT * FROM "WeatherEvent" WHERE "end" IS NULL ORDER BY "type", "location", "start"'
    );
    for (const row of res.rows) {
      addWeatherEvent(row.id, row.location, row.type);
    }
    console.log('Initial Weather Events:', weatherEventIds);
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.stack);
    }
  } finally {
    client.end();
  }
});
