<template>
	<div class="mark-box" v-if="show">
		<div class="progress-container">
			<div class="progress-text" :style="{ color: props.color }" v-if="progress < 100">
				{{ props.text }}
				中
				{{ progress }} %</div
			>
			<div
				class="progress-text"
				:style="{ color: props.isFailed ? '#ec1d1d' : props.color }"
				v-else
				>{{ props.isFailed ? props.text + '失败' : props.text + '成功' }}</div
			>
			<div class="progress-bar">
				<div class="progress" :style="{ width: progress + '%', background: props.color }"></div>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { ref, watch, onMounted } from 'vue';

	const props = defineProps({
		// 组件的状态 true 表示开始 | false 表示结束
		state: {
			type: Boolean,
			required: true,
		},
		// 是否失败
		isFailed: {
			type: Boolean,
			required: true,
		},
		color: {
			type: String,
			default: '#76b852',
		},
		text: {
			type: String,
			default: '上传',
		},
	});
	const emit = defineEmits(['closeProgress']);

	let time = null; // 定时器
	let progress = ref(0); // 进度条百分比
	let show = ref(false); // 遮罩层是否显示
	watch(
		() => props.state,
		(val) => {
			if (val) {
				show.value = true;
				time = setInterval(() => {
					if (progress.value < 99) {
						progress.value += 1;
					}
				}, 100);
			} else {
				clearInterval(time);
				progress.value = 100;
				setTimeout(() => {
					emit('closeProgress');
					show.value = false;
					setTimeout(() => {
						progress.value = 0;
					}, 500);
				}, 1500);
			}
		}
	);
</script>

<style lang="scss" scoped>
	.mark-box {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		z-index: 9999;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.progress-container {
		width: 90%;
		.progress-text {
			display: flex;
			justify-content: center;
			margin: 20rpx 0;
			font-size: 34rpx;
		}
		.progress-bar {
			height: 20px;
			border-radius: 25rpx;
			background: #eee;
			overflow: hidden;
			.progress {
				height: 100%;
				border-radius: 25rpx;
				transition: width 0.1s;
			}
		}
	}
</style>
