<script lang="ts">
	import { ActuatorType, Location } from '@prisma/client';

	import {
		ICON_ACTUATORS_SIMULATED,
		ICON_COMMON_LOCATION,
		ICON_ACTUATORS_TYPE,
		ICON_BUTTON_SAVE
	} from '$root/constants/iconConstants';
	import { enumValueToString, stringToEnumValue } from '$root/utils/enumUtil';
	import { locationIconMap } from '$root/utils/locationUtils';
	import { socket, SOCKET_REQUEST_CREATE_ACTUATOR_TOPIC } from '$root/utils/socketio';
	import { actuators } from '$root/stores/actuatorStores';
	import { isModalOpen } from '$root/stores/modalstore';
	import { selectedLocation } from '$root/stores/locationStores';

	import Modal from '$root/components/core/Modal.svelte';
	import SubTitle from '$root/components/core/SubTitle.svelte';
	import DropdownSelect from '$root/components/core/DropdownSelect.svelte';
	import ActionButton from '$root/components/core/ActionButton.svelte';
	import TextInput from '$root/components/core/TextInput.svelte';
	import { browser } from '$app/env';

	let updating = false;

	let instanceId = '';
	let isInstanceIdValid = false;

	const validateInstanceIdInput = (input: string) => {
		isInstanceIdValid = input.length > 0 && !$actuators.has(input);
		return isInstanceIdValid;
	};
	const invalidInstanceIdMessage = (input: string) =>
		input.length === 0
			? 'Instance id must not be empty!'
			: 'Actuator with this instance id already exists!';

	let name = '';
	let isNameValid = false;

	const validateNameInput = (input: string) => {
		isNameValid = input.length > 0;
		return isNameValid;
	};
	const invalidNameMessage = (input: string) => 'Name must not be empty!';

	const initialSelectedIsPhysical = false;
	let selectedIsPhysical = initialSelectedIsPhysical;

	const onPhysicalOrSimulatedDropdownSelectionChange = (option: string) => {
		selectedIsPhysical = option === 'Physical';
	};

	const selectedActuatorLocationOptions = Object.values(Location).map(enumValueToString);
	const selectedActuatorLocationOptionsIcons = Object.values(Location).map(
		(l) => locationIconMap[l]
	);
	const initialselectedActuatorLocationOption = selectedActuatorLocationOptions[0];
	let selectedActuatorLocation = Object.values(Location)[0];

	const onLocationDropdownSelectionChange = (option: string) => {
		selectedActuatorLocation = Object.values(Location).find(
			(v) => enumValueToString(v) === option
		)!;
	};

	const selectedActuatorTypeOptions = Object.values(ActuatorType).map(enumValueToString);
	const initialselectedActuatorTypeOption = selectedActuatorTypeOptions[0];
	let selectedActuatorType = Object.values(ActuatorType)[0];

	const onTypeDropdownSelectionChange = (option: string) => {
		selectedActuatorType = stringToEnumValue(ActuatorType, option);
	};

	const onSave = (
		instanceId: string,
		name: string,
		selectedIsPhysical: boolean,
		selectedActuatorLocation: Location,
		selectedActuatorType: ActuatorType
	) => {
		updating = true;

		socket.emit(
			SOCKET_REQUEST_CREATE_ACTUATOR_TOPIC,
			JSON.stringify({
				instanceId,
				name,
				isPhysical: selectedIsPhysical,
				location: selectedActuatorLocation,
				type: selectedActuatorType
			})
		);

		selectedLocation.set(enumValueToString(selectedActuatorLocation));
		if (browser) {
			document
				.getElementsByName('selectedLocation')
				.forEach((e: any) => (e.value = enumValueToString(selectedActuatorLocation)));
		}

		handleOnSave();

		isModalOpen.set(false);
		updating = false;
	};

	export let handleOnSave: CallableFunction;
</script>

<Modal>
	<div class="flex flex-col w-full items-center">
		<SubTitle text="Create a new Actuator" />
		<div class="w-full flex flex-col mt-4 justify-between items-center">
			<TextInput
				name="actuatorInstanceId"
				placeholder="Unique Actuator Id"
				bind:currentInput={instanceId}
				validateInput={validateInstanceIdInput}
				invalidInputMessage={invalidInstanceIdMessage}
				class="mb-4"
			/>
			<TextInput
				name="actuatorName"
				placeholder="Actuator Name"
				bind:currentInput={name}
				validateInput={validateNameInput}
				invalidInputMessage={invalidNameMessage}
				class="mb-4"
			/>
			<DropdownSelect
				name="selectedPhysicalOrSimulated"
				iconName={ICON_ACTUATORS_SIMULATED}
				iconAlt="PhysicalOrSimulated"
				initialValue={initialSelectedIsPhysical ? 'Physical' : 'Simulated'}
				options={['Physical', 'Simulated']}
				onChange={onPhysicalOrSimulatedDropdownSelectionChange}
				class="my-2 "
			/>
			<DropdownSelect
				name="selectedActuatorLocation"
				iconName={ICON_COMMON_LOCATION}
				iconAlt="Location"
				initialValue={initialselectedActuatorLocationOption}
				options={selectedActuatorLocationOptions}
				optionsIcons={selectedActuatorLocationOptionsIcons}
				onChange={onLocationDropdownSelectionChange}
				class="my-2"
			/>
			<DropdownSelect
				name="selectedActuatorType"
				iconName={ICON_ACTUATORS_TYPE}
				iconAlt="Type"
				initialValue={initialselectedActuatorTypeOption}
				options={selectedActuatorTypeOptions}
				onChange={onTypeDropdownSelectionChange}
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
						selectedActuatorLocation,
						selectedActuatorType
					)}
				disabled={!isInstanceIdValid || !isNameValid}
				{updating}
				class="mt-5"
			/>
		</div>
	</div>
</Modal>
