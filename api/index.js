import $http from '../js_sdk/zhouWei-request/requestConfig';
/*
* 说明：
load:是否显示加载动画
loadText:加载动画的文本
*/
// { load: true, loadText: '加载中...' }

export const 接口名称 = (data) => $http.post('接口地址', data);

export const 接口名称a = (data) =>
	$http.get('接口地址', data, {
		load: true,
	});
