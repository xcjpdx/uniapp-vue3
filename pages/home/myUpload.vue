<template>
	<div
		class="upload-box"
		:class="{
			'media-box': props.accept == 'image' || props.accept == 'video' || props.accept == 'media',
		}"
	>
		<template v-if="props.accept == 'image' || props.accept == 'video' || props.accept == 'media'">
			<div
				class="media-file"
				v-for="(item, index) in fileList"
				:key="index"
				@click="clickFile(item)"
			>
				<image v-if="item.type == 'image'" :src="item.fullurl" mode="scaleToFill" />
				<video
					v-if="item.type == 'video'"
					:src="item.fullurl"
					:controls="false"
					:show-center-play-btn="false"
					object-fit="fill"
				></video>
				<div class="close" @click.stop="deleteFile(index)">
					<u-icon name="close-circle-fill" color="#FFE6E6" size="40"></u-icon>
				</div>
			</div>
		</template>
		<template v-else>
			<div
				class="other-file"
				v-for="(item, index) in fileList"
				:key="index"
				@click="clickFile(item)"
			>
				<div class="name">
					<template v-if="item.type == 'image'">
						<u-icon name="photo-fill" color="#2979ff" size="28"></u-icon>
					</template>
					<template v-if="item.type == 'video'">
						<u-icon name="play-circle-fill" color="#2979ff" size="28"></u-icon>
					</template>
					<template v-if="item.type == 'document'">
						<u-icon name="file-text-fill" color="#2979ff" size="28"></u-icon>
					</template>
					<div class="name-text">{{ item.name }}</div>
				</div>
				<div @click.stop="deleteFile(index)">
					<u-icon name="close-circle-fill" color="#FFE6E6" size="40"></u-icon>
				</div>
			</div>
		</template>
		<u-upload
			name="myfile"
			:accept="props.accept"
			:capture="['album', 'camera']"
			:compressed="props.compressed"
			:camera="props.camera"
			:maxDuration="props.maxDuration"
			:multiple="props.multiple"
			:maxCount="props.maxCount"
			@afterRead="afterRead"
		>
			<div
				class="add-box"
				v-if="
					(props.multiple && fileList.length < props.maxCount) ||
					(!props.multiple && fileList.length == 0)
				"
			>
				<u-icon name="plus" color="#000" size="50"></u-icon>
			</div>
		</u-upload>
		<u-overlay :show="videoOverlay">
			<div class="video-overlay">
				<video :src="videoUrl" object-fit="fill"></video>
				<div class="close" @click="videoOverlay = false">
					<u-icon name="close-circle-fill" color="#FFE6E6" size="80"></u-icon>
				</div>
			</div>
		</u-overlay>
		<myProgress
			:state="state"
			:currentSize="progressCurrentSize"
			:totalSize="progressTotalSize"
			:isFailed="isFailed"
			@closeProgress="closeProgress"
		></myProgress>
	</div>
</template>

<script setup>
	import { ref, onMounted, computed, watchEffect, getCurrentInstance } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	const { proxy } = getCurrentInstance();

	let platform = '';
	onMounted(() => {
		const systemInfo = uni.getSystemInfoSync();
		platform = systemInfo.uniPlatform;
		// console.log('平台', platform);
	});

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
			type: String,
			default: '9',
		},
		maxSize: {
			type: String,
			default: '',
		},
		maxSizeAll: {
			type: String,
			default: '',
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
			default: 60,
		},
	});
	let fileList = defineModel('fileList'); // 文件列表
	const emit = defineEmits(['uploadCompleted']);

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

	// 上传文件之后
	async function afterRead({ file }) {
		try {
			state.value = true;
			if (props.multiple) {
				await uploadFiles(file);
			} else {
				await uploadFile(file);
			}
		} catch {
			isFailed.value = true;
		}
		state.value = false;
	}

	// 单文件上传
	async function uploadFile(file) {
		file.type = getFileType(file.name);
		let { type, size, url } = file;

		// 进行文件筛选 根据文件类型筛选(只保留图片和视频还有文档文件)
		if (type == 'other') {
			setTimeout(() => {
				uni.showToast({ title: `请上传支持的文件`, icon: 'none' });
			}, 1500);
			isFailed.value = true;
			return;
		}

		// 检查文件大小是否超过限制
		let maxSize = Number(props.maxSize);
		if (maxSize && Math.ceil(size / 1024 / 1024) > maxSize) {
			setTimeout(() => {
				uni.showToast({ title: `最多上传 ${maxSize} MB 的文件`, icon: 'none' });
			}, 1500);
			isFailed.value = true;
			return;
		}

		// 检查所有文件的总大小是否超过限制
		let maxSizeAll = Number(props.maxSizeAll);
		if (maxSizeAll && Math.ceil(size / 1024 / 1024) > maxSizeAll) {
			setTimeout(() => {
				uni.showToast({ title: `最多上传 ${maxSizeAll} MB 的文件`, icon: 'none' });
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
				name: getNameInType(file),
				size,
				fullurl: res.fullurl,
				originalUrl: url,
			},
		];

		emit('uploadCompleted', fileList.value[0]);
	}
	// 多文件上传
	async function uploadFiles(file) {
		file.forEach((item) => {
			item.type = getFileType(item.name);
		});

		// 进行文件筛选 根据文件类型筛选(只保留图片和视频还有文档文件)
		let otherFileName = [];
		file.forEach((item) => {
			if (item.type == 'other') {
				otherFileName.push(item.name);
			}
		});
		if (otherFileName.length) {
			let str = '以下文件上传失败 : 文件类型不支持' + '\n' + '\n';
			otherFileName.forEach((item, index) => {
				if (index != otherFileName.length - 1) {
					str += item + '\n' + '\n';
				} else {
					str += item;
				}
			});
			isFailed.value = true;
			setTimeout(() => {
				uni.showModal({
					title: '上传失败',
					showCancel: false,
					content: str,
				});
			}, 1500);
			return;
		}

		// 检查所有的文件大小是否超过限制
		let maxSize = Number(props.maxSize);
		if (maxSize) {
			let exceedFile = [];
			let arr = [];
			file.forEach((item) => {
				if (Math.ceil(item.size / 1024 / 1024) > maxSize) {
					exceedFile.push(item);
				} else {
					arr.push(item);
				}
			});
			if (exceedFile.length) {
				let str = `以下文件上传失败 : 文件大小不能超过 ${maxSize} MB ` + '\n' + '\n';
				exceedFile.forEach((item, index) => {
					if (index != otherFileName.length - 1) {
						str += item.name + ` (${(item.size / 1024 / 1024).toFixed(2)}MB) ` + '\n' + '\n';
					} else {
						str += item.name + ` (${(item.size / 1024 / 1024).toFixed(2)}MB) `;
					}
				});
				isFailed.value = true;
				setTimeout(() => {
					uni.showModal({
						title: '上传失败',
						showCancel: false,
						content: str,
					});
				}, 1500);
				return;
			} else {
				file = arr;
			}
		}

		// 检查所有文件的总大小是否超过限制
		let maxSizeAll = Number(props.maxSizeAll);
		if (maxSizeAll) {
			let fileArrSize = 0;
			file.forEach((item) => {
				fileArrSize += item.size;
			});
			if (Math.ceil(fileArrSize / 1024 / 1024) > maxSizeAll) {
				setTimeout(() => {
					uni.showToast({
						title: `所有文件的大小不能超过 ${maxSizeAll} MB`,
						icon: 'none',
					});
				}, 1500);
				isFailed.value = true;
				return;
			}
		}

		progressCurrentSize.value = 0;
		getTotalSize(file);

		// 开始上传
		for (let index = 0; index < file.length; index++) {
			let element = file[index];
			let res = await upload(element.url, index);
			fileList.value.push({
				type: element.type,
				name: getNameInType(element),
				size: element.size,
				fullurl: res.fullurl,
				originalUrl: element.url,
			});
		}

		emit('uploadCompleted', fileList.value);
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

	// 返回文件名(如果没有文件名:根据文件类型返回自定的文件名)
	function getNameInType(file) {
		let name = '';
		if (file.name) {
			name = file.name;
		} else {
			switch (file.type) {
				case 'image':
					let imageLength = fileList.value.filter((item) => item.type == 'image').length;
					name = `图片${imageLength + 1}`;
					break;
				case 'video':
					let videoLength = fileList.value.filter((item) => item.type == 'video').length;
					name = `视频${videoLength + 1}`;
					break;
				case 'document':
					let fileLength = fileList.value.filter((item) => item.type == 'document').length;
					name = `文件${fileLength + 1}`;
					break;
			}
		}
		return name;
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
				preview(data.fullurl);
				break;
			case 'video':
				clickVideo(data.fullurl);
				break;
			case 'document':
				saveAndOpenDocument(data);
				break;
		}
	}
	// 点击图片 放大
	function preview(url) {
		let urls = [];
		let index = 0;
		if (props.multiple) {
			fileList.value.forEach((item) => {
				if (item.type == 'image') {
					urls.push(item.fullurl);
				}
			});
			index = urls.indexOf(url);
		} else {
			urls = [url];
			index = 0;
		}
		uni.previewImage({
			current: [index],
			urls,
			loop: true,
			indicator: 'none',
		});
	}
	let videoOverlay = ref(false);
	let videoUrl = ref('');
	// 点击视频
	function clickVideo(url) {
		videoUrl.value = url;
		videoOverlay.value = true;
	}
	// 保存文档并打开预览
	function saveAndOpenDocument(data) {
		let { fullurl, name, originalUrl } = data;
		if (platform === 'web' || platform === 'h5') {
			let a = document.createElement('a');
			a.href = originalUrl;
			a.download = name;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			const fileUrl = encodeURIComponent(fullurl);
			// 使用 Microsoft Office Online 预览
			window.open(`https://view.officeapps.live.com/op/view.aspx?src=${fileUrl}`, '_blank');
			// 使用 Google Docs Viewer 预览
			// window.open(`https://docs.google.com/gview?url=${fileUrl}&embedded=true`, '_blank');
		} else {
			uni.downloadFile({
				url: fullurl,
				filePath: `${uni.env.USER_DATA_PATH}/${name}`, // 指定保存的路径并指定文件名
				success: (res) => {
					if (res.statusCode === 200) {
						uni.openDocument({
							filePath: res.filePath,
							showMenu: true,
						});
					}
				},
			});
		}
	}
	// 删除文件
	function deleteFile(index) {
		fileList.value.splice(index, 1);
		emit('uploadCompleted', fileList.value);
	}
</script>

<style lang="scss" scoped>
	.upload-box {
		::v-deep {
			.u-upload {
				flex: none;
			}
		}
	}
	.media-box {
		display: flex;
		flex-wrap: wrap;
	}
	.media-file {
		width: 150rpx;
		height: 150rpx;
		border-radius: 20rpx;
		overflow: hidden;
		margin: 15rpx;
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		image {
			width: 100%;
			height: 100%;
		}
		video {
			width: 100%;
			height: 100%;
		}
		.close {
			position: absolute;
			top: 0;
			right: 0;
		}
	}
	.other-file {
		height: 100rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: 10rpx 0;
		padding: 20rpx;
		background: #ccc;
		border-radius: 10rpx;
		.name {
			display: flex;
			align-items: center;
			margin-right: 20rpx;
			flex: 1;
			overflow: hidden;
			.name-text {
				font-weight: 700;
				font-size: 28rpx;
				color: #44aeed;
				margin-left: 10rpx;
				// 1行显示
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}
	}
	.add-box {
		display: flex;
		justify-content: center;
		align-items: center;
		background: #ccc;
		width: 150rpx;
		height: 150rpx;
		border-radius: 20rpx;
		overflow: hidden;
		margin: 15rpx;
	}
	.video-overlay {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		.close {
			margin-top: 20rpx;
		}
	}
</style>
