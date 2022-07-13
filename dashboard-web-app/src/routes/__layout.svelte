<script lang="ts">
	import { page } from '$app/stores';

	import NavigationBar from '$root/components/core/NavigationBar.svelte';
	import '$root/styles/app.css';
</script>

<main
	class="h-full min-h-screen w-full flex flex-col lg:flex-row p-4 lg:p-8 bg-white text-black dark:bg-black dark:text-white"
>
	<NavigationBar route={$page.routeId ?? ''} />
	<slot />
</main>
