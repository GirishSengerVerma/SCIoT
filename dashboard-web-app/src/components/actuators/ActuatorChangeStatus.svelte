<script lang="ts">
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc.js';

	dayjs.extend(utc);

	import type { Actuator, ActuatorMetaData, ActuatorStatusData } from '@prisma/client';

	import { formatWeatherEvent } from '$root/utils/weatherEventUtils';
	import {
		ICON_ACTUATOR_STATUS,
		ICON_ACTUATORS_WEATHER_EVENT,
		ICON_BUTTON_SAVE
	} from '$root/constants/iconConstants';
	import { actuatorStatusData, selectedActuatorStatus } from '$root/stores/actuatorStores';
	import { weatherEvents, selectedWeatherEventId } from '$root/stores/weatherEventStores';

	import SubTitle from '$root/components/core/SubTitle.svelte';
	import DropdownSelect from '$root/components/core/DropdownSelect.svelte';
	import ActionButton from '$root/components/core/ActionButton.svelte';
	import {
		socket,
		SOCKET_REQUEST_MANUALLY_CHANGE_ACTUATOR_STATUS_TOPIC
	} from '$root/utils/socketio';

	const selectedStatusOptions = ['Enabled', 'Disabled'];
	const selectedStatusOptionsIcons = ['🟢', '🔴'];

	$: currentWeatherEventsAtLocation =
		new Map(
			[...$weatherEvents]
				.filter(([_, v]) => !v.end && v.location === actuatorMetaData!.location)
				.sort((a, b) => dayjs(b[1].start).diff(dayjs(a[1].start)))
		) ?? new Map();

	$: selectedWeatherEventOptions = ['None'].concat(
		[...currentWeatherEventsAtLocation.keys()].map((id) =>
			formatWeatherEvent(currentWeatherEventsAtLocation.get(id)!, true, false)
		)
	);

	$: initialSelectedLocationOption =
		$selectedWeatherEventId === '-1' ||
		!currentWeatherEventsAtLocation.has(Number($selectedWeatherEventId))
			? 'None'
			: formatWeatherEvent(
					currentWeatherEventsAtLocation.get(Number($selectedWeatherEventId))!,
					true,
					false
			  );

	let updating = false;

	const onSave = (selectedActuatorStatus: boolean, selectedWeatherEventId: string) => {
		updating = true;
		socket.emit(
			SOCKET_REQUEST_MANUALLY_CHANGE_ACTUATOR_STATUS_TOPIC,
			JSON.stringify({
				selectedActuatorStatus,
				instanceId: actuator?.instanceId,
				type: actuatorMetaData!.type,
				location: actuatorMetaData!.location,
				weatherEventId:
					selectedWeatherEventId === '-1' ||
					!currentWeatherEventsAtLocation.has(Number(selectedWeatherEventId))
						? undefined
						: Number(selectedWeatherEventId)
			})
		);
	};

	$: onActuatorStatusChange($actuatorStatusData);

	const onActuatorStatusChange = (_: Map<string, ActuatorStatusData[]>) => {
		updating = false;
	};

	const onStatusDropdownSelectionChange = (option: string) =>
		selectedActuatorStatus.set(option === 'Enabled');

	const onLocationDropdownSelectionChange = (option: string) => {
		if (option === 'None') {
			selectedWeatherEventId.set('-1');
		} else {
			selectedWeatherEventId.set(
				'' +
					[...currentWeatherEventsAtLocation.keys()].find(
						(id) =>
							formatWeatherEvent(currentWeatherEventsAtLocation.get(id)!, true, false) === option
					) ?? '-1'
			);
		}
	};

	export let loading: boolean;
	export let actuator: Actuator | undefined;
	export let actuatorMetaData: ActuatorMetaData | undefined;
</script>

<div class="w-full flex flex-col py-2 lg:py-4">
	<SubTitle text="Manually change Status" clazz="mb-1 lg:mb-3" />
	<div class="flex flex-wrap justify-start">
		<DropdownSelect
			name="selectedStatus"
			iconName={ICON_ACTUATOR_STATUS}
			iconAlt="Status"
			{loading}
			initialValue={$selectedActuatorStatus ? 'Enabled' : 'Disabled'}
			options={selectedStatusOptions}
			optionsIcons={selectedStatusOptionsIcons}
			onChange={onStatusDropdownSelectionChange}
			class="mx-0 mr-3"
		/>
		<DropdownSelect
			name="selectedWeatherEvent"
			iconName={ICON_ACTUATORS_WEATHER_EVENT}
			iconAlt="WeatherEvent"
			{loading}
			initialValue={initialSelectedLocationOption}
			options={selectedWeatherEventOptions}
			onChange={onLocationDropdownSelectionChange}
			class="mx-0 mr-3"
		/>
		<ActionButton
			iconName={ICON_BUTTON_SAVE}
			iconAlt="Save"
			label="Update"
			onClick={() => onSave($selectedActuatorStatus, $selectedWeatherEventId)}
			{updating}
		/>
	</div>
</div>
