<script lang="ts">
    import type { Actuator, ActuatorStatusData } from '@prisma/client';

    import { ICON_ACTUATOR_STATUS, ICON_BUTTON_SAVE } from '$root/constants/iconConstants';
    import { actuatorMetaData, actuatorStatusData, selectedActuatorStatus } from '$root/stores/actuatorStores';

	import SubTitle from '$root/components/core/SubTitle.svelte';
    import DropdownSelect from '$root/components/core/DropdownSelect.svelte';
    import ActionButton from '$root/components/core/ActionButton.svelte';
    import { socket, SOCKET_REQUEST_MANUALLY_CHANGE_ACTUATOR_STATUS_TOPIC } from '$root/utils/socketio';

    const selectedStatusOptions = ['Enabled', 'Disabled'];
	const selectedStatusOptionsIcons = ['🟢', '🔴'];

    let updating = false; 

    const onSave = (selectedActuatorStatus: boolean) => {
        updating = true;
        socket.emit(SOCKET_REQUEST_MANUALLY_CHANGE_ACTUATOR_STATUS_TOPIC, JSON.stringify({ 
            selectedActuatorStatus, 
            instanceId: actuator?.instanceId, 
            type: $actuatorMetaData.get(actuator?.instanceId!)?.type,
            location: $actuatorMetaData.get(actuator?.instanceId!)?.location,
        }));
    };

    $: onActuatorStatusChange($actuatorStatusData);

    const onActuatorStatusChange = (_: Map<string, ActuatorStatusData[]>) => {
        updating = false;
    };

    const onDropdownSelectionChange = (option: string) => selectedActuatorStatus.set(option === 'Enabled');

    export let loading: boolean;
    export let actuator: Actuator | undefined;
</script>

<div class="w-full flex flex-col py-2 lg:py-4">
	<SubTitle text='Manually change Status' clazz="mb-1 lg:mb-3" />
	<div class="flex justify-start">
        <DropdownSelect
            name="selectedStatus"
            iconName={ICON_ACTUATOR_STATUS}
            iconAlt="Status"
            loading={loading}
            initialValue={$selectedActuatorStatus ? 'Enabled' : 'Disabled'}
            options={selectedStatusOptions}
            optionsIcons={selectedStatusOptionsIcons}
            onChange={onDropdownSelectionChange}
            class='mx-0 mr-3'
        />
        <ActionButton 
            iconName={ICON_BUTTON_SAVE} 
            iconAlt='Save' 
            label="Update"
            onClick={() => onSave($selectedActuatorStatus)}
            {updating}/>
    </div>
</div>