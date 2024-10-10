<template>
	<button @click="go2D">去2D</button>
	<div style="padding: 20rpx">
		{{ $t('home.title') }}
	</div>
	<button @click="aa">切换为英文</button>
	<button @click="bb">切换为中文</button>
	<button @click="cc">js访问国际化语言</button>
	<div style="padding: 20rpx">
		<myUpload
			url="https://pmcctestapi.wsandos.com/common/file/upload"
			accept="all"
			:multiple="true"
			maxSize="0.02"
			maxSizeAll="0.2"
			v-model:fileList="fileList"
		></myUpload>
		<button @click="viewFileList">点击查看文件列表</button>
	</div>
	<div style="padding: 20rpx">
		<button @click="timeShow = true">打开日期选择器</button>
		<DateTimePicker
			type="1"
			:itemHeight="50"
			:visibleItemCount="3"
			v-model:timeShow="timeShow"
			v-model:currentTime="currentTime"
			@confirm="handleDateSelected"
		/>
	</div>
	<div style="padding: 20rpx">
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
	</div>
	<div style="padding: 20rpx">
		<carouselCard :list="cardList" :showNum="3" @clickCard="clickCard"> </carouselCard>
	</div>
	<div style="padding: 20rpx">
		<myBanner
			:bannerList="bannerList"
			type="2"
			height="500rpx"
			@clickSwiper="clickSwiper"
		></myBanner>
	</div>
	<div style="padding: 50rpx">
		<myTooltip
			position="left-top"
			:text="tipText"
			width="100%"
			:arrowSize="20"
			background="#eee"
			shadowColor="#2D343E"
			borderColor="#61B765"
			:tipStyle="{
				'border-radius': '30rpx',
				'font-size': '30rpx',
				'font-weight': 700,
				color: '#000',
			}"
		>
			<!-- 默认插槽,自定义内容 -->
			<div class="tip-box">
				<image
					src="https://douleoss.oss-cn-shenzhen.aliyuncs.com/test/66236de1e4b0fb16c4b0c307.jpg"
					mode="scaleToFill"
				/>
				<text>{{ tipText }}</text>
			</div>
		</myTooltip>
	</div>
	<div style="padding: 20rpx; width: 200px">
		<hideText
			:text="text"
			rows="1"
			:labelStyle="{
				display: 'none',
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
			:textareaBoxStyle="{}"
			:textareaStyle="{
				'font-weight': 800,
				'font-size': '30rpx',
				color: '#333',
				'line-height': '2',
			}"
			placeholderStyle="font-weight: 500;font-size: 30rpx;color: #E9D8D4;line-height: 2;"
		></myTextarea>
	</div>
	<div style="padding: 20rpx">
		<myStepper v-model:number="num" :automaticWidth="true"></myStepper>
	</div>
	<div style="padding: 20rpx">
		<myList :isFinish="isFinish" :isNotData="isNotData">
			<!-- 默认插槽:展示数据 -->
			<div class="list-item" v-for="(item, index) in list" :key="index">
				<text>{{ item.name }}</text>
			</div>
			<!-- 数据加载完成插槽 -->
			<!-- <template #finish>数据加载完成了~~~</template> -->
			<!-- 暂无数据插槽 -->
			<!-- <template #notData>暂无数据</template> -->
		</myList>
	</div>
	<myTabbar type="home"></myTabbar>
	<backToTop :pageScrollingDistance="pageScrollingDistance"></backToTop>
</template>

<script setup>
	import { ref, onMounted, computed, watchEffect, getCurrentInstance } from 'vue';
	import { onLoad, onPullDownRefresh, onReachBottom, onPageScroll } from '@dcloudio/uni-app';
	const { proxy } = getCurrentInstance();
	import dayjs from 'dayjs';
	onMounted(() => {
		uni.hideTabBar();
		console.log(dayjs().format('YYYY-MM-DD HH:mm:ss dddd a'));
		getList();
		for (let index = 0; index < 5; index++) {
			cardList.value.push({
				name: `卡片${index + 1}`,
				url: 'https://pic.20988.xyz/2024-08-29/1724899264-903459-preview.jpg',
			});
		}
	});

	function go2D() {
		uni.navigateTo({
			url: '/pages/home/test/test',
		});
	}

	import { changeLocale, getLocaleText } from '@/utils/i18n';
	function aa() {
		changeLocale(proxy, 'en');
	}
	function bb() {
		changeLocale(proxy, 'zh-Hans');
	}
	function cc() {
		let text = getLocaleText(proxy, 'home.title');
		console.log(text);
	}

	import myUpload from './myUpload.vue';
	let fileList = ref([]);
	function viewFileList() {
		console.log('文件列表', fileList.value);
	}

	import DateTimePicker from './DateTimePicker.vue';
	let timeShow = ref(false);
	let currentTime = ref('');
	function handleDateSelected(timestamp, formattedDate) {
		console.log('返回的毫秒数: ', timestamp);
		console.log('返回的格式化后的时间: ', formattedDate);
	}

	import backToTop from './backToTop.vue';
	let pageScrollingDistance = ref(0);
	onPageScroll((e) => {
		pageScrollingDistance.value = Math.ceil(e.scrollTop);
	});

	import myTooltip from './myTooltip.vue';
	let tipText = ref(
		'提示文字提示文字提示文字提示文字提示文字提示文字提示文字提示文字提示文字提示文字提示文字提示文字'
	);

	import carouselCard from './carouselCard.vue';
	let cardList = ref([]);
	function clickCard(card) {
		console.log(card);
	}

	import myBanner from './myBanner.vue';
	let bannerList = ref([
		{
			url: 'https://pic.20988.xyz/2024-08-29/1724899264-903459-preview.jpg',
		},
		{
			url: 'https://pic.20988.xyz/2024-08-29/1724899264-903459-preview.jpg',
		},
		{
			url: 'https://pic.20988.xyz/2024-08-29/1724899264-903459-preview.jpg',
		},
		{
			url: 'https://pic.20988.xyz/2024-08-29/1724899264-903459-preview.jpg',
		},
		{
			url: 'https://pic.20988.xyz/2024-08-29/1724899264-903459-preview.jpg',
		},

		// {
		// 	url: 'http://vjs.zencdn.net/v/oceans.mp4',
		// },
		// {
		// 	url: 'http://vjs.zencdn.net/v/oceans.mp4',
		// },
		// {
		// 	url: 'http://vjs.zencdn.net/v/oceans.mp4',
		// },
	]);
	// 点击轮播图
	function clickSwiper(item) {
		console.log(item);
	}

	import myList from './myList.vue';
	let page = ref(1);
	let limit = ref(5);
	let isFinish = ref(false); // 是否加载完成
	let isNotData = ref(false); // 是否没有数据
	let list = ref([]);
	async function getList() {
		// 模拟发起请求 开始
		let res = [];
		let i = list.value.length;
		for (let index = 0; index < limit.value; index++) {
			res.push({
				id: i + index,
				name: '列表' + (i + index + 1),
			});
		}
		if (list.value.length == 5) {
			res.pop();
		}
		// 模拟发起请求 结束
		list.value.push(...res);
		isFinish.value = res.length < limit.value;
		isNotData.value = list.value.length == 0;
	}
	onReachBottom(() => {
		if (isFinish.value) return;
		page.value++;
		getList();
	});
	onPullDownRefresh(async () => {
		page.value = 1;
		list.value = [];
		await getList();
		uni.stopPullDownRefresh();
	});

	import myStepper from './myStepper.vue';
	let num = ref(5);

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
				url: 'https://douleoss.oss-cn-shenzhen.aliyuncs.com/test/66236de1e4b0fb16c4b0c307.jpg',
			},
		},
		{
			type: 'text', // 绘制类型 文字
			drawOptions: {
				// 绘制位置
				left: 85,
				bottom: 146,
				text: '这是一段测试文本，我会将测试两个字改为其他颜色，其他文字使用指定的文本颜色', // 文本
				maxLine: 3, // 文本最大行数
				maxWidth: 306, // 文本最大宽度
				type: 'fill', // 绘制类型 ： fill：填充，stroke：描边
				fontSize: 30, // 文本大小
				lineHeight: 1.5, // 文本行高
				fillStyle: '#333', // 文本颜色
				italic: false, // 是否斜体
				bold: false, // 是否加粗
				underlineColor: '#FBC21C', // 下划线颜色
				specialTreatment: [
					{
						str: '测',
						color: '#E63241',
					},
					{
						str: '试',
						color: '#1BA035',
					},
				],
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
				italic: true, // 是否斜体
				bold: true, // 是否加粗
				fontFamily: 'cursive', // 字体
				underlineColor: '#E63241', // 是否下划线
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
				uni.showToast({ title: '保存成功', icon: 'none' });
			},
			fail: (err) => {
				uni.showToast({ title: '保存失败', icon: 'none' });
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
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		padding: 50prx 30rpx;
		.canvas-btn {
			margin-top: 30rpx;
			padding: 10rpx 30rpx;
			background: #6ef2a3;
			display: flex;
			justify-content: center;
			align-items: center;
			border-radius: 30rpx;
			font-size: 30rpx;
			color: #fff;
			font-weight: 700;
		}
	}
	.list-item {
		padding: 20rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 30rpx;
		font-weight: 800;
		color: #6ef2a3;
		margin-bottom: 20rpx;
		background: #918f8f;
	}
	.tip-box {
		display: flex;
		image {
			width: 80rpx;
			height: 80rpx;
			border-radius: 50%;
			margin-right: 10rpx;
		}
		text {
			flex: 1;
		}
	}
</style>
