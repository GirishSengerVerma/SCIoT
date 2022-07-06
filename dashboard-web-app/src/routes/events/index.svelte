<script lang="ts">
	import { Location, type ActuatorMetaData, type ActuatorStatusData, type WeatherEvent, type WeatherEventRisk } from '@prisma/client';
	import { hasContext, onDestroy, onMount } from 'svelte';

	import { enumValueToString, stringToEnumValue } from '$root/utils/enumUtil';
	import { ICON_COMMON_LOCATION, ICON_BUTTON_ADD } from '$root/constants/iconConstants';
	import { locationIconMap } from '$root/utils/locationUtils';

	import { selectedLocation } from '$root/stores/locationStores';

	import {
		selectedWeatherEventId,
		weatherEvents,
		currentWeatherEventRisk,
	} from '$root/stores/weatherEventStores';

	import MainContent from '$root/components/core/MainContent.svelte';
	import MainContentHeader from '$root/components/core/MainContentHeader.svelte';
	import DropdownSelect from '$root/components/core/DropdownSelect.svelte';
	import ActionButton from '$root/components/core/ActionButton.svelte';
	import LoadingSpinner from '$root/components/core/LoadingSpinner.svelte';
	import SubTitle from '$root/components/core/SubTitle.svelte';
	
	import {
		socket,
		SOCKET_REQUEST_HISTORIC_WEATHER_EVENT_DATA_TOPIC,
		SOCKET_RESPONSE_HISTORIC_WEATHER_EVENT_DATA_TOPIC
	} from '$root/utils/socketio';
	import WeatherEventStatus from '$root/components/events/WeatherEventStatus.svelte';
	import WeatherEventHistory from '$root/components/events/WeatherEventHistory.svelte';
	import type { HistoricWeatherEventData } from '$root/types/additionalPrismaTypes';

	let initializingStores = true;

	const selectedLocationOptions = Object.values(Location).map(enumValueToString);
	const selectedLocationOptionsIcons = Object.values(Location).map(l => locationIconMap[l]);

	let weatherEventsAtLocation = new Map<number, WeatherEvent>();
	let pastWeatherEventsAtLocation = new Map<number, WeatherEvent>();

	let fetchingHistoricWeatherEventData = false;
	let selectedWeatherEventHistoricData: HistoricWeatherEventData | undefined; 

	onMount(() => {
		initializingStores = false;

		socket.on(SOCKET_RESPONSE_HISTORIC_WEATHER_EVENT_DATA_TOPIC, (message) => {
			try {
				const messageJSON = JSON.parse(message.toString());
				selectedWeatherEventHistoricData = messageJSON as HistoricWeatherEventData;
			} catch (error) {
				console.error(
					'Web App: Error processing incoming Historic Weather Event Data Response Socket IO message: ',
					error
				);
			}
			fetchingHistoricWeatherEventData = false;
		});
	});

	onDestroy(() => {
		socket.off(SOCKET_RESPONSE_HISTORIC_WEATHER_EVENT_DATA_TOPIC);
	});

	$: updateLiveData(stringToEnumValue(Location, $selectedLocation), $weatherEvents, $currentWeatherEventRisk);

	const updateLiveData = (
		selectedLocation: Location,
		weatherEvents: Map<number, WeatherEvent>,
		currentWeatherEventRisk: Map<number, WeatherEventRisk>
	) => {
		weatherEventsAtLocation = new Map(
			[...weatherEvents]
				.filter(([_, v]) => !v.end && v.location === selectedLocation)
				.sort((a, b) => b[1].start.getDate() - a[1].start.getDate())
		);
		pastWeatherEventsAtLocation = new Map(
			[...weatherEvents]
				.filter(([_, v]) => v.end && v.location === selectedLocation)
				.sort((a, b) => b[1].start.getDate() - a[1].start.getDate())
		);

		if (
			$selectedWeatherEventId && !weatherEventsAtLocation.has($selectedWeatherEventId) && !pastWeatherEventsAtLocation.has($selectedWeatherEventId)
		) {
			selectedWeatherEventId.set(-1);
		}
	};

	$: updateHistoricWeatherEventData($selectedWeatherEventId);

	const updateHistoricWeatherEventData = (selectedWeatherEventId: number) => {
		if(selectedWeatherEventId < 0) {
			return;
		}
		fetchingHistoricWeatherEventData = true;
		socket.emit(
			SOCKET_REQUEST_HISTORIC_WEATHER_EVENT_DATA_TOPIC,
			JSON.stringify({
				selectedWeatherEventId
			})
		);
	};
</script>

<svelte:head>
	<title>Dashboard | Weather Events</title>
</svelte:head>

<MainContent>
	<MainContentHeader title={'Weather Events'}>
		<div class="w-full flex flex-wrap justify-end ml-4 lg:ml-6">
			<ActionButton
				class="ml-auto lg:order-last"
				iconName={ICON_BUTTON_ADD}
				iconAlt="Add"
				label="Create Weather Event"
				onClick={() => alert('TODO DWA Implement')}
			/>
			<DropdownSelect
				name="selectedLocation"
				iconName={ICON_COMMON_LOCATION}
				iconAlt="WeatherEventLocation"
				loading={initializingStores}
				initialValue={$selectedLocation}
				options={selectedLocationOptions}
				optionsIcons={selectedLocationOptionsIcons}
				onChange={selectedLocation.set}
			/>
		</div>
	</MainContentHeader>
	<div class="flex flex-col lg:flex-row lg:mt-10">
		<div
			class="w-full flex flex-grow flex-col lg:mr-10 border rounded-xl border-accentLight dark:border-accentDark py-2 px-4 lg:py-3 lg:px-6"
		>
			{#if initializingStores}
				<LoadingSpinner />
			{:else if $selectedWeatherEventId && (weatherEventsAtLocation.has($selectedWeatherEventId) || pastWeatherEventsAtLocation.has($selectedWeatherEventId))}
				<!-- TODO DWA Implement <WeatherEventHistory
					isPast={pastWeatherEventsAtLocation.has($selectedWeatherEventId)}
					loading={initializingStores || fetchingHistoricWeatherEventData}
					historicWeatherEventData={selectedWeatherEventHistoricData}
				/>-->
			{/if}
		</div>
		<div
			class="flex flex-wrap gap-x-1 gap-y-3 md:gap-x-3 md:gap-y-6 mt-3 md:mt-6 lg:mt-0 justify-between items-start h-fit"
		>
			<SubTitle text='Current Weather Events'/>
			{#if initializingStores}
				<LoadingSpinner />
			{:else}
				{#each [...weatherEventsAtLocation] as [key, weatherEvent]}
					<WeatherEventStatus
						isPast={false}
						weatherEvent={weatherEvent}
						currentWeatherEventRisk={$currentWeatherEventRisk.get(key)}
						isSelected={key === $selectedWeatherEventId}
						onClick={() => selectedWeatherEventId.set(key)}
					/>
				{/each}
			{/if}
			<SubTitle text='Past Weather Events'/>
			{#if initializingStores}
				<LoadingSpinner />
			{:else}
				{#each [...pastWeatherEventsAtLocation] as [key, weatherEvent]}
					<WeatherEventStatus
						isPast={true}
						weatherEvent={weatherEvent}
						currentWeatherEventRisk={$currentWeatherEventRisk.get(key)}
						isSelected={key === $selectedWeatherEventId}
						onClick={() => selectedWeatherEventId.set(key)}
					/>
				{/each}
			{/if}
		</div>
	</div>
</MainContent>
