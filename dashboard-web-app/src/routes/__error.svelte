<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit'

	export const load: Load = ({ error, status }) => {
		return {
			props: {
				title: `${status}: ${error?.message}`
			}
		}
	}
</script>

<script lang="ts">
	export let title: string
</script>

<div class="error">
	<h1>{title}</h1>
	<span class="emoji">⚠️</span>
</div>

<style>
	.error {
		height: 100vh;
		display: grid;
		gap: var(--spacing-32);
		place-content: center;
		place-items: center;
	}

    .emoji {
        font-size: 20rem;
    }
</style>
