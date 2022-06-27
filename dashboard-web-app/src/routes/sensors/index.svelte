<script>
import DropdownSelect from "$root/components/core/DropdownSelect.svelte";
import MainContent from "$root/components/core/MainContent.svelte";
import MainContentHeader from "$root/components/core/MainContentHeader.svelte";
import { ICON_COMMON_LOCATION } from "$root/constants/iconConstants";

</script>
<svelte:head>
	<title>Dashboard | Sensors</title>
</svelte:head>

<MainContent>
	<MainContentHeader title={"Sensors"}>
		<DropdownSelect name="sensor_location" iconName={ICON_COMMON_LOCATION} iconAlt="SensorLocation" initialValue="Sttg. Max Eyth See" options={["Sttg. Max Eyth See", "Sttg. Killesbergpark", "Sttg. Vaihingen Office"]}/>
		<DropdownSelect name="sensor_location_2" iconName={ICON_COMMON_LOCATION} iconAlt="SensorLocation" initialValue="B" options={["A", "B"]}/>
	</MainContentHeader>
	Hellooo!
</MainContent>