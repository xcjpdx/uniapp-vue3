// 获取图片地址
export const getImg = function (path) {
	return '/static/imgs/' + path;
};
// 下载字体
export const downloadFont = function () {
	/*
	这种方式是为了区分不同的平台使用不同的字体
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
