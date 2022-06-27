<script lang="ts">
    import { ICON_COMMON_ACTUATOR, ICON_COMMON_AUTHORITY, ICON_COMMON_EVENT, ICON_COMMON_LOCATION, ICON_COMMON_SENSOR, ICON_COMMON_SETTINGS, ICON_COMMON_SOCIAL_MEDIA, ICON_COMMON_THEME_SWITCH } from "$root/constants/iconConstants";
    import { theme } from "$root/stores/themeStore";

    import NavigationBarItem from "$root/components/core/NavigationBarItem.svelte";

    export let route: string = "";
</script>

<div
	class="
            relative
            flex
            flex-row
            md:flex-col
            order-last
            md:order-first
            items-center
            justify-center
            md:justify-between
            text-center
            border border-accentLight dark:border-accentDark
            rounded-2xl"
>
    <a class="hidden md:block px-2 md:p-5 md:my-5" href="/">
        <img src="logo/logo_lightmode.svg" alt="DWA Logo" class="w-20 dark:hidden"/>
        <img src="logo/logo_darkmode.svg" alt="DWA Logo" class="w-20 hidden dark:block"/>
    </a>
	<div class="flex md:block w-full md:my-5 items-center justify-evenly">
        <NavigationBarItem      iconName={ICON_COMMON_EVENT}            iconAlt="Events"        link="/events"      selected={route === "events"}       />
        <NavigationBarItem      iconName={ICON_COMMON_LOCATION}         iconAlt="Locations"     link="/locations"   selected={route === "locations"}    />
        <NavigationBarItem      iconName={ICON_COMMON_SENSOR}           iconAlt="Sensors"       link="/sensors"     selected={route === "sensors"}      />
        <div class="md:hidden border rounded-lg">
            <NavigationBarItem      iconName={ICON_COMMON_THEME_SWITCH}     iconAlt="Switch Theme"  options    link={route}     onClick={() => theme.switch()}  />
            <NavigationBarItem      iconName={ICON_COMMON_SETTINGS}         iconAlt="Settings"      options    link="/settings" selected={route === "settings"} />
        </div>
        <NavigationBarItem      iconName={ICON_COMMON_ACTUATOR}         iconAlt="Actuators"     link="/actuators"   selected={route === "actuators"}        />
        <NavigationBarItem      iconName={ICON_COMMON_AUTHORITY}        iconAlt="Authorities"   link="/authorities" selected={route === "authorities"}      />
        <NavigationBarItem      iconName={ICON_COMMON_SOCIAL_MEDIA}     iconAlt="Social Media"  link="/socialmedia" selected={route === "socialmedia"}      />
    </div>
    <div class="hidden md:block px-2 md:p-5">
        <NavigationBarItem      iconName={ICON_COMMON_THEME_SWITCH}     iconAlt="Switch Theme"  options     link={route}        onClick={() => theme.switch()}  />
        <NavigationBarItem      iconName={ICON_COMMON_SETTINGS}         iconAlt="Settings"      options     link="/settings"    selected={route === "settings"} />
    </div>
</div>