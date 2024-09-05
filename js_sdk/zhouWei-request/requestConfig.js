import request from './request';
// 全局配置的请求域名
import { BASE_URL } from '@/constants.js';
let baseUrl = BASE_URL;
//可以new多个request来支持多个域名请求
let $http = new request({
	//接口请求地址
	baseUrl: baseUrl,
	//服务器本地上传文件地址
	fileUrl: baseUrl,
	// 服务器上传图片默认url
	// defaultUploadUrl: "http://cityscape.api.wsandos.com/upload",
	//设置请求头（如果使用报错跨域问题，可能是content-type请求类型和后台那边设置的不一致）
	header: {
		'content-type': 'application/json; charset=utf-8',
		// 'content-type': 'application/x-www-form-urlencoded',
	},
	// 请求超时时间（默认6000）
	timeout: 3000,
	// 默认配置（可不写）
	config: {
		// 是否自动提示错误
		isPrompt: true,
		// 是否显示加载动画
		load: false,
		// 加载动画的文本
		loadText: '加载中...',
		// 是否使用数据工厂
		isFactory: true,
	},
});

// 添加获取七牛云token的方法
$http.getQnToken = function (callback) {
	//该地址需要开发者自行配置（每个后台的接口风格都不一样）
	$http.get('api/kemean/aid/qn_upload').then((data) => {
		/*
		 *接口返回参数：
		 *visitPrefix:访问文件的域名
		 *token:七牛云上传token
		 *folderPath:上传的文件夹
		 *region: 地区 默认为：SCN
		 */
		callback({
			visitPrefix: data.visitPrefix,
			token: data.token,
			folderPath: data.folderPath,
			region: 'SCN',
		});
	});
};

//当前接口请求数
let requestNum = 0;
//请求开始拦截器
$http.requestStart = function (options) {
	if (options.load) {
		if (requestNum <= 0) {
			//打开加载动画
			uni.showLoading({
				title: options.loadText,
				mask: true,
			});
		}
		requestNum += 1;
	}
	// 图片上传大小限制
	if (options.method == 'FILE' && options.maxSize) {
		// 文件最大字节: options.maxSize 可以在调用方法的时候加入参数
		const maxSize = options.maxSize;
		for (let item of options.files) {
			if (item.size > maxSize) {
				setTimeout(() => {
					uni.showToast({
						title: '图片过大，请重新上传',
						icon: 'none',
					});
				}, 500);
				return false;
			}
		}
	}
	// 请求前加入token
	options.header['token'] = uni.getStorageSync('token');
	return options; // return false 表示请求拦截，不会继续请求
};

//请求结束
$http.requestEnd = function (options) {
	//判断当前接口是否需要加载动画
	if (options.load) {
		requestNum = requestNum - 1;
		if (requestNum <= 0) {
			uni.hideLoading();
		}
	}
};
$http.dataFactory = async function (res) {
	if (res.response.statusCode && res.response.statusCode == 200) {
		let httpData = res.response.data;
		if (typeof httpData == 'string') {
			httpData = JSON.parse(httpData);
		}
		/*********以下只是模板(及共参考)，需要开发者根据各自的接口返回类型修改*********/

		//判断数据是否请求成功
		if (httpData.success || httpData.code == 200) {
			// 返回正确的结果(then接受数据)

			return Promise.resolve(httpData.data);
		} else {
			// 返回错误的结果(catch接受数据)
			return Promise.reject({
				statusCode: httpData.code,
				errMsg: httpData.info || httpData.msg,
			});
		}
		/*********以上只是模板(及共参考)，需要开发者根据各自的接口返回类型修改*********/
	} else {
		// 返回错误的结果(catch接受数据)
		return Promise.reject({
			statusCode: res.response.statusCode,
			errMsg: res.response.data.msg,
		});
	}
};

// 错误回调
$http.requestError = function (e) {
	// e.statusCode === 0 是参数效验错误抛出的
	// console.log(e,'errmessg')
	const STATUS_CB = {
		0: () => {},
		400: () => {
			uni.showToast({
				title: e.errMsg,
				icon: 'none',
				duration: 3000,
			});
		},
		404: () => {
			uni.showToast({
				title: e.errMsg,
				icon: 'none',
				duration: 3000,
			});
		},
		403: () => {
			//密码不一致
			uni.showToast({
				title: e.errMsg,
				icon: 'none',
				duration: 3000,
			});
		},
		401: () => {
			uni.showToast({
				title: '当前登录失效，请先登录',
				icon: 'none',
			});
			setTimeout(() => {
				// 登录失败后清除token 让用户重新进行授权
				uni.clearStorageSync('token');
				uni.removeStorageSync('userInfo');
				uni.reLaunch({
					url: '/pages/login/index',
				});
			}, 1500);
		},
		500: () => {
			uni.showToast({
				title: '请稍后再试',
				icon: 'none',
			});
		},
		10000: () => {
			uni.showToast({
				title: e.errMsg,
				icon: 'none',
				duration: 3000,
			});
		},
	};

	if (STATUS_CB[e.statusCode]) {
		STATUS_CB[e.statusCode]();
	} else {
		uni.getNetworkType({
			success: (res) => {
				if (res.networkType == 'none') {
					uni.reLaunch({
						url: '/pages/pages_user/networkError/networkError',
					});
					uni.showToast({
						title: '网络出错了~',
						icon: 'none',
						duration: 3000,
					});
				} else {
					uni.showToast({
						title: '请检查网络是否流畅',
						icon: 'none',
						duration: 3000,
					});
				}
			},
		});
	}
};
export default $http;
