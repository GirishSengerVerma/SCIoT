<script lang="ts">
	import LoadingSpinner from './LoadingSpinner.svelte';

	let additionalClass = '';
	export { additionalClass as class };
	export let iconName: string | undefined = undefined;
	export let iconAlt: string | undefined = undefined;
	export let label: string;
	export let updating: boolean = false;
	export let onClick: CallableFunction;
	export let disabled = false;
</script>

<button
	{disabled}
	class={'flex items-center border hover:bg-accentLight/20 dark:hover:bg-accentDark/15 rounded-full mx-2 my-1 px-2 md:px-4 py-2 font-medium ' +
		additionalClass +
		(disabled
			? ' border-red-300 cursor-not-allowed'
			: ' border-accentLight dark:border-accentDark cursor-pointer')}
	on:click={() => !updating && onClick()}
>
	{#if iconName}
		<img
			class={'w-5 max-w-none mr-1 md:mr-3 dark:invert'}
			src={'icons/' + iconName + '.svg'}
			alt={iconAlt ?? iconName}
			aria-hidden="true"
		/>
	{/if}
	{#if updating}
		<p class="text-sm md:text-base border-b border-accentLight dark:border-accentDark mb-1">
			<LoadingSpinner />
		</p>
	{:else}
		<p class="text-sm md:text-base border-b border-accentLight dark:border-accentDark mb-1">
			{label}
		</p>
	{/if}
</button>
