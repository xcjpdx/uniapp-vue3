<template>
	<view class="main-box">
		<view class="title" @click="clickSave">保存</view>
		<view class="edit" @click="clickEdit">
			<view class="edit-box">
				<view
					class="edit-region"
					:style="{ border: currentIndex > -1 ? '1px dashed #21beee' : '' }"
				>
					<view
						v-for="(item, index) in elementList"
						:key="index"
						class="sourceMaterial"
						:style="{
							transform: `translate(${item.x}px, ${item.y}px) rotate(${item.angle}deg)`,
							zIndex: item.level,
						}"
						@click.stop="startEdit(index)"
					>
						<image
							id="image"
							:style="{ width: `${item.toolWidth}px`, height: `${item.toolHeight}px` }"
							:src="item.sourceMaterial"
							v-if="item.type === 'image'"
						/>
						<text
							id="text"
							:style="{
								'font-family': item.config.fontFamily,
								color: item.config.color,
								'font-weight': item.config.fontWeight ? 'bold' : 'normal',
								'font-style': item.config.italic ? 'italic' : 'normal',
								'border-bottom': item.config.textDecoration ? '1px solid #000' : '',
								'padding-bottom': item.config.textDecoration ? '5px' : '',
								'font-size': `${item.config.fontSize}px`,
								'writing-mode': item.config.writingDirection,
								'letter-spacing': `${item.config.letterSpacing}px`,
								'text-align': item.config.textAlign,
								transform: `rotateX(${item.config.xFlip ? '180deg' : '0deg'}) rotateY(${
									item.config.yFlip ? '180deg' : '0deg'
								});`,
							}"
							v-if="item.type === 'text'"
							>{{ item.sourceMaterial }}</text
						>
					</view>
				</view>
				<template v-if="currentIndex > -1">
					<div class="edit-region-tool">
						<div
							class="edit-region-tool-box"
							:style="{
								transform: `translate(${elementList[currentIndex].x}px, ${elementList[currentIndex].y}px) rotate(${elementList[currentIndex].angle}deg)`,
							}"
							@click.stop="startEdit(currentIndex)"
							@touchstart="(e) => onTouchStart(e, currentIndex)"
							@touchmove="(e) => onTouchMove(e, currentIndex)"
							@touchend="onTouchEnd"
						>
							<view class="tip-delete" @click.stop="deleteSourceMaterial(currentIndex)">
								<up-icon name="close" color="#000" size="16rpx"></up-icon>
							</view>
							<view
								class="tip-rotate"
								@touchstart="(e) => startRotate(e, currentIndex)"
								@touchmove="(e) => rotateSourceMaterial(e, currentIndex)"
								@touchend="onTouchEnd"
							>
								<up-icon name="reload" color="#000" size="16rpx"></up-icon>
							</view>
							<view
								class="tip-scale"
								@touchstart="(e) => startScale(e, currentIndex)"
								@touchmove="(e) => scaleSourceMaterial(e, currentIndex)"
								@touchend="onTouchEnd"
							>
								<up-icon name="level" color="#000" size="16rpx"></up-icon>
							</view>
							<view
								class="tip-operation"
								@click.stop="operation(elementList[currentIndex], currentIndex)"
								>{{ elementList[currentIndex].type === 'image' ? '替换' : '编辑' }}</view
							>
							<image
								id="image"
								:style="{
									width: `${elementList[currentIndex].toolWidth}px`,
									height: `${elementList[currentIndex].toolHeight}px`,
								}"
								:src="elementList[currentIndex].sourceMaterial"
								v-if="elementList[currentIndex].type === 'image'"
							/>
							<text
								id="text"
								:style="{
									'font-family': elementList[currentIndex].config.fontFamily,
									color: elementList[currentIndex].config.color,
									'font-weight': elementList[currentIndex].config.fontWeight ? 'bold' : 'normal',
									'font-style': elementList[currentIndex].config.italic ? 'italic' : 'normal',
									'border-bottom': elementList[currentIndex].config.textDecoration
										? '1px solid #000'
										: '',
									'padding-bottom': elementList[currentIndex].config.textDecoration ? '5px' : '',
									'font-size': `${elementList[currentIndex].config.fontSize}px`,
									'writing-mode': elementList[currentIndex].config.writingDirection,
									'letter-spacing': `${elementList[currentIndex].config.letterSpacing}px`,
									'text-align': elementList[currentIndex].config.textAlign,
									transform: `rotateX(${
										elementList[currentIndex].config.xFlip ? '180deg' : '0deg'
									}) rotateY(${elementList[currentIndex].config.yFlip ? '180deg' : '0deg'});`,
								}"
								v-if="elementList[currentIndex].type === 'text'"
								>{{ elementList[currentIndex].sourceMaterial }}</text
							>
						</div>
					</div>
				</template>
			</view>
		</view>
		<view class="tool-box" v-if="!toolSourcePopup && !toolTextPopup">
			<view @click.stop="clickToolSource">素材</view>
			<view @click.stop="clickToolText">文字</view>
			<view @click.stop="clickToolImage">图片</view>
		</view>
		<!-- 工具栏素材弹窗 占位 -->
		<view v-if="toolSourcePopup" :style="{ height: '50%', width: '100%' }"></view>
		<!-- 工具栏素材弹窗 -->
		<div>
			<up-popup :show="toolSourcePopup" mode="bottom" :overlay="false" round="30rpx">
				<view class="tool-source-popup">
					<view class="tool-source-title">素材</view>
					<view class="tool-source-tabs1">
						<view
							class="tool-source-tab1"
							:class="{ 'tool-source-tab1-active': toolSourcetab1 === item.id }"
							:style="{ 'margin-right': index === toolSourceTabList1.length - 1 ? '0' : '' }"
							v-for="(item, index) in toolSourceTabList1"
							:key="index"
							@click="changeToolSourcetab1(item.id)"
						>
							{{ item.name }}
						</view>
					</view>
					<view class="tool-source-tabs2">
						<view
							class="tool-source-tab2"
							:class="{ 'tool-source-tab2-active': toolSourcetab2 === item.id }"
							:style="{ 'margin-right': index === toolSourceTabList2.length - 1 ? '0' : '' }"
							v-for="(item, index) in toolSourceTabList2"
							:key="index"
							@click="changeToolSourcetab2(item.id)"
						>
							{{ item.name }}
						</view>
					</view>
					<view class="tool-source-list">
						<view
							class="tool-source-item"
							v-for="(item, index) in toolSourceList"
							:key="index"
							@click="addSourceMaterial(item)"
						>
							<image :src="item.sourceMaterial" mode="scaleToFill" />
						</view>
					</view>
				</view>
			</up-popup>
		</div>
		<!-- 工具栏文本弹窗 占位 -->
		<view v-if="toolTextPopup" :style="{ height: '50%', width: '100%' }"></view>
		<!-- 工具栏文本弹窗 -->
		<div>
			<up-popup :show="toolTextPopup" mode="bottom" :overlay="false" round="30rpx">
				<view class="tool-text-popup">
					<view class="tool-text-title">
						<textarea
							v-model="toolTextTitle"
							@input="toolTextTitleInput"
							placeholder="请输入文案"
						/>
						<div class="tool-text-title-icon" @click="clickEdit">
							<up-icon name="checkbox-mark" color="#000" size="28"></up-icon>
						</div>
					</view>
					<view class="tool-text-tabs">
						<view
							class="tool-text-tab"
							:class="{ 'tool-text-tab-active': toolTextTab === item.id }"
							:style="{ 'margin-right': index === toolTextTabList.length - 1 ? '0' : '' }"
							v-for="(item, index) in toolTextTabList"
							:key="index"
							@click="toolTextTab = item.id"
						>
							{{ item.name }}
						</view>
					</view>
					<template v-if="toolTextTab === 1">
						<view class="tool-text-Typeface-list">
							<view
								class="tool-text-Typeface"
								:style="{ border: toolTextTypeface === item.id ? '1px solid #40cef1' : '' }"
								v-for="(item, index) in toolTextTypefaceList"
								:key="index"
								@click="changeTypeFace(item.id)"
								>{{ item.name }}</view
							>
						</view>
					</template>
					<template v-if="toolTextTab === 2">
						<view class="tool-text-color-list">
							<view
								v-for="(item, index) in toolTextColorList"
								:key="index"
								@click="changeColor(item.id)"
							>
								<view
									class="tool-text-color-active"
									:style="{ border: `1px solid ${item.value}` }"
									v-if="toolTextColor === item.id"
								>
									<view
										class="tool-text-color-active-box"
										:style="{ background: item.value }"
									></view>
								</view>
								<view class="tool-text-color" :style="{ background: item.value }" v-else></view>
							</view>
						</view>
						<view class="tool-text-config">
							<view
								class="tool-text-config-item"
								:class="{ 'tool-text-config-item-active': toolTextFontWeight }"
								@click="changeFontWeight"
								>加粗
							</view>
							<view
								class="tool-text-config-item"
								:class="{ 'tool-text-config-item-active': toolTextItalic }"
								@click="changeItalic"
								>倾斜
							</view>
							<view
								class="tool-text-config-item"
								:class="{ 'tool-text-config-item-active': toolTextDecoration }"
								@click="changeTextDecoration"
								>下划线
							</view>
							<view
								class="tool-text-config-item"
								@click="changeTextWritingDirection('horizontal-tb')"
								>水平书写
							</view>
							<view class="tool-text-config-item" @click="changeTextWritingDirection('vertical-lr')"
								>垂直书写
							</view>
							<view class="tool-text-config-item" @click="changeTextFlip('x')"> 水平翻转 </view>
							<view class="tool-text-config-item" @click="changeTextFlip('y')"> 垂直翻转 </view>
							<view class="tool-text-config-item" @click="changeTextFontSize('add')"
								>字号加大
							</view>
							<view class="tool-text-config-item" @click="changeTextFontSize('reduce')"
								>字号减小
							</view>
							<view class="tool-text-config-item" @click="changeTextSpacing('add')">间距加大 </view>
							<view class="tool-text-config-item" @click="changeTextSpacing('reduce')"
								>间距减小
							</view>
							<view class="tool-text-config-item" @click="changeTextAlign('left')"> 左对齐 </view>
							<view class="tool-text-config-item" @click="changeTextAlign('center')">
								居中对齐
							</view>
							<view class="tool-text-config-item" @click="changeTextAlign('right')">右对齐 </view>
						</view>
					</template>
				</view>
			</up-popup>
		</div>
	</view>
</template>

<script setup>
	import { ref, watch, onMounted, nextTick } from 'vue';

	// 保存
	function clickSave() {}

	function clickEdit() {
		currentIndex.value = -1;
		toolSourcePopup.value = false;
		toolTextPopup.value = false;
		elementList.value = elementList.value.filter((item) => item.sourceMaterial !== '');
	}

	let editRegionInfo = '';
	// 获取编辑区域信息
	function getEditRegionInfo() {
		return new Promise(async (resolve, reject) => {
			await nextTick();
			let query = uni.createSelectorQuery();
			query.select('.edit-region').boundingClientRect();
			query.exec((res) => {
				// console.log('编辑区域信息', res[0]);
				editRegionInfo = res[0];
				resolve();
			});
		});
	}

	const currentIndex = ref(-1);

	let initialAngle = 0; // 初始旋转角度
	let initialDistance = 0; // 初始缩放距离
	let centerX = 0; // 中心点X
	let centerY = 0; // 中心点Y

	let initialTouchX = 0; // 初始触摸X坐标
	let initialTouchY = 0; // 初始触摸Y坐标
	let initialX = 0; // 素材初始X位置
	let initialY = 0; // 素材初始Y位置

	let isRotatingOrScaling = false; // 标记当前是否正在旋转或缩放

	const elementList = ref([]);

	watch(
		() => elementList.value.length,
		async (val) => {
			getTextInfo();
			if (!val) {
				clickEdit();
				setTimeout(() => {
					currentIndex.value = -1;
				}, 500);
			}
		}
		// { immediate: true }
	);
	// 获取文字元素的宽高
	function getTextInfo() {
		return new Promise(async (resolve, reject) => {
			await nextTick();
			let query = uni.createSelectorQuery();
			query.selectAll('#text').boundingClientRect();
			query.exec((res) => {
				let arr = res[0];
				if (arr.length) {
					let indexArr = [];
					elementList.value.forEach((item, index) => {
						if (item.type === 'text') {
							indexArr.push(index);
						}
					});
					indexArr.forEach((item, index) => {
						elementList.value[item].width = arr[index].width;
						elementList.value[item].height = arr[index].height;
					});
				}
				resolve();
			});
		});
	}

	// 删除素材
	function deleteSourceMaterial(index) {
		let type = elementList.value[index].type;
		elementList.value.splice(index, 1);
		if (type == 'text') {
			clickEdit();
		}
		let nextIndex = elementList.value.length - 1;
		currentIndex.value = nextIndex;
		if (nextIndex > -1) {
			startEdit(nextIndex);
		}
	}

	// 开始编辑
	async function startEdit(index) {
		await getEditRegionInfo();
		currentIndex.value = index;
	}

	// 计算角度
	function calculateAngle(x1, y1, x2, y2) {
		return Math.atan2(y1 - y2, x1 - x2) * (180 / Math.PI);
	}

	// 计算距离
	function calculateDistance(x1, y1, x2, y2) {
		return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
	}

	let load = false; // 节流使用的标记
	let loadTime = 20;

	// 开始移动
	function onTouchStart(e, index) {
		if (currentIndex.value != index) return;
		if (e.touches.length === 1 && !isRotatingOrScaling) {
			// 如果没有正在旋转或缩放
			const touch = e.touches[0];
			const item = elementList.value[index];
			initialTouchX = touch.pageX;
			initialTouchY = touch.pageY;
			initialX = item.x;
			initialY = item.y;
		}
	}

	// 移动素材
	function onTouchMove(e, index) {
		if (currentIndex.value != index) return;

		// if (load) return;
		// load = true;
		// setTimeout(() => {
		// 	load = false;
		// }, loadTime);

		if (e.touches.length === 1 && !isRotatingOrScaling) {
			// 如果没有正在旋转或缩放
			const touch = e.touches[0];
			const item = elementList.value[index];
			const deltaX = touch.pageX - initialTouchX;
			const deltaY = touch.pageY - initialTouchY;
			item.x = initialX + deltaX;
			item.y = initialY + deltaY;
		}
	}

	// 处理触摸结束事件
	function onTouchEnd() {
		isRotatingOrScaling = false; // 触摸结束，取消旋转或缩放标记
	}

	// 开始旋转
	async function startRotate(e, index) {
		if (e.touches.length === 1) {
			const touch = e.touches[0];
			const item = elementList.value[index];
			// 计算中心点时考虑 .edit-region 的偏移量
			centerX = item.x + parseFloat(item.width) / 2 + editRegionInfo.left;
			centerY = item.y + parseFloat(item.height) / 2 + editRegionInfo.top;
			initialAngle = calculateAngle(touch.pageX, touch.pageY, centerX, centerY);
			isRotatingOrScaling = true; // 标记为旋转或缩放中
		}
	}

	// 旋转素材
	function rotateSourceMaterial(e, index) {
		// if (load) return;
		// load = true;
		// setTimeout(() => {
		// 	load = false;
		// }, loadTime);
		if (e.touches.length === 1) {
			const touch = e.touches[0];
			const item = elementList.value[index];
			const currentAngle = calculateAngle(touch.pageX, touch.pageY, centerX, centerY);
			item.angle += currentAngle - initialAngle;
			initialAngle = currentAngle; // 更新初始角度
		}
	}

	// 开始缩放
	function startScale(e, index) {
		if (e.touches.length === 1) {
			const touch = e.touches[0];
			const item = elementList.value[index];
			// 计算中心点时考虑 .edit-region 的偏移量
			centerX = item.x + parseFloat(item.width) / 2 + editRegionInfo.left;
			centerY = item.y + parseFloat(item.height) / 2 + editRegionInfo.top;
			initialDistance = calculateDistance(touch.pageX, touch.pageY, centerX, centerY);
			isRotatingOrScaling = true; // 标记为旋转或缩放中
		}
	}

	// 缩放素材
	function scaleSourceMaterial(e, index) {
		if (e.touches.length === 1) {
			const touch = e.touches[0];
			const item = elementList.value[index];
			const currentDistance = calculateDistance(touch.pageX, touch.pageY, centerX, centerY);
			// 调整缩放因子的计算，增加缩放的灵敏度
			const scaleFactor = currentDistance / initialDistance;
			// 控制缩放范围
			item.scale *= scaleFactor;
			// 更新初始距离，防止缩放过快或过慢
			initialDistance = currentDistance;

			let oldToolWidth = item.toolWidth;
			let oldToolHeight = item.toolHeight;
			item.toolWidth = item.width * item.scale;
			item.toolHeight = item.height * item.scale;
			item.x = item.x - (item.toolWidth - oldToolWidth) / 2;
			item.y = item.y - (item.toolHeight - oldToolHeight) / 2;
		}
	}

	// 操作素材
	async function operation(item, index) {
		if (item.type == 'text' && toolTextPopup.value) return;
		currentIndex.value = index;
		if (item.type === 'image') {
			// 编辑图片
			uni.chooseImage({
				count: 1,
				success: (res) => {
					elementList.value[index].sourceMaterial = res.tempFilePaths[0];
				},
			});
		} else if (item.type === 'text') {
			if (toolTextTabList.value.length == 0) {
				await getToolTextTabList();
				await getToolTextTypefaceList();
				await getToolTextColorList();
			}
			// 编辑文字
			textConfigEcho(item);
			toolTextPopup.value = true;
			getEditRegionInfo();
		}
	}

	const toolSourceTabList1 = ref([]); // 工具栏素材tabs列表
	const toolSourcetab1 = ref('');
	async function getToolSourceTabList1() {
		toolSourceTabList1.value = [
			{
				name: '潮流',
				id: 1,
			},
			{
				name: '字符',
				id: 2,
			},
			{
				name: '背景',
				id: 3,
			},
			{
				name: '可爱',
				id: 4,
			},
			{
				name: '复古',
				id: 5,
			},
			{
				name: '动物',
				id: 6,
			},
		];
		toolSourcetab1.value = toolSourceTabList1.value[0].id;
	}
	function changeToolSourcetab1(id) {
		toolSourcetab1.value = id;
		getToolSourceTabList2();
	}
	const toolSourceTabList2 = ref([]); // 工具栏素材tabs列表
	const toolSourcetab2 = ref('');
	async function getToolSourceTabList2() {
		toolSourceTabList2.value = [
			{
				name: '潮流',
				id: 1,
			},
			{
				name: '字符',
				id: 2,
			},
			{
				name: '背景',
				id: 3,
			},
			{
				name: '可爱',
				id: 4,
			},
			{
				name: '复古',
				id: 5,
			},
			{
				name: '动物',
				id: 6,
			},
		];
		toolSourcetab2.value = toolSourceTabList2.value[0].id;
	}
	function changeToolSourcetab2(id) {
		toolSourcetab2.value = id;
		getToolSourceList();
	}
	const toolSourceList = ref([]); // 工具栏素材列表
	// 获取工具栏的素材
	async function getToolSourceList() {
		toolSourceList.value = [
			{
				type: 'image',
				sourceMaterial: 'https://pic.20988.xyz/2024-08-29/1724898997-618191-preview.jpg',
				width: 50,
				height: 50,
				x: 0,
				y: 0,
				scale: 1,
				angle: 0,
				level: 1,
			},
			{
				type: 'image',
				sourceMaterial: 'https://pic.20988.xyz/2024-08-29/1724899203-990813-preview.jpg',
				width: 50,
				height: 50,
				x: 0,
				y: 0,
				scale: 1,
				angle: 0,
				level: 1,
			},
			{
				type: 'image',
				sourceMaterial: 'https://pic.20988.xyz/2024-08-29/1724899216-718613-preview.jpg',
				width: 50,
				height: 50,
				x: 0,
				y: 0,
				scale: 1,
				angle: 0,
				level: 1,
			},
			{
				type: 'image',
				sourceMaterial: 'https://pic.20988.xyz/2024-08-29/1724899230-598238-preview.jpg',
				width: 50,
				height: 50,
				x: 0,
				y: 0,
				scale: 1,
				angle: 0,
				level: 1,
			},
			{
				type: 'image',
				sourceMaterial: 'https://pic.20988.xyz/2024-08-29/1724899247-834425-preview.jpg',
				width: 50,
				height: 50,
				x: 0,
				y: 0,
				scale: 1,
				angle: 0,
				level: 1,
			},
			{
				type: 'image',
				sourceMaterial: 'https://pic.20988.xyz/2024-08-29/1724899264-903459-preview.jpg',
				width: 50,
				height: 50,
				x: 0,
				y: 0,
				scale: 1,
				angle: 0,
				level: 1,
			},
		];
	}
	const toolSourcePopup = ref(false); // 工具栏素材弹窗
	// 点击工具栏的素材
	async function clickToolSource() {
		if (toolSourceTabList1.value.length == 0) {
			await getToolSourceTabList1();
			await getToolSourceTabList2();
			await getToolSourceList();
		}
		currentIndex.value = -1;
		toolSourcePopup.value = true;
	}
	// 添加素材
	async function addSourceMaterial(item) {
		let level = 0;
		if (elementList.value.length) {
			level = elementList.value[elementList.value.length - 1].level + 1;
		} else {
			level = 1;
		}
		await getEditRegionInfo();
		let x = 0;
		let y = 0;
		x = editRegionInfo.width / 2 - item.width / 2;
		y = editRegionInfo.height / 2 - item.height / 2;

		elementList.value.push({
			...item,
			level,
			x,
			y,
			toolWidth: item.width,
			toolHeight: item.height,
		});

		await nextTick();
		currentIndex.value = elementList.value.length - 1;
	}

	const toolTextTabList = ref([]); // 工具栏文字tabs列表
	const toolTextTab = ref('');
	async function getToolTextTabList() {
		toolTextTabList.value = [
			{
				name: '字体',
				id: 1,
			},
			{
				name: '样式',
				id: 2,
			},
		];
		toolTextTab.value = toolTextTabList.value[0].id;
	}
	const toolTextTypefaceList = ref([]); // 工具栏文字字体列表
	const toolTextTypeface = ref('');
	async function getToolTextTypefaceList() {
		toolTextTypefaceList.value = [
			{
				value: 'Source Han Sans SC',
				id: 1,
				name: '字体1',
			},
			{
				value: 'Source Han Sans SC',
				id: 2,
				name: '字体2',
			},
			{
				value: 'Source Han Sans SC',
				id: 3,
				name: '字体3',
			},
			{
				value: 'Source Han Sans SC',
				id: 4,
				name: '字体4',
			},
			{
				value: 'Source Han Sans SC',
				id: 5,
				name: '字体5',
			},
			{
				value: 'Source Han Sans SC',
				id: 6,
				name: '字体6',
			},
		];
		toolTextTypeface.value = toolTextTypefaceList.value[0].id;
	}
	function changeTypeFace(id) {
		toolTextTypeface.value = id;
		let data = elementList.value[currentIndex.value];
		data.config.fontFamily = toolTextTypefaceList.value.find((item) => item.id == id).value;
	}
	const toolTextColorList = ref([]); // 工具栏文字颜色列表
	const toolTextColor = ref('');
	async function getToolTextColorList() {
		toolTextColorList.value = [
			{
				id: 1,
				value: '#000000',
			},
			{
				id: 2,
				value: '#ffffff',
			},
			{
				id: 3,
				value: '#ff0000',
			},
		];
		toolTextColor.value = toolTextColorList.value[0].id;
	}
	function changeColor(id) {
		toolTextColor.value = id;
		let data = elementList.value[currentIndex.value];
		data.config.color = toolTextColorList.value.find((item) => item.id == id).value;
	}
	const toolTextFontWeight = ref(false); // 工具栏文字是否加粗
	function changeFontWeight() {
		toolTextFontWeight.value = !toolTextFontWeight.value;
		let data = elementList.value[currentIndex.value];
		data.config.fontWeight = toolTextFontWeight.value;
	}
	const toolTextItalic = ref(false); // 工具栏文字是否倾斜
	function changeItalic() {
		toolTextItalic.value = !toolTextItalic.value;
		let data = elementList.value[currentIndex.value];
		data.config.italic = toolTextItalic.value;
	}
	const toolTextDecoration = ref(false); // 工具栏文字底部是否有下划线
	function changeTextDecoration() {
		toolTextDecoration.value = !toolTextDecoration.value;
		let data = elementList.value[currentIndex.value];
		data.config.textDecoration = toolTextDecoration.value;
	}
	const toolTextFontSize = ref(16); // 工具栏文字大小
	async function changeTextFontSize(type) {
		if (type == 'add') {
			toolTextFontSize.value = toolTextFontSize.value + 2;
		} else {
			toolTextFontSize.value = toolTextFontSize.value - 2;
		}
		let data = elementList.value[currentIndex.value];
		data.config.fontSize = toolTextFontSize.value;
		if (data.isEdit) {
			updateTextPosition(data);
		} else {
			updateTextPositionCenter(data);
		}
	}
	const toolTextWritingDirection = ref(''); // 工具栏文字书写方向 horizontal-tb(水平) vertical-lr(垂直)
	async function changeTextWritingDirection(type) {
		if (toolTextWritingDirection.value == type) return;
		toolTextWritingDirection.value = type;
		let data = elementList.value[currentIndex.value];
		data.config.writingDirection = toolTextWritingDirection.value;
		if (data.isEdit) {
			updateTextPosition(data);
		} else {
			updateTextPositionCenter(data);
		}
	}
	const toolTextSpacing = ref(0); // 工具栏文字之间的间距
	async function changeTextSpacing(type) {
		if (type == 'add') {
			toolTextSpacing.value = toolTextSpacing.value + 2;
		} else {
			toolTextSpacing.value = toolTextSpacing.value - 2;
		}
		let data = elementList.value[currentIndex.value];
		data.config.letterSpacing = toolTextSpacing.value;
		if (data.isEdit) {
			updateTextPosition(data);
		} else {
			updateTextPositionCenter(data);
		}
	}
	const toolTextAlign = ref('center'); // 工具栏文字对齐方式 left(左对齐) center(居中) right(右对齐)
	function changeTextAlign(type) {
		if (toolTextAlign.value == type) return;
		toolTextAlign.value = type;
		let data = elementList.value[currentIndex.value];
		data.config.textAlign = toolTextAlign.value;
	}
	const toolTextXFlip = ref(false); // 工具栏文字水平翻转
	const toolTextYFlip = ref(false); // 工具栏文字垂直翻转
	function changeTextFlip(type) {
		let data = elementList.value[currentIndex.value];
		if (type == 'x') {
			toolTextXFlip.value = !toolTextXFlip.value;
			data.config.xFlip = toolTextXFlip.value;
		} else {
			toolTextYFlip.value = !toolTextYFlip.value;
			data.config.yFlip = toolTextYFlip.value;
		}
	}
	const toolTextPopup = ref(false); // 工具栏素材弹窗
	// 点击工具栏的文字
	async function clickToolText() {
		if (toolTextTabList.value.length == 0) {
			await getToolTextTabList();
			await getToolTextTypefaceList();
			await getToolTextColorList();
		}
		currentIndex.value = -1;
		textConfigClear();
		toolTextPopup.value = true;
		await nextTick();
		addText();
	}
	// 文字编辑 配置回显
	function textConfigEcho(data) {
		toolTextTitle.value = data.sourceMaterial;
		toolTextTypeface.value = toolTextTypefaceList.value.find(
			(item) => item.value == data.config.fontFamily
		).id;
		toolTextColor.value = toolTextColorList.value.find(
			(item) => item.value == data.config.color
		).id;
		toolTextFontWeight.value = data.config.fontWeight;
		toolTextItalic.value = data.config.italic;
		toolTextDecoration.value = data.config.textDecoration;
		toolTextFontSize.value = data.config.fontSize;
		toolTextWritingDirection.value = data.config.writingDirection;
		toolTextSpacing.value = data.config.letterSpacing;
		toolTextAlign.value = data.config.textAlign;
		toolTextXFlip.value = data.config.xFlip;
		toolTextYFlip.value = data.config.yFlip;
	}
	// 文字编辑 配置清空
	function textConfigClear() {
		toolTextTitle.value = '';
		toolTextTypeface.value = toolTextTypefaceList.value[0].id;
		toolTextColor.value = toolTextColorList.value[0].id;
		toolTextFontWeight.value = false;
		toolTextItalic.value = false;
		toolTextDecoration.value = false;
		toolTextFontSize.value = 16;
		toolTextWritingDirection.value = 'horizontal-tb';
		toolTextSpacing.value = 0;
		toolTextAlign.value = 'center';
		toolTextXFlip.value = false;
		toolTextYFlip.value = false;
	}
	// 添加文字
	async function addText() {
		let item = {
			type: 'text',
			sourceMaterial: '',
			config: {
				fontFamily: '',
				color: '',
				fontWeight: false, // 是否加粗
				italic: false, // 是否倾斜
				textDecoration: false, // 字体底部是否有下划线
				fontSize: 16,
				writingDirection: 'horizontal-tb',
				letterSpacing: 0,
				textAlign: 'center',
				xFlip: false,
				yFlip: false,
			},
			x: 0,
			y: 0,
			scale: 1,
			angle: 0,
			level: 1,
		};
		let fontFamily = toolTextTypefaceList.value.find(
			(item) => item.id == toolTextTypeface.value
		).value;
		item.config.fontFamily = fontFamily;
		let color = toolTextColorList.value.find((item) => item.id == toolTextColor.value).value;
		item.config.color = color;
		item.config.fontWeight = toolTextFontWeight.value;
		item.config.italic = toolTextItalic.value;
		item.config.textDecoration = toolTextDecoration.value;
		item.config.fontSize = toolTextFontSize.value;
		item.config.writingDirection = toolTextWritingDirection.value;
		item.config.letterSpacing = toolTextSpacing.value;
		item.config.textAlign = toolTextAlign.value;
		item.config.xFlip = toolTextXFlip.value;
		item.config.yFlip = toolTextYFlip.value;

		let level = 0;
		if (elementList.value.length) {
			level = elementList.value[elementList.value.length - 1].level + 1;
		} else {
			level = 1;
		}
		item.level = level;
		await getEditRegionInfo();
		let x = 0;
		let y = 0;
		x = editRegionInfo.width / 2;
		y = editRegionInfo.height / 2;
		item.x = x;
		item.y = y;
		item.isEdit = false;
		elementList.value.push(item);

		await nextTick();
		currentIndex.value = elementList.value.length - 1;
	}
	const toolTextTitle = ref('');
	async function toolTextTitleInput(e) {
		let data = elementList.value[currentIndex.value];
		data.sourceMaterial = e.detail.value;
		if (data.isEdit) {
			updateTextPosition(data);
		} else {
			updateTextPositionCenter(data);
		}
	}
	// 更新文字素材的位置(居中)
	async function updateTextPositionCenter(data) {
		await getTextInfo();
		let x = editRegionInfo.width / 2 - data.width / 2;
		let y = editRegionInfo.height / 2 - data.height / 2;
		data.x = x;
		data.y = y;
	}
	// 更新文字素材的位置
	async function updateTextPosition(data) {
		let oldWidth = data.width;
		let oldHeight = data.height;
		await getTextInfo();
		let widthDifference = data.width - oldWidth;
		let heightDifference = data.height - oldHeight;
		let x = 0;
		let y = 0;
		if (widthDifference > 0) {
			x = data.x - widthDifference / 2;
			y = data.y - heightDifference / 2;
		} else {
			x = data.x + Math.abs(widthDifference) / 2;
			y = data.y + Math.abs(heightDifference) / 2;
		}
	}

	// 点击工具栏的图片
	function clickToolImage() {
		uni.chooseImage({
			count: 1,
			success: (res) => {
				let data = {
					type: 'image',
					sourceMaterial: res.tempFilePaths[0],
					width: 50,
					height: 50,
					x: 0,
					y: 0,
					scale: 1,
					angle: 0,
					level: 1,
				};
				addSourceMaterial(data);
			},
		});
	}
</script>

<style lang="scss" scoped>
	.main-box {
		width: 100vw;
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		.title {
			position: fixed;
			top: 30rpx;
			left: 0;
			padding: 0 30rpx;
			color: #000;
			font-size: 32rpx;
			font-weight: bold;
		}
		.edit {
			width: 100%;
			flex: 1;
			display: flex;
			justify-content: center;
			align-items: center;
			.edit-box {
				width: 100%;
				height: 300px;
				background-image: url('https://p2.itc.cn/images01/20201116/8249665426024664aefd1295edce46e1.jpeg');
				background-repeat: no-repeat;
				background-size: cover;
				background-position: center;
				display: flex;
				justify-content: center;
				align-items: center;
				position: relative;
				.edit-region {
					width: 145px;
					height: 200px;
					background-color: transparent;
					position: relative;
					overflow: hidden;
					z-index: 100;
					.sourceMaterial {
						position: absolute;
						top: 0;
						left: 0;
						display: flex;
						justify-content: center;
						align-items: center;
						text {
							white-space: nowrap;
						}
					}
				}
				.edit-region-tool {
					z-index: 200;
					position: absolute;
					width: 145px;
					height: 200px;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
					.edit-region-tool-box {
						border: 1px solid #fff;
						position: absolute;
						top: 0;
						left: 0;
						display: flex;
						justify-content: center;
						align-items: center;
						image {
							opacity: 0;
						}
						text {
							opacity: 0;
							white-space: nowrap;
						}
						.tip-delete,
						.tip-rotate,
						.tip-scale {
							position: absolute;
							background: #fff;
							padding: 10rpx;
							border-radius: 50%;
							z-index: 9999999;
							display: flex;
							justify-content: center;
							align-items: center;
						}
						.tip-delete {
							top: 0;
							left: 0;
							transform: translate(-50%, -50%);
						}
						.tip-rotate {
							top: 50%;
							right: -10rpx;
							transform: translate(100%, -50%);
						}
						.tip-scale {
							bottom: 0;
							right: 0;
							transform: translate(50%, 50%);
						}
						.tip-operation {
							position: absolute;
							background: #fff;
							padding: 5rpx 10rpx;
							border-radius: 20rpx;
							color: #000;
							font-size: 16rpx;
							z-index: 9999999;
							display: flex;
							justify-content: center;
							align-items: center;
							top: 0;
							right: 0;
							transform: translate(50%, -50%);
						}
					}
				}
			}
		}
		.tool-box {
			width: 100%;
			padding: 30rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-bottom: constant(safe-area-inset-bottom);
			padding-bottom: env(safe-area-inset-bottom);
			box-shadow: 0rpx -1rpx 21rpx 0rpx rgba(131, 128, 127, 0.1);
			border-radius: 20rpx;
		}
		.tool-source-popup {
			height: 50vh;
			background: #a2f0e3;
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: column;
			.tool-source-title {
				font-size: 18px;
				margin-bottom: 20px;
			}
			.tool-source-tabs1 {
				padding: 0 30rpx;
				margin-bottom: 20rpx;
				width: 100%;
				display: flex;
				align-items: center;
				overflow-x: auto;
				white-space: nowrap;
				height: 70rpx;
				.tool-source-tab1 {
					margin-right: 20rpx;
				}
				.tool-source-tab1-active {
					position: relative;
					&::after {
						content: '';
						position: absolute;
						bottom: -5px;
						left: 0;
						width: 100%;
						height: 2px;
						background: #000;
					}
				}
			}
			.tool-source-tabs2 {
				padding: 0 30rpx;
				margin-bottom: 20rpx;
				width: 100%;
				display: flex;
				align-items: center;
				overflow-x: auto;
				white-space: nowrap;
				.tool-source-tab2 {
					padding: 10rpx 5rpx;
					background: #ccc;
					border-radius: 20rpx;
					margin-right: 20rpx;
					display: flex;
					justify-content: center;
					align-items: center;
				}
				.tool-source-tab2-active {
					background: #000;
					color: #fff;
				}
			}
			.tool-source-list {
				padding: 0 30rpx;
				flex: 1;
				padding-bottom: constant(safe-area-inset-bottom);
				padding-bottom: env(safe-area-inset-bottom);
				width: 100%;
				overflow: auto;
				display: grid;
				grid-template-columns: repeat(5, 1fr);
				gap: 30rpx;
				.tool-source-item {
					height: 100rpx;
					background: #ccc;
					display: flex;
					justify-content: center;
					align-items: center;
					image {
						width: 100%;
						height: 100%;
					}
				}
			}
		}
		.tool-text-popup {
			height: 50vh;
			background: #a2f0e3;
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: column;
			.tool-text-title {
				width: 100%;
				height: 130rpx;
				overflow: auto;
				margin-top: 20rpx;
				padding: 0 20rpx;
				display: flex;
				align-items: center;
				textarea {
					flex: 1;
					height: 100%;
					font-size: 18px;
				}
				.tool-text-title-icon {
					height: 100%;
					display: flex;
					justify-content: center;
					align-items: center;
					padding: 10rpx;
				}
			}
			.tool-text-tabs {
				padding: 0 30rpx;
				margin-bottom: 20rpx;
				width: 100%;
				display: flex;
				align-items: center;
				overflow-x: auto;
				white-space: nowrap;
				height: 70rpx;
				.tool-text-tab {
					margin-right: 20rpx;
				}
				.tool-text-tab-active {
					position: relative;
					&::after {
						content: '';
						position: absolute;
						bottom: -5px;
						left: 0;
						width: 100%;
						height: 2px;
						background: #000;
					}
				}
			}
			.tool-text-Typeface-list {
				padding: 0 30rpx;
				flex: 1;
				padding-bottom: constant(safe-area-inset-bottom);
				padding-bottom: env(safe-area-inset-bottom);
				width: 100%;
				overflow: auto;
				display: grid;
				grid-template-columns: repeat(5, 1fr);
				gap: 30rpx;
				.tool-text-Typeface {
					height: 100rpx;
					background: #ccc;
					display: flex;
					justify-content: center;
					align-items: center;
				}
			}
			.tool-text-color-list {
				padding: 0 30rpx;
				margin-bottom: 20rpx;
				width: 100%;
				display: flex;
				align-items: center;
				overflow-x: auto;
				white-space: nowrap;
				.tool-text-color,
				.tool-text-color-active {
					margin-right: 20rpx;
					width: 50rpx;
					height: 50rpx;
					border-radius: 50%;
				}
				.tool-text-color {
					border: 1px solid #ccc;
				}
				.tool-text-color-active {
					background: #fff;
					display: flex;
					justify-content: center;
					align-items: center;
					.tool-text-color-active-box {
						width: 80%;
						height: 80%;
						border-radius: 50%;
					}
				}
			}
			.tool-text-config {
				padding: 0 30rpx;
				flex: 1;
				padding-bottom: constant(safe-area-inset-bottom);
				padding-bottom: env(safe-area-inset-bottom);
				width: 100%;
				display: grid;
				grid-template-columns: repeat(5, 1fr);
				gap: 30rpx;
				.tool-text-config-item {
					margin-bottom: 20rpx;
				}
				.tool-text-config-item-active {
					background: #ccc;
					width: 80rpx;
					height: 80rpx;
					border-radius: 50%;
					display: flex;
					justify-content: center;
					align-items: center;
				}
			}
		}
	}
</style>
