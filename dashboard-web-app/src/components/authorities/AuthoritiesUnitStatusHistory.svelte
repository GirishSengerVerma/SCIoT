<script lang="ts">
	import { format } from 'timeago.js';

	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc.js';

	dayjs.extend(utc);

	import type { UnitsStatusDataWithRelatedWeatherEventData } from '$root/types/additionalPrismaTypes';
	import { formatWeatherEventAction } from '$root/utils/weatherEventUtils';
	import SubTitle from '$root/components/core/SubTitle.svelte';
	import { getColorByUnitType } from '$root/utils/unitTypeUtils';

	const getUnitsAmountDeltaToPreviousValue = (
		authoritiesHistoricUnitStatusData: UnitsStatusDataWithRelatedWeatherEventData[],
		i: number
	) => {
		if (i == authoritiesHistoricUnitStatusData.length - 1) {
			return authoritiesHistoricUnitStatusData[i].amount;
		} else {
			return (
				authoritiesHistoricUnitStatusData[i].amount -
				authoritiesHistoricUnitStatusData[i + 1].amount
			);
		}
	};

	export let loading = false;
	export let authoritiesHistoricUnitStatusData:
		| UnitsStatusDataWithRelatedWeatherEventData[]
		| undefined;

	// TODO DWA In Status Column: also show how units have changed (+1, -1 etc.)
</script>

<div class="w-full flex flex-col py-3 justify-evenly">
	<SubTitle text="Units Status History" />
	<div class="w-full border border-accentLight dark:border-accentDark rounded-lg my-2">
		<table class="w-full text-xs lg:text-sm text-left">
			<thead
				class="flex w-full overflow-auto uppercase text-center border-b border-accentLight dark:border-accentDark scrollbar-thin scrollbar-thumb-primary scrollbar-track-gray-100 dark:scrollbar-track-gray-800"
			>
				<tr class="flex w-full items-center">
					<th scope="col" class="w-1/4 lg:px-6 py-1 lg:py-3">Date and Time</th>
					<th scope="col" class="w-1/4 lg:px-6 py-1 lg:py-3">Units Amount</th>
					<th scope="col" class="w-1/4 lg:px-6 py-1 lg:py-3">Delta</th>
					<th scope="col" class="w-1/4 lg:px-6 py-1 lg:py-3">Caused by</th>
				</tr>
			</thead>
			<tbody
				class="flex flex-col items-center justify-between overflow-auto w-full max-h-[200px] scrollbar-thin scrollbar-thumb-primary scrollbar-track-gray-100 dark:scrollbar-track-gray-800"
			>
				{#if !loading && authoritiesHistoricUnitStatusData}
					{#each authoritiesHistoricUnitStatusData as unitStatus, i}
						<tr
							class={'flex w-full text-center' +
								(i < authoritiesHistoricUnitStatusData.length - 1
									? ' border-b border-accentLight dark:border-accentDark'
									: '')}
						>
							<td class="w-1/4 py-4 px-2 font-semibold"
								>{dayjs(unitStatus.timestamp).format('DD.MM.YYYY HH:mm:ss')} ({format(
									unitStatus.timestamp,
									'en_US'
								)})</td
							>
							<td class="flex w-1/4 justify-center items-center"
								><div
									class={'rounded-full w-fit text-xs md:text-sm text-black px-3 ' +
										getColorByUnitType(unitStatus.unitType)}
								>
									{unitStatus.amount} Units
								</div>
							</td>
							<td class="flex w-1/4 justify-center items-center">
								<div
									class={'text-xs md:text-sm ml-3 font-bold ' +
										(getUnitsAmountDeltaToPreviousValue(authoritiesHistoricUnitStatusData, i) >= 0
											? 'text-green-400'
											: 'text-red-400')}
								>
									({getUnitsAmountDeltaToPreviousValue(authoritiesHistoricUnitStatusData, i) >= 0
										? '+ '
										: '- '}
									{Math.abs(
										getUnitsAmountDeltaToPreviousValue(authoritiesHistoricUnitStatusData, i)
									)})
								</div>
							</td>
							<td class="flex w-1/4 justify-center items-center px-4">
								{unitStatus.changedBy
									? formatWeatherEventAction(unitStatus.changedBy, true, true, false)
									: '-'}
							</td>
						</tr>
					{/each}
				{:else}
					<tr class="flex w-full text-center">
						<td class="w-1/4 py-4 px-2 font-semibold ">Loading..</td>
						<td class="w-1/4">Loading..</td>
						<td class="w-1/4">Loading..</td>
						<td class="w-1/4">Loading..</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>
