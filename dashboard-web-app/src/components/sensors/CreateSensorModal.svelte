<script lang="ts">
	import {
		Location,
		SensorMeasure,
		SensorSimulationMode,
		SensorSimulationBehavior
	} from '@prisma/client';
	import { slide } from 'svelte/transition';

	import {
		ICON_SENSORS_SIMULATED,
		ICON_COMMON_LOCATION,
		ICON_SENSORS_MEASURE,
		ICON_BUTTON_SAVE
	} from '$root/constants/iconConstants';
	import { enumValueToString, stringToEnumValue } from '$root/utils/enumUtil';
	import { locationIconMap } from '$root/utils/locationUtils';
	import { socket, SOCKET_REQUEST_CREATE_SENSOR_TOPIC } from '$root/utils/socketio';
	import { sensors } from '$root/stores/sensorStores';
	import { isModalOpen } from '$root/stores/modalstore';
	import { selectedLocation } from '$root/stores/locationStores';

	import Modal from '$root/components/core/Modal.svelte';
	import SubTitle from '$root/components/core/SubTitle.svelte';
	import DropdownSelect from '$root/components/core/DropdownSelect.svelte';
	import ActionButton from '$root/components/core/ActionButton.svelte';
	import TextInput from '$root/components/core/TextInput.svelte';

	let updating = false;

	let instanceId = '';
	let isInstanceIdValid = false;

	const validateInstanceIdInput = (input: string) => {
		isInstanceIdValid = input.length > 0 && !$sensors.has(input);
		return isInstanceIdValid;
	};
	const invalidInstanceIdMessage = (input: string) =>
		input.length === 0
			? 'Instance id must not be empty!'
			: 'Sensor with this instance id already exists!';

	let name = '';
	let isNameValid = false;

	const validateNameInput = (input: string) => {
		isNameValid = input.length > 0;
		return isNameValid;
	};
	const invalidNameMessage = (input: string) => 'Name must not be empty!';

	const initialSelectedIsPhysical = true;
	let selectedIsPhysical = initialSelectedIsPhysical;

	const onPhysicalOrSimulatedDropdownSelectionChange = (option: string) => {
		selectedIsPhysical = option === 'Physical';
	};

	const selectedSensorSimulationModeOptions =
		Object.values(SensorSimulationMode).map(enumValueToString);
	const initialselectedSensorSimulationModeOption = selectedSensorSimulationModeOptions[0];
	let selectedSensorSimulationMode = Object.values(SensorSimulationMode)[0];

	const onSimulationModeDropdownSelectionChange = (option: string) => {
		selectedSensorSimulationMode = Object.values(SensorSimulationMode).find(
			(v) => enumValueToString(v) === option
		)!;
	};

	const selectedSensorSimulationBehaviorOptions =
		Object.values(SensorSimulationBehavior).map(enumValueToString);
	const initialselectedSensorSimulationBehaviorOption = selectedSensorSimulationBehaviorOptions[0];
	let selectedSensorSimulationBehavior = Object.values(SensorSimulationBehavior)[0];

	const onSimulationBehaviorDropdownSelectionChange = (option: string) => {
		selectedSensorSimulationBehavior = Object.values(SensorSimulationBehavior).find(
			(v) => enumValueToString(v) === option
		)!;
	};

	const selectedSensorLocationOptions = Object.values(Location).map(enumValueToString);
	const selectedSensorLocationOptionsIcons = Object.values(Location).map((l) => locationIconMap[l]);
	const initialselectedSensorLocationOption = selectedSensorLocationOptions[0];
	let selectedSensorLocation = Object.values(Location)[0];

	const onLocationDropdownSelectionChange = (option: string) => {
		selectedSensorLocation = Object.values(Location).find((v) => enumValueToString(v) === option)!;
	};

	const selectedSensorMeasureOptions = Object.values(SensorMeasure).map(enumValueToString);
	const initialselectedSensorMeasureOption = selectedSensorMeasureOptions[0];
	let selectedSensorMeasure = Object.values(SensorMeasure)[0];

	const onMeasureDropdownSelectionChange = (option: string) => {
		selectedSensorMeasure = stringToEnumValue(SensorMeasure, option);
	};

	const onSave = (
		instanceId: string,
		name: string,
		selectedIsPhysical: boolean,
		selectedSensorLocation: Location,
		selectedSensorMeasure: SensorMeasure,
		selectedSensorSimulationMode: SensorSimulationMode | undefined,
		selectedSensorSimulationBehavior: SensorSimulationBehavior | undefined
	) => {
		updating = true;

		socket.emit(
			SOCKET_REQUEST_CREATE_SENSOR_TOPIC,
			JSON.stringify({
				instanceId,
				name,
				isPhysical: selectedIsPhysical,
				location: selectedSensorLocation,
				measure: selectedSensorMeasure,
				simulationMode: selectedSensorSimulationMode,
				simulationBehavior: selectedSensorSimulationBehavior
			})
		);

		selectedLocation.set(enumValueToString(selectedSensorLocation));

		handleOnSave();

		isModalOpen.set(false);
		updating = false;
	};

	export let handleOnSave: CallableFunction;
</script>

<Modal>
	<div class="flex flex-col w-full items-center">
		<SubTitle text="Create a new Sensor" />
		<div class="w-full flex flex-col mt-4 justify-between items-center">
			<TextInput
				name="sensorInstanceId"
				placeholder="Unique Sensor Id"
				bind:currentInput={instanceId}
				validateInput={validateInstanceIdInput}
				invalidInputMessage={invalidInstanceIdMessage}
				class="mb-4"
			/>
			<TextInput
				name="sensorName"
				placeholder="Sensor Name"
				bind:currentInput={name}
				validateInput={validateNameInput}
				invalidInputMessage={invalidNameMessage}
				class="mb-4"
			/>
			<DropdownSelect
				name="selectedSensorPhysicalOrSimulated"
				iconName={ICON_SENSORS_SIMULATED}
				iconAlt="PhysicalOrSimulated"
				initialValue={selectedIsPhysical ? 'Physical' : 'Simulated'}
				options={['Physical', 'Simulated']}
				onChange={onPhysicalOrSimulatedDropdownSelectionChange}
				class="my-2 "
			/>
			{#if !selectedIsPhysical}
				<div transition:slide>
					<DropdownSelect
						name="selectedSensorSimulationMode"
						iconName={ICON_SENSORS_SIMULATED}
						iconAlt="SimulationMode"
						initialValue={initialselectedSensorSimulationModeOption}
						options={selectedSensorSimulationModeOptions}
						onChange={onSimulationModeDropdownSelectionChange}
						class="my-2 "
					/>
					<DropdownSelect
						name="selectedSensorSimulationBehavior"
						iconName={ICON_SENSORS_SIMULATED}
						iconAlt="SimulationBehavior"
						initialValue={initialselectedSensorSimulationBehaviorOption}
						options={selectedSensorSimulationBehaviorOptions}
						onChange={onSimulationBehaviorDropdownSelectionChange}
						class="my-2 "
					/>
				</div>
			{/if}
			<DropdownSelect
				name="selectedSensorLocation"
				iconName={ICON_COMMON_LOCATION}
				iconAlt="Location"
				initialValue={initialselectedSensorLocationOption}
				options={selectedSensorLocationOptions}
				optionsIcons={selectedSensorLocationOptionsIcons}
				onChange={onLocationDropdownSelectionChange}
				class="my-2"
			/>
			<DropdownSelect
				name="selectedSensorMeasure"
				iconName={ICON_SENSORS_MEASURE}
				iconAlt="Measure"
				initialValue={initialselectedSensorMeasureOption}
				options={selectedSensorMeasureOptions}
				onChange={onMeasureDropdownSelectionChange}
				class="my-2"
			/>
			<ActionButton
				iconName={ICON_BUTTON_SAVE}
				iconAlt="Save"
				label="Create"
				onClick={() =>
					onSave(
						instanceId,
						name,
						selectedIsPhysical,
						selectedSensorLocation,
						selectedSensorMeasure,
						selectedIsPhysical ? undefined : selectedSensorSimulationMode,
						selectedIsPhysical ? undefined : selectedSensorSimulationBehavior
					)}
				disabled={!isInstanceIdValid || !isNameValid}
				{updating}
				class="mt-5"
			/>
		</div>
	</div>
</Modal>
