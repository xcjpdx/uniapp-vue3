// vite.config.js

import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';

export default defineConfig({
	plugins: [uni()],
	// 国际化
	define: {
		__VUE_I18N_FULL_INSTALL__: true,
		__VUE_I18N_LEGACY_API__: true,
		__INTLIFY_PROD_DEVTOOLS__: false,
	},

	// H5服务器代理 解决跨域问题
	// server: {
	// 	proxy: {
	// 		'/proxy': {
	// 			target: '请求地址',
	// 			changeOrigin: true,
	// 			secure: false,
	// 			rewrite: (path) => path.replace(/^\/proxy/, ''),
	// 		},
	// 	},
	// },
});
