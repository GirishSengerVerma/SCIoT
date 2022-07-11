<script lang="ts">
	export let name: string;
	export let placeholder: string;
	export let validateInput: CallableFunction;
	export let showInvaidInputMessage = true;
	export let invalidInputMessage: CallableFunction;
	export let currentInput = '';
	let additionalClass = '';
	export { additionalClass as class };

	let isInputValid = validateInput(currentInput);

	const onInput = (event: any) => {
		currentInput = event.target.value;
		isInputValid = validateInput(event.target.value);
	};
</script>

<div class={additionalClass ? ' ' + additionalClass : ''}>
	<input
		class={'appearance-none block w-full rounded-md py-2 px-4 mb-1 bg-white dark:bg-black text-black dark:text-white placeholder:text-sm text-sm md:placeholder:text-base md:text-base border focus:outline focus:outline-1 ' +
			(isInputValid
				? ' border-accentLight dark:border-accentDark focus:border-primary focus:outline-primary'
				: ' border-red-300 focus:outline-red-300')}
		id={'text-input-' + name}
		type="text"
		{placeholder}
		on:input={onInput}
	/>
	{#if !isInputValid && showInvaidInputMessage}
		<p class="text-red-300 text-xs italic">{invalidInputMessage(currentInput)}</p>
	{/if}
</div>
