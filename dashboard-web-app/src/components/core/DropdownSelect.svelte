<script lang="ts">
    import { clickOutside } from "$root/utils/clickOutside";
    import { ICON_DROPDOWN_CHEVRON_DOWN, ICON_DROPDOWN_CHEVRON_UP } from "$root/constants/iconConstants";

    export let name: string;
    export let iconName: string;
    export let iconAlt: string;
    export let options: string[];
    export let initialValue: string;
    export let currentValue: string = initialValue;

    let selectedItemIndex = 0;

    let dropdownMenuOpen = false;

    const onClick = () => {
        dropdownMenuOpen = !dropdownMenuOpen;
    };

    const onClickOutside = () => {
        if(dropdownMenuOpen) {
            dropdownMenuOpen = false;
        }
    };

    const onSelectOption = (i: number) => {
        selectedItemIndex = i;
        dropdownMenuOpen = false;
    };

    $: console.log(currentValue);
</script>

<div class="relative flex border border-accentLight dark:border-accentDark rounded-md mx-2 my-1" use:clickOutside on:click_outside={onClickOutside}>
    <div class="relative flex items-center cursor-pointer outline-none px-2" tabindex="0" on:click={onClick}>
        <img src={"icons/" + iconName + ".svg"} alt={iconAlt} class="w-5 mr-2 md:mr-3 dark:invert" aria-hidden="true"/>
        {#each options as option, i}
            <div class="flex">
                <input class="hidden" type="radio" id={name + "-" + i} name={name} value={option} bind:group={currentValue} checked={selectedItemIndex === i} on:change={() => onSelectOption(i)}/>
                <p class={((selectedItemIndex === i) ? "block" : "hidden") + " w-full text-sm md:text-base font-medium"}>{option}</p>
            </div>
        {/each}
        <img class={"w-5 ml-1 md:ml-3 dark:invert transition duration-200" + (dropdownMenuOpen ? " rotate-180" : "")} src={"icons/" + ICON_DROPDOWN_CHEVRON_DOWN + ".svg"} alt={iconAlt} aria-hidden="true"/>
    </div>
    <ul class={"absolute left-0 w-full mt-11 md:mt-12 rounded-md border border-accentLight dark:border-accentDark list-none text-center transition duration-200" + (dropdownMenuOpen ? " opacity-1" : " opacity-0")}>
        {#each options as option, i}
            <li>
                <label class={"block w-full px-3 py-2 text-sm md:text-base hover:bg-accentLight/[.20] dark:hover:bg-accentDark/[.20] focus:bg-accentLight/[.20] focus:hover:bg-accentDark/[.20]" + (dropdownMenuOpen ? " cursor-pointer" : "")} for={name + "-" + i} aria-hidden="true">
                    {option}
                </label>
                {#if i < options.length - 1}
                    <hr class="border-accentLight dark:border-accentDark"/>
                {/if}
            </li>
        {/each}
    </ul>
</div>