<!-- 多种头部导航栏 -->
<template>
	<!-- 0.有返回和回到首页 -->
	<template v-if="props.type == 0">
		<u-navbar
			:placeholder="props.placeholder"
			:bgColor="props.bgColor"
			:title="props.title"
			:titleStyle="{ color: props.color, 'font-size': '34rpx', 'font-weight': 400 }"
		>
			<template #left>
				<view class="u-nav-slot2">
					<u-icon name="arrow-left" :color="props.color" size="40" @click="goBack"></u-icon>
					<view class="nav-line"></view>
					<u-icon name="home" :color="props.color" size="40" @click="goHome"></u-icon>
				</view>
			</template>
		</u-navbar>
	</template>
	<!-- 1.只有返回 -->
	<template v-if="props.type == 1">
		<u-navbar
			:placeholder="props.placeholder"
			:bgColor="props.bgColor"
			autoBack
			:title="props.title"
			:titleStyle="{ color: props.color, 'font-size': '34rpx', 'font-weight': 400 }"
		>
			<template #left>
				<view class="u-nav-slot1">
					<view class="nav-box">
						<u-icon name="arrow-left" size="40"></u-icon>
					</view>
				</view>
			</template>
		</u-navbar>
	</template>
	<!-- 2.只有回到首页 -->
	<template v-if="props.type == 2">
		<u-navbar
			:placeholder="props.placeholder"
			:bgColor="props.bgColor"
			:title="props.title"
			:titleStyle="{ color: props.color, 'font-size': '34rpx', 'font-weight': 400 }"
		>
			<template #left>
				<view class="u-nav-slot2">
					<u-icon name="home" :color="props.color" size="40" @click="goHome"></u-icon>
				</view>
			</template>
		</u-navbar>
	</template>
	<!-- 3.什么都没有 -->
	<template v-if="props.type == 3">
		<u-navbar
			leftIconSize="0"
			:placeholder="props.placeholder"
			:bgColor="props.bgColor"
			:title="props.title"
			:titleStyle="{ color: props.color, 'font-size': '34rpx', 'font-weight': 400 }"
		>
		</u-navbar>
	</template>
</template>
<script setup>
	import { ref, onMounted, computed, watchEffect } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	const props = defineProps({
		type: {
			type: String,
			default: '0',
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
			default: '#3F3F40',
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
	.u-nav-slot1 {
		.nav-box {
			width: 63rpx;
			height: 63rpx;
			border: 1px solid #d1d1d1;
			border-radius: 50%;
			@extend %c-box-center;
		}
	}
	.u-nav-slot2 {
		@extend %c-box-center;
		width: 173rpx;
		height: 66rpx;
		border: 2rpx solid #d1d1d1;
		border-radius: 32rpx;
		.nav-line {
			width: 2rpx;
			height: 40rpx;
			background: #fff;
			margin: 0 20rpx;
		}
	}
</style>
