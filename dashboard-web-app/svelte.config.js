import adapter from '@sveltejs/adapter-node';
import preprocess from 'svelte-preprocess';
import path from 'path';
import { defineConfig } from 'vite';

import { persistDataServicePlugin } from './services/persistDataService.js';

const loadViteConfig = () => {
	return defineConfig({
		resolve: {
			alias: {
				$root: path.resolve('./src')
			}
		},
        plugins: [persistDataServicePlugin],
    });
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		adapter: adapter(),
		vite: loadViteConfig(),
	}
};

export default config;
