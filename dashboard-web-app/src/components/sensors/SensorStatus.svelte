<script lang="ts">
	import type { SensorMetaData, SensorTelemetryData } from '@prisma/client';

	import { enumValueToString, stringToEnumValue } from '$root/utils/enumUtil';
	import { ICON_SENSORS_BY_NAME } from '$root/constants/iconConstants';
	import { SENSOR_UNIT_REPRESENTATION_MAP } from '$root/utils/sensorUnitRepresentations';
	import {
		getSensorValueStatus,
		getSensorValueStatusBgColor,
		getSensorValueStatusBorderColor
	} from '$root/utils/sensorValueStatusUtil';
	import { SensorValueStatus } from '$root/types/sensorValueStatus';

	import LoadingSpinner from '$root/components/core/LoadingSpinner.svelte';

	$: formattedCurrentValue =
		telemetryData && telemetryData.length > 0
			? Number(telemetryData![telemetryData!.length - 1].value).toFixed(0) +
			  ' ' +
			  SENSOR_UNIT_REPRESENTATION_MAP.get(telemetryData![telemetryData!.length - 1].unit)
			: '-';

	$: dataTrend = isHistoricData
		? telemetryData && telemetryData.length >= 2
			? calculateDataTrend(true)
			: 'No Data'
		: '';

	$: valueStatus = isHistoricData
		? telemetryData && telemetryData.length >= 2
			? calculateDataTrend(false)
			: 'No Data'
		: enumValueToString(
				telemetryData && telemetryData.length > 0
					? getSensorValueStatus(metaData.measure, telemetryData![telemetryData!.length - 1].value)
					: SensorValueStatus.MEDIUM
		  );

	$: valueStatusBgColor = isHistoricData
		? telemetryData && telemetryData.length >= 2
			? dataTrend.startsWith('+')
				? 'bg-green-300'
				: 'bg-red-300'
			: 'bg-accentLight dark:bg-accentDark'
		: getSensorValueStatusBgColor(stringToEnumValue(SensorValueStatus, valueStatus));

	$: valueStatusBorderColor = isHistoricData
		? telemetryData && telemetryData.length >= 2
			? dataTrend.startsWith('+')
				? 'border-green-400'
				: 'border-red-400'
			: 'border-accentLight dark:border-accentDark'
		: getSensorValueStatusBorderColor(stringToEnumValue(SensorValueStatus, valueStatus));

	const calculateDataTrend = (absolute: boolean) => {
		const oldestValue = Number(telemetryData![0].value);
		const newestValue = Number(telemetryData![telemetryData!.length - 1].value);
		const trendAbsolute = newestValue - oldestValue;
		if (absolute) {
			return (
				(trendAbsolute >= 0.0 ? '+ ' : '- ') +
				trendAbsolute.toFixed(1).replace('+', '').replace('-', '')
			);
		}

		const trendRelative = (trendAbsolute / oldestValue) * 100.0;

		return (
			(trendAbsolute >= 0.0 ? '+ ' : '- ') +
			trendRelative.toFixed(1).replace('+', '').replace('-', '') +
			' %'
		);
	};

	export let metaData: SensorMetaData;
	export let telemetryData: SensorTelemetryData[] | undefined;
	export let isSelected: boolean = false;
	export let isHistoricData: boolean = false;
	export let onClick: CallableFunction = () => {};
</script>

<div
	class={'flex md:flex-grow md:flex-shrink w-[48%] md:w-60 relative px-4 py-2 md:p-4 border md:border-accentLight md:dark:border-accentDark ' +
		valueStatusBorderColor +
		(isSelected ? ' md:border-primary outline outline-primary outline-1' : '') +
		' rounded-lg text-center justify-center items-center cursor-pointer hover:bg-accentLight/20 dark:hover:bg-accentDark/10 transition-colors'}
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
						{isHistoricData ? dataTrend : formattedCurrentValue}
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
