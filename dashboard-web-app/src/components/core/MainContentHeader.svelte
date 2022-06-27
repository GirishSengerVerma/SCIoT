<script lang="ts">
    import { page } from "$app/stores";

    export let title: string;
</script>

<div class="flex mb-6">
    <a href={$page.routeId}><h1 class="text-3xl md:text-4xl pb-2 font-bold border-b-2 border-primary">{title}</h1></a>
    <slot/>
</div>
