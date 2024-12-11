<template>
	<view
		class="navbar-box"
		:style="{ 'background-color': props.bgColor }"
		v-if="statusBarHeight && navBarHeight"
	>
		<!-- 状态栏 -->
		<view :style="{ height: statusBarHeight + 'px' }"></view>
		<!-- 导航栏 -->
		<view :style="{ height: navBarHeight + 'px' }">
			<slot>
				<div class="navbar-default">
					<div class="default-left" v-if="props.type != 'none'">
						<view class="default-all" v-if="props.type == 'all'">
							<text @click="goBack">返回</text>
							<view class="default-line"></view>
							<text @click="goHome">首页</text>
						</view>
						<view class="default-back" v-if="props.type == 'back'">
							<text @click="goBack">返回</text>
						</view>
						<view class="default-home" v-if="props.type == 'home'">
							<text @click="goHome">首页</text>
						</view>
					</div>
					<view class="default-title">{{ props.title }}</view>
				</div>
			</slot>
		</view>
	</view>
	<!-- 占位 -->
	<view :style="{ height: placeholderHeight + 'px' }"></view>
</template>
<script setup>
	import { ref, onMounted, computed, watchEffect } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	const props = defineProps({
		title: {
			type: String,
			default: '',
		},
		bgColor: {
			type: String,
			default: '#fff',
		},
		type: {
			type: String,
			default: 'all',
		},
	});

	onMounted(() => {
		geStatusBarHeight();
		getNavBarHeight();
	});

	let statusBarHeight = ref(0);
	let navBarHeight = ref(0);

	// 计算占位盒子高度
	const placeholderHeight = computed(() => {
		// #ifdef MP-WEIXIN
		return statusBarHeight.value + navBarHeight.value;
		// #endif

		// #ifdef APP-PLUS
		const system = uni.getSystemInfoSync();
		// 安卓
		if (system.platform.toLowerCase() === 'android') {
			return statusBarHeight.value + navBarHeight.value;
		}
		// iOS
		return statusBarHeight.value + navBarHeight.value;
		// #endif

		// #ifdef H5
		return statusBarHeight.value + navBarHeight.value;
		// #endif
	});

	// 获取状态栏高度优化
	function geStatusBarHeight() {
		const sys = uni.getSystemInfoSync();
		// #ifdef H5
		statusBarHeight.value = 0;
		// #endif

		// #ifdef MP-WEIXIN || APP-PLUS
		statusBarHeight.value = sys.statusBarHeight;
		// #endif
	}

	// 获取导航栏高度优化
	function getNavBarHeight() {
		// #ifdef MP-WEIXIN
		const menuButtonInfo = uni.getMenuButtonBoundingClientRect();
		navBarHeight.value =
			menuButtonInfo.height +
			(menuButtonInfo.top - uni.getSystemInfoSync().statusBarHeight) * 2 +
			2;
		// #endif

		// #ifdef APP-PLUS
		const system = uni.getSystemInfoSync();
		if (system.platform.toLowerCase() === 'android') {
			navBarHeight.value = 48;
		} else {
			navBarHeight.value = 44;
		}
		// #endif

		// #ifdef H5
		navBarHeight.value = 44;
		// #endif
	}

	// 返回上一页
	function goBack() {
		const pages = getCurrentPages();
		if (pages.length == 1) {
			uni.reLaunch({
				url: '/pages/home/index',
			});
			return;
		}
		uni.navigateBack();
	}
	// 去首页
	function goHome() {
		uni.reLaunch({
			url: '/pages/home/index',
		});
	}
</script>

<style lang="scss" scoped>
	.navbar-box {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		z-index: 2000;
		.navbar-default {
			height: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			position: relative;
			.default-left {
				position: absolute;
				top: 50%;
				left: 24rpx;
				transform: translateY(-50%);
				.default-all {
					display: flex;
					justify-content: center;
					align-items: center;
					padding: 10rpx 30rpx;
					background: rgba(0, 0, 0, 0.5);
					border-radius: 32rpx;
					.default-line {
						width: 2rpx;
						height: 40rpx;
						background: #afafaf;
						margin: 0 20rpx;
					}
				}
				.default-back,
				.default-home {
					width: 63rpx;
					height: 63rpx;
					background: rgba(0, 0, 0, 0.5);
					border-radius: 50%;
					display: flex;
					justify-content: center;
					align-items: center;
				}
			}
			.default-title {
				color: #000;
				font-weight: bold;
				font-size: 16px;
			}
		}
	}
</style>
