<script lang="ts">
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc.js';

	dayjs.extend(utc);

	import { Location, type WeatherEvent, type WeatherEventRisk } from '@prisma/client';
	import { onDestroy, onMount } from 'svelte';

	import { enumValueToString, stringToEnumValue } from '$root/utils/enumUtil';
	import { ICON_COMMON_LOCATION, ICON_BUTTON_ADD } from '$root/constants/iconConstants';
	import { locationIconMap } from '$root/utils/locationUtils';

	import { selectedLocation } from '$root/stores/locationStores';

	import { isModalOpen } from '$root/stores/modalstore';

	import {
		selectedWeatherEventId,
		weatherEvents,
		currentWeatherEventRisk
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
		SOCKET_RESPONSE_HISTORIC_WEATHER_EVENT_DATA_TOPIC,
		weatherEventActionTopicPrefix
	} from '$root/utils/socketio';
	import WeatherEventStatus from '$root/components/events/WeatherEventStatus.svelte';
	import WeatherEventHistory from '$root/components/events/WeatherEventHistory.svelte';
	import type { HistoricWeatherEventData } from '$root/types/additionalPrismaTypes';
	import WeatherEventChangeRiskLevel from '$root/components/events/WeatherEventChangeRiskLevel.svelte';
	import WeatherEventTakeAction from '$root/components/events/WeatherEventTakeAction.svelte';
	import DeleteWeatherEvent from '$root/components/events/DeleteWeatherEvent.svelte';
	import EndWeatherEvent from '$root/components/events/EndWeatherEvent.svelte';
	import CreateWeatherEventModal from '$root/components/events/CreateWeatherEventModal.svelte';

	let initializingStores = true;

	const selectedLocationOptions = Object.values(Location).map(enumValueToString);
	const selectedLocationOptionsIcons = Object.values(Location).map((l) => locationIconMap[l]);

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

		socket.on(weatherEventActionTopicPrefix, (_) => {
			updateHistoricWeatherEventData(Number($selectedWeatherEventId), $currentWeatherEventRisk);
		});
	});

	onDestroy(() => {
		socket.off(SOCKET_RESPONSE_HISTORIC_WEATHER_EVENT_DATA_TOPIC);
		socket.off(weatherEventActionTopicPrefix);
	});

	$: updateLiveData(
		stringToEnumValue(Location, $selectedLocation),
		$weatherEvents,
		$currentWeatherEventRisk
	);

	const updateLiveData = (
		selectedLocation: Location,
		weatherEvents: Map<number, WeatherEvent>,
		currentWeatherEventRisk: Map<number, WeatherEventRisk>
	) => {
		weatherEventsAtLocation = new Map(
			[...weatherEvents]
				.filter(([_, v]) => !v.end && v.location === selectedLocation)
				.sort((a, b) => dayjs(b[1].start).diff(dayjs(a[1].start)))
		);
		pastWeatherEventsAtLocation = new Map(
			[...weatherEvents]
				.filter(([_, v]) => v.end && v.location === selectedLocation)
				.sort((a, b) => dayjs(b[1].start).diff(dayjs(a[1].start)))
		);

		if (
			$selectedWeatherEventId &&
			Number($selectedWeatherEventId) >= 0 &&
			!weatherEventsAtLocation.has(Number($selectedWeatherEventId)) &&
			!pastWeatherEventsAtLocation.has(Number($selectedWeatherEventId))
		) {
			selectedWeatherEventId.set('-1');
		}
	};

	$: updateHistoricWeatherEventData(Number($selectedWeatherEventId), $currentWeatherEventRisk);

	const updateHistoricWeatherEventData = (
		selectedWeatherEventId: number,
		_: Map<number, WeatherEventRisk>
	) => {
		if (selectedWeatherEventId == null || selectedWeatherEventId < 0) {
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

	let selectLocationDropdown: DropdownSelect;

	const handleOnCreateWeatherEvent = () => {
		selectLocationDropdown.changeSelection($selectedLocation);
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
				onClick={() => isModalOpen.set(true)}
			/>
			<DropdownSelect
				bind:this={selectLocationDropdown}
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
			{:else if $selectedWeatherEventId != null && Number($selectedWeatherEventId) >= 0 && (weatherEventsAtLocation.has(Number($selectedWeatherEventId)) || pastWeatherEventsAtLocation.has(Number($selectedWeatherEventId)))}
				<WeatherEventHistory
					isPast={pastWeatherEventsAtLocation.has(Number($selectedWeatherEventId))}
					loading={initializingStores || fetchingHistoricWeatherEventData}
					weatherEvent={pastWeatherEventsAtLocation.has(Number($selectedWeatherEventId))
						? pastWeatherEventsAtLocation.get(Number($selectedWeatherEventId))
						: weatherEventsAtLocation.get(Number($selectedWeatherEventId))}
					historicWeatherEventData={selectedWeatherEventHistoricData}
				/>
				<WeatherEventChangeRiskLevel
					loading={initializingStores}
					weatherEvent={pastWeatherEventsAtLocation.has(Number($selectedWeatherEventId))
						? pastWeatherEventsAtLocation.get(Number($selectedWeatherEventId))
						: weatherEventsAtLocation.get(Number($selectedWeatherEventId))}
				/>
				<WeatherEventTakeAction
					loading={initializingStores}
					weatherEvent={pastWeatherEventsAtLocation.has(Number($selectedWeatherEventId))
						? pastWeatherEventsAtLocation.get(Number($selectedWeatherEventId))
						: weatherEventsAtLocation.get(Number($selectedWeatherEventId))}
				/>
				{#if weatherEventsAtLocation.get(Number($selectedWeatherEventId))}
					<EndWeatherEvent
						loading={initializingStores}
						weatherEvent={pastWeatherEventsAtLocation.has(Number($selectedWeatherEventId))
							? pastWeatherEventsAtLocation.get(Number($selectedWeatherEventId))
							: weatherEventsAtLocation.get(Number($selectedWeatherEventId))}
					/>
				{/if}
				<DeleteWeatherEvent
					loading={initializingStores}
					weatherEvent={pastWeatherEventsAtLocation.has(Number($selectedWeatherEventId))
						? pastWeatherEventsAtLocation.get(Number($selectedWeatherEventId))
						: weatherEventsAtLocation.get(Number($selectedWeatherEventId))}
				/>
			{/if}
		</div>
		<div class="flex flex-col min-w-[210px]">
			<SubTitle text="Current Weather Events" clazz="mt-3 md:mt-0" />
			<div
				class="flex flex-wrap gap-x-1 gap-y-3 md:gap-x-3 md:gap-y-6 mt-3 md:mt-5 justify-between items-start h-fit"
			>
				{#if initializingStores}
					<LoadingSpinner />
				{:else if weatherEventsAtLocation.size > 0}
					{#each [...weatherEventsAtLocation] as [key, weatherEvent]}
						<WeatherEventStatus
							isPast={false}
							{weatherEvent}
							currentWeatherEventRisk={$currentWeatherEventRisk.get(key)}
							isSelected={key === Number($selectedWeatherEventId)}
							onClick={() => selectedWeatherEventId.set('' + key)}
						/>
					{/each}
				{:else}
					None
				{/if}
			</div>
			<SubTitle text="Past Weather Events" clazz="mt-8" />
			<div
				class="flex flex-wrap gap-x-1 gap-y-3 md:gap-x-3 md:gap-y-6 mt-3 md:mt-5 justify-between items-start h-fit"
			>
				{#if initializingStores}
					<LoadingSpinner />
				{:else if pastWeatherEventsAtLocation.size > 0}
					{#each [...pastWeatherEventsAtLocation] as [key, weatherEvent]}
						<WeatherEventStatus
							isPast={true}
							{weatherEvent}
							currentWeatherEventRisk={$currentWeatherEventRisk.get(key)}
							isSelected={key === Number($selectedWeatherEventId)}
							onClick={() => selectedWeatherEventId.set('' + key)}
						/>
					{/each}
				{:else}
					None
				{/if}
			</div>
		</div>
	</div>
</MainContent>
<CreateWeatherEventModal handleOnSave={handleOnCreateWeatherEvent} />
