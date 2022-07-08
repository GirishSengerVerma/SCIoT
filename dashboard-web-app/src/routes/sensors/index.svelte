<script lang="ts">
	import { Location, type SensorMetaData, type SensorTelemetryData } from '@prisma/client';
	import { onDestroy, onMount } from 'svelte';

	import { enumValueToString, stringToEnumValue } from '$root/utils/enumUtil';
	import { DataPeriod } from '$root/types/dataPeriod';
	import {
		ICON_COMMON_LOCATION,
		ICON_BUTTON_ADD,
		ICON_DATA_PERIOD_LIVE_DATA,
		ICON_DATA_PERIOD_HISTORIC_DATA
	} from '$root/constants/iconConstants';

	import { selectedLocation } from '$root/stores/locationStores';

	import {
		sensorDataPeriod,
		sensorMetaData,
		selectedSensorInstanceId,
		liveSensorData
	} from '$root/stores/sensorStores';

	import MainContent from '$root/components/core/MainContent.svelte';
	import MainContentHeader from '$root/components/core/MainContentHeader.svelte';
	import DropdownSelect from '$root/components/core/DropdownSelect.svelte';
	import ActionButton from '$root/components/core/ActionButton.svelte';
	import SensorStatus from '$root/components/sensors/SensorStatus.svelte';
	import SensorChart from '$root/components/sensors/SensorChart.svelte';
	import {
		socket,
		SOCKET_REQUEST_HISTORIC_SENSOR_DATA_TOPIC,
		SOCKET_RESPONSE_HISTORIC_SENSOR_DATA_TOPIC
	} from '$root/utils/socketio';
	import LoadingSpinner from '$root/components/core/LoadingSpinner.svelte';
	import { locationIconMap } from '$root/utils/locationUtils';

	let initializingStores = true;
	let fetchingData = false;

	const selectedLocationOptions = Object.values(Location).map(enumValueToString);
	const selectedLocationOptionsIcons = Object.values(Location).map(l => locationIconMap[l]);

	const sensorDataPeriodOptions = Object.values(DataPeriod).map(enumValueToString);

	$: $sensorDataPeriod === enumValueToString(DataPeriod.LIVE_DATA)
		? updateLiveData(stringToEnumValue(Location, $selectedLocation), $sensorMetaData)
		: updateHistoricData(
				stringToEnumValue(Location, $selectedLocation),
				stringToEnumValue(DataPeriod, $sensorDataPeriod)
		  );

	$: isLiveData = $sensorDataPeriod === enumValueToString(DataPeriod.LIVE_DATA);

	let sensorMetaDataAtLocation = new Map<string, SensorMetaData>();
	let historicSensorTelemetryData = new Map<string, SensorTelemetryData[]>();

	onMount(() => {
		initializingStores = false;

		socket.on(SOCKET_RESPONSE_HISTORIC_SENSOR_DATA_TOPIC, (message) => {
			if ($sensorDataPeriod === enumValueToString(DataPeriod.LIVE_DATA)) {
				fetchingData = false;
				console.log('Ignoring incoming historic sensor data because we are in Live Data mode.');
				return;
			}

			try {
				const messageJSON = JSON.parse(message.toString());

				const metaDataHelperMap: Map<string, SensorMetaData> = new Map();
				const telemetryDataHelperMap: Map<string, SensorTelemetryData[]> = new Map();

				for (let sensorInstanceId of Object.keys(messageJSON)) {
					metaDataHelperMap.set(
						sensorInstanceId,
						messageJSON[sensorInstanceId]['metaData'] as SensorMetaData
					);
					telemetryDataHelperMap.set(
						sensorInstanceId,
						messageJSON[sensorInstanceId]['telemetryData'] as SensorTelemetryData[]
					);
				}

				sensorMetaDataAtLocation = new Map(
					[...metaDataHelperMap].sort((a, b) => a[0].localeCompare(b[0]))
				);

				historicSensorTelemetryData = telemetryDataHelperMap;

				if ($selectedSensorInstanceId && !sensorMetaDataAtLocation.has($selectedSensorInstanceId)) {
					selectedSensorInstanceId.set('');
				}
			} catch (error) {
				console.error(
					'Web App: Error processing incoming Historic Sensor Data Response Socket IO message: ',
					error
				);
			}

			fetchingData = false;
		});
	});

	onDestroy(() => {
		socket.off(SOCKET_RESPONSE_HISTORIC_SENSOR_DATA_TOPIC);
	});

	const updateLiveData = (
		selectedLocation: Location,
		sensorMetaData: Map<string, SensorMetaData>
	) => {
		sensorMetaDataAtLocation = new Map(
			[...sensorMetaData]
				.filter(([_, v]) => v.location === selectedLocation)
				.sort((a, b) => a[0].localeCompare(b[0]))
		);

		if ($selectedSensorInstanceId && !sensorMetaDataAtLocation.has($selectedSensorInstanceId)) {
			selectedSensorInstanceId.set('');
		}
	};

	const updateHistoricData = (selectedLocation: Location, sensorDataPeriod: DataPeriod) => {
		fetchingData = true;

		socket.emit(
			SOCKET_REQUEST_HISTORIC_SENSOR_DATA_TOPIC,
			JSON.stringify({
				selectedLocation,
				sensorDataPeriod
			})
		);
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
				name="selectedLocation"
				iconName={ICON_COMMON_LOCATION}
				iconAlt="SensorLocation"
				loading={initializingStores}
				initialValue={$selectedLocation}
				options={selectedLocationOptions}
				optionsIcons={selectedLocationOptionsIcons}
				onChange={selectedLocation.set}
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
			{#if initializingStores || fetchingData}
				<LoadingSpinner />
			{:else if $selectedSensorInstanceId && sensorMetaDataAtLocation.has($selectedSensorInstanceId) && $liveSensorData.has($selectedSensorInstanceId)}
				<div class="w-11/12 max-w-screen-lg">
					<SensorChart
						sensorMetaData={sensorMetaDataAtLocation.get($selectedSensorInstanceId)}
						data={isLiveData
							? $liveSensorData.get($selectedSensorInstanceId)
							: fetchingData
							? undefined
							: historicSensorTelemetryData.get($selectedSensorInstanceId)}
					/>
				</div>
			{/if}
		</div>
		<div
			class="flex flex-wrap lg:max-w-xl gap-x-1 gap-y-3 md:gap-x-3 md:gap-y-6 mt-3 md:mt-6 lg:mt-0 justify-between lg:justify-end items-start h-fit"
		>
			{#if initializingStores || fetchingData}
				<LoadingSpinner />
			{:else}
				{#each [...sensorMetaDataAtLocation] as [key, metaData]}
					<SensorStatus
						{metaData}
						isSelected={key === $selectedSensorInstanceId}
						isHistoricData={!isLiveData}
						telemetryData={isLiveData
							? $liveSensorData.get(key)
							: fetchingData
							? undefined
							: historicSensorTelemetryData.get(key)}
						onClick={() => selectedSensorInstanceId.set(key)}
					/>
				{/each}
			{/if}
		</div>
	</div>
</MainContent>
