import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		
		fs: {
		  strict:false,
		  allow: ['.','node_modules','node_modules/@sveltejs/kit/src/runtime/client'],
		},
	  },
});
