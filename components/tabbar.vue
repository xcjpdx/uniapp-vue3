<template>
	<view class="tabbar-box">
		<view class="tabbar-box-item" v-for="item in tabbarList" @click="goPage(item)">
			<image :src="type === item.type ? item.activeUrl : item.url"></image>
			<text :style="{ color: type === item.type ? '#2D99A1' : '' }">{{ item.title }}</text>
		</view>
	</view>
</template>

<script setup>
	import { ref, onMounted, computed, watchEffect } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';

	defineProps({
		type: {
			type: String,
			default: 'home',
		},
	});

	let tabbarList = ref([
		{
			title: '首页',
			type: 'home',
			path: '/pages/home/index',
			url: '/static/image/tabbar/home-not-active.png',
			activeUrl: '/static/image/tabbar/home-active.png',
		},
		{
			title: '我的',
			type: 'user',
			path: '/pages/user/index',
			url: '/static/image/tabbar/user-not-active.png',
			activeUrl: '/static/image/tabbar/user-active.png',
		},
	]);

	function goPage(item) {
		uni.reLaunch({
			url: item.path,
		});
	}
</script>

<style lang="scss" scoped>
	.tabbar-box {
		z-index: 1000;
		position: fixed;
		bottom: 0;
		left: 0;
		padding: 20rpx;
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
		width: 100%;
		background: #fff;
		border-radius: 20rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		.tabbar-box-item {
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			image {
				width: 34rpx;
				height: 34rpx;
				margin-bottom: 10rpx;
			}
			font-size: 22rpx;
			font-weight: 500;
			color: #999999;
		}
	}
</style>
