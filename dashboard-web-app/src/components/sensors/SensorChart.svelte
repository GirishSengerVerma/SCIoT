<script lang="ts">
	import type { SensorMetaData, SensorTelemetryData } from '@prisma/client';

	import { SENSOR_UNIT_REPRESENTATION_MAP } from '$root/utils/sensorUnitRepresentations';
	import ApexChart from '$root/components/core/ApexChart.svelte';
	import { LIGHT_MODE, theme } from '$root/stores/themeStore';
	import LoadingSpinner from '$root/components/core/LoadingSpinner.svelte';
	import SubTitle from '../core/SubTitle.svelte';

	const getOptions = (
		themeToUse: string,
		isLiveData: boolean | undefined,
		data: SensorTelemetryData[] | undefined
	) => {
		return {
			theme: {
				mode: themeToUse
			},
			chart: {
				type: 'area',
				width: '100%',
				background: 'rgba(0, 0, 0, 0)',
				toolbar: {
					show: !isLiveData
				},
				zoom: {
					enabled: !isLiveData,
					//type: 'xy'
					autoScaleYaxis: true
				},
				animations: {
					enabled: true,
					easing: 'linear',
					dynamicAnimation: {
						speed: !isLiveData ? 500 : 3000 // needs to by in sync with sensor simulator interval
					}
				}
			},
			fill: {
				colors: ['#00D1FF']
			},
			stroke: {
				colors: ['#00D1FF']
			},
			series: [
				{
					name: 'Value',
					data: data?.map((d) => [d.timestamp, d.value])
				}
			],
			dataLabels: {
				enabled: false
			},
			markers: {
				size: 0
			},
			yaxis: {
				labels: {
					formatter: function (val: number) {
						return val.toFixed(0);
					}
				},
				title: {
					text:
						'Value in ' +
						(data && data.length > 0 ? SENSOR_UNIT_REPRESENTATION_MAP.get(data[0].unit)! : '')
				}
			},
			xaxis: {
				type: 'datetime',
				title: {
					text: 'Timestamp'
				}
			},
			tooltip: {
				theme: $theme,
				shared: false,
				y: {
					formatter: function (val: number) {
						return val.toFixed(2);
					}
				}
			}
		};
	};

	let chart:
		| { updateOptions(options: any): void; updateSeries(series: any): void; destroy(): void }
		| undefined;

	$: onParametersChange($theme, isLiveData, sensorMetaData);

	let previousMetaData: SensorMetaData | undefined = undefined;

	const onParametersChange = (
		theme: string | undefined,
		isLiveData: boolean | undefined,
		sensorMetaData: SensorMetaData | undefined
	) => {
		let shouldUpdate = true;
		if (!chart || !sensorMetaData) {
			shouldUpdate = false;
		} else if (
			previousMetaData &&
			sensorMetaData &&
			previousMetaData.instanceId !== sensorMetaData?.instanceId
		) {
			shouldUpdate = true;
		}

		if (!shouldUpdate) {
			return;
		}

		try {
			chart!.updateOptions(getOptions(theme ?? LIGHT_MODE, isLiveData, data));
		} catch (error) {
			console.warn('Could not update SensorChart: ', error);
		}
	};

	$: onDataChange(data, sensorMetaData);

	let previousData: SensorTelemetryData[] = [];

	const onDataChange = (
		data: SensorTelemetryData[] | undefined,
		sensorMetaData: SensorMetaData | undefined
	) => {
		let shouldUpdate = true;
		if (!chart || !data || !sensorMetaData) {
			shouldUpdate = false;
		} else if (
			previousMetaData &&
			sensorMetaData &&
			previousMetaData.instanceId !== sensorMetaData?.instanceId
		) {
			shouldUpdate = true;
		} else if (previousData.length === data.length) {
			shouldUpdate = false;
		}

		if (!shouldUpdate) {
			return;
		}

		previousData = data!;
		previousMetaData = sensorMetaData;

		chart!.updateSeries([
			{
				name: 'Value',
				data: data?.map((d) => [d.timestamp, d.value])
			}
		]);
	};

	export let isLiveData: boolean | undefined;
	export let sensorMetaData: SensorMetaData | undefined;
	export let data: SensorTelemetryData[] | undefined;
</script>

<SubTitle text="Sensor Data Chart" />
{#if !sensorMetaData || !data}
	<LoadingSpinner />
{:else}
	<ApexChart options={getOptions($theme ?? LIGHT_MODE, isLiveData, data)} bind:chartRef={chart} />
{/if}
