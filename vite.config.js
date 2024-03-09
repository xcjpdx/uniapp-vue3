// vite.config.js

import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';

export default defineConfig({
	plugins: [uni()],
	// H5服务器代理 解决跨域问题
	// server: {
	// 	proxy: {
	// 		'/api': {
	// 			target: '请求地址',
	// 			changeOrigin: true,
	// 			secure: false,
	// 			rewrite: (path) => path.replace(/^\/api/, ''),
	// 		},
	// 	},
	// },
});
