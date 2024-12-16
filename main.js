import App from './App';

// 引入uv-ui
import uvUI from '@climblee/uv-ui';

import { getImgUrl } from './utils/index.js';

// pinia
import { setupStore } from './store/index.js';

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

	// 引入uv-ui
	app.use(uvUI);
	uni.$uv.setConfig({
		// 修改$uv.config对象的属性
		config: {
			// 修改默认单位为rpx，相当于执行 uni.$uv.config.unit = 'rpx'
			unit: 'rpx',
		},
	});

	// 获取图片地址
	app.config.globalProperties.$imgUrl = getImgUrl;

	// pinia
	app.use(setupStore());

	// 国际化
	app.use(i18n);

	// 公共组件
	app.component('myNavbar', myNavbar);
	app.component('myTabbar', myTabbar);

	return {
		app,
	};
}
