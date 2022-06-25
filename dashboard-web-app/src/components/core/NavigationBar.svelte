<script lang="ts">
import { NAVIGATION_ICON_ACTUATOR, NAVIGATION_ICON_AUTHORITY, NAVIGATION_ICON_EVENT, NAVIGATION_ICON_LOCATION, NAVIGATION_ICON_SENSOR, NAVIGATION_ICON_SETTINGS, NAVIGATION_ICON_SOCIAL_MEDIA, NAVIGATION_ICON_THEME_SWITCH } from "$root/constants/iconConstants";

import NavigationBarItem from "./NavigationBarItem.svelte";

</script>

<div
	class="
            flex
            flex-col
            items-center
            justify-between
            text-center
            border border-accentLight dark:border-accentDark
            rounded-2xl
            p-7"
>
    <a class="my-5" href="/">
        <img src="logo/logo_lightmode.svg" alt="DWA Logo" class="w-20 dark:hidden"/>
        <img src="logo/logo_darkmode.svg" alt="DWA Logo" class="w-20 hidden dark:block"/>
    </a>
	<div class="my-5">
        <NavigationBarItem      iconName={NAVIGATION_ICON_EVENT}            iconAlt="Events"/>
        <NavigationBarItem      iconName={NAVIGATION_ICON_LOCATION}         iconAlt="Locations"/>
        <NavigationBarItem      iconName={NAVIGATION_ICON_SENSOR}           iconAlt="Sensors"/>
        <NavigationBarItem      iconName={NAVIGATION_ICON_ACTUATOR}         iconAlt="Actuators"/>
        <NavigationBarItem      iconName={NAVIGATION_ICON_AUTHORITY}        iconAlt="Authorities"/>
        <NavigationBarItem      iconName={NAVIGATION_ICON_SOCIAL_MEDIA}     iconAlt="Social Media"/>
    </div>
    <div>
        <NavigationBarItem      iconName={NAVIGATION_ICON_THEME_SWITCH}     iconAlt="Switch Theme"  options/>
        <NavigationBarItem      iconName={NAVIGATION_ICON_SETTINGS}         iconAlt="Settings"      options/>
    </div>
</div>
