import { sveltekit } from '@sveltejs/kit/vite';
import devtoolsJson from 'vite-plugin-devtools-json';

const config = {
	plugins: [sveltekit(), devtoolsJson()],
};

export default config;
