import $http from '../js_sdk/zhouWei-request/requestConfig';
// {load:false} 是否出现加载框

export const 接口名称 = (data) => $http.post('接口地址', data);

export const 接口名称a = (data) =>
	$http.get('接口地址', data, {
		load: true,
	});
