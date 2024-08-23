// 切换语言
export const changeLocale = function (proxy, locale) {
	proxy.$i18n.locale = locale;
	uni.setLocale(locale);
};
// 获取国际化的文本
export const getLocaleText = function (proxy, key) {
	let text = proxy.$i18n.messages[uni.getLocale()][key];
	return text;
};
