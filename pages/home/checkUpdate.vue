<template>
	<button @click="checkUpdate">检测更新</button>
	<div class="progress-box" v-if="appDownloadProgress">
		<div class="progress-main">
			<div class="tip">下载中,请稍后...</div>
			<div class="progress">
				<div class="number">{{ appDownloadProgress }} %</div>
				<div class="bar">
					<div class="bar-progress" :style="{ width: appDownloadProgress + '%' }"></div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { ref, onMounted, computed, watchEffect, getCurrentInstance } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	const { proxy } = getCurrentInstance();

	onMounted(() => {});
	onLoad((res) => {});

	function checkUpdate() {
		let platform = uni.getSystemInfoSync().uniPlatform;
		switch (platform) {
			case 'web':
				break;
			case 'app':
				checkAppUpdate();
				break;
			case 'mp-weixin':
				checkWxUpdate();
				break;
		}
	}

	function checkAppUpdate() {
		plus.runtime.getProperty(plus.runtime.appid, async (widgetInfo) => {
			console.log(widgetInfo);
			let platform = plus.os.name; // 系统类型
			let os_version = plus.os.version; // 系统版本
			let vendor = plus.device.vendor; // 设备厂商
			let cur_version = widgetInfo.version; // App版本号 1.0.0
			let url = 'https://www.51app.cn/api'; // 服务器地址
			// 向后端发起请求,检查是否需要升级
			let params = {
				platform,
				os_version,
				vendor,
				cur_version,
			};
			try {
				// let result = await request(url, params);
				// console.log(result);
				// let data = result.data ? result.data : null;
				let data = {
					url: 'https://cos3.pgyer.com/ffcbdea01968b705b32a31355f510ce1.apk?sign=d81e626455fbe0ed288680eed00a5ff9&sign2=9ae1dd88a8f20dde1894326235152e2b&t=1730534638&response-content-disposition=attachment%3Bfilename%3D%22%E6%B5%8B%E8%AF%95_1.5.27.apk%22',
					versionCode: 1726197699562,
				};
				// console.log(data);
				let downAppUrl = data.url;
				let versionCode = parseInt(widgetInfo.versionCode); //版本号代码
				//判断版本是否需要升级
				if (versionCode >= data.versionCode) {
					console.log('当前版本不需要升级');
					return;
				}
				// 升级提示
				uni.showModal({
					title: '更新提示',
					content: '检测到新版本，是否立即升级',
					success: (res) => {
						if (!res.confirm) {
							console.log('点击取消 不升级');
							return;
						}
						if (platform === 'Android') {
							AndroidHandle(downAppUrl);
						} else if (platform === 'iOS') {
						}
					},
				});
			} catch (error) {}
		});
	}
	function request(url, params) {
		return new Promise((resolve, reject) => {
			uni.request({
				url: url,
				data: params,
				success: (res) => {
					resolve(res.data);
				},
				fail: (err) => {
					reject(err);
				},
			});
		});
	}
	const appDownloadProgress = ref(0); // 应用下载进度
	// 安卓更新App处理函数
	function AndroidHandle(downAppUrl) {
		// 去应用市场更新
		// jumpToAppMarket();

		// 创建下载任务
		var dtask = plus.downloader.createDownload(
			downAppUrl,
			{
				filename: '_downloads/',
			},
			function (d, status) {
				// 下载完成
				if (status == 200) {
					appDownloadProgress.value = 0;
					plus.runtime.install(
						d.filename,
						{
							force: true,
						},
						function () {
							// 重新启动App
							plus.runtime.restart();
						},
						(e) => {
							console.log('安装失败:', JSON.stringify(e));
							uni.showModal({
								title: '安装提示',
								content: '安装失败:' + JSON.stringify(e),
								showCancel: false,
							});
						}
					);
				} else {
					appDownloadProgress.value = 0;
					uni.showModal({
						title: '下载提示',
						content: '下载失败 , 状态: ' + status,
						showCancel: false,
					});
				}
			}
		);
		// 监听下载进度
		dtask.addEventListener(
			'statechanged',
			(e) => {
				if (e && e.downloadedSize > 0) {
					appDownloadProgress.value = ((e.downloadedSize / e.totalSize) * 100).toFixed(2);
					// 保留两位小数的数字
					console.log('下载进度:', appDownloadProgress.value);
				}
			},
			false
		);
		// 开始下载
		dtask.start();
	}
	// 打开应用市场
	/*
	这里都用微信示例，实际项目需要替换自己的iOS包地址和Android包名
	安卓 如果有多个应用市场，会弹出列表提供选择
	ios 则直接进入appstore
	*/
	function jumpToAppMarket() {
		if (plus.os.name == 'iOS') {
			plus.runtime.openURL('itms-apps://' + 'itunes.apple.com/cn/app/wechat/id414478124?mt=8');
		} else if (plus.os.name == 'Android') {
			var Uri = plus.android.importClass('android.net.Uri');
			var uri = Uri.parse('market://details?id=' + 'com.tencent.mm');
			var Intent = plus.android.importClass('android.content.Intent');
			var intent = new Intent(Intent.ACTION_VIEW, uri);
			var main = plus.android.runtimeMainActivity();
			main.startActivity(intent);
		}
	}

	// 微信小程序 检查版本更新
	function checkWxUpdate() {
		console.log('微信小程序检查版本更新');
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
	}
</script>

<style lang="scss" scoped>
	.progress-box {
		position: fixed;
		z-index: 1000;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		top: 0;
		left: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		.progress-main {
			width: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: column;
			.tip {
				font-size: 30rpx;
				color: #fff;
				font-weight: bold;
				margin-bottom: 20rpx;
			}
			.progress {
				width: 90%;
				.number {
					font-size: 26rpx;
					color: #fff;
					margin-bottom: 10rpx;
				}
				.bar {
					width: 100%;
					height: 40rpx;
					background: #fff;
					border-radius: 25rpx;
					overflow: hidden;
					.bar-progress {
						height: 100%;
						border-radius: 25rpx;
						transition: width 0.1s;
						background: #44aeed;
					}
				}
			}
		}
	}
</style>
