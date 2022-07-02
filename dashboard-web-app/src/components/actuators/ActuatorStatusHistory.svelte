<script lang="ts">
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc.js';

	dayjs.extend(utc);

	import type { ActuatorStatusDataWithRelatedWeatherEventData } from '$root/types/additionalPrismaTypes';
	import LoadingSpinner from '../core/LoadingSpinner.svelte';
	import { formatWeatherEventAction } from '$root/utils/weatherEventUtils';

	export let loading = false;
	export let actuatorHistoricStatusData:
		| ActuatorStatusDataWithRelatedWeatherEventData[]
		| undefined;
</script>

<div class="flex flex-col py-3">
	<h3 class="w-fit text-md md:text-lg mb-3 pb-1 font-bold border-b-2 border-primary">
		Actuator Status History
	</h3>
	{#if loading}
		<LoadingSpinner />
	{:else}
		<div
			class="relative overflow-x-auto border border-accentLight dark:border-accentDark sm:rounded-lg my-2"
		>
			<table class="table-auto w-full text-sm text-left">
				<thead class="uppercase text-center border-b border-accentLight dark:border-accentDark">
					<tr>
						<th scope="col" class="px-6 py-3">Date and Time</th>
						<th scope="col" class="px-6 py-3">Status</th>
						<th scope="col" class="px-6 py-3">INITIATED BY</th>
					</tr>
				</thead>
				<tbody>
					{#if actuatorHistoricStatusData}
						{#each actuatorHistoricStatusData as statusData, i}
							<tr class=" text-center">
								<td class="py-4 font-semibold whitespace-nowrap"
									>{dayjs(statusData.timestamp).format('DD.MM.YYYY HH:mm:ss')}</td
								>
								<td
									><div
										class={'rounded-full w-fit mx-auto ' +
											(statusData.enabled ? 'bg-green-300' : 'bg-red-300') +
											' text-xs md:text-sm text-black px-3'}
									>
										{statusData.enabled ? 'Enabled' : 'Disabled'}
									</div>
								</td>
								<td>
									{statusData.lastChangedBy
										? formatWeatherEventAction(statusData.lastChangedBy, true, false)
										: '-'}
								</td>
							</tr>
							{#if i < actuatorHistoricStatusData.length - 1}
								<hr />
							{/if}
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	{/if}
</div>
