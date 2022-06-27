<script lang="ts">
    import { slide } from 'svelte/transition';

    export let options: boolean;
    export let selected: boolean;
</script>

{#if selected && !options}
    <div class={"w-7 md:w-1 h-1 md:h-8 md:my-4 rounded-full bg-primary"} transition:slide={{duration: 300}}></div>
{:else if !options}
    <div class="w-7 md:w-1 h-1 md:h-8 md:my-4"></div>
{/if}
<slot/>
{#if selected && !options}
    <div class="w-7 md:w-1 h-1 md:h-8" transition:slide={{duration: 300}}></div>
{:else if !options}
    <div class="w-7 md:w-1 h-1 md:h-8 md:my-4"></div>
{/if}