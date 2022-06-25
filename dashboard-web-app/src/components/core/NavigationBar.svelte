<script lang="ts">
    import { NAVIGATION_ICON_ACTUATOR, NAVIGATION_ICON_AUTHORITY, NAVIGATION_ICON_EVENT, NAVIGATION_ICON_LOCATION, NAVIGATION_ICON_SENSOR, NAVIGATION_ICON_SETTINGS, NAVIGATION_ICON_SOCIAL_MEDIA, NAVIGATION_ICON_THEME_SWITCH } from "$root/constants/iconConstants";
import { theme } from "$root/stores/themeStore";

    import NavigationBarItem from "./NavigationBarItem.svelte";
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
            rounded-2xl
            px-2
            md:p-5"
>
    <a class="hidden md:block md:my-5" href="/">
        <img src="logo/logo_lightmode.svg" alt="DWA Logo" class="w-20 dark:hidden"/>
        <img src="logo/logo_darkmode.svg" alt="DWA Logo" class="w-20 hidden dark:block"/>
    </a>
	<div class="flex md:block w-full md:w-auto md:my-5 items-center justify-evenly">
        <NavigationBarItem      iconName={NAVIGATION_ICON_EVENT}            iconAlt="Events"        link="/events"      />
        <NavigationBarItem      iconName={NAVIGATION_ICON_LOCATION}         iconAlt="Locations"     link="/locations"   />
        <NavigationBarItem      iconName={NAVIGATION_ICON_SENSOR}           iconAlt="Sensors"       link="/sensors"     />
        <div class="md:hidden border rounded-lg">
            <NavigationBarItem      iconName={NAVIGATION_ICON_THEME_SWITCH}     iconAlt="Switch Theme"  options      onClick={() => theme.switch()}      />
            <NavigationBarItem      iconName={NAVIGATION_ICON_SETTINGS}         iconAlt="Settings"      options    link="/settings"                    />
        </div>
        <NavigationBarItem      iconName={NAVIGATION_ICON_ACTUATOR}         iconAlt="Actuators"     link="/actuators"   />
        <NavigationBarItem      iconName={NAVIGATION_ICON_AUTHORITY}        iconAlt="Authorities"   link="/authorities" />
        <NavigationBarItem      iconName={NAVIGATION_ICON_SOCIAL_MEDIA}     iconAlt="Social Media"  link="/socialmedia" />
    </div>
    <div class="hidden md:block">
        <NavigationBarItem      iconName={NAVIGATION_ICON_THEME_SWITCH}     iconAlt="Switch Theme"  options     onClick={() => theme.switch()}      />
        <NavigationBarItem      iconName={NAVIGATION_ICON_SETTINGS}         iconAlt="Settings"      options     link="/settings"                    />
    </div>
</div>