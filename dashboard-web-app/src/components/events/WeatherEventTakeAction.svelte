<script lang="ts">
	import { WeatherEventActionType, type WeatherEvent } from '@prisma/client';
    import { onDestroy } from 'svelte';

    import { enumValueToString, stringToEnumValue } from '$root/utils/enumUtil';
    import { ICON_WEATHER_EVENTS_ACTION, ICON_BUTTON_ADD } from '$root/constants/iconConstants';
    import { selectedWeatherEventActionType } from '$root/stores/weatherEventStores';

	import SubTitle from '$root/components/core/SubTitle.svelte';
    import DropdownSelect from '$root/components/core/DropdownSelect.svelte';
    import ActionButton from '$root/components/core/ActionButton.svelte';
    import { socket, SOCKET_REQUEST_MANUALLY_TAKE_WEATHER_EVENT_ACTION_TOPIC, weatherEventActionTopicPrefix } from '$root/utils/socketio';

    const selectedWeatherEventActionTypeOptions = Object.values(WeatherEventActionType)
        .filter(type => type !== WeatherEventActionType.COUNTER_MEASURE_MOVE_UNITS_REQUEST 
                    && type !== WeatherEventActionType.COUNTER_MEASURE_MOVE_UNITS_RESPONSE
                    && type !== WeatherEventActionType.PLANNING_INCREASE_RISK_LEVEL
                    && type !== WeatherEventActionType.PLANNING_DECREASE_RISK_LEVEL)
        .map(enumValueToString);
	
    let updating = false;

    const onAdd = (selectedWeatherEventActionType: WeatherEventActionType) => {
        updating = true;
        socket.emit(SOCKET_REQUEST_MANUALLY_TAKE_WEATHER_EVENT_ACTION_TOPIC, JSON.stringify({ type: selectedWeatherEventActionType, location: weatherEvent?.location, weatherEventId: weatherEvent?.id }));

        socket.on(weatherEventActionTopicPrefix, (_) => {
			updating = false;
		});
    };

    onDestroy(() => { 
		socket.off(weatherEventActionTopicPrefix);
	});

    export let loading: boolean;
    export let weatherEvent: WeatherEvent | undefined;
</script>

<div class="w-full flex flex-col py-2 lg:py-4">
	<SubTitle text='Manually take Action' clazz="mb-1 lg:mb-3" />
	<div class="flex justify-start">
        <DropdownSelect
            name="selectedActionType"
            iconName={ICON_WEATHER_EVENTS_ACTION}
            iconAlt="ActionType"
            loading={loading}
            initialValue={$selectedWeatherEventActionType}
            options={selectedWeatherEventActionTypeOptions}
            onChange={selectedWeatherEventActionType.set}
            class='mx-0 mr-3'
        />
        <ActionButton 
            iconName={ICON_BUTTON_ADD} 
            iconAlt='Add' 
            label="Add" 
            onClick={() => onAdd(stringToEnumValue(WeatherEventActionType, $selectedWeatherEventActionType))}
            {updating}/>
    </div>
</div>