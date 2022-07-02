<script lang="ts">
	import { Location, type ActuatorMetaData } from '@prisma/client';
	import { onMount } from 'svelte';

	import { enumValueToString, stringToEnumValue } from '$root/utils/enumUtil';
	import { ICON_COMMON_LOCATION, ICON_BUTTON_ADD } from '$root/constants/iconConstants';

	import { selectedLocation } from '$root/stores/locationStores';

	import {
		selectedActuatorInstanceId,
		actuators,
		actuatorMetaData,
		actuatorStatusData
	} from '$root/stores/actuatorStores';

	import MainContent from '$root/components/core/MainContent.svelte';
	import MainContentHeader from '$root/components/core/MainContentHeader.svelte';
	import DropdownSelect from '$root/components/core/DropdownSelect.svelte';
	import ActionButton from '$root/components/core/ActionButton.svelte';
	import ActuatorStatus from '$root/components/actuators/ActuatorStatus.svelte';
	import LoadingSpinner from '$root/components/core/LoadingSpinner.svelte';

	let initializingStores = true;

	const selectedLocationOptions = Object.values(Location).map(enumValueToString);

	let actuatorMetaDataAtLocation = new Map<string, ActuatorMetaData>();

	onMount(() => {
		initializingStores = false;
		updateLiveData(stringToEnumValue(Location, $selectedLocation), $actuatorMetaData);
	});

	$: updateLiveData(stringToEnumValue(Location, $selectedLocation), $actuatorMetaData);

	const updateLiveData = (
		selectedLocation: Location,
		actuatorMetaData: Map<string, ActuatorMetaData>
	) => {
		console.log('Updating Actuators Data', selectedLocation, actuatorMetaData);

		actuatorMetaDataAtLocation = new Map(
			[...actuatorMetaData]
				.filter(([_, v]) => v.location === selectedLocation)
				.sort((a, b) => a[0].localeCompare(b[0]))
		);

		if (
			$selectedActuatorInstanceId &&
			!actuatorMetaDataAtLocation.has($selectedActuatorInstanceId)
		) {
			selectedActuatorInstanceId.set('');
		}
	};
</script>

<svelte:head>
	<title>Dashboard | Actuators</title>
</svelte:head>

<MainContent>
	<MainContentHeader title={'Actuators'}>
		<div class="w-full flex flex-wrap justify-end ml-4 lg:ml-6">
			<ActionButton
				class="ml-auto lg:order-last"
				iconName={ICON_BUTTON_ADD}
				iconAlt="Add"
				label="Create Actuator"
				onClick={() => alert('TODO DWA Implement')}
			/>
			<DropdownSelect
				name="selectedLocation"
				iconName={ICON_COMMON_LOCATION}
				iconAlt="ActuatorLocation"
				{initializingStores}
				initialValue={$selectedLocation}
				options={selectedLocationOptions}
				onChange={selectedLocation.set}
			/>
		</div>
	</MainContentHeader>
	<div class="flex flex-col lg:flex-row lg:mt-10">
		<div
			class="flex flex-grow lg:mr-10 border rounded-xl border-accentLight dark:border-accentDark p-3 lg:p-8"
		>
			{#if initializingStores}
				<LoadingSpinner />
			{:else if $selectedActuatorInstanceId && actuatorMetaDataAtLocation.has($selectedActuatorInstanceId) && $actuatorStatusData.has($selectedActuatorInstanceId)}
				<div class="w-full">// TODO Show History of changes and allow updating status</div>
			{/if}
		</div>
		<div
			class="flex flex-wrap gap-x-1 gap-y-3 md:gap-x-3 md:gap-y-6 mt-3 md:mt-6 lg:mt-0 justify-between"
		>
			{#if initializingStores}
				<LoadingSpinner />
			{:else}
				{#each [...actuatorMetaDataAtLocation] as [key, metaData]}
					<ActuatorStatus
						actuator={$actuators.get(key)}
						{metaData}
						isSelected={key === $selectedActuatorInstanceId}
						statusData={$actuatorStatusData.get(key)}
						onClick={() => selectedActuatorInstanceId.set(key)}
					/>
				{/each}
			{/if}
		</div>
	</div>
</MainContent>
