<script lang="ts">
	import { slide } from 'svelte/transition';

	export let options: boolean;
	export let selected: boolean;
</script>

{#if selected && !options}
	<div
		class={'w-7 lg:w-1 h-1 lg:h-8 lg:my-4 rounded-full bg-primary'}
		transition:slide={{ duration: 300 }}
	/>
{:else if !options}
	<div class="w-7 lg:w-1 h-1 lg:h-8 lg:my-4" />
{/if}
<slot />
{#if selected && !options}
	<div class="w-7 lg:w-1 h-1 lg:h-8" transition:slide={{ duration: 300 }} />
{:else if !options}
	<div class="w-7 lg:w-1 h-1 lg:h-8 lg:my-4" />
{/if}
