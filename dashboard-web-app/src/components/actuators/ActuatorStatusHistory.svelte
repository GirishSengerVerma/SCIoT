<script lang="ts">
	import { format } from 'timeago.js';

	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc.js';

	dayjs.extend(utc);

	import type { ActuatorStatusDataWithRelatedWeatherEventData } from '$root/types/additionalPrismaTypes';
	import { formatWeatherEventAction } from '$root/utils/weatherEventUtils';
	import SubTitle from '$root/components/core/SubTitle.svelte';

	export let loading = false;
	export let actuatorHistoricStatusData:
		| ActuatorStatusDataWithRelatedWeatherEventData[]
		| undefined;
</script>

<div class="w-full flex flex-col py-3 justify-evenly">
	<SubTitle text="Actuator Status History" />
	<div class="w-full border border-accentLight dark:border-accentDark rounded-lg my-2">
		<table class="w-full text-xs lg:text-sm text-left">
			<thead class="flex w-full overflow-scroll uppercase text-center border-b border-accentLight dark:border-accentDark">
				<tr class="flex w-full items-center">
					<th scope="col" class="w-1/3 lg:px-6 py-1 lg:py-3">Date and Time</th>
					<th scope="col" class="w-1/3 lg:px-6 py-1 lg:py-3">Status</th>
					<th scope="col" class="w-1/3 lg:px-6 py-1 lg:py-3">Caused by</th>
				</tr>
			</thead>
			<tbody class="flex flex-col items-center justify-between overflow-scroll w-full max-h-[200px]">
				{#if !loading && actuatorHistoricStatusData}
					{#each actuatorHistoricStatusData as statusData, i}
						<tr class={"flex w-full text-center" + ((i < actuatorHistoricStatusData.length - 1) ? " border-b border-accentLight dark:border-accentDark" : "")}>
							<td class="w-1/3 py-4 px-2 font-semibold"
								>{dayjs(statusData.timestamp).format('DD.MM.YYYY HH:mm:ss')} ({format(statusData.timestamp, 'en_US')})</td
							>
							<td class="flex w-1/3 justify-center items-center"
								><div
									class={'rounded-full w-fit mx-auto ' +
										(statusData.enabled ? 'bg-green-300' : 'bg-red-300') +
										' text-xs md:text-sm text-black px-3'}
								>
									{statusData.enabled ? 'Enabled' : 'Disabled'}
								</div>
							</td>
							<td class="flex w-1/3 justify-center items-center">
								{statusData.lastChangedBy
									? formatWeatherEventAction(statusData.lastChangedBy, true, false, false)
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
