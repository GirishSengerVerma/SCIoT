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

<div class="w-full flex flex-col py-3 min-h-[220px] max-h-40 lg:max-h-96 justify-evenly">
	<SubTitle text="Units Status History" />
	<div class="overflow-auto border border-accentLight dark:border-accentDark rounded-lg my-2">
		<table class="table-auto w-full text-xs lg:text-sm text-left">
			<thead class="uppercase text-center border-b border-accentLight dark:border-accentDark">
				<tr>
					<th scope="col" class="px-6 py-3">Date and Time</th>
					<th scope="col" class="px-6 py-3">Status</th>
					<th scope="col" class="px-6 py-3">Caused by</th>
				</tr>
			</thead>
			<tbody>
				{#if !loading && authoritiesHistoricUnitStatusData}
					{#each authoritiesHistoricUnitStatusData as unitStatus, i}
						<tr class={"text-center" + ((i < authoritiesHistoricUnitStatusData.length - 1) ? " border-b border-accentLight dark:border-accentDark" : "")}>
							<td class="py-4 px-2 font-semibold whitespace-nowrap"
								>{dayjs(unitStatus.timestamp).format('DD.MM.YYYY HH:mm:ss')} ({format(unitStatus.timestamp, 'en_US')})</td
							>
							<td
								><div
									class={'rounded-full w-fit mx-auto text-xs md:text-sm text-black px-3 ' + getColorByUnitType(unitStatus.unitType)}
								>
									{unitStatus.amount} Units
								</div>
							</td>
							<td class="max-w-xs">
								{unitStatus.changedBy
									? formatWeatherEventAction(unitStatus.changedBy, true, true, false)
									: '-'}
							</td>
						</tr>
					{/each}
				{:else}
					<tr class="text-center">
						<td class="py-4 px-2 font-semibold ">Loading..</td>
						<td>Loading..</td>
						<td>Loading..</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>
