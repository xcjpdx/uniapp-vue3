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
							<u-icon name="arrow-left" color="#fff" size="20" @click="goBack"></u-icon>
							<view class="default-line"></view>
							<u-icon name="home" color="#fff" size="20" @click="goHome"></u-icon>
						</view>
						<view class="default-back" v-if="props.type == 'back'">
							<u-icon name="arrow-left" color="#fff" size="20" @click="goBack"></u-icon>
						</view>
						<view class="default-home" v-if="props.type == 'home'">
							<u-icon name="home-fill" color="#fff" size="20" @click="goHome"></u-icon>
						</view>
					</div>
					<view class="default-title">{{ props.title }}</view>
				</div>
			</slot>
		</view>
	</view>
	<!-- 占位 -->
	<view :style="{ height: statusBarHeight + navBarHeight + 'px' }"></view>
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

	// 获取状态栏高度
	function geStatusBarHeight() {
		statusBarHeight.value = uni.getSystemInfoSync()['statusBarHeight'];
	}
	// 获取导航栏高度
	function getNavBarHeight() {
		// #ifdef MP-WEIXIN
		let menuButtonInfo = uni.getMenuButtonBoundingClientRect(); // 胶囊信息
		// 导航栏高度 = 胶囊高度 + 上间距 + 下间距 + 微调
		navBarHeight.value =
			menuButtonInfo.height +
			(menuButtonInfo.top - uni.getSystemInfoSync()['statusBarHeight']) * 2 +
			2;
		// #endif
		// #ifdef APP-PLUS || H5
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
