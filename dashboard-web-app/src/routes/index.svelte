<script lang="ts">
	import {DARK_MODE, LIGHT_MODE, theme} from '$root/stores/themeStore';
</script>

<svelte:head>
	<title>Dashboard | Start</title>
</svelte:head>

<main class="bg-white text-black dark:bg-black dark:text-white">
	<h1 class="text-3xl font-bold underline">Hello world!</h1>
	<h2 class="text-1xl">Theme: {$theme}</h2>

	<button class="font-bold py-2 px-4 rounded bg-white border border-black text-black" on:click={() => theme.set(LIGHT_MODE)}>light</button>
	<button class="font-bold py-2 px-4 rounded bg-black border border-white text-white" on:click={() => theme.set(DARK_MODE)}>dark</button>
</main>
