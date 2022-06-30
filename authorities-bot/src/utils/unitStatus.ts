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
      'SELECT * FROM "UnitStatus" ORDER BY "location", "unitType"'
    );
    for (let row of res.rows) {
      unitStatus.set(row.location + '|' + row.unitType, row.amount);
    }
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.stack);
    }
  } finally {
    client.end();
  }
});
