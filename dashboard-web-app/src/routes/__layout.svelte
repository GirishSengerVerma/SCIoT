<script lang="ts">
	import { page } from '$app/stores';

	import NavigationBar from '$root/components/core/NavigationBar.svelte';
	import '$root/styles/app.css';
</script>

<main class="h-screen w-screen flex flex-col md:flex-row p-4 md:p-8 bg-white text-black dark:bg-black dark:text-white">
	<NavigationBar route={$page.routeId ?? ""} />
	<div class="flex-grow md:mx-5 md:my-8">
		<slot />
	</div>
</main>
