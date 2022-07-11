<script lang="ts">
	import type { WeatherEvent } from '@prisma/client';

	import { ICON_BUTTON_DELETE } from '$root/constants/iconConstants';
	import { socket, SOCKET_REQUEST_DELETE_WEATHER_EVENT_TOPIC } from '$root/utils/socketio';

	import ActionButton from '$root/components/core/ActionButton.svelte';
	import TextInput from '$root/components/core/TextInput.svelte';
	import SubTitle from '$root/components/core/SubTitle.svelte';
	import LoadingSpinner from '$root/components/core/LoadingSpinner.svelte';
	import {
		weatherEvents,
		currentWeatherEventRisk,
		selectedWeatherEventId
	} from '$root/stores/weatherEventStores';

	const validateConfirmInput = (input: string) => input === 'delete-' + weatherEvent?.id;
	const invalidConfirmInputMessage = (_: string) => '';

	const onDelete = () => {
		if (!weatherEvent || weatherEventConfirmDelete !== 'delete-' + weatherEvent.id) {
			return;
		}

		updating = true;

		socket.emit(SOCKET_REQUEST_DELETE_WEATHER_EVENT_TOPIC, JSON.stringify({ id: weatherEvent.id }));

		selectedWeatherEventId.set('-1');
		currentWeatherEventRisk.resetForWeatherEvent(weatherEvent.id);
		weatherEvents.remove(weatherEvent.id);
	};

	let updating = false;
	let weatherEventConfirmDelete = '';

	export let loading: boolean;
	export let weatherEvent: WeatherEvent | undefined;
</script>

<div class="w-full flex flex-col py-2 lg:py-4">
	<SubTitle text="Delete Weather Event" clazz="mb-1 lg:mb-3" />
	<div class="flex justify-start items-center">
		{#if loading || !weatherEvent}
			<LoadingSpinner />
		{:else}
			<TextInput
				name="weatherEventConfirmDelete"
				placeholder={"Enter 'delete-" + weatherEvent.id + "' to confirm"}
				bind:currentInput={weatherEventConfirmDelete}
				validateInput={validateConfirmInput}
				invalidInputMessage={invalidConfirmInputMessage}
				showInvaidInputMessage={false}
			/>
			<ActionButton
				iconName={ICON_BUTTON_DELETE}
				iconAlt="Delete"
				label="Delete"
				onClick={() => onDelete()}
				disabled={weatherEventConfirmDelete !== 'delete-' + weatherEvent.id}
				{updating}
				class="mt-0"
			/>
		{/if}
	</div>
</div>
