/* eslint-disable @typescript-eslint/no-non-null-assertion */
import pg from 'pg';
const { Client } = pg;

const unitStatus = new Map<string, number>();

export const setUnitStatus = (
  location: string,
  unitType: string,
  amount: number
) => {
  unitStatus.set(location + '|' + unitType, amount);
};

export const hasUnitStatus = (location: string, unitType: string): boolean => {
  return unitStatus.has(location + '|' + unitType);
};

export const getUnitStatus = (location: string, unitType: string): number => {
  return unitStatus.get(location + '|' + unitType)!;
};

if (!process.env.DATABASE_URL) {
  throw 'DATABASE_URL Environment Variable is not set!';
}

const connectionString: string = process.env.DATABASE_URL;
const client = new Client({ connectionString });
client.connect().then(async (reason: any) => {
  try {
    const res = await client.query(
      'SELECT * FROM "UnitStatus" AS unitStatus WHERE "id" = (SELECT "id" FROM "UnitStatus" AS unitStatus2 WHERE unitStatus."location" = unitStatus2."location" AND unitStatus."unitType" = unitStatus2."unitType" ORDER BY unitStatus2."timestamp" DESC LIMIT 1) ORDER BY unitStatus."location" DESC, unitStatus."unitType"'
    );
    for (const row of res.rows) {
      unitStatus.set(row.location + '|' + row.unitType, row.amount);
    }
    console.log(unitStatus);
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.stack);
    }
  } finally {
    client.end();
  }
});
