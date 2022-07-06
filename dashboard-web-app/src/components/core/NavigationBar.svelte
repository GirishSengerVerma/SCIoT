<script lang="ts">
	import {
		ICON_COMMON_ACTUATOR,
		ICON_COMMON_AUTHORITY,
		ICON_COMMON_EVENT,
		ICON_COMMON_LOCATION,
		ICON_COMMON_SENSOR,
		ICON_COMMON_SETTINGS,
		ICON_COMMON_SOCIAL_MEDIA,
		ICON_COMMON_THEME_SWITCH
	} from '$root/constants/iconConstants';
	import { theme } from '$root/stores/themeStore';

	import NavigationBarItem from '$root/components/core/NavigationBarItem.svelte';

	export let route: string = '';
</script>

<div
	class="
            z-10
            fixed
            left-0
            bottom-0
            w-full
            lg:w-auto
            lg:relative
            flex
            flex-row
            lg:flex-col
            order-last
            lg:order-first
            items-center
            justify-center
            lg:justify-between
            text-center
            border-t
            lg:border border-accentLight dark:border-accentDark
            lg:rounded-2xl
            bg-white
            dark:bg-black   
            shadow-lg 
            lg:shadow-none
        "
>
	<a class="hidden lg:block px-2 lg:p-5 lg:my-5" href="/">
		<img src="logo/logo_lightmode.svg" alt="DWA Logo" class="w-20 dark:hidden" />
		<img src="logo/logo_darkmode.svg" alt="DWA Logo" class="w-20 hidden dark:block" />
	</a>
	<div class="flex lg:block w-full lg:my-5 items-center justify-evenly">
		<NavigationBarItem
			iconName={ICON_COMMON_EVENT}
			iconAlt="Events"
			link="/events"
			selected={route === 'events'}
		/>
		<NavigationBarItem
			iconName={ICON_COMMON_SENSOR}
			iconAlt="Sensors"
			link="/sensors"
			selected={route === 'sensors'}
		/>
		<div class="lg:hidden border rounded-lg">
			<NavigationBarItem
				iconName={ICON_COMMON_THEME_SWITCH}
				iconAlt="Switch Theme"
				options
				link={route}
				onClick={() => theme.switch()}
			/>
			<NavigationBarItem
				iconName={ICON_COMMON_SETTINGS}
				iconAlt="Settings"
				options
				link="/settings"
				selected={route === 'settings'}
			/>
		</div>
		<NavigationBarItem
			iconName={ICON_COMMON_ACTUATOR}
			iconAlt="Actuators"
			link="/actuators"
			selected={route === 'actuators'}
		/>
		<NavigationBarItem
			iconName={ICON_COMMON_AUTHORITY}
			iconAlt="Authorities"
			link="/authorities"
			selected={route === 'authorities'}
		/>
		<!--<NavigationBarItem
			iconName={ICON_COMMON_SOCIAL_MEDIA}
			iconAlt="Social Media"
			link="/socialmedia"
			selected={route === 'socialmedia'}
		/>-->
	</div>
	<div class="hidden lg:block px-2 lg:p-5">
		<NavigationBarItem
			iconName={ICON_COMMON_THEME_SWITCH}
			iconAlt="Switch Theme"
			options
			link={route}
			onClick={() => theme.switch()}
		/>
		<NavigationBarItem
			iconName={ICON_COMMON_SETTINGS}
			iconAlt="Settings"
			options
			link="/settings"
			selected={route === 'settings'}
		/>
	</div>
</div>
