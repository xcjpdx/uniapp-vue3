<template>
	<div class="tooltip" :style="tipStyle">
		<slot>
			<text>{{ props.text }}</text>
		</slot>
		<div class="before" :style="beforeStyle"></div>
		<div class="after" :style="afterStyle"></div>
	</div>
</template>

<script setup>
	import { ref, onMounted, computed, watchEffect, getCurrentInstance } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	const { proxy } = getCurrentInstance();
	const example = proxy;
	const props = defineProps({
		width: {
			type: String,
			default: 'max-content',
		},
		text: {
			type: String,
			default: '这是气泡提示',
		},
		arrowSize: {
			type: Number,
			default: 16,
		},
		position: {
			type: String,
			default: 'top-left',
		},
		background: {
			type: String,
			default: '#fff',
		},
		shadowColor: {
			type: String,
			default: '#eee',
		},
		borderColor: {
			type: String,
			default: '#ddd',
		},
		tipStyle: {
			type: Object,
			default: {},
		},
	});

	onMounted(() => {
		tipStyle.value = {
			width: props.width,
			padding: '20rpx',
			'border-radius': '20rpx',
			border: '2rpx solid',
			...props.tipStyle,
			background: props.background,
			borderColor: props.borderColor,
			filter: `drop-shadow(0 0 10rpx ${props.shadowColor})`,
		};

		let publicStyle = {
			border: `${props.arrowSize}rpx solid transparent`,
			content: '',
			display: 'block',
			width: 0,
			height: 0,
			overflow: 'hidden',
			position: 'absolute',
			'z-index': 101,
		};
		let mainStyle = {
			'z-index': 99,
		};
		if (
			props.position == 'top-left' ||
			props.position == 'top-center' ||
			props.position == 'top-right'
		) {
			publicStyle = {
				...publicStyle,
				top: `-${props.arrowSize}rpx`,
				'border-top': 0,
				'border-bottom-color': props.background,
			};
			switch (props.position) {
				case 'top-left':
					publicStyle = {
						...publicStyle,
						left: '16px',
					};
					break;
				case 'top-center':
					publicStyle = {
						...publicStyle,
						left: '50%',
						transform: 'translateX(-50%)',
					};
					break;
				case 'top-right':
					publicStyle = {
						...publicStyle,
						right: '16px',
					};
					break;
			}
			mainStyle = {
				...publicStyle,
				...mainStyle,
				top: `-${props.arrowSize + 2}rpx`,
				'border-bottom-color': props.borderColor,
			};
		}
		if (
			props.position == 'bottom-left' ||
			props.position == 'bottom-center' ||
			props.position == 'bottom-right'
		) {
			publicStyle = {
				...publicStyle,
				bottom: `-${props.arrowSize}rpx`,
				'border-bottom': 0,
				'border-top-color': props.background,
			};
			switch (props.position) {
				case 'bottom-left':
					publicStyle = {
						...publicStyle,
						left: '16px',
					};
					break;
				case 'bottom-center':
					publicStyle = {
						...publicStyle,
						left: '50%',
						transform: 'translateX(-50%)',
					};
					break;
				case 'bottom-right':
					publicStyle = {
						...publicStyle,
						right: '16px',
					};
					break;
			}
			mainStyle = {
				...publicStyle,
				...mainStyle,
				bottom: `-${props.arrowSize + 2}rpx`,
				'border-top-color': props.borderColor,
			};
		}
		if (
			props.position == 'left-top' ||
			props.position == 'left-center' ||
			props.position == 'left-bottom'
		) {
			publicStyle = {
				...publicStyle,
				left: `-${props.arrowSize}rpx`,
				'border-left': 0,
				'border-right-color': props.background,
			};
			switch (props.position) {
				case 'left-top':
					publicStyle = {
						...publicStyle,
						top: '16px',
					};
					break;
				case 'left-center':
					publicStyle = {
						...publicStyle,
						top: '50%',
						transform: 'translateY(-50%)',
					};
					break;
				case 'left-bottom':
					publicStyle = {
						...publicStyle,
						bottom: '16px',
					};
					break;
			}
			mainStyle = {
				...publicStyle,
				...mainStyle,
				left: `-${props.arrowSize + 2}rpx`,
				'border-right-color': props.borderColor,
			};
		}
		if (
			props.position == 'right-top' ||
			props.position == 'right-center' ||
			props.position == 'right-bottom'
		) {
			publicStyle = {
				...publicStyle,
				right: `-${props.arrowSize}rpx`,
				'border-right': 0,
				'border-left-color': props.background,
			};
			switch (props.position) {
				case 'right-top':
					publicStyle = {
						...publicStyle,
						top: '16px',
					};
					break;
				case 'right-center':
					publicStyle = {
						...publicStyle,
						top: '50%',
						transform: 'translateY(-50%)',
					};
					break;
				case 'right-bottom':
					publicStyle = {
						...publicStyle,
						bottom: '16px',
					};
					break;
			}
			mainStyle = {
				...publicStyle,
				...mainStyle,
				right: `-${props.arrowSize + 2}rpx`,
				'border-left-color': props.borderColor,
			};
		}

		afterStyle.value = publicStyle;
		beforeStyle.value = mainStyle;
	});
	let tipStyle = ref({});
	let afterStyle = ref('');
	let beforeStyle = ref('');
</script>

<style lang="scss" scoped>
	.tooltip {
		position: relative;
		.before,
		.after {
			position: absolute;
		}
	}
</style>
