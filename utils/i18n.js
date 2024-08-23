// 切换语言
export const changeLocale = function (proxy, locale) {
	let currentLocale = uni.getStorageSync('locale');
	if (currentLocale === locale) {
		uni.showToast({
			icon: 'none',
			title: proxy.$t('tip'),
		});
		return;
	}
	proxy.$i18n.locale = locale;
	uni.setStorageSync('locale', locale);
};
// 获取国际化的文本
export const getLocaleText = function (proxy, key) {
	return proxy.$t(key);
};
