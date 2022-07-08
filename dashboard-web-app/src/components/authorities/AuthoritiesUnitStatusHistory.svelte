<script lang="ts">
	import { format } from 'timeago.js';
	
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc.js';

	dayjs.extend(utc);

	import type { UnitsStatusDataWithRelatedWeatherEventData } from '$root/types/additionalPrismaTypes';
	import { formatWeatherEventAction } from '$root/utils/weatherEventUtils';
	import SubTitle from '$root/components/core/SubTitle.svelte';
	import { getColorByUnitType } from '$root/utils/unitTypeUtils';

	export let loading = false;
	export let authoritiesHistoricUnitStatusData:
		| UnitsStatusDataWithRelatedWeatherEventData[]
		| undefined;
</script>

<div class="w-full flex flex-col py-3 justify-evenly">
	<SubTitle text="Units Status History" />
	<div class="w-full border border-accentLight dark:border-accentDark rounded-lg my-2">
		<table class="w-full text-xs lg:text-sm text-left">
			<thead class="flex w-full overflow-scroll uppercase text-center border-b border-accentLight dark:border-accentDark">
				<tr class="flex w-full">
					<th scope="col" class="w-1/3 px-6 py-3">Date and Time</th>
					<th scope="col" class="w-1/3 px-6 py-3">Status</th>
					<th scope="col" class="w-1/3 px-6 py-3">Caused by</th>
				</tr>
			</thead>
			<tbody class="flex flex-col items-center justify-between overflow-scroll w-full max-h-[200px]">
				{#if !loading && authoritiesHistoricUnitStatusData}
					{#each authoritiesHistoricUnitStatusData as unitStatus, i}
						<tr class={"flex w-full text-center" + ((i < authoritiesHistoricUnitStatusData.length - 1) ? " border-b border-accentLight dark:border-accentDark" : "")}>
							<td class="w-1/3 py-4 px-2 font-semibold"
								>{dayjs(unitStatus.timestamp).format('DD.MM.YYYY HH:mm:ss')} ({format(unitStatus.timestamp, 'en_US')})</td
							>
							<td class="flex w-1/3 justify-center items-center"
								><div
									class={'rounded-full w-fit mx-auto text-xs md:text-sm text-black px-3 ' + getColorByUnitType(unitStatus.unitType)}
								>
									{unitStatus.amount} Units
								</div>
							</td>
							<td class="flex w-1/3 justify-center items-center">
								{unitStatus.changedBy
									? formatWeatherEventAction(unitStatus.changedBy, true, true, false)
									: '-'}
							</td>
						</tr>
					{/each}
				{:else}
					<tr class="flex w-full text-center">
						<td class="w-1/3 py-4 px-2 font-semibold ">Loading..</td>
						<td class="w-1/3">Loading..</td>
						<td class="w-1/3">Loading..</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>
