<template>
	<div class="mark-box" v-if="markShow">
		<div class="progress-container">
			<div class="progress-text" :style="{ color: props.waitColor }" v-if="progress < 100">
				{{ props.waitText }} {{ progress }} %
			</div>
			<div
				class="progress-text"
				:style="{ color: props.isFailed ? props.failColor : props.successColor }"
				v-else
			>
				{{ props.isFailed ? props.failText : props.successText }}
			</div>
			<div class="progress-bar">
				<div
					class="progress"
					:style="{ width: progress + '%', background: props.progressBarColor }"
				></div>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { ref, watch, onMounted } from 'vue';

	const props = defineProps({
		state: {
			type: Boolean,
			required: true,
		},
		isFailed: {
			type: Boolean,
			required: true,
		},
		totalSize: {
			type: Number,
		},
		currentSize: {
			type: Number,
		},
		waitText: {
			type: String,
			default: '上传中',
		},
		waitColor: {
			type: String,
			default: '#F5BD00',
		},
		successText: {
			type: String,
			default: '上传成功',
		},
		successColor: {
			type: String,
			default: '#00B26A',
		},
		failText: {
			type: String,
			default: '上传失败',
		},
		failColor: {
			type: String,
			default: '#EB3941',
		},
		progressBarColor: {
			type: String,
			default: '#00B26A',
		},
	});
	const emit = defineEmits(['closeProgress']);

	let progress = ref(0); // 进度条百分比
	let markShow = ref(false); // 遮罩层是否显示
	watch(
		() => props.state,
		(val) => {
			if (val) {
				markShow.value = val;
			} else {
				setTimeout(() => {
					markShow.value = val;
					progress.value = 0;
					emit('closeProgress');
				}, 1000);
			}
		}
	);
	watch(
		() => props.currentSize,
		() => {
			if (markShow.value) {
				progress.value = ((props.currentSize / props.totalSize) * 100).toFixed(1);
				// console.log('当前进度', progress.value);
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
