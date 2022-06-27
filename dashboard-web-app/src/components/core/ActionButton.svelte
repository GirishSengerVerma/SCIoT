<script lang="ts">
    let additionalClass = "";
    export { additionalClass as class };
    export let iconName: string;
    export let iconAlt: string;
    export let label: string;
    export let onClick: CallableFunction;
</script>

<button class={"flex items-center border border-accentLight dark:border-accentDark rounded-full mx-2 my-1 px-2 md:px-4 py-2 font-medium " + additionalClass} on:click={() => onClick()}>
    <img class={"w-5 mr-1 md:mr-3 dark:invert"} src={"icons/" + iconName + ".svg"} alt={iconAlt} aria-hidden="true"/>
    <p class="text-sm md:text-base">{label}</p>
</button>