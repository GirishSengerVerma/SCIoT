<script lang="ts">
	import { Location, UnitType, type UnitStatus } from '@prisma/client';
	import { onDestroy, onMount } from 'svelte';

	import { enumValueToString, stringToEnumValue } from '$root/utils/enumUtil';
	import { ICON_COMMON_LOCATION } from '$root/constants/iconConstants';

	import { selectedLocation } from '$root/stores/locationStores';

	import {
		selectedAuthorityLocationAndUnitType,
		authoritiesUnitStatus,
		type UnitStatusKey,
	} from '$root/stores/authoritiesStores';

	import MainContent from '$root/components/core/MainContent.svelte';
	import MainContentHeader from '$root/components/core/MainContentHeader.svelte';
	import DropdownSelect from '$root/components/core/DropdownSelect.svelte';
	import LoadingSpinner from '$root/components/core/LoadingSpinner.svelte';
	import AuthoritiesUnitStatus from '$root/components/authorities/AuthoritiesUnitStatus.svelte';

	import {
		socket,
		SOCKET_REQUEST_HISTORIC_AUTHORITIES_UNIT_STATUS_DATA_TOPIC,
		SOCKET_RESPONSE_HISTORIC_AUTHORITIES_UNIT_STATUS_DATA_TOPIC
	} from '$root/utils/socketio';
	import type { UnitsStatusDataWithRelatedWeatherEventData } from '$root/types/additionalPrismaTypes';

	let initializingStores = true;

	const selectedLocationOptions = Object.values(Location).map(enumValueToString);

	let authoritiesUnitStatusDataAtLocation = new Map<UnitStatusKey, UnitStatus>();

	let fetchingHistoricAuthoritiesUnitStatusData = false;
	let selectedAuthorityUnitsHistoricStatusData:
		| UnitsStatusDataWithRelatedWeatherEventData[]
		| undefined;

	onMount(() => {
		initializingStores = false;

		socket.on(SOCKET_RESPONSE_HISTORIC_AUTHORITIES_UNIT_STATUS_DATA_TOPIC, (message) => {
			try {
				const messageJSON = JSON.parse(message.toString());
				console.log(JSON.stringify(messageJSON));
				selectedAuthorityUnitsHistoricStatusData =
					messageJSON as UnitsStatusDataWithRelatedWeatherEventData[];
			} catch (error) {
				console.error(
					'Web App: Error processing incoming Historic Authorities Units Status Data Response Socket IO message: ',
					error
				);
			}
			fetchingHistoricAuthoritiesUnitStatusData = false;
		});
	});

	onDestroy(() => {
		socket.off(SOCKET_RESPONSE_HISTORIC_AUTHORITIES_UNIT_STATUS_DATA_TOPIC);
	});

	$: updateLiveData(stringToEnumValue(Location, $selectedLocation), $authoritiesUnitStatus);

	const updateLiveData = (
		selectedLocation: Location,
		authoritiesUnitStatus: Map<UnitStatusKey, UnitStatus>
	) => {
		authoritiesUnitStatusDataAtLocation = new Map(
			[...authoritiesUnitStatus]
				.filter(([k, v]) => k.location === selectedLocation)
				.sort((a, b) => a[0].unitType.localeCompare(b[0].unitType))
		);

		if (
			$selectedAuthorityLocationAndUnitType &&
			!authoritiesUnitStatusDataAtLocation.has(parseUnitStatusKeyFromString($selectedAuthorityLocationAndUnitType))
		) {
			selectedAuthorityLocationAndUnitType.set('');
		}
	};

	$: console.log(authoritiesUnitStatusDataAtLocation);

	$: updateHistoricAuthorityUnitsStatusData($selectedAuthorityLocationAndUnitType);

	const updateHistoricAuthorityUnitsStatusData = (selectedAuthorityLocationAndUnitType: string) => {
		fetchingHistoricAuthoritiesUnitStatusData = true;
		socket.emit(
			SOCKET_REQUEST_HISTORIC_AUTHORITIES_UNIT_STATUS_DATA_TOPIC,
			JSON.stringify(parseUnitStatusKeyFromString(selectedAuthorityLocationAndUnitType))
		);
	};

	const parseUnitStatusKeyFromString = (s: string): UnitStatusKey => {
		return { 
			location: stringToEnumValue(Location, s.split('|')[0]), 
			unitType: stringToEnumValue(UnitType, s.split('|')[1]),
		};
	};

	const unitStatusKeyToString = (unitStatusKey: UnitStatusKey): string => {
		return unitStatusKey.location + '|' + unitStatusKey.unitType;
	};
</script>

<svelte:head>
	<title>Dashboard | Authorities</title>
</svelte:head>

<MainContent>
	<MainContentHeader title={'Authorities'}>
		<div class="w-full flex flex-wrap justify-start ml-4 lg:ml-6">
			<DropdownSelect
				name="selectedLocation"
				iconName={ICON_COMMON_LOCATION}
				iconAlt="AuthoritiesLocation"
				loading={initializingStores}
				initialValue={$selectedLocation}
				options={selectedLocationOptions}
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
			{:else if $selectedAuthorityLocationAndUnitType && authoritiesUnitStatusDataAtLocation.has(parseUnitStatusKeyFromString($selectedAuthorityLocationAndUnitType))}
				<!-- TODO DWA Implement <AuthorityUnitsStatusHistory
					loading={initializingStores || fetchingHistoricAuthoritiesUnitStatusData}
					authoritiesUnitsHistoricStatusData={selectedAuthorityUnitsHistoricStatusData}
				/>-->
			{/if}
		</div>
		<div
			class="flex flex-wrap gap-x-1 gap-y-3 md:gap-x-3 md:gap-y-6 mt-3 md:mt-6 lg:mt-0 justify-between"
		>
			{#if initializingStores}
				<LoadingSpinner />
			{:else}
				{#each [...authoritiesUnitStatusDataAtLocation] as [key, unitStatusData]}
					<AuthoritiesUnitStatus
						isSelected={key === parseUnitStatusKeyFromString($selectedAuthorityLocationAndUnitType)}
						unitStatus={unitStatusData}
						onClick={() => selectedAuthorityLocationAndUnitType.set(unitStatusKeyToString(key))}
					/>
				{/each}
			{/if}
		</div>
	</div>
</MainContent>
