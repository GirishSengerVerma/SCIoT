<script lang="ts">
	import { format } from 'timeago.js';
	
    import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc.js';

	dayjs.extend(utc);

	import type { WeatherEvent } from '@prisma/client';
    import { enumValueToString } from '$root/utils/enumUtil';
    import { formatWeatherEventAction, getWeatherEventRiskLevelColor } from '$root/utils/weatherEventUtils';
	import SubTitle from '$root/components/core/SubTitle.svelte';
    import type { HistoricWeatherEventData } from "$root/types/additionalPrismaTypes";

    export let isPast: boolean;
    export let loading: boolean;
    export let weatherEvent: WeatherEvent | undefined;
	export let historicWeatherEventData: HistoricWeatherEventData | undefined;
</script>

<div class="w-full flex flex-col py-3 min-h-[220px] max-h-40 lg:max-h-96 justify-evenly">
	<SubTitle text={(isPast ? 'Past ' : '') + 'Weather Event Risk History'} />
	<div class="overflow-auto border border-accentLight dark:border-accentDark rounded-lg my-2">
		<table class="table-auto w-full text-xs lg:text-sm text-left">
			<thead class="uppercase text-center border-b border-accentLight dark:border-accentDark">
				<tr>
					<th scope="col" class="px-6 py-3">Start Date and Time</th>
					<th scope="col" class="px-6 py-3">End Date and Time</th>
					<th scope="col" class="px-6 py-3">Risk Level</th>
				</tr>
			</thead>
			<tbody>
				{#if !loading && historicWeatherEventData}
					{#each historicWeatherEventData.risks as weatherEventRisk, i}
						<tr class={"text-center" + ((i < historicWeatherEventData.risks.length - 1) ? " border-b border-accentLight dark:border-accentDark" : "")}>
							<td class="py-4 px-2 font-semibold whitespace-nowrap"
								>{dayjs(weatherEventRisk.start).format('DD.MM.YYYY HH:mm:ss')} ({format(weatherEventRisk.start, 'en_US')})</td
							>
                            <td class="py-4 px-2 font-semibold whitespace-nowrap"
								>{weatherEventRisk.end ? (dayjs(weatherEventRisk.end).format('DD.MM.YYYY HH:mm:ss') + ' (' + format(weatherEventRisk.end, 'en_US') + ')') : 'Still ongoing'}</td
							>
							<td
								><div
									class={'rounded-full w-fit mx-auto text-xs md:text-sm text-black px-3 ' + getWeatherEventRiskLevelColor(weatherEventRisk.riskLevel)}
								>
									{enumValueToString(weatherEventRisk.riskLevel)}
								</div>
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
	<SubTitle text={(isPast ? 'Past ' : '') + 'Weather Event Actions History'} clazz="mt-10" />
	<div class="overflow-auto border border-accentLight dark:border-accentDark rounded-lg my-2">
		<table class="table-auto w-full text-xs lg:text-sm text-left">
			<thead class="uppercase text-center border-b border-accentLight dark:border-accentDark">
				<tr>
					<th scope="col" class="px-6 py-3">Date and Time</th>
					<th scope="col" class="px-6 py-3">Action</th>
				</tr>
			</thead>
			<tbody>
				{#if !loading && historicWeatherEventData}
					{#each historicWeatherEventData.actions as weatherEventAction, i}
						<tr class={"text-center" + ((i < historicWeatherEventData.risks.length - 1) ? " border-b border-accentLight dark:border-accentDark" : "")}>
							<td class="py-4 px-2 font-semibold whitespace-nowrap"
								>{dayjs(weatherEventAction.timestamp).format('DD.MM.YYYY HH:mm:ss')} ({format(weatherEventAction.timestamp, 'en_US')})</td
							>
							<td class="max-w-xs">
								{weatherEvent ? formatWeatherEventAction({...weatherEventAction, weatherEvent}, false, true, false) : ''}
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