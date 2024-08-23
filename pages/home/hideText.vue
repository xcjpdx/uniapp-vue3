<template>
	<div class="box">
		<!-- 文本内容 -->
		<text class="text-all" :style="[{ opacity: textHeight ? 1 : 0 }, textStyle]">
			{{ props.text }}
		</text>
		<!-- 占位文本 -->
		<text class="placeholder" :style="props.textStyle">{{ placeholder }}</text>
		<!-- 展开收起文本/按钮 -->
		<view
			class="label-box"
			:style="[{ 'justify-content': showAll ? 'flex-end' : 'space-between' }, lableBoxStyle]"
			v-if="lines > rows"
		>
			<text :style="props.textStyle">{{ showAll ? '' : '...' }}</text>
			<image
				@click="showText"
				v-if="props.labelIcon"
				:src="props.labelIcon"
				mode=""
				:style="[{ transform: 'rotate(' + (showAll ? 180 : 0) + 'deg)' }, labelStyle]"
			/>
			<view v-else @click="showText" :style="[props.textStyle, labelStyle, { height: '100%' }]">
				{{ showAll ? props.hideText : props.showText }}
			</view>
		</view>
	</div>
</template>

<script setup>
	import { ref, onMounted, computed, watch, getCurrentInstance, nextTick } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	const { proxy } = getCurrentInstance();
	const example = proxy;
	const props = defineProps({
		text: {
			type: String,
			required: true,
		},
		rows: {
			type: String,
			default: '2',
		},
		textStyle: {
			type: Object,
			default: {},
		},
		labelStyle: {
			type: Object,
			default: {},
		},
		hideText: {
			type: String,
			default: '收起',
		},
		showText: {
			type: String,
			default: '更多',
		},
		labelIcon: {
			type: String,
			default: '',
		},
	});

	onMounted(() => {
		init();
	});
	let textStyle = ref(''); // 文本样式
	let lableBoxStyle = ref({}); // lableBox样式
	let labelStyle = ref({}); // label样式
	let placeholder = ref('占');
	let rows = ref(''); // 行数
	let showAll = ref(false); // 是否显示全部内容 true 显示所有内容  false 只显示指定行数内容
	let lineHeight = ref(0); // 单行文本高度
	let textHeight = ref(0); // 文本高度
	let oneTextWidth = ref(0); // 单个文字宽度
	async function init() {
		rows.value = props.rows * 1;
		textStyle.value = {
			overflow: 'hidden',
			transition: 'all 0.3s',
			...props.textStyle,
		};
		labelStyle.value = {
			...props.labelStyle,
		};
		if (!props.labelIcon) {
			// 删除labelStyle中的字号/行高/粗细/字体(与文字样式保持一致)
			for (let key in labelStyle.value) {
				if (
					key == 'fontSize' ||
					key == 'font-size' ||
					key == 'lineHeight' ||
					key == 'line-height' ||
					key == 'fontWeight' ||
					key == 'font-weight' ||
					key == 'fontFamily' ||
					key == 'font-family'
				) {
					delete labelStyle.value[key];
				}
			}
		}
		await getlineHeight();
		textStyle.value.height = lineHeight.value * rows.value + 'px';
		lableBoxStyle.value.height = lineHeight.value + 'px';
		placeholder.value = '';
		await getTextHeight();
		if (lines.value > rows.value) {
			let labelBoxWidth = await getLableBoxWidth();
			lableBoxStyle.value.width =
				Math.ceil(labelBoxWidth / oneTextWidth.value) * oneTextWidth.value + 'px';
		}
	}
	// 获取单行文本高度/单个文字宽度
	function getlineHeight() {
		let query = uni.createSelectorQuery().in(example);
		return new Promise((resolve, reject) => {
			query
				.select('.placeholder')
				.fields(
					{
						size: true,
					},
					(data) => {
						lineHeight.value = data.height;
						oneTextWidth.value = data.width;
						resolve();
					}
				)
				.exec();
		});
	}
	// 获取文本展示高度
	function getTextHeight() {
		let query = uni.createSelectorQuery().in(example);
		return new Promise((resolve, reject) => {
			query
				.select('.text-all')
				.fields(
					{
						size: true,
					},
					(data) => {
						textHeight.value = data.height;
						resolve();
					}
				)
				.exec();
		});
	}
	// 获取右侧lableBox的宽度
	function getLableBoxWidth() {
		let query = uni.createSelectorQuery().in(example);
		return new Promise((resolve, reject) => {
			query
				.select('.label-box')
				.fields(
					{
						size: true,
					},
					(data) => {
						let width = Math.ceil(data.width);
						resolve(width);
					}
				)
				.exec();
		});
	}

	// 文本所占总行数
	let lines = computed(() => {
		return Math.floor(
			textHeight.value > 0 && lineHeight.value > 0 ? textHeight.value / lineHeight.value : 0
		);
	});

	// 展示隐藏查看更多
	function showText() {
		showAll.value = !showAll.value;
		if (showAll.value) {
			textStyle.value.height = textHeight.value + 'px';
		} else {
			textStyle.value.height = lineHeight.value * rows.value + 'px';
		}
	}
</script>

<style lang="scss" scoped>
	.box {
		position: relative;
		text {
			display: -webkit-box;
			text-align: justify;
		}
		.placeholder {
			position: absolute;
			left: 0;
			top: 0;
			transform: translateX(-500%);
			z-index: -1;
			opacity: 0;
		}
		.label-box {
			position: absolute;
			bottom: 0;
			right: 0;
			background: #fff;
			display: flex;
			align-items: center;
			image {
				margin-left: 10rpx;
			}
		}
	}
</style>
