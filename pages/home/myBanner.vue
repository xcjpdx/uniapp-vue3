<template>
	<div class="banner-box" :style="isIndicator ? 'position: relative' : ''">
		<swiper
			:circular="props.circular"
			:autoplay="props.autoplay"
			:interval="props.interval"
			:current="swiperIndex"
			:previous-margin="previousMargin"
			:next-margin="nextMargin"
			@change="swiperChange"
			@animationfinish="swiperFinish"
			:style="{ height: props.height, 'border-radius': props.radius }"
		>
			<swiper-item v-for="(item, index) in bannerList" :key="index" @click="clickSwiper(item)">
				<template v-if="props.type == 1">
					<image :src="item.url" mode="scaleToFill" v-if="item.urlType == 'image'" />
					<video
						class="banner-video"
						:src="item.url"
						:poster="item.poster"
						object-fit="fill"
						v-if="item.urlType == 'video'"
					></video>
				</template>
				<template v-if="props.type == 2">
					<view
						class="main-card"
						:class="swiperIndex == index ? 'current-card' : 'side-card'"
						:style="{ 'border-radius': props.radius }"
					>
						<image :src="item.url" mode="scaleToFill" v-if="item.urlType == 'image'" />
						<video
							class="banner-video"
							:src="item.url"
							:poster="item.poster"
							object-fit="fill"
							v-if="item.urlType == 'video'"
						></video>
					</view>
				</template>
			</swiper-item>
		</swiper>
		<view class="banner-indicator indicator1" v-if="isIndicator && props.indicatorType == 1">
			<view
				class="indicator-item"
				:class="{ 'indicator-item-active': indicatorIndex === swiperIndex }"
				v-for="(img, indicatorIndex) in bannerList.length"
				:key="indicatorIndex"
				@click="swiperIndex = indicatorIndex"
			></view>
		</view>
		<view
			class="banner-indicator indicator2"
			:style="`width: calc(${40}rpx * ${bannerList.length})`"
			v-if="isIndicator && props.indicatorType == 2"
		>
			<div class="banner-indicator-box">
				<view
					class="indicator-item"
					:style="`transform: translateX(calc(${40}rpx * ${swiperIndex}))`"
				></view>
			</div>
		</view>
	</div>
</template>

<script setup>
	import { ref, onMounted, computed, watch, getCurrentInstance } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	const { proxy } = getCurrentInstance();
	const example = proxy;
	const props = defineProps({
		// 轮播图类型 1 普通轮播图 2 卡片式轮播图
		type: {
			type: String,
			default: '1',
		},
		// 圆角
		radius: {
			type: String,
			default: '30rpx',
		},
		// 前边距，可用于露出前一项的一小部分(仅type为2时生效)
		previousMargin: {
			type: String,
			default: '',
		},
		// 后边距 ，可用于露出后一项的一小部分(仅type为2时生效)
		nextMargin: {
			type: String,
			default: '',
		},
		// 是否显示指示器
		isIndicator: {
			type: Boolean,
			default: true,
		},
		// 轮播图类型 1 指示器分开展示 2 指示器在一个滑块中
		indicatorType: {
			type: String,
			default: '1',
		},
		// 轮播图数据
		bannerList: {
			type: Array,
			required: true,
		},
		// 配置数据的字段
		option: {
			type: Object,
			default: {
				url: 'url', // 图片或视频的链接
				poster: 'poster', // 视频封面的图片网络资源地址
			},
		},
		// 轮播图高度
		height: {
			type: String,
			default: '512rpx',
		},
		// 是否开启循环轮播
		circular: {
			type: Boolean,
			default: true,
		},
		// 是否自动轮播
		autoplay: {
			type: Boolean,
			default: true,
		},
		// 自动轮播的时间间隔 单位 ms
		interval: {
			type: Number,
			default: 3000,
		},
	});

	let bannerList = ref([]);
	let previousMargin = ref('');
	let nextMargin = ref('');
	let isIndicator = ref(''); // 是否显示指示器
	let option = '';
	watch(
		() => props.bannerList,
		() => {
			isIndicator.value = props.isIndicator;
			option = {
				url: props.option.url || 'url',
				poster: props.option.poster || 'poster',
			};
			let platform = uni.getSystemInfoSync().platform;
			if (props.type == 2) {
				previousMargin.value = props.previousMargin || '60rpx';
				nextMargin.value = props.nextMargin || '60rpx';
			}
			if (props.bannerList) {
				bannerList.value = props.bannerList;
				if (bannerList.value.length) {
					bannerList.value = bannerList.value.map((item) => {
						let url = '';
						let poster = '';
						for (const key in item) {
							if (key == option.url) {
								url = item[key];
							}
							if (key == option.poster) {
								poster = item[key];
							}
						}
						let urlType = judgeFileType(url);
						if (urlType == 'video' && platform == 'ios') {
							isIndicator.value = false;
						}
						return {
							...item,
							urlType,
							url,
							poster,
						};
					});
				}
			}
		},
		{
			immediate: true,
		}
	);

	// 根据url判断文件类型
	function judgeFileType(url) {
		let imageType = ['png', 'jpg', 'jpeg'];
		let videoType = ['mp4', 'mov', 'mkv'];
		if (imageType.includes(url.split('.').pop())) {
			return 'image';
		} else if (videoType.includes(url.split('.').pop())) {
			return 'video';
		}
	}

	const emit = defineEmits(['clickSwiper']);
	let swiperIndex = ref(0); // 轮播图当前所在滑块的 index
	// 轮播图切换
	function swiperChange(e) {
		if (props.type == 2) {
			swiperIndex.value = e.detail.current;
		}
	}
	// 轮播图切换
	function swiperFinish(e) {
		if (props.type == 1) {
			swiperIndex.value = e.detail.current;
		}
	}
	// 点击轮播图
	function clickSwiper(item) {
		emit('clickSwiper', item);
	}
</script>

<style lang="scss" scoped>
	.banner-box {
		swiper {
			overflow: hidden;
			swiper-item {
				display: grid;
				align-items: center;
				border-radius: 30rpx;
				overflow: hidden;
				transform: rotate(0deg);
				-webkit-transform: rotate(0deg);
				image {
					width: 100%;
					height: 100%;
				}
				video {
					width: 100%;
					height: 100%;
				}
			}
		}
		.banner-video {
			border-radius: 30rpx;
			overflow: hidden;
			transform: rotate(0deg);
			-webkit-transform: rotate(0deg);
		}
		.main-card {
			overflow: hidden;
			margin: 0 10rpx;
			transition: all 0.6s;
		}
		.current-card {
			height: 100%;
		}
		.side-card {
			height: 80%;
		}
		.banner-indicator {
			position: absolute;
			bottom: 20rpx;
			left: 50%;
			transform: translateX(-50%);
		}
		.indicator1 {
			display: flex;
			justify-content: center;
			align-items: center;
			.indicator-item {
				width: 15rpx;
				height: 15rpx;
				background: #fff;
				border-radius: 50%;
				margin-right: 14rpx;
			}
			.indicator-item-active {
				background: #fdd100;
			}
		}
		.indicator2 {
			.banner-indicator-box {
				background: #d4d4d4;
				border-radius: 15rpx;
				height: 20rpx;
				position: relative;
				.indicator-item {
					position: absolute;
					width: 40rpx;
					height: 20rpx;
					background: #2d99a1;
					border-radius: 15rpx;
					transition: all 0.3s;
				}
			}
		}
	}
</style>
