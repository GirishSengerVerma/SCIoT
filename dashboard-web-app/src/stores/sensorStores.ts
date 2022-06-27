// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { localStorageStore } from "@babichjacob/svelte-localstorage/svelte-kit";
import { Location } from "@prisma/client";
import type { Writable } from "svelte/store";

import { enumValueToString } from "$root/utils/enumUtil";
import { DataPeriod } from "$root/types/dataPeriod";

const initialSensorLocation = enumValueToString(Location.STUTTGART_KILLESBERG_PARK);
export const sensorLocation: Writable<string> = localStorageStore("sensorLocation", initialSensorLocation);

const initialSensorDataPeriod = enumValueToString(DataPeriod.LIVE_DATA);
export const sensorDataPeriod: Writable<string> = localStorageStore("sensorDatPeriod", initialSensorDataPeriod);
