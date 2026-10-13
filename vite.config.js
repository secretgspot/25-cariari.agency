import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import devtoolsJson from 'vite-plugin-devtools-json';

const config = { plugins: [sveltekit({ adapter: adapter() }), devtoolsJson()] };

export default config;
