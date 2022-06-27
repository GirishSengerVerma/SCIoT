<script lang="ts">
	// @ts-ignore
	import { localStorageStore } from "@babichjacob/svelte-localstorage/svelte-kit";
	import { Location } from "@prisma/client";
	import { onMount } from "svelte";
	import type { Writable } from "svelte/store";

	import { enumValueToString, stringToEnumValue } from "$root/utils/enumUtil";
	import { DataPeriod } from "$root/types/dataPeriod";
	import { ICON_COMMON_LOCATION, ICON_BUTTON_ADD, ICON_DATA_PERIOD_LIVE_DATA, ICON_DATA_PERIOD_HISTORIC_DATA } from "$root/constants/iconConstants";

	import MainContent from "$root/components/core/MainContent.svelte";
	import MainContentHeader from "$root/components/core/MainContentHeader.svelte";
	import DropdownSelect from "$root/components/core/DropdownSelect.svelte";
	import ActionButton from "$root/components/core/ActionButton.svelte";

	let initializingStores = true;

	const initialSensorLocation = enumValueToString(Location.STUTTGART_KILLESBERG_PARK);
	const sensorLocationOptions = Object.values(Location).map(enumValueToString);
	const sensorLocation: Writable<string> = localStorageStore("sensorLocation", initialSensorLocation);
	
	const initialSensorDataPeriod = enumValueToString(DataPeriod.LIVE_DATA);
	const sensorDataPeriodOptions = Object.values(DataPeriod).map(enumValueToString);
	const sensorDataPeriod: Writable<string> = localStorageStore("sensorDatPeriod", initialSensorDataPeriod);
	
	$: onOptionsChange(stringToEnumValue(Location, $sensorLocation), stringToEnumValue(DataPeriod, $sensorDataPeriod));

	$: isLiveData = $sensorDataPeriod === enumValueToString(DataPeriod.LIVE_DATA);

	onMount(() => {
        initializingStores = false;
    });

	const onOptionsChange = (sensorLocation: Location, sensorDataPeriod: DataPeriod) => {
		console.log("Options changed");
		// TODO DWA Fetch data using prisma
	};
</script>

<svelte:head>
	<title>Dashboard | Sensors</title>
</svelte:head>

<MainContent>
	<MainContentHeader title={"Sensors"}>
		<div class="w-full flex flex-wrap justify-end ml-4 lg:ml-6">
			<ActionButton 
				class="ml-auto lg:order-last" 
				iconName={ICON_BUTTON_ADD} iconAlt="Add" 
				label="Create Sensor" 
				onClick={() => alert("TODO DWA Implement")}/>
			<DropdownSelect 
				name="sensorLocation" 
				iconName={ICON_COMMON_LOCATION} iconAlt="SensorLocation" 
				loading={initializingStores} 
				initialValue={$sensorLocation} 
				options={sensorLocationOptions} 
				onChange={sensorLocation.set}/>
			<DropdownSelect 
				name="sensorDataPeriod" 
				iconName={isLiveData ? ICON_DATA_PERIOD_LIVE_DATA : ICON_DATA_PERIOD_HISTORIC_DATA} iconAlt="SensorDataPeriod" 
				loading={initializingStores} 
				initialValue={$sensorDataPeriod} 
				options={sensorDataPeriodOptions} 
				onChange={sensorDataPeriod.set}/>
		</div>
	</MainContentHeader>
	Hellooo!
</MainContent>