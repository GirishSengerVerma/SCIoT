<script lang="ts">
	import { WeatherEventRiskLevel, type WeatherEvent, type WeatherEventRisk } from '@prisma/client';
    import { enumValueToString, stringToEnumValue } from '$root/utils/enumUtil';
    import { ICON_WEATHER_EVENTS_RISK_LEVEL, ICON_BUTTON_SAVE } from '$root/constants/iconConstants';
    import { weatherEventRiskLevelIconMap } from '$root/utils/weatherEventUtils';
    import { selectedWeatherEventRiskLevel, currentWeatherEventRisk } from '$root/stores/weatherEventStores';

	import SubTitle from '$root/components/core/SubTitle.svelte';
    import DropdownSelect from '$root/components/core/DropdownSelect.svelte';
    import ActionButton from '$root/components/core/ActionButton.svelte';
    import { socket, SOCKET_REQUEST_CHANGE_WEATHER_EVENT_RISK_LEVEL_TOPIC } from '$root/utils/socketio';

    const selectedRiskLevelOptions = Object.values(WeatherEventRiskLevel).map(enumValueToString);
	const selectedRiskLevelOptionsIcons = Object.values(WeatherEventRiskLevel).map(l => weatherEventRiskLevelIconMap[l]);

    let updating = false;

    const onSave = (selectedWeatherEventRiskLevel: WeatherEventRiskLevel) => {
        updating = true;
        socket.emit(SOCKET_REQUEST_CHANGE_WEATHER_EVENT_RISK_LEVEL_TOPIC, JSON.stringify({ selectedWeatherEventRiskLevel, location: weatherEvent?.location, weatherEventId: weatherEvent?.id }));
    };

    $: onRiskLevelChange($currentWeatherEventRisk);

    const onRiskLevelChange = (_: Map<number, WeatherEventRisk>) => {
        updating = false;
    };

    export let loading: boolean;
    export let weatherEvent: WeatherEvent | undefined;
</script>

<div class="w-full flex flex-col py-2 lg:py-4">
	<SubTitle text='Manually change Risk Level' clazz="mb-1 lg:mb-3" />
	<div class="flex justify-start">
        <DropdownSelect
            name="selectedRiskLevel"
            iconName={ICON_WEATHER_EVENTS_RISK_LEVEL}
            iconAlt="RiskLevel"
            loading={loading}
            initialValue={$selectedWeatherEventRiskLevel}
            options={selectedRiskLevelOptions}
            optionsIcons={selectedRiskLevelOptionsIcons}
            onChange={selectedWeatherEventRiskLevel.set}
            class='mx-0 mr-3'
        />
        <ActionButton 
            iconName={ICON_BUTTON_SAVE} 
            iconAlt='Save' 
            label="Update" 
            onClick={() => onSave(stringToEnumValue(WeatherEventRiskLevel, $selectedWeatherEventRiskLevel))}
            {updating}/>
    </div>
</div>