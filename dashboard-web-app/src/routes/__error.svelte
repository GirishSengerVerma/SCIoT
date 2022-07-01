<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = ({ error, status }) => {
		return {
			props: {
				title: `${status}: ${error?.message}`
			}
		};
	};
</script>

<script lang="ts">
	export let title: string;
</script>

<div class="flex h-full min-h-screen justify-center items-center">
	<div class="text-center">
		<h1 class="text-5xl font-bold underline">{title}</h1>
		<p class="text-[50vw] md:text-[20rem]">⚠️</p>
	</div>
</div>
