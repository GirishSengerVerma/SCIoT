<script lang="ts">
    import NavigationBarSelectedItemIndicator from './NavigationBarSelectedItemIndicator.svelte';

    export let iconName: string;
    export let iconAlt: string;
    export let options: boolean = false;
    export let link: string = '/';
    export let onClick: (e: MouseEvent) => void = (e) => {};
    export let selected: boolean = false;
</script>

<div class={"flex flex-col md:flex-row self-stretch items-center justify-between"}>
    <NavigationBarSelectedItemIndicator options={options} selected={selected}>
        <a href={link} on:click={onClick}>
            <div class={
                "hover:cursor-pointer transition border rounded-lg px-2 md:p-5" 
                + ((selected && options) ? " bg-accentLight bg-opacity-80 dark:bg-opacity-20" : "")
                + (options ? 
                    " p-1 md:my-2 md:p-2 border-transparent md:border-accentLight md:dark:border-accentDark hover:bg-accentLight/[.20] dark:hover:bg-accentDark/[.25]" : 
                    " p-2 md:my-4 md:p-4 rounded-lg border-transparent  hover:border hover:rounded-lg hover:border-accentLight dark:hover:border-accentDark")
            }>
                <img src={"icons/nav/" + iconName + ".svg"} alt={iconAlt} class={(options ? "w-5 md:w-6" : "w-6 md:w-7") + " dark:invert max-w-none"}/>
            </div>
        </a>
    </NavigationBarSelectedItemIndicator>
</div>