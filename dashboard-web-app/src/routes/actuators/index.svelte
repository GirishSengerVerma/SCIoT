<script lang="ts">
	import { Location, type ActuatorMetaData, type ActuatorStatusData } from '@prisma/client';
	import { onDestroy, onMount } from 'svelte';

	import { enumValueToString, stringToEnumValue } from '$root/utils/enumUtil';
	import { ICON_COMMON_LOCATION, ICON_BUTTON_ADD } from '$root/constants/iconConstants';
	import { locationIconMap } from '$root/utils/locationUtils';

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
	import {
		socket,
		SOCKET_REQUEST_HISTORIC_ACTUATOR_STATUS_DATA_TOPIC,
		SOCKET_RESPONSE_HISTORIC_ACTUATOR_STATUS_DATA_TOPIC
	} from '$root/utils/socketio';
	import type { ActuatorStatusDataWithRelatedWeatherEventData } from '$root/types/additionalPrismaTypes';
	import ActuatorStatusHistory from '$root/components/actuators/ActuatorStatusHistory.svelte';
	import ActuatorChangeStatus from '$root/components/actuators/ActuatorChangeStatus.svelte';
	import { isModalOpen } from '$root/stores/modalstore';
	import CreateActuatorModal from '$root/components/actuators/CreateActuatorModal.svelte';
	import DeleteActuator from '$root/components/actuators/DeleteActuator.svelte';

	let initializingStores = true;

	const selectedLocationOptions = Object.values(Location).map(enumValueToString);
	const selectedLocationOptionsIcons = Object.values(Location).map((l) => locationIconMap[l]);

	let actuatorMetaDataAtLocation = new Map<string, ActuatorMetaData>();

	let fetchingHistoricActuatorsData = false;
	let selectedActuatorHistoricStatusData:
		| ActuatorStatusDataWithRelatedWeatherEventData[]
		| undefined;

	onMount(() => {
		initializingStores = false;

		socket.on(SOCKET_RESPONSE_HISTORIC_ACTUATOR_STATUS_DATA_TOPIC, (message) => {
			try {
				const messageJSON = JSON.parse(message.toString());
				selectedActuatorHistoricStatusData =
					messageJSON as ActuatorStatusDataWithRelatedWeatherEventData[];
			} catch (error) {
				console.error(
					'Web App: Error processing incoming Historic Actuators Status Data Response Socket IO message: ',
					error
				);
			}
			fetchingHistoricActuatorsData = false;
		});
	});

	onDestroy(() => {
		socket.off(SOCKET_RESPONSE_HISTORIC_ACTUATOR_STATUS_DATA_TOPIC);
	});

	$: updateLiveData(stringToEnumValue(Location, $selectedLocation), $actuatorMetaData);

	const updateLiveData = (
		selectedLocation: Location,
		actuatorMetaData: Map<string, ActuatorMetaData>
	) => {
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

	$: updateHistoricActuatorsStatusData($selectedActuatorInstanceId, $actuatorStatusData);

	const updateHistoricActuatorsStatusData = (
		selectedActuatorInstanceId: string,
		_: Map<string, ActuatorStatusData[]>
	) => {
		fetchingHistoricActuatorsData = true;
		socket.emit(
			SOCKET_REQUEST_HISTORIC_ACTUATOR_STATUS_DATA_TOPIC,
			JSON.stringify({
				selectedActuatorInstanceId
			})
		);
	};

	let selectLocationDropdown: DropdownSelect;

	const handleOnCreateActuator = () => {
		selectLocationDropdown.changeSelection($selectedLocation);
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
				onClick={() => isModalOpen.set(true)}
			/>
			<DropdownSelect
				bind:this={selectLocationDropdown}
				name="selectedLocation"
				iconName={ICON_COMMON_LOCATION}
				iconAlt="ActuatorLocation"
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
			{:else if $selectedActuatorInstanceId && actuatorMetaDataAtLocation.has($selectedActuatorInstanceId) && $actuatorStatusData.has($selectedActuatorInstanceId)}
				<ActuatorStatusHistory
					loading={initializingStores || fetchingHistoricActuatorsData}
					actuatorHistoricStatusData={selectedActuatorHistoricStatusData}
				/>
				<ActuatorChangeStatus
					loading={initializingStores || fetchingHistoricActuatorsData}
					actuator={$actuators.get($selectedActuatorInstanceId)}
					actuatorMetaData={actuatorMetaDataAtLocation.get($selectedActuatorInstanceId)}
				/>
				<DeleteActuator
					loading={initializingStores || fetchingHistoricActuatorsData}
					actuator={$actuators.get($selectedActuatorInstanceId)}
				/>
			{/if}
		</div>
		<div
			class="flex flex-wrap gap-x-1 gap-y-3 md:gap-x-3 md:gap-y-6 mt-3 md:mt-6 lg:mt-0 justify-between items-start h-fit"
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
<CreateActuatorModal handleOnSave={handleOnCreateActuator} />
