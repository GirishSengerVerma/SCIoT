<script lang="ts">
	import { format } from 'timeago.js';
	import type { WeatherEvent, WeatherEventRisk } from '@prisma/client';

	import { enumValueToString, stringToEnumValue } from '$root/utils/enumUtil';
	import { getWeatherEventRiskLevelColor } from '$root/utils/weatherEventUtils';

	import { ICON_WEATHER_EVENTS_BY_NAME } from '$root/constants/iconConstants';
	import LoadingSpinner from '$root/components/core/LoadingSpinner.svelte';

	export let weatherEvent: WeatherEvent;
	export let currentWeatherEventRisk: WeatherEventRisk | undefined;
	export let isPast: boolean;
	export let isSelected: boolean = false;
	export let onClick: CallableFunction = () => {};
</script>

<div
	class={'flex md:flex-grow md:flex-shrink w-[48%] md:w-56 max-h-36 relative px-4 py-2 md:p-4 border md:border-accentLight md:dark:border-accentDark' +
		(isSelected ? ' md:border-primary outline outline-primary outline-1' : '') +
		' rounded-lg text-center justify-center cursor-pointer hover:bg-accentLight/20 dark:hover:bg-accentDark/15 transition-colors'}
	on:click={() => onClick()}
>
	<div
		class="hidden md:block absolute -top-2 md:-top-3 left-0 right-0 ml-auto mr-auto px-2 w-fit rounded-full bg-accentLight dark:bg-accentDark text-xs md:text-sm"
	>
		{#if isPast}
			Ended {weatherEvent.end ? format(weatherEvent.end, 'en_US') : ''}
		{:else}
			Started {format(weatherEvent.start, 'en_US')}
		{/if}
	</div>
	<div class="flex flex-col flex-grow">
		<div class="md:text-lg md:font-medium text-center">
			{enumValueToString(weatherEvent.type)}
		</div>
		<div class="flex md:px-5 mt-1 md:mt-3 justify-center md:justify-between">
			<div
				class="hidden md:flex bg-accentLight dark:bg-accentDark bg-opacity-30 rounded-lg mr-8 lg:mr-7 p-1 md:p-3"
			>
				<img
					class={'w-8 h-8 max-w-none dark:invert'}
					src={'icons/' + ICON_WEATHER_EVENTS_BY_NAME.get(weatherEvent.type) + '.svg'}
					alt={enumValueToString(weatherEvent.type)}
					aria-hidden="true"
				/>
			</div>
			<div class="flex flex-col justify-around items-center">
				{#if currentWeatherEventRisk}
					<div
						class={'rounded-full w-fit whitespace-nowrap ' +
							getWeatherEventRiskLevelColor(currentWeatherEventRisk.riskLevel) +
							' text-xs md:text-sm text-black px-3'}
					>
						{enumValueToString(currentWeatherEventRisk.riskLevel)} Risk
					</div>
				{:else}
					<LoadingSpinner />
				{/if}
				<div class="md:hidden text-xs pt-2">
					{#if isPast}
						Ended {weatherEvent.end ? format(weatherEvent.end, 'en_US') : ''}
					{:else}
						Started {format(weatherEvent.start, 'en_US')}
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
