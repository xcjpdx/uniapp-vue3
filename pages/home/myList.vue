<template>
	<template v-if="!props.isNotData">
		<slot></slot>
		<slot name="finish" v-if="props.isFinish">
			<div class="finish">数据加载完了</div>
		</slot>
	</template>
	<slot name="notData" v-else>
		<div class="not-data">
			<image
				src="https://tui.tongbu.com/images/history/pic_blank_udid_nodata.png"
				mode="aspectFit"
			/>
			<text>暂无数据</text>
		</div>
	</slot>
</template>

<script setup>
	import { ref, onMounted, computed, watch, watchEffect, getCurrentInstance } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	const { proxy } = getCurrentInstance();
	const props = defineProps({
		isFinish: {
			required: true,
		},
		isNotData: {
			required: true,
		},
	});
</script>

<style lang="scss" scoped>
	.finish {
		margin: 20rpx 0;
		color: #ccc;
		text-align: center;
	}
	.not-data {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		image {
			width: 200rpx;
			height: 200rpx;
			margin-bottom: 30rpx;
		}
		text {
			font-size: 32rpx;
			font-weight: 400;
			color: #666666;
		}
	}
</style>
