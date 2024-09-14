import { BASE_URL } from '@/constants.js';
// 获取图片地址
export const getImgUrl = function (path) {
	return BASE_URL + path;
};
// 下载字体
export const downloadFont = function () {
	/*
	这种方式是为了区分不同的平台使用不同的字体或者进行更灵活的操作
	有注意事项,具体请参考：https://uniapp.dcloud.net.cn/api/ui/font.html#loadfontface
	*/
	let platform = uni.getSystemInfoSync().platform;
	console.log('平台', platform);
	if (platform == 'android') {
		uni.loadFontFace({
			global: true,
			family: '字体包的自定义名称',
			source: 'url("字体包的地址")',
			success() {
				console.log('字体加载成功');
			},
			fail() {
				console.log('字体加载失败');
			},
		});
	} else {
	}
};
// 版本更新(小程序)
export const checkUpdate = function () {
	console.log('检查版本更新');
	const updateManager = uni.getUpdateManager();
	let version = '';
	updateManager.onCheckForUpdate(function (res) {
		// 请求完新版本信息的回调
		console.log('当向小程序后台请求完新版本信息，会进行回调', res);
		version = res.version || '1.0.0';
	});
	updateManager.onUpdateReady(function (res) {
		console.log('当新版本下载完成，会进行回调');
		uni.showModal({
			title: '更新提示',
			content: `新版本 ${version} 已经准备好，是否重启应用？`,
			success(res) {
				if (res.confirm) {
					// 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
					updateManager.applyUpdate();
				} else {
					uni.showToast({
						title: '已取消重启',
						icon: 'none',
					});
				}
			},
		});
	});
	updateManager.onUpdateFailed(function (res) {
		console.log('当新版本下载失败，会进行回调');
		uni.showModal({
			title: '更新提示',
			showCancel: false,
			content: `新版本 ${version} 下载失败, 请手动重启应用重试`,
		});
	});
};

/*
	获取用户授权(小程序专用)
	@scopeName 授权名称 参考文档:https://uniapp.dcloud.net.cn/api/other/authorize.html#scope-%E5%88%97%E8%A1%A8
	@tip 提示信息
	@cb 回调函数
*/
export const getSetting = function (scopeName, tip = '请在设置中开启授权', cb) {
	uni.getSetting({
		success: (res) => {
			if (res.authSetting[scopeName]) {
				// 已经授权，调用回调函数
				cb();
			} else if (res.authSetting[scopeName] === false) {
				// 用户已拒绝授权，引导用户到设置页面开启
				uni.showModal({
					title: '您未开启相关授权',
					content: tip,
					success: (res) => {
						if (res.confirm) {
							uni.openSetting({
								success(settingRes) {
									if (settingRes.authSetting[scopeName]) {
										// 用户打开了授权，调用回调函数
										cb();
									}
								},
							});
						}
					},
				});
			} else {
				// 首次使用，请求授权
				uni.authorize({
					scope: scopeName,
					success() {
						cb();
					},
					fail() {
						// 首次使用，用户拒绝授权，引导用户到设置页面开启
						uni.showModal({
							title: '您未开启相关授权',
							content: tip,
							success: (res) => {
								if (res.confirm) {
									uni.openSetting({
										success(settingRes) {
											if (settingRes.authSetting[scopeName]) {
												// 用户打开了授权，调用回调函数
												cb();
											}
										},
									});
								}
							},
						});
					},
				});
			}
		},
	});
};
// 获取页面路径以及参数
export const getPagePath = function () {
	const pages = getCurrentPages();
	const currentPage = pages[pages.length - 1];
	const currentPath = currentPage.__route__;
	const query = currentPage.options;
	let path = '/' + currentPath;
	Object.entries(query).forEach(([key, value], index) => {
		if (index == 0) {
			path += '?';
		}
		path += `${key}=${value}${index < Object.keys(query).length - 1 ? '&' : ''}`;
	});
	console.log('页面路径以及参数:', path);
	return path;
};
/*
获取系统信息
osName:系统名称, 返回值:ios、android、windows、macos、linux
platform:运行平台, 返回值:app、web、mp-weixin 等等 参考文档:https://uniapp.dcloud.net.cn/api/system/info.html#uniplatform
safeAreaTopHeight:顶部安全区域高度(单位px)
safeAreaBottomHeight:底部安全区域高度(单位px)
*/
export const getSystemInfo = function () {
	let system = uni.getSystemInfoSync();
	let safeAreaBottomHeight = 0;
	if (system.osName == 'ios') {
		safeAreaBottomHeight = system.safeAreaInsets.bottom;
	} else {
		safeAreaBottomHeight = system.safeAreaInsets.bottom ? system.safeAreaInsets.bottom : 20;
	}
	return {
		osName: system.osName, // 系统名称
		platform: system.uniPlatform, // 运行平台
		safeAreaTopHeight: system.safeAreaInsets.top, // 顶部安全区域高度
		safeAreaBottomHeight, // 底部安全区域高度
	};
};
