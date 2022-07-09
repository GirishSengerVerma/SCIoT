<script lang="ts">
    import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc.js';

	dayjs.extend(utc);

    import { Location, type UnitStatus } from '@prisma/client';

    import { enumValueToString } from '$root/utils/enumUtil';
    import { locationIconMap } from '$root/utils/locationUtils';
    import { formatWeatherEvent } from '$root/utils/weatherEventUtils';
    import { ICON_COMMON_HASH, ICON_COMMON_LOCATION, ICON_ACTUATORS_WEATHER_EVENT, ICON_BUTTON_SAVE } from '$root/constants/iconConstants';
    import { authoritiesUnitStatus } from '$root/stores/authoritiesStores';
    import { weatherEvents, selectedWeatherEventId } from '$root/stores/weatherEventStores';

	import SubTitle from '$root/components/core/SubTitle.svelte';
    import DropdownSelect from '$root/components/core/DropdownSelect.svelte';
    import ActionButton from '$root/components/core/ActionButton.svelte';
    import { socket, SOCKET_REQUEST_MANUALLY_MOVE_AUTHORITIES_UNITS_TOPIC } from '$root/utils/socketio';
    import { unitTypeIconMap } from '$root/utils/unitTypeUtils';

    $: selectedUnitsAmountOptions = Array.from({length: unitStatus?.amount ?? 0}, (_, i) => '' + (i + 1));
    let initialSelectedUnitsAmount = 1;
    let selectedUnitsAmount = initialSelectedUnitsAmount;

    $: selectedMoveToLocationOptions = Object.values(Location).filter(l => l !== unitStatus?.location).map(enumValueToString);
	$: selectedMoveToLocationOptionsIcons = Object.values(Location).filter(l => l !== unitStatus?.location).map(l => locationIconMap[l]);
    $: initialSelectedMoveToLocationOption = selectedMoveToLocationOptions[0];
    let selectedMoveToLocation: Location = Object.values(Location)[0];

    $: currentWeatherEventsAtLocation = new Map(
			[...$weatherEvents]
				.filter(([_, v]) => !v.end && v.location === unitStatus!.location)
				.sort((a, b) => dayjs(b[1].start).diff(dayjs(a[1].start)))
		) ?? new Map();

    $: selectedWeatherEventOptions = ['None'].concat([...currentWeatherEventsAtLocation.keys()].map(id => formatWeatherEvent(currentWeatherEventsAtLocation.get(id)!, true, false)));

    $: initialSelectedWeatherEventOption = ($selectedWeatherEventId === '-1' || !currentWeatherEventsAtLocation.has(Number($selectedWeatherEventId))) 
        ? 'None' 
        : formatWeatherEvent(currentWeatherEventsAtLocation.get(Number($selectedWeatherEventId))!, true, false);

    let updating = false; 

    const onSave = (selectedUnitsAmount: number, selectedWeatherEventId: string) => {
        updating = true;
        console.log(selectedUnitsAmount);
        socket.emit(SOCKET_REQUEST_MANUALLY_MOVE_AUTHORITIES_UNITS_TOPIC, JSON.stringify({ 
            moveUnitsAmount: selectedUnitsAmount, 
            moveUnitsType: unitStatus!.unitType,
            moveUnitsFromLocation: unitStatus!.location,
            moveUnitsToLocation: selectedMoveToLocation,
            weatherEventId: (selectedWeatherEventId === '-1' || !currentWeatherEventsAtLocation.has(Number(selectedWeatherEventId))) ? undefined : Number(selectedWeatherEventId),
        }));
    };

    $: onUnitStatusChange($authoritiesUnitStatus);

    const onUnitStatusChange = (_: Map<string, UnitStatus>) => {
        updating = false;
    };

    const onUnitsAmountDropdownSelectionChange = (option: string) => selectedUnitsAmount = Number(option);

    const onMoveToLocationDropdownSelectionChange = (option: string) => {
        selectedMoveToLocation = Object.values(Location).find(v => enumValueToString(v) === option)!;
    };

    const onWeatherEventDropdownSelectionChange = (option: string) => {
      if(option === 'None') {
        selectedWeatherEventId.set('-1');
      } else {
        selectedWeatherEventId.set(('' + [...currentWeatherEventsAtLocation.keys()].find(id => formatWeatherEvent(currentWeatherEventsAtLocation.get(id)!, true, false) === option)) ?? '-1');
      }
    };

    export let loading: boolean;
    export let unitStatus: UnitStatus | undefined;
</script>

<div class="w-full flex flex-col py-2 lg:py-4">
	<SubTitle text='Manually move Units' clazz="mb-1 lg:mb-3" />
	<div class="flex justify-start items-center">
        {#if unitStatus && unitStatus.amount > 0}
            Move
            <DropdownSelect
                name="selectedUnitsAmount"
                iconName={ICON_COMMON_HASH}
                iconAlt="Amount"
                loading={loading}
                initialValue={'' + initialSelectedUnitsAmount}
                options={selectedUnitsAmountOptions}
                onChange={onUnitsAmountDropdownSelectionChange}
                class='mx-3'
            />
            to
            <DropdownSelect
                name="selectedMoveToLocation"
                iconName={ICON_COMMON_LOCATION}
                iconAlt="Location"
                loading={loading}
                initialValue={initialSelectedMoveToLocationOption}
                options={selectedMoveToLocationOptions}
                optionsIcons={selectedMoveToLocationOptionsIcons}
                onChange={onMoveToLocationDropdownSelectionChange}
                class='mx-3'
            />
            due to
            <DropdownSelect
                name="selectedWeatherEvent"
                iconName={ICON_ACTUATORS_WEATHER_EVENT}
                iconAlt="WeatherEvent"
                loading={loading}
                initialValue={initialSelectedWeatherEventOption}
                options={selectedWeatherEventOptions}
                onChange={onWeatherEventDropdownSelectionChange}
                class='mx-3'
            />
            <ActionButton 
                iconName={ICON_BUTTON_SAVE} 
                iconAlt='Save' 
                label="Save"
                onClick={() => onSave(selectedUnitsAmount, $selectedWeatherEventId)}
                {updating}/>
        {:else if unitStatus}
            No Units of type {unitTypeIconMap[unitStatus?.unitType]} {enumValueToString(unitStatus?.unitType)} currently positioned at {locationIconMap[unitStatus?.location]} {enumValueToString(unitStatus?.location)}.
        {/if}
    </div>
</div>