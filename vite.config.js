// vite.config.js

import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import { BASE_URL } from './constants';

export default defineConfig({
	plugins: [uni()],
	// H5服务器代理 解决跨域问题
	// server: {
	// 	proxy: {
	// 		'/api': {
	// 			target: BASE_URL,
	// 			changeOrigin: true,
	// 			rewrite: (path) => path.replace(/^\/api/, ''),
	// 		},
	// 	},
	// },
});
