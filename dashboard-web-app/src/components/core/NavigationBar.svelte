<script lang="ts">
import { NAVIGATION_ICON_ACTUATOR, NAVIGATION_ICON_AUTHORITY, NAVIGATION_ICON_EVENT, NAVIGATION_ICON_LOCATION, NAVIGATION_ICON_SENSOR, NAVIGATION_ICON_SETTINGS, NAVIGATION_ICON_SOCIAL_MEDIA, NAVIGATION_ICON_THEME_SWITCH } from "$root/constants/iconConstants";

	// your script goes here

import { LIGHT_MODE, theme } from "$root/stores/themeStore";
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
    <div class="my-5">
        <img src={$theme === LIGHT_MODE ? "logo/logo_lightmode.svg" : "logo/logo_darkmode.svg" } alt="DWA Logo" class="w-20"/>
    </div>
	<div>
        <NavigationBarItem      iconName={NAVIGATION_ICON_EVENT}            iconAlt="Events"/>
        <NavigationBarItem      iconName={NAVIGATION_ICON_LOCATION}         iconAlt="Locations"/>
        <NavigationBarItem      iconName={NAVIGATION_ICON_SENSOR}           iconAlt="Sensors"/>
        <NavigationBarItem      iconName={NAVIGATION_ICON_ACTUATOR}         iconAlt="Actuators"/>
        <NavigationBarItem      iconName={NAVIGATION_ICON_AUTHORITY}        iconAlt="Authorities"/>
        <NavigationBarItem      iconName={NAVIGATION_ICON_SOCIAL_MEDIA}     iconAlt="Social Media"/>
    </div>
    <div class="my-5">
        <NavigationBarItem      iconName={NAVIGATION_ICON_THEME_SWITCH}     iconAlt="Switch Theme"  alwaysShowBorder/>
        <NavigationBarItem      iconName={NAVIGATION_ICON_SETTINGS}         iconAlt="Settings"      alwaysShowBorder/>
    </div>
</div>
