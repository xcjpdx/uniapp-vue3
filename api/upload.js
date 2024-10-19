import $http from '../js_sdk/zhouWei-request/requestConfig';
import { BASE_URL } from '@/constants.js';

// 文件上传
export const $upload_transfer = (url) => {
	return new Promise((resolve, reject) => {
		uni.uploadFile({
			url: `${BASE_URL}`,
			filePath: url,
			name: 'file',
			formData: {},
			success: (res) => {
				const data = JSON.parse(res.data);
				console.log('文件上传结果', data);
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
};
