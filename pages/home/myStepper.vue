<template>
	<div class="box-number">
		<div class="number-left" @click="changeNum('reduce')"> - </div>
		<div class="number-center" :style="{ width: inputWidth }">
			<input
				class="number-input"
				border="none"
				type="number"
				v-model="num"
				@blur="inputChangeNum"
			/>
			<text class="number-size" v-if="automaticWidth">{{ num }}</text>
		</div>
		<div class="number-right" @click="changeNum('add')"> + </div>
	</div>
</template>

<script setup>
	import { ref, watch, getCurrentInstance, nextTick } from 'vue';
	const { proxy } = getCurrentInstance();
	let example = proxy;

	const props = defineProps({
		number: {
			type: Number,
			required: true,
		},
		automaticWidth: {
			type: Boolean,
			default: false,
		},
		minNumber: {
			type: Number,
			default: 1,
			required: false,
		},
		maxNumber: {
			type: Number,
			default: 100,
			required: false,
		},
		step: {
			type: Number,
			default: 1,
			required: false,
		},
	});

	const emit = defineEmits(['update:number']);

	let num = ref(); // 数量
	let numBackUp = ref(); // 数量 用于备份原数据
	let inputWidth = ref('');
	watch(
		() => props.number,
		(val) => {
			num.value = val;
			numBackUp.value = val;
		},
		{ immediate: true }
	);

	// 动态改变input宽度
	watch(
		num,
		async () => {
			if (!props.automaticWidth) return;
			await nextTick();
			uni
				.createSelectorQuery()
				.in(example)
				.select('.number-size')
				.boundingClientRect((data) => {
					let width = Math.ceil(data.width) * 2;
					width = width > 50 ? width : 50;
					inputWidth.value = width + 20 + 'rpx';
				})
				.exec();
		},
		{
			immediate: true,
		}
	);

	// 改变数量
	function changeNum(type) {
		num.value = Number(num.value);
		switch (type) {
			case 'add':
				num.value += props.step;
				break;
			case 'reduce':
				num.value -= props.step;
				break;
		}
		let isLegal = checkNum(type);
		if (isLegal) {
			confirmChangeNum();
		} else {
			backUpNum();
		}
	}
	// 输入框失去焦点 改变数量
	function inputChangeNum() {
		num.value = Number(num.value);
		let isLegal = checkNum();
		if (isLegal) {
			confirmChangeNum();
		} else {
			backUpNum();
		}
	}
	// 判断数据是否合法
	function checkNum(type = 'change') {
		let isLegal = true;
		switch (type) {
			case 'reduce':
				if (num.value < props.minNumber) {
					uni.showToast({ title: `数量不能小于 ${props.minNumber}`, icon: 'none' });
					isLegal = false;
				}
				break;
			case 'add':
				if (num.value > props.maxNumber) {
					uni.showToast({ title: `数量不能大于 ${props.maxNumber}`, icon: 'none' });
					isLegal = false;
				}
				break;
			case 'change':
				if (isNaN(num.value)) {
					uni.showToast({ title: '请输入正确的数量', icon: 'none' });
					isLegal = false;
				}
				if (num.value < props.minNumber) {
					uni.showToast({ title: `数量不能小于 ${props.minNumber}`, icon: 'none' });
					isLegal = false;
				}
				if (num.value > props.maxNumber) {
					uni.showToast({ title: `数量不能大于 ${props.maxNumber}`, icon: 'none' });
					isLegal = false;
				}
				break;
		}
		return isLegal;
	}
	// 确定改变数据
	function confirmChangeNum() {
		emit('update:number', num.value);
		numBackUp.value = num.value;
	}
	// 数据回退
	function backUpNum() {
		num.value = numBackUp.value;
	}
</script>

<style lang="scss" scoped>
	.box-number {
		display: flex;
		align-items: center;
		.number-left,
		.number-center,
		.number-right {
			display: flex;
			justify-content: center;
			align-items: center;
		}
		.number-left {
			width: 51rpx;
			height: 50rpx;
			background: #ffffff;
			border: 1px solid #d2d2d2;
			border-radius: 10rpx 0rpx 0rpx 10rpx;
			image {
				width: 23rpx;
				height: 3rpx;
			}
		}
		.number-center {
			position: relative;
			width: 75rpx;
			height: 50rpx;
			background: #ffffff;
			border: 1px solid #d2d2d2;
			font-size: 28rpx;
			font-weight: 500;
			color: #333333;
			transition: all 0.3s;
			.number-input {
				text-align: center;
				width: 100%;
			}
			.number-size {
				font-size: 28rpx;
				position: absolute;
				visibility: hidden;
			}
		}
		.number-right {
			width: 51rpx;
			height: 50rpx;
			background: #ffffff;
			border: 1px solid #d2d2d2;
			border-radius: 0rpx 10rpx 10rpx 0rpx;
			image {
				width: 23rpx;
				height: 23rpx;
			}
		}
	}
</style>
