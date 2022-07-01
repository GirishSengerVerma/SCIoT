<script lang="ts">
	import { enumValueToString, stringToEnumValue } from '$root/utils/enumUtil';
	import { ICON_SENSORS_BY_NAME } from '$root/constants/iconConstants';

	import type { SensorMetaData, SensorTelemetryData } from '@prisma/client';
	import { SENSOR_UNIT_REPRESENTATION_MAP } from '$root/utils/sensorUnitRepresentations';
	import {
		getSensorValueStatus,
		getSensorValueStatusBgColor,
		getSensorValueStatusBorderColor
	} from '$root/utils/sensorValueStatusUtil';
	import LoadingSpinner from '../core/LoadingSpinner.svelte';
	import { SensorValueStatus } from '$root/types/sensorValueStatus';

	$: valueStatus = enumValueToString(getSensorValueStatus(metaData.measure, telemetryData?.value));
	$: valueStatusBgColor = getSensorValueStatusBgColor(
		stringToEnumValue(SensorValueStatus, valueStatus)
	);
	$: valueStatusBorderColor = getSensorValueStatusBorderColor(
		stringToEnumValue(SensorValueStatus, valueStatus)
	);

	$: formattedValue = telemetryData
		? Number(telemetryData.value).toFixed(0) +
		  ' ' +
		  SENSOR_UNIT_REPRESENTATION_MAP.get(telemetryData.unit)
		: '';

	export let metaData: SensorMetaData;
	export let telemetryData: SensorTelemetryData | undefined;
	export let isSelected: boolean = false;
	export let onClick: CallableFunction = () => {};
</script>

<div
	class={'flex md:flex-grow md:flex-shrink w-[48%] md:w-60 relative px-4 py-2 md:p-4 border md:border-accentLight md:dark:border-accentDark ' +
		valueStatusBorderColor +
		(isSelected ? ' md:border-primary outline outline-primary outline-1' : '') +
		' rounded-lg text-center justify-center cursor-pointer hover:bg-accentLight/20 dark:hover:bg-accentDark/10 transition-colors'}
	on:click={() => onClick()}
>
	<div
		class="hidden md:block absolute -top-2 md:-top-3 left-0 right-0 ml-auto mr-auto w-24 rounded-full bg-accentLight dark:bg-accentDark text-xs md:text-sm"
	>
		{metaData.simulationMode ? 'Simulated' : 'Physical'}
	</div>
	<div class="md:hidden w-6 h-6 mr-3 bg-accentLight dark:bg-accentDark rounded-full self-center">
		{metaData.simulationMode ? 'S' : 'P'}
	</div>
	<div class="flex flex-col flex-grow">
		<div class="md:text-lg md:font-medium text-right md:text-center">
			{enumValueToString(metaData.measure)}
		</div>
		<div class="flex md:px-5 mt-1 md:mt-3 justify-end md:justify-between">
			<div
				class="hidden md:flex bg-accentLight dark:bg-accentDark bg-opacity-30 rounded-lg mr-8 lg:mr-7 p-1 md:p-3"
			>
				<img
					class={'w-8 h-8 dark:invert'}
					src={'icons/' + ICON_SENSORS_BY_NAME.get(metaData.measure) + '.svg'}
					alt={enumValueToString(metaData.measure)}
					aria-hidden="true"
				/>
			</div>
			<div class="flex flex-col justify-around">
				{#if telemetryData}
					<div class="text-lg md:text-xl font-bold md:font-medium text-right md:text-center">
						{formattedValue}
					</div>
					<div
						class={'hidden md:block rounded-full ' +
							valueStatusBgColor +
							' text-xs md:text-sm text-black px-3'}
					>
						{valueStatus}
					</div>
				{:else}
					<LoadingSpinner />
				{/if}
			</div>
		</div>
	</div>
</div>
