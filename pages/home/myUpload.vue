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
				@click="clickFile(item, index)"
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
				@click="clickFile(item, index)"
			>
				<div class="name">{{ item.name }}</div>
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
		<myProgress :state="state" :isFailed="isFailed" @closeProgress="closeProgress"></myProgress>
	</div>
</template>

<script setup>
	import { ref, onMounted, computed, watchEffect, getCurrentInstance } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	const { proxy } = getCurrentInstance();
	const example = proxy;
	import myProgress from './myProgress.vue';

	const props = defineProps({
		// 上传的服务器地址
		url: {
			type: String,
			required: true,
		},
		/*
		上传的文件类型 all | file | media | image | video
		file只支持H5,只有微信小程序才支持把accept配置为all、media
		*/
		accept: {
			type: String,
			default: 'image',
		},
		// 当accept为video时生效，是否压缩视频
		compressed: {
			type: Boolean,
			default: true,
		},
		// 当accept为video时生效，使用前置还是后置摄像头
		camera: {
			type: String,
			default: 'back',
		},
		// 是否支持多选
		multiple: {
			type: Boolean,
			default: true,
		},
		// 最大上传数量
		maxCount: {
			type: String,
			default: '9',
		},
		// 限制单个文件的上传大小，单位MB
		maxSize: {
			type: String,
			default: '',
		},
		// 限制上传的所有文件的总大小，单位MB
		maxSizeAll: {
			type: String,
			default: '',
		},
	});
	const emit = defineEmits(['uploadCompleted']);

	let fileList = ref([]); // 文件列表
	// 进度条相关
	let state = ref(false); // 进度条组件状态
	let isFailed = ref(false); // 是否失败
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
	// 关闭进度条
	function closeProgress() {
		state.value = false;
		isFailed.value = false;
	}
	// 多文件上传
	async function uploadFiles(file) {
		console.log('文件列表', file);
		// 挑选出符合大小的文件
		let maxSize = Number(props.maxSize);
		if (maxSize) {
			let exceedFileName = [];
			let arr = [];
			for (let index = 0; index < file.length; index++) {
				const element = file[index];
				if (Math.ceil(element.size / 1024 / 1024) > maxSize) {
					exceedFileName.push(element.name);
				} else {
					arr.push(element);
				}
			}
			file = arr;
			if (exceedFileName.length) {
				uni.showToast({
					title: `文件大小不能超过${maxSize}MB`,
					icon: 'none',
					duration: 2000,
				});
				isFailed.value = true;
			}
		}
		// 对文件进行排序 按照文件大小进行从小到大的排序
		file.sort((a, b) => {
			return a.size - b.size;
		});
		// 根据最大上传数量截取文件
		let difference = props.maxCount - fileList.value.length;
		file = file.slice(0, difference);

		let maxSizeAll = Number(props.maxSizeAll);
		for (let index = 0; index < file.length; index++) {
			let element = file[index];
			let url = element.url;
			// 判断是否已经超过限制上传的所有文件的总大小
			if (maxSizeAll && isUpload(element.size)) {
				uni.showToast({
					title: `所有文件的大小不能超过${maxSizeAll}MB`,
					icon: 'none',
					duration: 2000,
				});
				isFailed.value = true;
				break;
			}
			let res = await upload(url);
			fileList.value.push({
				type: element.type,
				name: getNameInType(element),
				size: element.size,
				url: res.url,
				fullurl: res.fullurl,
			});
		}
		fileList.value = sortTypeFile(fileList.value);
		emit('uploadCompleted', fileList.value);
		// 判断是否已经超过限制的所有文件大小
		function isUpload(size) {
			let fileArrSize = 0;
			fileList.value.forEach((item) => {
				fileArrSize += item.size;
			});
			fileArrSize += size;
			return Math.ceil(fileArrSize / 1024 / 1024) > maxSizeAll;
		}
	}
	// 将文件按照类型进行排序 image > video > file
	function sortTypeFile(file) {
		let imageFile = [];
		let videoFile = [];
		let fileArr = [];
		for (let index = 0; index < file.length; index++) {
			const element = file[index];
			switch (element.type) {
				case 'image':
					imageFile.push(element);
					break;
				case 'video':
					videoFile.push(element);
					break;
				case 'file':
					fileArr.push(element);
					break;
			}
		}
		file = [...imageFile, ...videoFile, ...fileArr];
		return file;
	}
	// 根据文件类型返回文件名
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
				case 'file':
					let fileLength = fileList.value.filter((item) => item.type == 'file').length;
					name = `文件${fileLength + 1}`;
					break;
			}
		}
		return name;
	}
	// 单文件上传
	async function uploadFile(file) {
		let { type, size, url } = file;
		let maxSize = Number(props.maxSize);
		if (maxSize && Math.ceil(size / 1024 / 1024) > maxSize) {
			uni.showToast({ title: `最多上传${maxSize}MB的文件`, icon: 'none', duration: 2000 });
			isFailed.value = true;
			return;
		}
		let res = await upload(url);
		fileList.value = [
			{
				type,
				name: getNameInType(element),
				size,
				url: res.url,
				fullurl: res.fullurl,
			},
		];
		emit('uploadCompleted', fileList.value[0]);
	}

	// 发送请求
	function upload(url) {
		return new Promise((resolve, reject) => {
			uni.uploadFile({
				url: props.url, // 后端地址 实例:'https://pmccapi.wsandos.com//common/file/upload'
				filePath: url,
				name: 'file',
				formData: {},
				success: (res) => {
					const data = JSON.parse(res.data);
					// console.log(data);
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
		});
	}

	// 点击文件
	function clickFile(data, index) {
		switch (data.type) {
			case 'image':
				preview(index);
				break;
			case 'video':
				clickVideo(data.fullurl);
				break;
			case 'file':
				saveFile(data);
				break;
		}
	}
	// 点击图片 放大
	function preview(index) {
		let urls = [];
		fileList.value.forEach((item) => {
			if (item.type == 'image') {
				urls.push(item.fullurl);
			}
		});
		if (!props.multiple) index = 0;
		uni.previewImage({
			current: [index],
			urls,
			loop: true,
			indicator: 'none',
		});
	}
	// 保存文件并预览
	function saveFile(data) {
		let { fullurl: url, name } = data;
		uni.downloadFile({
			url,
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
	let videoOverlay = ref(false);
	let videoUrl = ref('');
	// 点击视频
	function clickVideo(url) {
		videoUrl.value = url;
		videoOverlay.value = true;
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
		width: 100%;
		height: 100rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: 10rpx 0;
		padding: 20rpx;
		background: #ccc;
		border-radius: 10rpx;
		.name {
			font-weight: 700;
			font-size: 28rpx;
			color: #44aeed;
			margin-right: 20rpx;
			flex: 1;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 1;
			overflow: hidden;
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
