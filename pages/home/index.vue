<template>
	<button @click="isCanvas = true">打开海报</button>
	<div class="canvas-mark-box" v-if="isCanvas" @click="isCanvas = false">
		<myCanvas
			:drawArr="drawArr"
			:width="690"
			:height="996"
			@canvasDrawComplete="canvasDrawComplete"
		></myCanvas>
		<div class="canvas-btn" @click.stop="downloadCanvasImageUrl">{{
			canvasImageUrl ? '保存海报' : '绘制中...'
		}}</div>
	</div>
	<div style="padding: 20rpx">
		<hideText
			:text="text"
			rows="2"
			:labelStyle="{
				background: '#000',
				'font-size': '20rpx',
				padding: '5rpx 20rpx',
				'border-radius': '6rpx',
				color: '#fff',
				display: 'flex',
				'justify-content': 'center',
				'align-items': 'center',
			}"
		></hideText>
	</div>
	<div style="padding: 20rpx">
		<myTabs type="1" :tabList="tabList" :activeTab="activeTab" @changeTab="changeTab"></myTabs>
	</div>
	<div style="padding: 20rpx">
		<myTextarea
			height="300rpx"
			v-model="textarea"
			:maxlength="-1"
			placeholder="请输入内容请输入内容请输入内容请输入内容请输入内容请输入内容请输入内容请输入内容"
			:autoHeight="true"
			:textareaBoxStyle="{
				'line-height': '2',
			}"
			:textareaStyle="{
				'font-weight': 500,
				'font-size': '30rpx',
				color: '#333',
			}"
			placeholderStyle="font-weight: 500;font-size: 30rpx;color: #E9D8D4;"
		></myTextarea>
	</div>
</template>

<script setup>
	import { ref, onMounted, computed, watchEffect, getCurrentInstance } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	const { proxy } = getCurrentInstance();
	import dayjs from 'dayjs';
	onMounted(() => {
		console.log(dayjs().format('YYYY-MM-DD HH:mm:ss dddd a'));
	});

	import myTextarea from './myTextarea.vue';
	let textarea = ref('');

	import myTabs from './myTabs.vue';
	let tabList = ref([
		{
			id: 1,
			name: '首页占位',
		},
		{
			id: 2,
			name: '定制',
		},
		{
			id: 3,
			name: '视频',
		},
		{
			id: 4,
			name: '公告',
		},
		{
			id: 5,
			name: '活动',
		},
		{
			id: 6,
			name: '我的占位',
		},
		{
			id: 7,
			name: '购物占位',
		},
		{
			id: 8,
			name: '游泳占位',
		},
	]);
	let activeTab = ref(1);
	function changeTab(tab) {
		activeTab.value = tab.id;
	}

	import hideText from './hideText.vue';
	let text = ref(
		'是大呼大叫挖的就打问号对啊对啊到家我弟害我多久啊打完就叼毛我的考完的单位的舅妈我肯定嘛胃口的是大呼大叫挖的就打问号对啊对啊到家我弟害我多久啊打完就叼毛我的考完的单位的舅妈我肯定嘛胃口的是大呼大叫挖的就打问号对啊对啊到家我弟害我多久啊打完就叼毛我的考完的单位的舅妈我肯定嘛胃口的是大呼大叫挖的就打问号对啊对啊到家我弟害我多久啊打完就叼毛我的考完的单位的舅妈我肯定嘛胃口的是大呼大叫挖的就打问号对啊对啊到家我弟害我多久啊打完就叼毛我的考完的单位的舅妈我肯定嘛胃口的'
	);

	import myCanvas from './myCanvas.vue';
	let isCanvas = ref(false);
	let drawArr = ref([
		{
			type: 'image', // 绘制类型 图片
			drawOptions: {
				// 绘制位置
				left: 0,
				top: 0,
				url: 'https://douleoss.oss-cn-shenzhen.aliyuncs.com/test/6618d93cf28fd5af0da7c96b.png',
				// 绘制尺寸
				width: '100%',
				height: '100%',
			},
		},
		{
			type: 'rect', // 绘制类型 矩形
			drawOptions: {
				// 绘制位置
				left: 'center',
				bottom: 88,
				// 绘制尺寸
				width: 614,
				height: 645,
				type: 'fill', // 绘制类型：fill：填充，stroke：描边
				fillStyle: '#fff', // 填充颜色
				isFillet: true, // 是否有圆角
				radius: 30 / 2, // 圆角值
			},
		},
		{
			type: 'rect', // 绘制类型 矩形
			drawOptions: {
				// 绘制位置
				left: 'center',
				top: 370,
				// 绘制尺寸
				width: 347,
				height: 347,
				type: 'fill', // 绘制类型：fill：填充，stroke：描边
				fillStyle: '#FFF9E5', // 填充颜色
				isFillet: true, // 是否有圆角
				radius: 12 / 2, // 圆角值
			},
		},
		{
			type: 'image', // 绘制类型 图片
			drawOptions: {
				// 绘制位置
				left: 'center',
				top: 377,
				url: 'https://douleoss.oss-cn-shenzhen.aliyuncs.com/test/6625cabfe4b06f8b5acbb005.png',
				// 绘制尺寸
				width: 331,
				height: 331,
			},
		},
		{
			type: 'avatar',
			drawOptions: {
				// 绘制位置
				top: 280,
				left: 'center',
				width: 80,
				height: 80,
				type: 'fill',
				fillStyle: '#6ef2a3',
				url: 'https://douleoss.oss-cn-shenzhen.aliyuncs.com/test/66236de1e4b0fb16c4b0c307.jpg',
			},
		},
		{
			type: 'text', // 绘制类型 文字
			drawOptions: {
				// 绘制位置
				left: 85,
				bottom: 146,
				text: '预约导乐服务 | 专业的技术、细心的真爱服务', // 文本
				maxLine: 2, // 文本最大行数
				maxWidth: 306, // 文本最大宽度
				type: 'fill', // 绘制类型 ： fill：填充，stroke：描边
				fontSize: 30, // 文本大小
				lineHeight: 1.2, // 文本行高
				fillStyle: '#333', // 文本颜色
			},
		},
		{
			type: 'text', // 绘制类型 文字
			drawOptions: {
				// 绘制位置
				right: 214,
				bottom: 146,
				text: '¥', // 文本
				type: 'fill', // 绘制类型 ： fill：填充，stroke：描边
				fontSize: 24, // 文本大小
				fillStyle: '#E63241', // 文本颜色
			},
		},
		{
			type: 'text', // 绘制类型 文字
			drawOptions: {
				// 绘制位置
				right: 85,
				bottom: 145,
				text: '120.00', // 文本
				type: 'fill', // 绘制类型 ： fill：填充，stroke：描边
				fontSize: 40, // 文本大小
				fillStyle: '#E63241', // 文本颜色
			},
		},
		{
			type: 'text', // 绘制类型 文字
			drawOptions: {
				// 绘制位置
				left: 85,
				bottom: 31,
				text: '长按识别图中二维码查看详情', // 文本
				type: 'fill', // 绘制类型 ： fill：填充，stroke：描边
				fontSize: 24, // 文本大小
				fillStyle: '#333', // 文本颜色
			},
		},
	]);
	let canvasImageUrl = ref(''); // canvas画布转换成图片的url
	function canvasDrawComplete(url) {
		canvasImageUrl.value = url;
	}
	function downloadCanvasImageUrl() {
		if (!canvasImageUrl.value) return;
		uni.saveImageToPhotosAlbum({
			filePath: canvasImageUrl.value,
			success: () => {
				console.log('保存图片到系统相册成功');
			},
			fail: (err) => {
				console.log('保存图片到系统相册失败', err);
			},
		});
	}
</script>

<style lang="scss" scoped>
	.canvas-mark-box {
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		z-index: 9999;
		@extend %c-box-center;
		flex-direction: column;
		padding: 50prx 30rpx;
		.canvas-btn {
			margin-top: 30rpx;
			padding: 10rpx 30rpx;
			background: #6ef2a3;
			@extend %c-box-center;
			border-radius: 30rpx;
			font-size: 30rpx;
			color: #fff;
			font-weight: 700;
		}
	}
</style>
