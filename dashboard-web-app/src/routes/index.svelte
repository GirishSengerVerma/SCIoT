<script lang="ts">
	import NavigationBar from '$root/components/core/NavigationBar.svelte';

	import { DARK_MODE, LIGHT_MODE, theme } from '$root/stores/themeStore';
</script>

<svelte:head>
	<title>Dashboard | Start</title>
</svelte:head>

<main class="h-screen w-screen flex p-8 bg-white text-black dark:bg-black dark:text-white">
	<NavigationBar />
	<div class="flex-grow">
		<button
			class="font-bold py-2 px-4 rounded bg-white border border-black text-black"
			on:click={() => theme.set(LIGHT_MODE)}>light</button
		>
		<button
			class="font-bold py-2 px-4 rounded bg-black border border-white text-white"
			on:click={() => theme.set(DARK_MODE)}>dark</button
		>
	</div>
</main>
