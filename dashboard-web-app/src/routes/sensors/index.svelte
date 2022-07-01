<script lang="ts">
	import { Location, type SensorMetaData, type SensorTelemetryData } from '@prisma/client';
	import { onMount } from 'svelte';

	import { enumValueToString, stringToEnumValue } from '$root/utils/enumUtil';
	import { DataPeriod } from '$root/types/dataPeriod';
	import {
		ICON_COMMON_LOCATION,
		ICON_BUTTON_ADD,
		ICON_DATA_PERIOD_LIVE_DATA,
		ICON_DATA_PERIOD_HISTORIC_DATA
	} from '$root/constants/iconConstants';

	import {
		sensorLocation,
		sensorDataPeriod,
		sensorMetaData,
		liveSensorData
	} from '$root/stores/sensorStores';

	import MainContent from '$root/components/core/MainContent.svelte';
	import MainContentHeader from '$root/components/core/MainContentHeader.svelte';
	import DropdownSelect from '$root/components/core/DropdownSelect.svelte';
	import ActionButton from '$root/components/core/ActionButton.svelte';
	import SensorStatus from '$root/components/sensors/SensorStatus.svelte';
	import SensorChart from '$root/components/sensors/SensorChart.svelte';

	let initializingStores = true;

	const sensorLocationOptions = Object.values(Location).map(enumValueToString);
	const sensorDataPeriodOptions = Object.values(DataPeriod).map(enumValueToString);

	$: onChange(
		stringToEnumValue(Location, $sensorLocation),
		stringToEnumValue(DataPeriod, $sensorDataPeriod),
		$sensorMetaData,
		$liveSensorData
	);

	// TODO DWA Store in localstorage store, fix Chart not updating after changing selection
	let selectedSensorInstanceId: string | undefined = undefined;

	let sensorMetaDataAtLocation = new Map<string, SensorMetaData>();
	let sensorTelemetryData = new Map<string, SensorTelemetryData[]>();
	let sensorCurrentTelemetryData = new Map<string, SensorTelemetryData>();

	onMount(() => {
		initializingStores = false;
	});

	const onChange = (
		sensorLocation: Location,
		sensorDataPeriod: DataPeriod,
		sensorMetaData: Map<string, SensorMetaData>,
		liveSensorData: Map<string, SensorTelemetryData[]>
	) => {
		const isLiveData = sensorDataPeriod === DataPeriod.LIVE_DATA;

		if (isLiveData) {
			sensorMetaDataAtLocation = new Map(
				[...sensorMetaData]
					.filter(([_, v]) => v.location === sensorLocation)
					.sort((a, b) => a[0].localeCompare(b[0]))
			);

			if (!selectedSensorInstanceId && [...sensorMetaDataAtLocation.keys()].length > 0) {
				selectedSensorInstanceId = [...sensorMetaDataAtLocation.keys()][0];
			}

			sensorTelemetryData = new Map(
				[...liveSensorData].filter(([k, _]) => sensorMetaDataAtLocation.has(k))
			);

			let helperMap = new Map<string, SensorTelemetryData>();
			for (let [k, v] of [...sensorTelemetryData]) {
				if (!sensorTelemetryData.has(k)) {
					continue;
				}
				const allSensorTelemetryData = sensorTelemetryData.get(k)!;
				helperMap.set(k, allSensorTelemetryData[allSensorTelemetryData.length - 1]);
			}
			sensorCurrentTelemetryData = helperMap;
		} else {
			// TODO Historic Data
		}
	};
</script>

<svelte:head>
	<title>Dashboard | Sensors</title>
</svelte:head>

<MainContent>
	<MainContentHeader title={'Sensors'}>
		<div class="w-full flex flex-wrap justify-end ml-4 lg:ml-6">
			<ActionButton
				class="ml-auto lg:order-last"
				iconName={ICON_BUTTON_ADD}
				iconAlt="Add"
				label="Create Sensor"
				onClick={() => alert('TODO DWA Implement')}
			/>
			<DropdownSelect
				name="sensorLocation"
				iconName={ICON_COMMON_LOCATION}
				iconAlt="SensorLocation"
				loading={initializingStores}
				initialValue={$sensorLocation}
				options={sensorLocationOptions}
				onChange={sensorLocation.set}
			/>
			<DropdownSelect
				name="sensorDataPeriod"
				iconName={$sensorDataPeriod === enumValueToString(DataPeriod.LIVE_DATA)
					? ICON_DATA_PERIOD_LIVE_DATA
					: ICON_DATA_PERIOD_HISTORIC_DATA}
				iconAlt="SensorDataPeriod"
				loading={initializingStores}
				initialValue={$sensorDataPeriod}
				options={sensorDataPeriodOptions}
				onChange={sensorDataPeriod.set}
			/>
		</div>
	</MainContentHeader>
	<div class="flex flex-col lg:flex-row lg:mt-10">
		<div
			class="flex flex-grow lg:mr-10 border rounded-xl border-accentLight dark:border-accentDark p-3 lg:p-8"
		>
			{#if selectedSensorInstanceId && sensorMetaDataAtLocation.has(selectedSensorInstanceId) && sensorTelemetryData.has(selectedSensorInstanceId)}
				<div class="w-full">
					<SensorChart
						sensorMetaData={sensorMetaDataAtLocation.get(selectedSensorInstanceId)}
						data={sensorTelemetryData.get(selectedSensorInstanceId)}
					/>
				</div>
			{/if}
		</div>
		<div
			class="flex flex-wrap lg:max-w-xl gap-x-1 gap-y-3 md:gap-x-3 md:gap-y-6 mt-3 md:mt-6 lg:mt-0 justify-between lg:justify-end"
		>
			{#each [...sensorMetaDataAtLocation] as [key, metaData]}
				<SensorStatus
					{metaData}
					isSelected={key === selectedSensorInstanceId}
					telemetryData={sensorCurrentTelemetryData.get(key)}
					onClick={() => (selectedSensorInstanceId = key)}
				/>
			{/each}
		</div>
	</div>
</MainContent>
