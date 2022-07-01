import adapter from '@sveltejs/adapter-node';
import preprocess from 'svelte-preprocess';
import path from 'path';
import { defineConfig } from 'vite';

import { dataServicePlugin } from './services/dataService.js';

const loadViteConfig = () => {
	return defineConfig({
		resolve: {
			alias: {
				$root: path.resolve('./src')
			}
		},
		plugins: [dataServicePlugin],
		optimizeDeps: {
			exclude: ["@babichjacob/svelte-localstorage"],
		},
		ssr: {
			noExternal: ["@babichjacob/svelte-localstorage"],
		},
	});
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [
		preprocess({
			postcss: true,
		}),
	],

	kit: {
		adapter: adapter(),
		vite: loadViteConfig(),
	}
};

export default config;
