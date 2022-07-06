<script lang="ts">
	import type { Actuator, ActuatorMetaData, ActuatorStatusData, WeatherEvent, WeatherEventRisk } from '@prisma/client';

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
	class={'flex md:flex-grow md:flex-shrink w-[48%] md:w-60 max-h-36 relative px-4 py-2 md:p-4 border md:border-accentLight md:dark:border-accentDark' +
		(isSelected ? ' md:border-primary outline outline-primary outline-1' : '') +
		' rounded-lg text-center justify-center cursor-pointer hover:bg-accentLight/20 dark:hover:bg-accentDark/10 transition-colors'}
	on:click={() => onClick()}
>
	<div
		class="hidden md:block absolute -top-2 md:-top-3 left-0 right-0 ml-auto mr-auto w-24 rounded-full bg-accentLight dark:bg-accentDark text-xs md:text-sm"
	>
		{isPast ? 'Past' : 'Current'}
	</div>
	<div class="md:hidden w-6 h-6 mr-3 bg-accentLight dark:bg-accentDark rounded-full self-center">
		{isPast ? 'P' : 'C'}
	</div>
	<div class="flex flex-col flex-grow">
		<div class="md:text-lg md:font-medium text-right md:text-center">
			{enumValueToString(weatherEvent.type)}
		</div>
		<div class="flex md:px-5 mt-1 md:mt-3 justify-end md:justify-between">
			<div
				class="hidden md:flex bg-accentLight dark:bg-accentDark bg-opacity-30 rounded-lg mr-8 lg:mr-7 p-1 md:p-3"
			>
				<img
					class={'w-8 h-8 dark:invert'}
					src={'icons/' + ICON_WEATHER_EVENTS_BY_NAME.get(weatherEvent.type) + '.svg'}
					alt={enumValueToString(weatherEvent.type)}
					aria-hidden="true"
				/>
			</div>
			<div class="flex flex-col justify-around">
				{#if currentWeatherEventRisk}
					<div
						class={'rounded-full ' +
							getWeatherEventRiskLevelColor(currentWeatherEventRisk.riskLevel) +
							' text-xs md:text-sm text-black px-3'}
					>
						{enumValueToString(currentWeatherEventRisk.riskLevel)}
					</div>
				{:else}
					<LoadingSpinner />
				{/if}
			</div>
		</div>
	</div>
</div>
