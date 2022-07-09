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

<div class="w-full flex flex-col py-1 lg:py-3 justify-evenly">
	<SubTitle text={(isPast ? 'Past ' : '') + 'Weather Event Risk History'} clazz="mb-1 lg:mb-3" />
	<div class="w-full border border-accentLight dark:border-accentDark rounded-lg lg:my-2">
		<table class="w-full text-xs lg:text-sm text-left">
			<thead class="flex w-full overflow-scroll uppercase text-center border-b border-accentLight dark:border-accentDark">
				<tr class="flex w-full items-center">
					<th scope="col" class="w-1/3 lg:px-6 py-1 lg:py-3">Start Date and Time</th>
					<th scope="col" class="w-1/3 lg:px-6 py-1 lg:py-3">End Date and Time</th>
					<th scope="col" class="w-1/3 lg:px-6 py-1 lg:py-3">Risk Level</th>
				</tr>
			</thead>
			<tbody class="flex flex-col items-center justify-between overflow-scroll w-full max-h-[200px]">
				{#if !loading && historicWeatherEventData}
					{#each historicWeatherEventData.risks as weatherEventRisk, i}
						<tr class={"flex w-full text-center" + ((i < historicWeatherEventData.risks.length - 1) ? " border-b border-accentLight dark:border-accentDark" : "")}>
							<td class="w-1/3 py-4 px-2 font-semibold"
								>{dayjs(weatherEventRisk.start).format('DD.MM.YYYY HH:mm:ss')} ({format(weatherEventRisk.start, 'en_US')})</td
							>
							<td class="w-1/3 py-4 px-2 font-semibold"
								>{weatherEventRisk.end ? (dayjs(weatherEventRisk.end).format('DD.MM.YYYY HH:mm:ss') + ' (' + format(weatherEventRisk.end, 'en_US') + ')') : 'Still ongoing'}</td
							>
							<td class="flex w-1/3 justify-center items-center"
								><div
									class={'rounded-full w-fit h-fit mx-auto text-xs md:text-sm text-black px-3 ' + getWeatherEventRiskLevelColor(weatherEventRisk.riskLevel)}
								>
									{enumValueToString(weatherEventRisk.riskLevel)}
								</div>
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
	<SubTitle text={(isPast ? 'Past ' : '') + 'Weather Event Actions History'} clazz="mt-4 lg:mt-10 mb-1 lg:mb-3" />
	<div class="w-full border border-accentLight dark:border-accentDark rounded-lg lg:my-2">
		<table class="w-full text-xs lg:text-sm text-left">
			<thead class="flex w-full overflow-scroll uppercase text-center border-b border-accentLight dark:border-accentDark">
				<tr class="flex w-full">
					<th scope="col" class="w-1/2 px-6 py-3">Date and Time</th>
					<th scope="col" class="w-1/2 px-6 py-3">Action</th>
				</tr>
			</thead>
			<tbody class="flex flex-col items-center justify-between overflow-scroll w-full max-h-[200px]">
				{#if !loading && historicWeatherEventData}
					{#each historicWeatherEventData.actions as weatherEventAction, i}
						<tr class={"flex w-full text-center" + ((i < historicWeatherEventData.risks.length - 1) ? " border-b border-accentLight dark:border-accentDark" : "")}>
							<td class="w-1/2 py-4 px-2 font-semibold"
								>{dayjs(weatherEventAction.timestamp).format('DD.MM.YYYY HH:mm:ss')} ({format(weatherEventAction.timestamp, 'en_US')})</td
							>
							<td class="flex w-1/2 justify-center items-center">
								{weatherEvent ? formatWeatherEventAction({...weatherEventAction, weatherEvent}, false, true, false) : ''}
							</td>
						</tr>
					{/each}
				{:else}
					<tr class="flex w-full text-center">
						<td class="w-1/2 py-4 px-2 font-semibold ">Loading..</td>
						<td class="w-1/2">Loading..</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>