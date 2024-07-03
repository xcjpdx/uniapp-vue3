<template>
	<view class="back-to-top" :style="{ opacity: showBackToTop ? 1 : 0 }" @click="backToTop">
		<text>Top</text>
	</view>
</template>

<script setup>
	import { ref, onMounted, computed, watch, getCurrentInstance } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	const { proxy } = getCurrentInstance();
	const example = proxy;

	let windowHeight = 0;
	onMounted(() => {
		windowHeight = uni.getSystemInfoSync().windowHeight;
	});
	const props = defineProps({
		pageScrollingDistance: {
			type: Number,
			required: true,
		},
	});
	let showBackToTop = ref(false);
	watch(
		() => props.pageScrollingDistance,
		(val) => {
			if (val >= windowHeight / 2) {
				showBackToTop.value = true;
			} else {
				showBackToTop.value = false;
			}
		}
	);

	function backToTop() {
		uni.pageScrollTo({
			scrollTop: 0,
			duration: 300, // 回到顶部的动画时长，单位为毫秒
		});
	}
</script>

<style lang="scss" scoped>
	.back-to-top {
		position: fixed;
		bottom: 20rpx;
		right: 20rpx;
		border-radius: 50%;
		background: #ccc;
		padding: 20rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 999;
		transition: opacity 0.3s;
		opacity: 0;

		text {
			color: #fff;
		}
	}
</style>
