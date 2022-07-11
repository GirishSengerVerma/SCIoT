<script lang="ts">
	import type { Sensor } from '@prisma/client';

	import { ICON_BUTTON_DELETE } from '$root/constants/iconConstants';
	import { socket, SOCKET_REQUEST_DELETE_SENSOR_TOPIC } from '$root/utils/socketio';

	import ActionButton from '$root/components/core/ActionButton.svelte';
	import TextInput from '$root/components/core/TextInput.svelte';
	import SubTitle from '$root/components/core/SubTitle.svelte';
	import LoadingSpinner from '../core/LoadingSpinner.svelte';
	import {
		sensorMetaData,
		sensors,
		liveSensorData,
		selectedSensorInstanceId
	} from '$root/stores/sensorStores';

	const validateConfirmInput = (input: string) => input === sensor?.instanceId;
	const invalidConfirmInputMessage = (_: string) => '';

	const onDelete = () => {
		if (sensorConfirmDelete !== sensor?.instanceId) {
			return;
		}

		updating = true;

		socket.emit(
			SOCKET_REQUEST_DELETE_SENSOR_TOPIC,
			JSON.stringify({ instanceId: sensor.instanceId })
		);

		selectedSensorInstanceId.set('');
		liveSensorData.resetSensor(sensor.instanceId);
		sensorMetaData.resetSensor(sensor.instanceId);
		sensors.remove(sensor.instanceId);
	};

	let updating = false;
	let sensorConfirmDelete = '';

	export let loading: boolean;
	export let sensor: Sensor | undefined;
</script>

<div class="w-full flex flex-col py-2 lg:py-4">
	<SubTitle text="Delete Sensor" clazz="mb-1 lg:mb-3" />
	<div class="flex justify-start items-center">
		{#if loading || !sensor}
			<LoadingSpinner />
		{:else}
			<TextInput
				name="sensorConfirmDelete"
				placeholder={"Enter '" + sensor.instanceId + "' to confirm"}
				bind:currentInput={sensorConfirmDelete}
				validateInput={validateConfirmInput}
				invalidInputMessage={invalidConfirmInputMessage}
				showInvaidInputMessage={false}
			/>
			<ActionButton
				iconName={ICON_BUTTON_DELETE}
				iconAlt="Delete"
				label="Delete"
				onClick={() => onDelete()}
				disabled={sensorConfirmDelete !== sensor.instanceId}
				{updating}
				class="mt-0"
			/>
		{/if}
	</div>
</div>
