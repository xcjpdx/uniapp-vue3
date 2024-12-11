<template>
	<view class="tabbar-box" :style="{ 'padding-bottom': osName == 'ios' ? '' : '30rpx' }">
		<view
			class="tabbar-box-item"
			v-for="(item, index) in tabbarList"
			@click="goPage(item)"
			:key="index"
		>
			<image :src="props.type === item.type ? item.activeUrl : item.url"></image>
			<text :style="{ color: props.type === item.type ? '#2D99A1' : '' }">{{ item.title }}</text>
		</view>
	</view>
	<!-- 占位 -->
	<view :style="{ height: tabbarHeight + 'px' }"></view>
</template>

<script setup>
	import { ref, onMounted, getCurrentInstance } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	const { proxy } = getCurrentInstance();

	const osName = uni.getSystemInfoSync().osName;

	const props = defineProps({
		type: {
			type: String,
			default: 'home',
		},
	});

	let tabbarHeight = ref('');
	onMounted(() => {
		// 获取 tabbar-box 的高度
		let query = uni.createSelectorQuery().in(proxy);
		query
			.select('.tabbar-box')
			.boundingClientRect((data) => {
				tabbarHeight.value = data.height;
			})
			.exec();
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
		if (item.type == props.type) return;
		uni.switchTab({
			url: item.path,
		});
	}
</script>

<style lang="scss" scoped>
	.tabbar-box {
		width: 100%;
		z-index: 1000;
		position: fixed;
		bottom: 0;
		left: 0;
		padding: 20rpx;
		// 兼容 IOS<11.2
		padding-bottom: constant(safe-area-inset-bottom);
		// 兼容 IOS>=11.2
		padding-bottom: env(safe-area-inset-bottom);
		background: #fff;
		box-shadow: 0rpx -1rpx 21rpx 0rpx rgba(131, 128, 127, 0.1);
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
