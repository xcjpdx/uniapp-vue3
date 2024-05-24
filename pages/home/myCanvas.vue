<template>
	<div
		class="canvas-box"
		:style="{
			width: props.width + 'rpx',
			height: props.height + 'rpx',
		}"
		@click.stop=""
	>
		<template v-if="canvansWidth && !canvasImageUrl">
			<canvas
				:style="{
					width: canvansWidth + 'px',
					height: canvansHeight + 'px',
				}"
				canvas-id="myCanvas"
				class="myCanvas"
			></canvas>
		</template>
		<image v-if="canvasImageUrl" :src="canvasImageUrl" mode="widthFix" show-menu-by-longpress />
	</div>
</template>

<script setup>
	import { ref, onMounted, computed, watch, getCurrentInstance, nextTick } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	const { proxy } = getCurrentInstance();
	let example = proxy;

	const props = defineProps({
		drawArr: {
			type: Array,
			default: [],
			required: true,
		},
		width: {
			type: Number,
			required: true,
		},
		height: {
			type: Number,
			required: true,
		},
	});

	const emit = defineEmits(['canvasDrawComplete']);

	onMounted(async () => {
		uni.showLoading({ title: '绘制中...' });
		init();
		await startDrawing();
		canvasImageUrl.value = await getCanvasImageUrl();
		emit('canvasDrawComplete', canvasImageUrl.value);
		uni.hideLoading();
	});

	let drawArr = ref('');
	let canvansWidth = ref(0); // 画布宽度
	let canvansHeight = ref(0); // 画布高度
	let ctx = null; // 画布
	let canvasImageUrl = ref(''); // 生成的图片路径

	// 初始化
	function init() {
		drawArr.value = JSON.parse(JSON.stringify(props.drawArr));
		canvansWidth.value = props.width / 2;
		canvansHeight.value = props.height / 2;
		ctx = uni.createCanvasContext('myCanvas', example);
		handleData();
	}

	// 处理数据
	function handleData() {
		// 获取绘制元素的x,y坐标
		for (let index = 0; index < drawArr.value.length; index++) {
			let element = drawArr.value[index];
			switch (element.type) {
				case 'image':
				case 'rect':
					element.drawOptions.width = getWidth(element.drawOptions.width);
					element.drawOptions.height = getHeight(element.drawOptions.height);
					element.drawOptions.x = getX(element.drawOptions);
					element.drawOptions.y = getY(element.drawOptions);
					break;
				case 'arc':
					element.drawOptions.radius = element.drawOptions.radius / 2;
					element.drawOptions.x = getArcX(element.drawOptions);
					element.drawOptions.y = getArcY(element.drawOptions);
					break;
				case 'avatar':
					element.drawOptions.width = getWidth(element.drawOptions.width);
					element.drawOptions.height = getHeight(element.drawOptions.height);
					element.drawOptions.radius = element.drawOptions.width / 2;
					element.drawOptions.x = getArcX(element.drawOptions);
					element.drawOptions.y = getArcY(element.drawOptions);
					break;
				case 'text':
					element.drawOptions.fontSize = element.drawOptions.fontSize / 2 || 16;
					element.drawOptions.maxLine = element.drawOptions.maxLine || 1;
					element.drawOptions.lineHeight = element.drawOptions.lineHeight || 1.2;
					element.drawOptions.italic = element.drawOptions.italic ? 'italic' : 'normal';
					element.drawOptions.bold = element.drawOptions.bold ? 'bold' : 'normal';
					element.drawOptions.fontFamily = element.drawOptions.fontFamily || 'PingFang SC';
					element.drawOptions.maxWidth = element.drawOptions.maxWidth / 2 || canvansWidth.value;
					break;
			}
		}
	}

	function getWidth(width) {
		if (typeof width === 'number') {
			return width / 2;
		} else {
			return canvansWidth.value * (width.match(/\d+/)[0] / 100);
		}
	}
	function getHeight(height) {
		if (typeof height === 'number') {
			return height / 2;
		} else {
			return canvansHeight.value * (height.match(/\d+/)[0] / 100);
		}
	}
	function getX(drawOptions) {
		let { left, right, width } = drawOptions;
		let x = '';
		if (left || left === 0) {
			if (typeof left === 'number') {
				x = left / 2;
			} else {
				x = canvansWidth.value / 2 - width / 2;
			}
		} else {
			x = canvansWidth.value - (right / 2 + width);
		}
		return x;
	}
	function getY(drawOptions) {
		let { top, bottom, height } = drawOptions;
		let y = '';
		if (top || top === 0) {
			if (typeof top === 'number') {
				y = top / 2;
			} else {
				y = canvansHeight.value / 2 - height / 2;
			}
		} else {
			y = canvansHeight.value - (bottom / 2 + height);
		}
		return y;
	}
	function getArcX(drawOptions) {
		let { left, right, radius } = drawOptions;
		let x = '';
		if (left || left === 0) {
			if (typeof left === 'number') {
				x = left / 2 + radius;
			} else {
				x = canvansWidth.value / 2;
			}
		} else if (left === 0) {
			x = radius;
		} else {
			x = canvansWidth.value - (right / 2 + radius);
		}
		return x;
	}
	function getArcY(drawOptions) {
		let { top, bottom, radius } = drawOptions;
		let y = '';
		if (top) {
			if (typeof top === 'number') {
				y = top / 2 + radius;
			} else {
				y = canvansHeight.value / 2;
			}
		} else if (top === 0) {
			y = radius;
		} else {
			y = canvansHeight.value - (bottom / 2 + radius);
		}
		return y;
	}

	// 开始绘制
	async function startDrawing() {
		for (let index = 0; index < drawArr.value.length; index++) {
			const element = drawArr.value[index];
			await draw(element);
		}
	}

	// 绘制
	async function draw(data) {
		switch (data.type) {
			case 'image':
				let imageUrl = await getUrl(data.drawOptions.url);
				drawImage(data, imageUrl);
				break;
			case 'text':
				drawText(data);
				break;
			case 'rect':
				drawRect(data);
				break;
			case 'arc':
				drawArc(data);
				break;
			case 'avatar':
				let avatarUrl = await getUrl(data.drawOptions.url);
				drawAvatar(data, avatarUrl);
				break;
		}
	}

	// 获取图片url
	function getUrl(url) {
		return new Promise((resolve, reject) => {
			uni.downloadFile({
				url: url,
				success: (res) => {
					resolve(res.tempFilePath);
				},
			});
		});
	}

	// 绘制图片
	function drawImage(data, url) {
		ctx.save();
		let { x, y, width, height } = data.drawOptions;
		ctx.drawImage(url, x, y, width, height);
		ctx.draw(true);
		ctx.restore();
	}

	// 绘制矩形
	function drawRect(data) {
		ctx.save();
		let { x, y, width, height, type, fillStyle, strokeStyle, isFillet, radius } = data.drawOptions;
		// 绘制圆角
		if (isFillet) {
			ctx.beginPath();
			switch (type) {
				case 'fill':
					// ctx.fillStyle = 'transparent';
					ctx.fillStyle = fillStyle;
					break;
				case 'stroke':
					// ctx.strokeStyle = 'transparent';
					ctx.strokeStyle = strokeStyle;
					break;
			}
			// 左上角
			ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 1.5);
			// 右上角
			ctx.arc(x + width - radius, y + radius, radius, Math.PI * 1.5, Math.PI * 2);
			// 右下角
			ctx.arc(x + width - radius, y + height - radius, radius, 0, Math.PI * 0.5);
			// 左下角
			ctx.arc(x + radius, y + height - radius, radius, Math.PI * 0.5, Math.PI);
			ctx.closePath();
			switch (type) {
				case 'fill':
					ctx.fill();
					break;
				case 'stroke':
					ctx.stroke();
					break;
			}
			ctx.clip();
		}
		// 绘制矩形
		switch (type) {
			case 'fill':
				ctx.fillStyle = fillStyle;
				ctx.fillRect(x, y, width, height);
				break;
			case 'stroke':
				ctx.strokeStyle = strokeStyle;
				ctx.strokeRect(x, y, width, height);
				break;
		}
		ctx.draw(true);
		ctx.restore();
	}

	// 绘制圆
	function drawArc(data) {
		ctx.save();
		let { x, y, radius, type, fillStyle, strokeStyle } = data.drawOptions;
		switch (type) {
			case 'fill':
				ctx.fillStyle = fillStyle;
				ctx.arc(x, y, radius, 0, Math.PI * 2);
				ctx.fill();
				break;
			case 'stroke':
				ctx.strokeStyle = strokeStyle;
				ctx.arc(x, y, radius, 0, Math.PI * 2);
				ctx.stroke();
				break;
		}
		ctx.draw(true);
		ctx.restore();
	}

	// 绘制头像(背景是一个圆)
	function drawAvatar(data, url) {
		ctx.save();
		let { x, y, width, height, radius, type, fillStyle, strokeStyle } = data.drawOptions;
		// 绘制背景圆
		switch (type) {
			case 'fill':
				ctx.fillStyle = fillStyle;
				ctx.arc(x, y, radius, 0, Math.PI * 2);
				ctx.fill();
				break;
			case 'stroke':
				ctx.strokeStyle = strokeStyle;
				ctx.arc(x, y, radius, 0, Math.PI * 2);
				ctx.stroke();
				break;
		}
		ctx.clip();
		// 绘制头像图片
		ctx.drawImage(url, x - radius, y - radius, width, height);
		ctx.draw(true);
		ctx.restore();
	}

	// 绘制文字
	function drawText(data) {
		ctx.save();
		let {
			text,
			maxLine,
			maxWidth,
			type,
			fontSize,
			lineHeight,
			fillStyle,
			strokeStyle,
			italic,
			bold,
			fontFamily,
		} = data.drawOptions;
		ctx.font = `${italic} ${bold} ${fontSize}px ${fontFamily}`;
		// 兼容部分iOS设备字号不生效问题
		ctx.setFontSize(fontSize);

		data.drawOptions.x = getTextX(data.drawOptions);
		data.drawOptions.y = getTextY(data.drawOptions);
		let { x, y } = data.drawOptions;

		switch (type) {
			case 'fill':
				ctx.fillStyle = fillStyle;
				let handleTextFill = textHandle(text, maxLine, maxWidth);
				for (let i = 0; i < handleTextFill.length; i++) {
					ctx.fillText(handleTextFill[i], x, y + (i + 1) * (fontSize * lineHeight));
				}
				break;
			case 'stroke':
				ctx.strokeStyle = strokeStyle;
				let handleTextStroke = textHandle(text, maxLine, maxWidth);
				for (let i = 0; i < handleTextStroke.length; i++) {
					ctx.strokeText(handleTextStroke[i], x, y + (i + 1) * (fontSize * lineHeight));
				}
				break;
		}
		ctx.draw(true);
		ctx.restore();
	}
	// 文本处理
	function textHandle(text, maxLine, maxWidth) {
		let rowLength = 0;
		let textStr = '';
		let textArr = [];
		for (let index = 0; index < text.length; index++) {
			if (textArr.length > maxLine) break;
			const t = text[index];
			rowLength += ctx.measureText(t).width;
			textStr += t;
			if (rowLength == maxWidth) {
				textArr.push(textStr);
				textStr = '';
				rowLength = 0;
			} else if (rowLength > maxWidth) {
				textStr = textStr.slice(0, -1);
				textArr.push(textStr);
				textStr = '';
				rowLength = 0;
			}
		}
		textArr.push(textStr);
		if (textArr.length > maxLine) {
			textArr[maxLine - 1] = textArr[maxLine - 1].slice(0, -1) + '...';
			textArr = textArr.slice(0, maxLine);
		}
		return textArr;
	}
	function getTextX(drawOptions) {
		let { left, right, text, maxLine, maxWidth } = drawOptions;
		let x = '';
		if (left || left === 0) {
			if (typeof left === 'number') {
				x = left / 2;
			} else {
				let rowLength = getTextWidth(text, maxLine, maxWidth);
				x = canvansWidth.value / 2 - rowLength / 2;
			}
		} else {
			let rowLength = getTextWidth(text, maxLine, maxWidth);
			x = canvansWidth.value - (right / 2 + rowLength);
		}
		function getTextWidth(text, maxLine, maxWidth) {
			let textArr = textHandle(text, maxLine, maxWidth);
			let textItem = textArr[0];
			let rowLength = 0;
			for (let index = 0; index < textItem.length; index++) {
				const t = textItem[index];
				rowLength += ctx.measureText(t).width;
			}
			rowLength = Math.floor(rowLength);
			if (rowLength > maxWidth) {
				rowLength = maxWidth;
			}
			return rowLength;
		}
		return x;
	}
	function getTextY(drawOptions) {
		let { top, bottom, text, fontSize, lineHeight, maxLine, maxWidth } = drawOptions;
		let y = '';
		if (top || top === 0) {
			if (typeof top === 'number') {
				y = top / 2;
			} else {
				let textHeight = getTextHeight(text, maxLine, maxWidth, fontSize, lineHeight);
				y = canvansHeight.value / 2 - textHeight / 2;
			}
		} else {
			let textHeight = getTextHeight(text, maxLine, maxWidth, fontSize, lineHeight);
			y = canvansHeight.value - (bottom / 2 + textHeight);
		}
		function getTextHeight(text, maxLine, maxWidth, fontSize, lineHeight) {
			let textArr = textHandle(text, maxLine, maxWidth);
			let textHeight = textArr.length * (fontSize * lineHeight);
			return textHeight;
		}
		return y;
	}

	// 下载图片
	function getCanvasImageUrl() {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				uni.canvasToTempFilePath(
					{
						canvasId: 'myCanvas',
						success: (res) => {
							// console.log('转换图片成功', res.tempFilePath);
							resolve(res.tempFilePath);
						},
						fail: (err) => {
							console.error('转换图片失败', err);
							reject(err);
						},
					},
					example
				);
			}, 300);
		});
	}
</script>

<style lang="scss" scoped>
	.canvas-box {
		position: relative;
		.myCanvas {
			position: absolute;
			left: -200%;
			top: -200%;
		}
		image {
			width: 100%;
			height: 100%;
		}
	}
</style>
