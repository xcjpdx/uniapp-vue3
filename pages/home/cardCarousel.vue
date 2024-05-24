<template>
	<scroll-view scroll-x="true" enable-flex>
		<div class="card-list">
			<view class="card-item" v-for="item in list" @click="emit('clickCard', item)">
				<image :src="item.url" mode="" />
				<text>{{ item.name }}</text>
			</view>
		</div>
	</scroll-view>
</template>

<script setup>
	import { ref, onMounted, computed, watchEffect, getCurrentInstance } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	const { proxy } = getCurrentInstance();
	const example = proxy;
	const props = defineProps({
		list: {
			type: Array,
			required: true,
		},
	});
	const emit = defineEmits(['clickCard']);
</script>

<style lang="scss" scoped>
	.card-list {
		display: flex;
		.card-item {
			margin-right: 11rpx;
			background: #f5f5f5;
			border-radius: 20rpx;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			padding: 20rpx;
			image {
				width: 150rpx;
				height: 100rpx;
				margin-bottom: 20rpx;
			}
			text {
				font-size: 28rpx;
				font-weight: 800;
				color: #333333;
				text-align: center;
				word-break: break-all;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 1; /** 显示的行数 **/
				overflow: hidden;
			}
		}
		.card-item:last-child {
			margin-right: 0;
		}
	}
</style>
