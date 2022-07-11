<script lang="ts">
	import { Location, WeatherEventRiskLevel, WeatherEventType } from '@prisma/client';

	import {
		ICON_COMMON_LOCATION,
		ICON_WEATHER_EVENTS_TYPE,
		ICON_BUTTON_SAVE,
		ICON_WEATHER_EVENTS_RISK_LEVEL
	} from '$root/constants/iconConstants';
	import { enumValueToString, stringToEnumValue } from '$root/utils/enumUtil';
	import { locationIconMap } from '$root/utils/locationUtils';
	import { socket, SOCKET_REQUEST_CREATE_WEATHER_EVENT_TOPIC } from '$root/utils/socketio';
	import { isModalOpen } from '$root/stores/modalstore';
	import { selectedLocation } from '$root/stores/locationStores';
	import { weatherEventRiskLevelIconMap } from '$root/utils/weatherEventUtils';

	import Modal from '$root/components/core/Modal.svelte';
	import SubTitle from '$root/components/core/SubTitle.svelte';
	import DropdownSelect from '$root/components/core/DropdownSelect.svelte';
	import ActionButton from '$root/components/core/ActionButton.svelte';

	let updating = false;

	const selectedWeatherEventLocationOptions = Object.values(Location).map(enumValueToString);
	const selectedWeatherEventLocationOptionsIcons = Object.values(Location).map(
		(l) => locationIconMap[l]
	);
	const initialselectedWeatherEventLocationOption = selectedWeatherEventLocationOptions[0];
	let selectedWeatherEventLocation = Object.values(Location)[0];

	const onLocationDropdownSelectionChange = (option: string) => {
		selectedWeatherEventLocation = Object.values(Location).find(
			(v) => enumValueToString(v) === option
		)!;
	};

	const selectedWeatherEventTypeOptions = Object.values(WeatherEventType).map(enumValueToString);
	const initialselectedWeatherEventTypeOption = selectedWeatherEventTypeOptions[0];
	let selectedWeatherEventType = Object.values(WeatherEventType)[0];

	const onTypeDropdownSelectionChange = (option: string) => {
		selectedWeatherEventType = stringToEnumValue(WeatherEventType, option);
	};

	const selectedWeatherEventInitialRiskLevelOptions =
		Object.values(WeatherEventRiskLevel).map(enumValueToString);
	const initialSelectedWeatherEventInitialRiskLevelOption =
		selectedWeatherEventInitialRiskLevelOptions[0];
	const selectedWeatherEventInitialRiskLevelOptionsIcons = Object.values(WeatherEventRiskLevel).map(
		(l) => weatherEventRiskLevelIconMap[l]
	);
	let selectedWeatherEventInitialRiskLevel = Object.values(WeatherEventRiskLevel)[0];

	const onRiskLevelDropdownSelectionChange = (option: string) => {
		selectedWeatherEventInitialRiskLevel = stringToEnumValue(WeatherEventRiskLevel, option);
	};

	const onSave = (
		selectedWeatherEventLocation: Location,
		selectedWeatherEventType: WeatherEventType,
		selectedWeatherEventInitialRiskLevel: WeatherEventRiskLevel
	) => {
		updating = true;

		socket.emit(
			SOCKET_REQUEST_CREATE_WEATHER_EVENT_TOPIC,
			JSON.stringify({
				location: selectedWeatherEventLocation,
				type: selectedWeatherEventType,
				initialRiskLevel: selectedWeatherEventInitialRiskLevel
			})
		);

		selectedLocation.set(enumValueToString(selectedWeatherEventLocation));

		handleOnSave();

		isModalOpen.set(false);
		updating = false;
	};

	export let handleOnSave: CallableFunction;
</script>

<Modal>
	<div class="flex flex-col w-full items-center">
		<SubTitle text="Create a new WeatherEvent" />
		<div class="w-full flex flex-col mt-4 justify-between items-center">
			<DropdownSelect
				name="selectedWeatherEventLocation"
				iconName={ICON_COMMON_LOCATION}
				iconAlt="Location"
				initialValue={initialselectedWeatherEventLocationOption}
				options={selectedWeatherEventLocationOptions}
				optionsIcons={selectedWeatherEventLocationOptionsIcons}
				onChange={onLocationDropdownSelectionChange}
				class="my-2"
			/>
			<DropdownSelect
				name="selectedWeatherEventType"
				iconName={ICON_WEATHER_EVENTS_TYPE}
				iconAlt="Type"
				initialValue={initialselectedWeatherEventTypeOption}
				options={selectedWeatherEventTypeOptions}
				onChange={onTypeDropdownSelectionChange}
				class="my-2"
			/>
			<DropdownSelect
				name="selectedWeatherEventRiskLevel"
				iconName={ICON_WEATHER_EVENTS_RISK_LEVEL}
				iconAlt="RiskLevel"
				initialValue={initialSelectedWeatherEventInitialRiskLevelOption}
				options={selectedWeatherEventInitialRiskLevelOptions}
				optionsIcons={selectedWeatherEventInitialRiskLevelOptionsIcons}
				onChange={onRiskLevelDropdownSelectionChange}
				class="my-2"
			/>
			<ActionButton
				iconName={ICON_BUTTON_SAVE}
				iconAlt="Save"
				label="Create"
				onClick={() =>
					onSave(
						selectedWeatherEventLocation,
						selectedWeatherEventType,
						selectedWeatherEventInitialRiskLevel
					)}
				{updating}
				class="mt-5"
			/>
		</div>
	</div>
</Modal>
