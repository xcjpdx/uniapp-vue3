<template>
	<view class="textarea-box" :style="[textareaBoxStyle, isFocus ? focusStyle : '']">
		<textarea
			:style="[textareaStyle]"
			:placeholder="props.placeholder"
			:placeholder-style="props.placeholderStyle"
			:maxlength="props.maxlength"
			:auto-height="props.autoHeight"
			:disabled="props.disabled"
			@focus="isFocus = true"
			@blur="isFocus = false"
			@input="inputChange"
		></textarea>
	</view>
</template>

<script setup>
	import { ref, onMounted, computed, watch, getCurrentInstance } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	const { proxy } = getCurrentInstance();
	const example = proxy;
	const props = defineProps({
		height: {
			type: String,
			default: '200rpx',
		},
		textareaBoxStyle: {
			type: Object,
			default: {},
		},
		textareaBoxPadding: {
			type: String,
			default: '40rpx',
		},
		textareaStyle: {
			type: Object,
			default: {},
		},
		placeholder: {
			type: String,
			default: '请输入',
		},
		placeholderStyle: {
			type: String,
			default: '',
		},
		disabled: {
			type: Boolean,
			default: false,
		},
		autoHeight: {
			type: Boolean,
			default: true,
		},
		maxlength: {
			type: Number,
			default: 150,
		},
		focusStyle: {
			type: Object,
			default: {},
		},
	});
	const emit = defineEmits(['update:modelValue']);

	onMounted(() => {
		init();
	});
	function init() {
		textareaBoxStyle.value = {
			padding: '20rpx',
			borderRadius: '10rpx',
			backgroundColor: '#f8f8f8',
			...props.textareaBoxStyle,
		};
		textareaStyle.value = {
			...props.textareaStyle,
		};
		for (let key in textareaBoxStyle.value) {
			if (key == 'height' || key == 'minHeight' || key == 'min-height') {
				delete textareaBoxStyle.value[key];
			}
		}
		for (let key in textareaStyle.value) {
			if (key == 'height' || key == 'minHeight' || key == 'min-height') {
				delete textareaStyle.value[key];
			}
		}
		if (props.autoHeight) {
			for (let key in textareaBoxStyle.value) {
				if (key == 'lineHeight' || key == 'line-height') {
					delete textareaBoxStyle.value[key];
				}
			}
			for (let key in textareaStyle.value) {
				if (key == 'lineHeight' || key == 'line-height') {
					delete textareaStyle.value[key];
				}
			}
			textareaBoxStyle.value.minHeight = props.height;
			// 处理textareaStyle的min-height
			let result = extractNumberAndUnit(props.textareaBoxPadding);
			let heightResult = extractNumberAndUnit(props.height);
			let minHeight = '';
			if (heightResult.unit == 'rpx') {
				if (result.unit == 'rpx') {
					minHeight = heightResult.number - result.number + 'rpx';
				} else {
					minHeight = heightResult.number - result.number * 2 + 'rpx';
				}
			} else {
				if (result.unit == 'rpx') {
					minHeight = heightResult.number - result.number / 2 + 'px';
				} else {
					minHeight = heightResult.number - result.number + 'px';
				}
			}
			textareaStyle.value.minHeight = minHeight;
		} else {
			textareaBoxStyle.value.height = props.height;
			textareaStyle.value.height = '100%';
		}
		focusStyle.value = {
			backgroundColor: '#fff',
			border: '1rpx solid #97CBE8',
			...props.focusStyle,
		};
	}
	function extractNumberAndUnit(inputString) {
		const match = inputString.match(/(\d+)([a-zA-Z]+)/);
		if (match) {
			const number = match[1] * 1;
			const unit = match[2];
			return { number, unit };
		} else {
			return { number: null, unit: null };
		}
	}
	let textareaBoxStyle = ref({});
	let textareaStyle = ref({});
	let focusStyle = ref({});
	let isFocus = ref(false);
	function inputChange(e) {
		emit('update:modelValue', e.detail.value);
	}
</script>

<style lang="scss" scoped>
	textarea {
		width: 100%;
		z-index: 99;
	}
</style>
