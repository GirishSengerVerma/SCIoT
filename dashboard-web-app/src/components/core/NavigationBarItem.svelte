<script lang="ts">
    export let iconName: string;
    export let iconAlt: string;
    export let alwaysShowBorder: boolean = false;
</script>

<div class={(alwaysShowBorder 
        ? "border rounded-lg border-accentLight dark:border-accentDark" 
        : "hover:border hover:rounded-lg hover:border-accentLight dark:hover:border-accentDark") 
        + " p-4 my-4 hover:cursor-pointer"}>
    <img src={"icons/nav/" + iconName + ".svg"} alt={iconAlt} class="w-7"/>
</div>