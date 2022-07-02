/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import { localStorageStore } from '@babichjacob/svelte-localstorage/svelte-kit';
import type { Writable } from 'svelte/store';

import { enumValueToString } from '$root/utils/enumUtil';
import { Location } from '@prisma/client';

const initialSelectedLocation = enumValueToString(Location.STUTTGART_KILLESBERG_PARK);
export const selectedLocation: Writable<string> = localStorageStore(
	'selectedLocation',
	initialSelectedLocation
);
