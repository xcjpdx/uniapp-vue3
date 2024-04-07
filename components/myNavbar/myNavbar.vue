<template>
	<u-navbar
		:placeholder="props.placeholder"
		:bgColor="props.bgColor"
		:title="props.title"
		:titleStyle="{ color: props.color, 'font-size': '34rpx', 'font-weight': 400 }"
	>
		<template #left>
			<view class="u-nav-slot" v-if="props.type == 0">
				<u-icon name="arrow-left" color="#000" size="40" @click="goBack"></u-icon>
				<view class="nav-line" v-if="props.type == 0"></view>
				<u-icon name="home" color="#000" size="40" @click="goHome"></u-icon>
			</view>
			<view class="u-nav-slot-back" v-if="props.type == 1">
				<u-icon name="arrow-left" color="#fff" size="30" @click="goBack"></u-icon>
			</view>
			<view class="u-nav-slot-home" v-if="props.type == 2">
				<u-icon name="home-fill" color="#fff" size="30" @click="goHome"></u-icon>
			</view>
		</template>
	</u-navbar>
</template>
<script setup>
	import { ref, onMounted, computed, watchEffect } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	const props = defineProps({
		type: {
			type: String,
			default: '0', // 0.有返回和回到首页 1.只有返回 2.只有回到首页 3.什么都没有
		},
		title: {
			type: String,
			default: '',
		},
		bgColor: {
			type: String,
			default: '#fff',
		},
		color: {
			type: String,
			default: '#171717',
		},
		placeholder: {
			type: Boolean,
			default: true,
		},
	});
	// 返回上一页
	function goBack() {
		// 获取页面栈
		const pages = getCurrentPages();
		// console.log('页面栈的长度', pages.length);
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
	.u-nav-slot {
		@extend %c-box-center;
		padding: 10rpx 30rpx;
		border: 2rpx solid #d1d1d1;
		border-radius: 32rpx;
		.nav-line {
			width: 2rpx;
			height: 40rpx;
			background: #afafaf;
			margin: 0 20rpx;
		}
	}
	.u-nav-slot-back,
	.u-nav-slot-home {
		width: 63rpx;
		height: 63rpx;
		background: rgba(0, 0, 0, 0.5);
		border-radius: 50%;
		@extend %c-box-center;
	}
</style>
