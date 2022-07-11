<script lang="ts">
	import type { Actuator } from '@prisma/client';

	import { ICON_BUTTON_DELETE } from '$root/constants/iconConstants';
	import { socket, SOCKET_REQUEST_DELETE_ACTUATOR_TOPIC } from '$root/utils/socketio';

	import ActionButton from '$root/components/core/ActionButton.svelte';
	import TextInput from '$root/components/core/TextInput.svelte';
	import SubTitle from '$root/components/core/SubTitle.svelte';
	import LoadingSpinner from '$root/components/core/LoadingSpinner.svelte';
	import {
		actuatorMetaData,
		actuators,
		actuatorStatusData,
		selectedActuatorInstanceId
	} from '$root/stores/actuatorStores';

	const validateConfirmInput = (input: string) => input === actuator?.instanceId;
	const invalidConfirmInputMessage = (_: string) => '';

	const onDelete = () => {
		if (actuatorConfirmDelete !== actuator?.instanceId) {
			return;
		}

		updating = true;

		socket.emit(
			SOCKET_REQUEST_DELETE_ACTUATOR_TOPIC,
			JSON.stringify({ instanceId: actuator.instanceId })
		);

		selectedActuatorInstanceId.set('');
		actuatorStatusData.resetActuator(actuator.instanceId);
		actuatorMetaData.resetActuator(actuator.instanceId);
		actuators.remove(actuator.instanceId);
	};

	let updating = false;
	let actuatorConfirmDelete = '';

	export let loading: boolean;
	export let actuator: Actuator | undefined;
</script>

<div class="w-full flex flex-col py-2 lg:py-4">
	<SubTitle text="Delete Actuator" clazz="mb-1 lg:mb-3" />
	<div class="flex justify-start items-center">
		{#if loading || !actuator}
			<LoadingSpinner />
		{:else}
			<TextInput
				name="actuatorConfirmDelete"
				placeholder={"Enter '" + actuator.instanceId + "' to confirm"}
				bind:currentInput={actuatorConfirmDelete}
				validateInput={validateConfirmInput}
				invalidInputMessage={invalidConfirmInputMessage}
				showInvaidInputMessage={false}
			/>
			<ActionButton
				iconName={ICON_BUTTON_DELETE}
				iconAlt="Delete"
				label="Delete"
				onClick={() => onDelete()}
				disabled={actuatorConfirmDelete !== actuator.instanceId}
				{updating}
				class="mt-0"
			/>
		{/if}
	</div>
</div>
