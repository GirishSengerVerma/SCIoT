<script lang="ts">
	import type { SensorMetaData, SensorTelemetryData } from '@prisma/client';

	import ApexChart from '$root/components/core/ApexChart.svelte';
	import { LIGHT_MODE, theme } from '$root/stores/themeStore';
	import { enumValueToString } from '$root/utils/enumUtil';
	import LoadingSpinner from '../core/LoadingSpinner.svelte';

	const getOptions = (
		themeToUse: string,
		sensorMetaData: SensorMetaData | undefined,
		data: SensorTelemetryData[] | undefined
	) => {
		return {
			theme: {
				mode: themeToUse
			},
			title: {
				text:
					(sensorMetaData ? enumValueToString(sensorMetaData.measure) + ' ' : '') + 'Sensor Chart',
				align: 'left'
			},
			chart: {
				type: 'area',
				stacked: false,
				width: '100%',
				background: 'rgba(0, 0, 0, 0)',
				zoom: {
					type: 'x',
					enabled: true,
					autoScaleYaxis: true
				},
				toolbar: {
					autoSelected: 'zoom'
				}
			},
			dataLabels: {
				enabled: false
			},
			markers: {
				size: 0
			},
			series: [
				{
					name: 'sensorValues',
					data: data ? data.map((d) => d.value) : []
				}
			],
			fill: {
				type: 'gradient',
				gradient: {
					shadeIntensity: 1,
					inverseColors: false,
					opacityFrom: 0.5,
					opacityTo: 0,
					stops: [0, 90, 100]
				}
			},
			yaxis: {
				labels: {
					formatter: function (val: number) {
						return (val / 1000000).toFixed(0);
					}
				},
				title: {
					text: 'Value'
				}
			},
			xaxis: {
				type: 'datetime'
			},
			tooltip: {
				theme: $theme,
				shared: false,
				y: {
					formatter: function (val: number) {
						return (val / 1000000).toFixed(0);
					}
				}
			}
		};
	};

	let chart: { update(options: any): void; destroy(): void } | undefined;

	$: onParametersChange($theme, sensorMetaData, data);

	const onParametersChange = (
		theme: string | undefined,
		sensorMetaData: SensorMetaData | undefined,
		data: SensorTelemetryData[] | undefined
	) => {
		if (!chart) {
			return;
		}
		try {
			chart!.update(getOptions(theme ?? LIGHT_MODE, sensorMetaData, data));
		} catch (error) {
			console.error('Could not update SensorChart: ', error);
		}
	};

	export let sensorMetaData: SensorMetaData | undefined;
	export let data: SensorTelemetryData[] | undefined;
</script>

{#if !data}
	<LoadingSpinner />
{:else}
	<ApexChart
		options={getOptions($theme ?? LIGHT_MODE, sensorMetaData, data)}
		bind:chartRef={chart}
	/>
{/if}
