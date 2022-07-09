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

	import Modal from '$root/components/core/Modal.svelte';
	import SubTitle from '$root/components/core/SubTitle.svelte';
	import DropdownSelect from '$root/components/core/DropdownSelect.svelte';
	import ActionButton from '../core/ActionButton.svelte';

	let updating = false;

	const initialSelectedIsPhysical = false;
	let selectedIsPhysical = initialSelectedIsPhysical;

	const selectedLocationOptions = Object.values(Location).map(enumValueToString);
	const selectedLocationOptionsIcons = Object.values(Location).map((l) => locationIconMap[l]);
	const initialSelectedLocationOption = selectedLocationOptions[0];
	let selectedLocation = Object.values(Location)[0];

	const selectedTypeOptions = Object.values(ActuatorType).map(enumValueToString);
	const initialSelectedTypeOption = selectedTypeOptions[0];
	let selectedType = Object.values(ActuatorType)[0];

	const onPhysicalOrSimulatedDropdownSelectionChange = (option: string) => {
		selectedIsPhysical = option === 'Physical';
	};

	const onLocationDropdownSelectionChange = (option: string) => {
		selectedLocation = Object.values(Location).find((v) => enumValueToString(v) === option)!;
	};

	const onTypeDropdownSelectionChange = (option: string) => {
		selectedType = stringToEnumValue(ActuatorType, option);
	};

	const onSave = (
		selectedIsPhysical: boolean,
		selectedLocation: Location,
		selectedType: ActuatorType
	) => {
		// TODO DWA Implement create actuator
	};
</script>

<Modal>
	<div class="flex flex-col w-full items-center">
		<SubTitle text="Create a new Actuator" />
		<div class="w-full flex flex-col mt-4 justify-between items-center">
			<DropdownSelect
				name="selectedPhysicalOrSimulated"
				iconName={ICON_ACTUATORS_SIMULATED}
				iconAlt="PhysicalOrSimulated"
				initialValue={initialSelectedIsPhysical ? 'Physical' : 'Simulated'}
				options={['Physical', 'Simulated']}
				onChange={onPhysicalOrSimulatedDropdownSelectionChange}
				class="my-2"
			/>
			<DropdownSelect
				name="selectedLocation"
				iconName={ICON_COMMON_LOCATION}
				iconAlt="Location"
				initialValue={initialSelectedLocationOption}
				options={selectedLocationOptions}
				optionsIcons={selectedLocationOptionsIcons}
				onChange={onLocationDropdownSelectionChange}
				class="my-2"
			/>
			<DropdownSelect
				name="selectedType"
				iconName={ICON_ACTUATORS_TYPE}
				iconAlt="Type"
				initialValue={initialSelectedTypeOption}
				options={selectedTypeOptions}
				onChange={onTypeDropdownSelectionChange}
				class="my-2"
			/>
			<ActionButton
				iconName={ICON_BUTTON_SAVE}
				iconAlt="Save"
				label="Create"
				onClick={() => onSave(selectedIsPhysical, selectedLocation, selectedType)}
				{updating}
			/>
			<!-- instanceId, name -->
		</div>
	</div>
</Modal>
