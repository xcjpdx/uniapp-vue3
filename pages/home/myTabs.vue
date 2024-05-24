<template>
	<div class="tabs-box">
		<scroll-view
			:style="[scrollViewStyle]"
			scroll-x
			scroll-with-animation
			enable-flex
			:scroll-left="scrollLeft"
		>
			<div
				class="tabs"
				:style="{
					'justify-content': props.type == 2 ? 'center' : '',
				}"
			>
				<div
					class="tab"
					:style="[
						tabStyle,
						item.id === props.activeTab ? tabActiveStyle : '',
						{ 'margin-right': index == props.tabList.length - 1 ? '0' : '' },
					]"
					v-for="(item, index) in props.tabList"
					:key="item.id"
					@click="changeTab(index)"
				>
					{{ item.name }}
					<!-- <div class="tab-line"></div> -->
				</div>
				<image
					class="tabs-line"
					:style="tabsLineStyle"
					:src="props.tabLineImg"
					mode=""
					v-if="props.tabLineImg"
				/>
				<div class="tabs-line" :style="tabsLineStyle" v-else></div>
			</div>
		</scroll-view>
	</div>
</template>

<script setup>
	import { ref, onMounted, nextTick, getCurrentInstance } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	const { proxy } = getCurrentInstance();
	let instance = proxy;
	const props = defineProps({
		/*
		1 tabs内容很多,超过屏幕宽度
		2 tabs内容很少,不超过屏幕宽度,tabs内容居中显示
		*/
		type: {
			type: String,
			default: '1',
		},
		// tab列表
		tabList: {
			type: Array,
			required: true,
		},
		// 当前激活的tab
		activeTab: {
			type: Number,
			required: true,
		},
		// 间距 单位是
		spacing: {
			type: String,
			default: '20rpx',
		},
		// tab样式
		tabStyle: {
			type: Object,
			default: {},
		},
		// tab激活样式
		tabActiveStyle: {
			type: Object,
			default: {},
		},
		// 底部滑块样式
		tabsLineStyle: {
			type: Object,
			default: {},
		},
		// 滑块图片地址(网络图片)
		tabLineImg: {
			type: String,
			default: '',
		},
	});
	const emit = defineEmits(['changeTab']);

	onMounted(async () => {
		await init();
		// 计算第一次的位置
		let index = props.tabList.findIndex((ele) => ele.id === props.activeTab);
		changeTab(index);
	});
	// 初始化
	async function init() {
		let spacingRes = extractNumberAndUnit(props.spacing);
		switch (spacingRes.unit) {
			case 'rpx':
				spacing.value = spacingRes.number / 2;
				break;
			case 'px':
				spacing.value = spacingRes.number;
				break;
		}
		tabStyle.value = {
			height: '80rpx',
			display: 'flex',
			'justify-content': 'center',
			'align-items': 'center',
			'font-weight': 500,
			'font-size': '28rpx',
			color: '#999',
			'margin-right': `${spacing.value}px`,
			...props.tabStyle,
		};
		tabActiveStyle.value = {
			'font-weight': 800,
			'font-size': '36rpx',
			color: '#333',
			...props.tabActiveStyle,
		};
		tabsLineStyle.value = {
			height: '4rpx',
			bottom: '-4rpx',
			background: '#fdd100',
			...props.tabsLineStyle,
		};
		let scrollViewHeight = 0;
		let tabHeight = 0;
		let tabsLineHeight = 0;
		let tabHeightRes = extractNumberAndUnit(tabStyle.value.height);
		let tabsLineHeightRes = extractNumberAndUnit(tabsLineStyle.value.height);
		switch (tabHeightRes.unit) {
			case 'rpx':
				tabHeight = tabHeightRes.number;
				break;
			case 'px':
				tabHeight = tabHeightRes.number * 2;
				break;
		}
		switch (tabsLineHeightRes.unit) {
			case 'rpx':
				tabsLineHeight = tabsLineHeightRes.number;
				break;
			case 'px':
				tabsLineHeight = tabsLineHeightRes.number * 2;
				break;
		}
		scrollViewHeight = tabHeight + tabsLineHeight;
		scrollViewStyle.value = {
			height: scrollViewHeight + 'rpx',
		};
		boxInfo = await getTabsBoxInfo();
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
	// 获取tabs-box的宽度
	function getTabsBoxInfo() {
		let query = uni.createSelectorQuery().in(instance);
		return new Promise((resolve, reject) => {
			query
				.select('.tabs-box')
				.boundingClientRect((data) => {
					resolve({
						left: data.left,
						width: data.width,
					});
				})
				.exec();
		});
	}

	let scrollViewStyle = ref({});
	let scrollLeft = ref(0);
	let spacing = ref('');
	let tabStyle = ref({});
	let tabActiveStyle = ref({});
	let tabsLineStyle = ref({});
	let boxInfo = { left: '', width: '' };
	let tabInfo = [];

	async function changeTab(index) {
		let selectTab = props.tabList[index];
		// console.log(selectTab);
		emit('changeTab', selectTab);
		await getTabInfo();
		if (props.type == 1) {
			getLine1(index);
			scrollLeft.value = moveX - boxInfo.width / 2;
		} else {
			getLine2(index);
		}
	}
	// 获取tab的信息
	function getTabInfo() {
		let query = uni.createSelectorQuery().in(instance);
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				query
					.selectAll('.tab')
					.boundingClientRect((rect) => {
						tabInfo = [];
						tabInfo = rect.map((item) => {
							return { width: item.width, left: item.left };
						});
						resolve();
					})
					.exec();
			}, 300);
		});
	}
	let moveX = 0;
	// 获取tab-line的位移距离
	function getLine1(index) {
		moveX = 0;
		let tabsLineWidth = props.tabsLineStyle.width;
		for (let i = 0; i < tabInfo.length; i++) {
			if (i <= index) {
				let ele = tabInfo[i];
				let tWidth = '';
				if (tabsLineWidth) {
					let tabsLineWidthRes = extractNumberAndUnit(tabsLineWidth);
					switch (tabsLineWidthRes.unit) {
						case 'rpx':
							tWidth = tabsLineWidthRes.number / 2;
							break;
						case 'px':
							tWidth = tabsLineWidthRes.number;
							break;
					}
				} else {
					tWidth = ele.width / 2;
				}
				if (index == i) {
					tabsLineWidth = tWidth;
				}
				if (i < index) {
					moveX += ele.width + spacing.value;
				} else {
					moveX += (ele.width - tWidth) / 2;
				}
			} else {
				break;
			}
		}
		tabsLineStyle.value.width = tabsLineWidth + 'px';
		tabsLineStyle.value.transform = `translateX(${moveX}px)`;
	}
	function getLine2(index) {
		moveX = 0;
		let tabsLineWidth = props.tabsLineStyle.width;
		let tWidth = '';
		let ele = tabInfo[index];
		if (tabsLineWidth) {
			let tabsLineWidthRes = extractNumberAndUnit(tabsLineWidth);
			switch (tabsLineWidthRes.unit) {
				case 'rpx':
					tWidth = tabsLineWidthRes.number / 2;
					break;
				case 'px':
					tWidth = tabsLineWidthRes.number;
					break;
			}
		} else {
			tWidth = ele.width / 2;
		}
		moveX = ele.left - boxInfo.left + (ele.width - tWidth) / 2;
		tabsLineStyle.value.width = tWidth + 'px';
		tabsLineStyle.value.transform = `translateX(${moveX}px)`;
	}
</script>

<style lang="scss" scoped>
	.tabs {
		display: flex;
		position: relative;
		.tab {
			position: relative;
			transition: all 0.6s;
			white-space: nowrap;
			.tab-line {
				position: absolute;
				left: 50%;
				bottom: 0;
				width: 50%;
				transform: translateX(-50%);
				background: #000;
				height: 4rpx;
			}
		}
		.tabs-line {
			position: absolute;
			left: 0;
			transition: all 0.2s;
		}
	}
</style>
