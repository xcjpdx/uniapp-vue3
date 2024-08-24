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

// 国际化
import messages from './locale/index.js';
import { createI18n } from 'vue-i18n';
const locale = uni.getStorageSync('locale') || uni.getLocale() || 'zh-Hans';
// console.log('本地化语言', locale);
uni.setStorageSync('locale', locale);
const i18nConfig = {
	locale,
	messages,
};
const i18n = createI18n(i18nConfig);

// 公共组件
import myNavbar from './components/myNavbar.vue';
import myTabbar from './components/myTabbar.vue';

import { createSSRApp } from 'vue';
export function createApp() {
	const app = createSSRApp(App);

	app.config.globalProperties.$url = getImg;

	// uview-plus
	app.use(uviewPlus);
	// uview-plus 单位配置
	uni.$u.config.unit = 'rpx';

	// pinia
	const pinia = createPinia();
	pinia.use(piniaPluginPersistedstate);
	app.use(pinia);

	// 国际化
	app.use(i18n);

	// 公共组件
	app.component('myNavbar', myNavbar);
	app.component('myTabbar', myTabbar);

	return {
		app,
	};
}
