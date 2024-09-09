<template>
	<div class="media-box">
		<div
			class="media-item"
			v-for="(item, index) in mediaFileList"
			:key="index"
			@click="clickFile(item)"
		>
			<image v-if="item.type == 'image'" :src="item.url" mode="scaleToFill" />
			<video
				v-if="item.type == 'video'"
				:src="item.url"
				:controls="true"
				:show-center-play-btn="false"
				object-fit="fill"
			></video>
			<div class="media-item-delete" @click.stop="deleteFile(item.uuid)">X</div>
		</div>
	</div>
	<div
		class="other-box"
		v-for="(item, index) in otherFileList"
		:key="index"
		@click="clickFile(item)"
	>
		<div class="other-box-name">{{ item.name }}</div>
		<div class="other-box-delete" @click.stop="deleteFile(item.uuid)">删除</div>
	</div>
	<div
		class="add-box"
		v-if="
			(props.multiple && fileList.length < props.maxCount) ||
			(!props.multiple && fileList.length == 0)
		"
		@click="selectFile"
	>
		+
	</div>

	<div class="tip-overlay" v-if="isTip">
		<div class="tip-title">以下文件上传失败</div>
		<div class="tip-box">
			<div class="tip-box-item" v-for="(tipFile, index) in tipFileList" :key="index">
				<div class="tip-box-item-reasons">{{ tipFile.tipReasons }}</div>
				<div class="tip-media-box">
					<div
						class="tip-media-item"
						v-for="(item, index) in tipFile.tipMediaFileList"
						:key="index"
					>
						<image v-if="item.type == 'image'" :src="item.url" mode="scaleToFill" />
						<video
							v-if="item.type == 'video'"
							:src="item.url"
							:controls="true"
							:show-center-play-btn="false"
							object-fit="fill"
						></video>
					</div>
				</div>
				<div class="tip-other-box" v-for="(item, index) in tipFile.tipOtherFileList" :key="index">
					{{ item.name }}
				</div>
			</div>
		</div>
		<div class="tip-close" @click="isTip = false">关闭</div>
	</div>

	<myProgress
		:state="state"
		:currentSize="progressCurrentSize"
		:totalSize="progressTotalSize"
		:isFailed="isFailed"
		@closeProgress="closeProgress"
	></myProgress>
</template>

<script setup>
	import { ref, onMounted, computed, watchEffect, getCurrentInstance } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	const { proxy } = getCurrentInstance();

	const props = defineProps({
		url: {
			type: String,
			required: true,
		},
		accept: {
			type: String,
			default: 'image',
		},
		multiple: {
			type: Boolean,
			default: true,
		},
		maxCount: {
			type: Number,
			default: 9,
		},
		maxSize: {
			type: String,
			default: '',
		},
		maxSizeAll: {
			type: String,
			default: '',
		},
		sourceType: {
			type: Array,
			default: ['album', 'camera'],
		},
		compressed: {
			type: Boolean,
			default: true,
		},
		camera: {
			type: String,
			default: 'back',
		},
		maxDuration: {
			type: Number,
			default: 9,
		},
		extension: {
			type: Array,
			default: [],
		},
	});
	let fileList = defineModel('fileList'); // 文件列表
	const mediaFileList = ref([]);
	const otherFileList = ref([]);
	watch(
		() => fileList.value.length,
		() => {
			mediaFileList.value = fileList.value.filter(
				(item) => item.type == 'image' || item.type == 'video'
			);
			otherFileList.value = fileList.value.filter(
				(item) => item.type == 'document' || item.type == 'other'
			);
		},
		{
			immediate: true,
		}
	);

	// 进度条相关
	import myProgress from './myProgress.vue';
	let state = ref(false); // 进度条组件状态
	let isFailed = ref(false); // 是否失败
	// 关闭进度条
	function closeProgress() {
		state.value = false;
		isFailed.value = false;
	}
	let progressTotalSize = ref(0); // 总上传数据大小
	// 计算需要上传的数据总大小
	function getTotalSize(file) {
		let totalSize = 0;
		if (props.multiple) {
			file.forEach((item) => {
				totalSize += item.size;
			});
		} else {
			totalSize = file.size;
		}
		progressTotalSize.value = totalSize;
	}
	let progressCurrentSize = ref(0); // 当前上传数据大小

	const platform = uni.getSystemInfoSync().uniPlatform;

	// 点击选择文件
	function selectFile() {
		switch (platform) {
			case 'web':
				switch (props.accept) {
					case 'image':
						choiceImageInWeb();
						break;
					case 'video':
						choiceVideoInWeb();
						break;
					case 'media':
						choiceMediaInWeb();
						break;
					case 'file':
						choiceFileInWeb();
						break;
					case 'all':
						choiceAllInWeb();
						break;
				}
				break;
			case 'mp-weixin':
				switch (props.accept) {
					case 'image':
						choiceImageInMini();
						break;
					case 'video':
						choiceVideoInMini();
						break;
					case 'media':
						choiceMediaInMini();
						break;
					case 'file':
						choiceFileInMini();
						break;
					case 'all':
						choiceAllInMini();
						break;
				}
				break;
			case 'app':
				switch (props.accept) {
					case 'image':
						choiceImageInApp();
						break;
					case 'video':
						choiceVideoInApp();
						break;
					case 'media':
						choiceMediaInApp();
						break;
					case 'file':
						choiceFileInApp();
						break;
					case 'all':
						choiceAllInApp();
						break;
				}
				break;
		}
	}

	// 选择图片 web端
	function choiceImageInWeb() {
		uni.chooseImage({
			count: props.multiple ? props.maxCount : 1,
			sourceType: props.sourceType,
			extension: props.extension,
			success: (res) => {
				let arr = res.tempFiles.map((item) => {
					return {
						type: 'image',
						url: item.path,
						size: item.size,
						name: item.name || '',
					};
				});
				afterRead(arr);
			},
			fail: () => {},
		});
	}
	// 选择视频 web端
	function choiceVideoInWeb() {
		uni.chooseVideo({
			sourceType: props.sourceType,
			compressed: props.compressed,
			maxDuration: props.maxDuration,
			camera: props.camera,
			extension: props.extension,
			success: (res) => {
				let arr = [
					{
						type: 'video',
						url: res.tempFilePath,
						size: res.size,
						name: res.name || '',
					},
				];
				afterRead(arr);
			},
			fail: () => {},
		});
	}
	// 选择媒体文件 web端
	function choiceMediaInWeb() {
		uni.showToast({
			title: 'web端暂不支持选择媒体文件',
			icon: 'none',
		});
	}
	// 选择file web端
	function choiceFileInWeb() {
		uni.showToast({
			title: 'web端暂不支持选择file文件',
			icon: 'none',
		});
	}
	// 选择全部文件 web端
	function choiceAllInWeb() {
		uni.chooseFile({
			count: props.multiple ? props.maxCount : 1,
			sourceType: props.sourceType,
			extension: props.extension,
			success: (res) => {
				let arr = res.tempFiles.map((item) => {
					return {
						type: getFileType(item.name),
						url: item.path,
						size: item.size,
						name: item.name || '',
					};
				});
				afterRead(arr);
			},
			fail: () => {},
		});
	}

	// 选择图片 微信小程序端
	function choiceImageInMini() {
		uni.chooseImage({
			count: props.multiple ? props.maxCount : 1,
			sourceType: props.sourceType,
			success: (res) => {
				let arr = res.tempFiles.map((item) => {
					return {
						type: 'image',
						url: item.path,
						size: item.size,
						name: item.name || '',
					};
				});
				afterRead(arr);
			},
			fail: () => {},
		});
	}
	// 选择视频 微信小程序端
	function choiceVideoInMini() {
		uni.chooseVideo({
			sourceType: props.sourceType,
			compressed: props.compressed,
			maxDuration: props.maxDuration,
			camera: props.camera,
			success: (res) => {
				let arr = [
					{
						type: 'video',
						url: res.tempFilePath,
						size: res.size,
						name: res.name || '',
					},
				];
				afterRead(arr);
			},
			fail: () => {},
		});
	}
	// 选择媒体文件 微信小程序端
	function choiceMediaInMini() {
		uni.chooseMedia({
			count: props.multiple ? props.maxCount : 1,
			sourceType: props.sourceType,
			maxDuration: props.maxDuration,
			camera: props.camera,
			success: (res) => {
				let arr = res.tempFiles.map((item) => {
					return {
						type: item.fileType,
						url: item.tempFilePath,
						size: item.size,
						name: '',
					};
				});
				afterRead(arr);
			},
			fail: () => {},
		});
	}
	// 选择file 微信小程序端
	function choiceFileInMini() {
		wx.chooseMessageFile({
			count: props.multiple ? props.maxCount : 1,
			type: 'file',
			extension: props.extension,
			success: (res) => {
				let arr = res.tempFiles.map((item) => {
					return {
						type: getFileType(item.name),
						url: item.path,
						size: item.size,
						name: item.name || '',
					};
				});
				afterRead(arr);
			},
			fail: () => {},
		});
	}
	// 选择全部文件 微信小程序端
	function choiceAllInMini() {
		wx.chooseMessageFile({
			count: props.multiple ? props.maxCount : 1,
			success: (res) => {
				let arr = res.tempFiles.map((item) => {
					return {
						type: getFileType(item.name),
						url: item.path,
						size: item.size,
						name: item.name || '',
					};
				});
				afterRead(arr);
			},
			fail: () => {},
		});
	}

	// 选择图片 app端
	function choiceImageInApp() {
		uni.chooseImage({
			count: props.multiple ? props.maxCount : 1,
			sourceType: props.sourceType,
			success: (res) => {
				let arr = res.tempFiles.map((item) => {
					return {
						type: 'image',
						url: item.path,
						size: item.size,
						name: item.name || '',
					};
				});
				afterRead(arr);
			},
			fail: () => {},
		});
	}
	// 选择视频 app端
	function choiceVideoInApp() {
		uni.chooseVideo({
			sourceType: props.sourceType,
			compressed: props.compressed,
			maxDuration: props.maxDuration,
			camera: props.camera,
			success: (res) => {
				let arr = [
					{
						type: 'video',
						url: res.tempFilePath,
						size: res.size,
						name: res.name || '',
					},
				];
				afterRead(arr);
			},
			fail: () => {},
		});
	}
	// 选择媒体文件 app端
	function choiceMediaInApp() {
		uni.showToast({
			title: 'app端暂不支持选择媒体文件',
			icon: 'none',
		});
	}
	// 选择file app端
	function choiceFileInApp() {
		uni.showToast({
			title: 'app端暂不支持选择file文件',
			icon: 'none',
		});
	}
	// 选择全部文件 app端
	function choiceAllInApp() {
		uni.showToast({
			title: 'app端暂不支持选择全部文件',
			icon: 'none',
		});
	}

	// 上传文件之后
	async function afterRead(file) {
		try {
			state.value = true;
			if (props.multiple) {
				await uploadFiles(file);
			} else {
				await uploadFile(file[0]);
			}
			if (tipFileList.value.length) {
				isTip.value = true;
			}
		} catch {
			isFailed.value = true;
		}
		state.value = false;
	}

	// 单文件上传
	async function uploadFile(file) {
		try {
			let { type, size, url, name } = file;

			// 检查文件大小是否超过限制
			let maxSize = props.maxSize * 1024 * 1024;
			if (maxSize && size > maxSize) {
				setTimeout(() => {
					uni.showToast({ title: `最多上传 ${maxSize / 1024 / 1024} MB 的文件`, icon: 'none' });
				}, 1500);
				isFailed.value = true;
				return;
			}

			// 检查所有文件的总大小是否超过限制
			let maxSizeAll = props.maxSizeAll * 1024 * 1024;
			if (maxSizeAll && size > maxSizeAll) {
				setTimeout(() => {
					uni.showToast({ title: `最多上传 ${maxSizeAll / 1024 / 1024} MB 的文件`, icon: 'none' });
				}, 1500);
				isFailed.value = true;
				return;
			}

			progressCurrentSize.value = 0;
			getTotalSize(file);

			// 开始上传
			let res = await upload(url, 0);
			fileList.value = [
				{
					type,
					name,
					size,
					url: res.fullurl,
					originalUrl: url,
					uuid: getUniqueKey(type, size),
				},
			];
		} catch (error) {
			console.log(error);
		}
	}
	// 上传错误提示相关
	const isTip = ref(false);
	const tipFileList = ref([]);
	let allFileSize = 0; // 总文件大小
	// 多文件上传
	async function uploadFiles(file) {
		tipFileList.value = [];
		try {
			// 检查所有的文件大小是否超过限制
			let maxSize = props.maxSize * 1024 * 1024;
			if (maxSize) {
				let unqualifiedArr = []; // 不符合限制的文件
				let qualifiedArr = []; // 符合限制的文件
				file.forEach((item) => {
					if (item.size > maxSize) {
						unqualifiedArr.push(item);
					} else {
						qualifiedArr.push(item);
					}
				});
				if (unqualifiedArr.length) {
					let tipMediaFileList = [];
					let tipOtherFileList = [];
					unqualifiedArr.forEach((item) => {
						if (item.type == 'image' || item.type == 'video') {
							tipMediaFileList.push(item);
						} else {
							tipOtherFileList.push(item);
						}
					});
					tipFileList.value.push({
						tipReasons: `失败原因 : 文件大小不能超过 ${maxSize / 1024 / 1024} MB`,
						tipMediaFileList,
						tipOtherFileList,
					});
				}
				file = qualifiedArr;
			}

			// 检查所有文件的总大小是否超过限制
			let maxSizeAll = props.maxSizeAll * 1024 * 1024;
			if (maxSizeAll) {
				let arrIndex = -1;
				let unqualifiedArr = []; // 不符合限制的文件
				let qualifiedArr = []; // 符合限制的文件
				for (let index = 0; index < file.length; index++) {
					const size = file[index].size;
					allFileSize += size;
					if (allFileSize > maxSizeAll) {
						arrIndex = index;
						break;
					}
				}
				if (arrIndex == -1) {
					qualifiedArr = file;
				} else {
					unqualifiedArr = file.slice(arrIndex, file.length);
					qualifiedArr = file.slice(0, arrIndex);
				}

				if (unqualifiedArr.length) {
					let tipMediaFileList = [];
					let tipOtherFileList = [];
					unqualifiedArr.forEach((item) => {
						if (item.type == 'image' || item.type == 'video') {
							tipMediaFileList.push(item);
						} else {
							tipOtherFileList.push(item);
						}
					});
					tipFileList.value.push({
						tipReasons: `失败原因 : 所有文件的大小不能超过 ${maxSizeAll / 1024 / 1024} MB`,
						tipMediaFileList,
						tipOtherFileList,
					});
				}
				file = qualifiedArr;
			}

			// 开始上传
			if (file.length) {
				progressCurrentSize.value = 0;
				getTotalSize(file);
				let arr = [];
				for (let index = 0; index < file.length; index++) {
					let element = file[index];
					let res = await upload(element.url, index);
					arr.push({
						type: element.type,
						name: element.name,
						size: element.size,
						url: res.fullurl,
						originalUrl: element.url,
						uuid: getUniqueKey(element.type, element.size),
					});
				}
				fileList.value = [...fileList.value, ...arr];
			}
			renewAllFileSize();
		} catch (error) {
			console.log(error);
		}
	}
	// 获取文件类型
	function getFileType(fileName) {
		let fileType = '';
		const imageExtensions = [
			'jpg',
			'jpeg',
			'png',
			'gif',
			'bmp',
			'tiff',
			'tif',
			'webp',
			'heic',
			'ico',
			'svg',
			'eps',
			'ai',
			'raw',
			'psd',
			'xcf',
			'tga',
			'dds',
		];
		const videoExtensions = [
			'mp4',
			'mkv',
			'avi',
			'mov',
			'wmv',
			'flv',
			'webm',
			'mpg',
			'mpeg',
			'3gp',
			'm4v',
			'vob',
			'rmvb',
			'f4v',
			'ts',
			'ogv',
			'mxf',
			'asf',
			'swf',
		];
		const documentExtensions = ['doc', 'xls', 'ppt', 'pdf', 'docx', 'xlsx', 'pptx'];
		const extension = fileName.split('.').pop().toLowerCase();
		// console.log('文件后缀', extension);
		if (imageExtensions.includes(extension)) {
			fileType = 'image';
		} else if (videoExtensions.includes(extension)) {
			fileType = 'video';
		} else if (documentExtensions.includes(extension)) {
			fileType = 'document';
		} else {
			fileType = 'other';
		}
		return fileType;
	}
	// 生成一个唯一标识:type+size+10位随机数
	function getUniqueKey(type, size) {
		return type + size + Math.ceil(Math.random() * 10000000000);
	}
	// 更新总文件大小
	function renewAllFileSize() {
		allFileSize = 0;
		fileList.value.forEach((item) => {
			allFileSize += item.size;
		});
	}

	// 发送请求
	function upload(url, index) {
		return new Promise((resolve, reject) => {
			var uploadTask = uni.uploadFile({
				url: props.url,
				filePath: url,
				name: 'file',
				formData: {},
				success: (res) => {
					const data = JSON.parse(res.data);
					// console.log('后端接口返回结果', data);
					if (data.code === 200) {
						resolve(data.data);
					} else {
						reject(data);
						uni.showToast({
							icon: 'error',
							title: data.msg,
						});
					}
				},
				fail: (e) => {
					uni.showToast({
						icon: 'error',
						title: '上传失败',
					});
					reject(e);
				},
			});
			let lastProgress = 0; // 上次上传进度
			let progressOfThisUpload = 0; // 当前上传进度
			uploadTask.onProgressUpdate((res) => {
				// console.log('已经上传的数据长度', res.totalBytesSent);
				if (index) {
					if (lastProgress) {
						progressOfThisUpload = res.totalBytesSent;
						progressCurrentSize.value += progressOfThisUpload - lastProgress;
						lastProgress = progressOfThisUpload;
					} else {
						lastProgress = res.totalBytesSent;
						progressCurrentSize.value += lastProgress;
					}
				} else {
					progressCurrentSize.value = res.totalBytesSent;
				}
			});
		});
	}

	// 点击文件
	function clickFile(data) {
		switch (data.type) {
			case 'image':
				preview(data.url);
				break;
			case 'document':
			case 'other':
				saveAndOpenDocument(data);
				break;
		}
	}
	// 点击图片 放大
	function preview(url) {
		try {
			let urls = [];
			let index = 0;
			if (props.multiple) {
				mediaFileList.value.forEach((item) => {
					if (item.type == 'image') {
						urls.push(item.url);
					}
				});
				index = urls.indexOf(url);
			} else {
				urls = [url];
				index = 0;
			}
			uni.previewImage({
				current: index,
				urls,
			});
		} catch (error) {
			console.log(error);
		}
	}
	// 保存文档并打开预览
	function saveAndOpenDocument(data) {
		let { url, name, originalUrl, type } = data;
		if (platform === 'web') {
			let a = document.createElement('a');
			a.href = originalUrl;
			a.download = name;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			if (type == 'document') {
				const fileUrl = encodeURIComponent(url);
				// // 使用 Microsoft Office Online 预览
				window.open(`https://view.officeapps.live.com/op/view.aspx?src=${fileUrl}`, '_blank');
				// // 使用 Google Docs Viewer 预览
				// // window.open(`https://docs.google.com/gview?url=${fileUrl}&embedded=true`, '_blank');
			}
		} else {
			uni.downloadFile({
				url: url,
				filePath: `${uni.env.USER_DATA_PATH}/${name}`, // 指定保存的路径并指定文件名
				success: (res) => {
					if (res.statusCode === 200) {
						if (type == 'document') {
							uni.openDocument({
								filePath: res.filePath,
								showMenu: true,
							});
						}
					}
				},
			});
		}
	}
	// 删除文件
	function deleteFile(uuid) {
		fileList.value = fileList.value.filter((item) => item.uuid != uuid);
	}
</script>

<style lang="scss" scoped>
	.media-box {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		.media-item {
			width: 200rpx;
			height: 200rpx;
			margin: 15rpx;
			position: relative;
			image,
			video {
				width: 100%;
				height: 100%;
				border-radius: 20rpx;
				overflow: hidden;
			}
			.media-item-delete {
				position: absolute;
				top: 0;
				right: 0;
				transform: translate(50%, -50%);
				display: flex;
				justify-content: center;
				align-items: center;
				width: 40rpx;
				height: 40rpx;
				border-radius: 50%;
				background: #f8382a;
				color: #fff;
				font-size: 20rpx;
			}
		}
	}
	.other-box {
		height: 100rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: 15rpx;
		padding: 20rpx;
		background: #ccc;
		border-radius: 10rpx;
		.other-box-name {
			flex: 1;
			font-weight: 700;
			font-size: 28rpx;
			color: #44aeed;
			// 1行显示
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
		.other-box-delete {
			margin-left: 20rpx;
			padding: 10rpx 20rpx;
			border-radius: 20rpx;
			background: #f8382a;
			color: #fff;
			font-size: 28rpx;
		}
	}

	.add-box {
		display: flex;
		justify-content: center;
		align-items: center;
		background: #ccc;
		width: 200rpx;
		height: 200rpx;
		border-radius: 20rpx;
		overflow: hidden;
		margin: 15rpx;
		font-size: 100rpx;
	}

	.tip-overlay {
		position: fixed;
		top: 0;
		left: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(10px);
		z-index: 9999;
		width: 100vw;
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		.tip-title {
			font-weight: 700;
			font-size: 28rpx;
			color: #44aeed;
			margin: 20rpx;
		}
		.tip-box {
			flex: 1;
			margin: 20rpx;
			overflow-y: auto;
			.tip-box-item {
				.tip-box-item-reasons {
					font-weight: 700;
					font-size: 28rpx;
					color: #44aeed;
					margin-bottom: 20rpx;
				}
				.tip-media-box {
					display: flex;
					align-items: center;
					flex-wrap: wrap;
					.tip-media-item {
						width: 200rpx;
						height: 200rpx;
						border-radius: 20rpx;
						overflow: hidden;
						margin: 15rpx;
						image,
						video {
							width: 100%;
							height: 100%;
						}
					}
				}
				.tip-other-box {
					padding: 10rpx 20rpx;
					background: #ccc;
					margin: 20rpx 0;
					width: 100%;
					font-weight: 700;
					font-size: 28rpx;
					color: #44aeed;
					// 1行显示
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
			}
		}
		.tip-close {
			margin: 20rpx;
			padding: 10rpx 20rpx;
			border-radius: 20rpx;
			background: #44aeed;
			color: #fff;
			font-size: 28rpx;
		}
	}
</style>
