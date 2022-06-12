import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';
import path from 'path';
import { defineConfig } from 'vite';

import { persistDataService } from './persistDataService.js';

const loadViteConfig = () => {
	return defineConfig({
		resolve: {
			alias: {
				$root: path.resolve('./src')
			}
		},
        plugins: [persistDataService],
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
