<script lang="ts">
    export let iconName: string;
    export let iconAlt: string;
    export let options: boolean = false;
</script>

<div class={
    "hover:cursor-pointer transition border rounded-lg" 
    + (options ? 
        " my-2 p-2 border-accentLight dark:border-accentDark hover:bg-accentLight/[.15] dark:hover:bg-accentDark/[.25]" : 
        " my-4 p-4 rounded-lg border-transparent  hover:border hover:rounded-lg hover:border-accentLight dark:hover:border-accentDark")
}>
    <img src={"icons/nav/" + iconName + ".svg"} alt={iconAlt} class={(options ? "w-6" : "w-7") + ' dark:invert'}/>
</div>