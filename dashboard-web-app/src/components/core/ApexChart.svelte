<script>
	// @ts-nocheck

	import { onMount } from 'svelte';

	export let options;

	let ApexCharts;
	let loaded = false;

	export let chartRef;

	export const chart = (node, options) => {
		if (!loaded) return;

		let myChart = new ApexCharts(node, options);
		myChart.render();

		chartRef = {
			update(options) {
				myChart.updateOptions(options);
			},
			destroy() {
				myChart.destroy();
			}
		};

		return chartRef;
	};

	onMount(async () => {
		const module = await import('apexcharts');
		ApexCharts = module.default;
		window.ApexCharts = ApexCharts;
		loaded = true;
	});
</script>

<!-- See https://www.reddit.com/r/sveltejs/comments/n508th/comment/gx74djr/ -->

{#if loaded}
	<div use:chart={options} />
{/if}
