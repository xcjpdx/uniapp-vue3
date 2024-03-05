import App from './App';

import uviewPlus from 'uview-plus';
import { getImg } from './utils/index.js';
// pinia
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
// dayjs
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn'; // 导入本地化语言
dayjs.locale('zh-cn'); // 使用本地化语言

// #ifndef VUE3
import Vue from 'vue';
import './uni.promisify.adaptor';
Vue.config.productionTip = false;
App.mpType = 'app';
const app = new Vue({
	...App,
});
app.$mount();
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue';
export function createApp() {
	const app = createSSRApp(App);

	app.config.globalProperties.$url = getImg;

	// uview-plus
	app.use(uviewPlus);

	// pinia
	const pinia = createPinia();
	pinia.use(piniaPluginPersistedstate);
	app.use(pinia);

	// dayjs
	app.config.globalProperties.$dayjs = dayjs;

	// 如此配置即可
	uni.$u.config.unit = 'rpx';

	return {
		app,
	};
}
// #endif
