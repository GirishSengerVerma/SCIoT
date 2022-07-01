<script lang="ts">
	import type { SensorMetaData, SensorTelemetryData } from '@prisma/client';

	import ApexChart from '$root/components/core/ApexChart.svelte';
	import { LIGHT_MODE, theme } from '$root/stores/themeStore';
	import { enumValueToString } from '$root/utils/enumUtil';

	const getOptions = (themeToUse: string) => {
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
					name: 'sales',
					data: [30, 40, 35, 50, 49, 60, 70, 91, 125]
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

	theme.subscribe((newTheme) => {
		if (!newTheme || !chart) {
			return;
		}
		chart!.update(getOptions(newTheme));
	});

	export let sensorMetaData: SensorMetaData | undefined;
	export let data: SensorTelemetryData[] | undefined;
</script>

<ApexChart options={getOptions($theme ?? LIGHT_MODE)} bind:chartRef={chart} />
