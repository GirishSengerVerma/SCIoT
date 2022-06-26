<script lang="ts">
    import { NAVIGATION_ICON_ACTUATOR, NAVIGATION_ICON_AUTHORITY, NAVIGATION_ICON_EVENT, NAVIGATION_ICON_LOCATION, NAVIGATION_ICON_SENSOR, NAVIGATION_ICON_SETTINGS, NAVIGATION_ICON_SOCIAL_MEDIA, NAVIGATION_ICON_THEME_SWITCH } from "$root/constants/iconConstants";
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
        <NavigationBarItem      iconName={NAVIGATION_ICON_EVENT}            iconAlt="Events"        link="/events"      selected={route === "events"}       />
        <NavigationBarItem      iconName={NAVIGATION_ICON_LOCATION}         iconAlt="Locations"     link="/locations"   selected={route === "locations"}    />
        <NavigationBarItem      iconName={NAVIGATION_ICON_SENSOR}           iconAlt="Sensors"       link="/sensors"     selected={route === "sensors"}      />
        <div class="md:hidden border rounded-lg">
            <NavigationBarItem      iconName={NAVIGATION_ICON_THEME_SWITCH}     iconAlt="Switch Theme"  options    link={route}     onClick={() => theme.switch()}  />
            <NavigationBarItem      iconName={NAVIGATION_ICON_SETTINGS}         iconAlt="Settings"      options    link="/settings" selected={route === "settings"} />
        </div>
        <NavigationBarItem      iconName={NAVIGATION_ICON_ACTUATOR}         iconAlt="Actuators"     link="/actuators"   selected={route === "actuators"}        />
        <NavigationBarItem      iconName={NAVIGATION_ICON_AUTHORITY}        iconAlt="Authorities"   link="/authorities" selected={route === "authorities"}      />
        <NavigationBarItem      iconName={NAVIGATION_ICON_SOCIAL_MEDIA}     iconAlt="Social Media"  link="/socialmedia" selected={route === "socialmedia"}      />
    </div>
    <div class="hidden md:block px-2 md:p-5">
        <NavigationBarItem      iconName={NAVIGATION_ICON_THEME_SWITCH}     iconAlt="Switch Theme"  options     link={route}        onClick={() => theme.switch()}  />
        <NavigationBarItem      iconName={NAVIGATION_ICON_SETTINGS}         iconAlt="Settings"      options     link="/settings"    selected={route === "settings"} />
    </div>
</div>