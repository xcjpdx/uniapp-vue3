<template>
	<scroll-view
		class="list"
		scroll-y
		enable-back-to-top
		refresher-enabled
		:refresher-triggered="props.refresherTriggered"
		@scrolltolower="onScrolltolower"
		@refresherrefresh="onRefresherrefresh"
	>
		<template v-if="!props.isNotData">
			<slot></slot>
			<div v-if="props.listFinish" class="list-finish">数据加载完了</div>
		</template>
		<slot name="notData" v-else>
			<div class="not-data">
				<image src="/static/zwsj.png" mode="aspectFit" />
				<text>暂无数据</text>
			</div>
		</slot>
	</scroll-view>
</template>

<script setup>
	import { ref, onMounted, computed, watch, watchEffect, getCurrentInstance } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	const { proxy } = getCurrentInstance();
	const props = defineProps({
		listFinish: {
			required: true,
		},
		isNotData: {
			required: true,
		},
		refresherTriggered: {
			required: true,
		},
	});
	const emit = defineEmits(['scrolltolower', 'refresherrefresh']);
	function onScrolltolower() {
		if (props.listFinish) return;
		emit('scrolltolower');
	}
	async function onRefresherrefresh() {
		emit('refresherrefresh');
	}
</script>

<style lang="scss" scoped>
	.list {
		height: 100%;
		.list-finish {
			margin-top: 20rpx;
			padding-bottom: 20rpx;
			color: #ccc;
			display: flex;
			justify-content: center;
		}
		.not-data {
			height: 100%;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			image {
				width: 206rpx;
				height: 214rpx;
				margin-bottom: 30rpx;
				margin-left: 90rpx;
			}
			text {
				font-size: 32rpx;
				font-weight: 400;
				color: #666666;
			}
		}
	}
</style>
