<script lang="ts">
	import { fade } from 'svelte/transition';

	import { isModalOpen } from '$root/stores/modalstore';
	import { clickOutside } from '$root/utils/clickOutside';
	import { ICON_COMMON_CLOSE } from '$root/constants/iconConstants';
</script>

{#if $isModalOpen}
	<div
		class="fixed top-0 left-0 z-30 w-screen h-screen bg-black/40 transition"
		in:fade={{ duration: 70 }}
		out:fade={{ duration: 70 }}
	>
		<div
			class="fixed w-full h-full top-0 left-0 xl:w-1/3 xl:h-1/2 xl:top-1/4 xl:left-1/3 xl:rounded-xl bg-white dark:bg-black border border-accentLight dark:border-accentDark p-14"
			use:clickOutside
			on:click_outside={() => isModalOpen.set(false)}
		>
			<button class="absolute top-2 left-2" on:click={() => isModalOpen.set(false)}>
				<img
					class={'w-8 h-8 dark:invert'}
					src={'icons/' + ICON_COMMON_CLOSE + '.svg'}
					alt="Close"
					aria-hidden="true"
				/>
			</button>
			<slot />
		</div>
	</div>
{/if}
