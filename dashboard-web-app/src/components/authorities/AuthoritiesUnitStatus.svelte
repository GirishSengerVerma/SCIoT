<script lang="ts">
	import type { UnitStatus } from '@prisma/client';

	import { enumValueToString } from '$root/utils/enumUtil';
    import { ICON_AUTHORITIES_UNIT_TYPE_BY_NAME } from '$root/constants/iconConstants';

	export let unitStatus: UnitStatus;
	export let isSelected: boolean = false;
	export let onClick: CallableFunction = () => {};
</script>

<div
	class={'flex md:flex-grow md:flex-shrink w-[48%] md:w-60 relative px-4 py-2 md:p-4 border md:border-accentLight md:dark:border-accentDark' +
		(isSelected ? ' md:border-primary outline outline-primary outline-1' : '') +
		' rounded-lg text-center justify-center cursor-pointer hover:bg-accentLight/20 dark:hover:bg-accentDark/10 transition-colors'}
	on:click={() => onClick()}
>
	<div class="flex flex-col flex-grow">
		<div class="md:text-lg md:font-medium text-right md:text-center">
			{enumValueToString(unitStatus.unitType)}
		</div>
		<div class="flex md:px-5 mt-1 md:mt-3 justify-end md:justify-between">
			<div
				class="hidden md:flex bg-accentLight dark:bg-accentDark bg-opacity-30 rounded-lg mr-8 lg:mr-7 p-1 md:p-3"
			>
				<img
					class={'w-8 h-8 dark:invert'}
					src={'icons/' + ICON_AUTHORITIES_UNIT_TYPE_BY_NAME.get(unitStatus.unitType) + '.svg'}
					alt={enumValueToString(unitStatus.unitType)}
					aria-hidden="true"
				/>
			</div>
			<div class="flex flex-col justify-around">
                <div
                    class={'rounded-full bg-green-300 text-xs md:text-sm text-black px-3'}
                >
                    {unitStatus.amount}
                </div>
			</div>
		</div>
	</div>
</div>
