// import { TextDecoder } from 'text-encoding-utf-8';
let bluetoothOpen = false; // 手机蓝牙是否打开
let bluetoothConnect = false; // 设备和蓝牙是否连接
let isHaveDevice = false; // 是否查找到设备
let deviceId = null; // 设备id
let serviceId = null; // 服务id
let notify = null; // 监听uuid
let writeId = null; // 写入uuid
/**
 * 获取手机蓝牙是否打开
 */
export const getBluetoothState = () => {
	// 主机模式
	return new Promise((resolve, reject) => {
		// mode: 'central',
		uni.openBluetoothAdapter({
			success: (r) => {
				console.log('蓝牙初始化成功');
				// 获取蓝牙的匹配状态
				uni.getBluetoothAdapterState({
					success: function (row) {
						console.log('蓝牙状态：', row.available);
						if (row.available) {
							bluetoothOpen = true;
							resolve();
						} else {
							// 请开启蓝牙
							uni.showToast({
								title: '请打开蓝牙3',
								icon: 'none',
							});
							bluetoothOpen = false;
							bluetoothConnect = false;

							reject();
						}
					},
					fail: function (err) {
						// 请开启蓝牙
						uni.showToast({
							title: '请打开蓝牙2',
							icon: 'none',
						});
						bluetoothOpen = false;
						bluetoothConnect = false;
						reject();
					},
				});
			},
			fail: () => {
				// 请开启蓝牙
				uni.showToast({
					title: '请打开蓝牙1',
					icon: 'none',
				});
				bluetoothOpen = false;
				bluetoothConnect = false;
				reject();
			},
		});
	});
};
/**
 * 开始搜索蓝牙设备
 */
export const discoveryBluetooth = () => {
	return new Promise((resolve) => {
		uni.startBluetoothDevicesDiscovery({
			success(res) {
				console.log('搜索蓝牙外围设备完成', res);
				setTimeout(() => {
					resolve();
				}, 2000);
			},
		});
	});
};
// 关闭蓝牙搜索
export const stopDiscoveryBluetooth = () => {
	uni.stopBluetoothDevicesDiscovery({
		success(r) {
			console.log('停止搜索蓝牙设备', r);
		},
	});
};
/**
 * 获取搜索到的设备信息
 */
export const getBluetoothDevices = (deviceName) => {
	return new Promise((resolve, reject) => {
		uni.getBluetoothDevices({
			success(res) {
				console.log('获取搜索到的设备信息', res.devices);

				bluetoothConnect = false;
				// 过滤掉name为空或者未知设备的设备
				let devices = res.devices.filter(function (obj) {
					return obj.name !== '' && obj.name !== '未知设备';
				});
				console.log('有名称蓝牙列表', devices, deviceName);
				devices &&
					devices.forEach((item) => {
						if (item.name && item.name === deviceName) {
							deviceId = item.deviceId;
							isHaveDevice = true;
							resolve(isHaveDevice);
							console.log('设备ID', deviceId, item);
						}
					});
			},
			fail: function () {
				console.log('搜索蓝牙设备失败');
				bluetoothConnect = false;
				isHaveDevice = false;
				reject(isHaveDevice);
			},
			complete: function () {
				console.log('蓝牙搜索完成');
				// // 是否具有当前设备
				// if (deviceId) {
				// 	isHaveDevice = true;
				// } else {
				// 	isHaveDevice = false;
				// }
				// resolve(isHaveDevice);
			},
		});
	});
};
/**
 * 连接蓝牙
 * deviceId 蓝牙设备id
 */
export const connectBluetooth = () => {
	return new Promise((resolve, reject) => {
		uni.createBLEConnection({
			deviceId: deviceId, // 设备id
			success() {
				bluetoothConnect = true;
				console.log('连接蓝牙成功', deviceId);
				// 蓝牙连接成功后关闭蓝牙搜索
				stopDiscoveryBluetooth();
				resolve();
				// 获取服务id
				getServiceId();
			},
			fail() {
				bluetoothConnect = false;
				console.log('蓝牙连接失败');
				reject();
			},
		});
	});
};
// closeBLEConnection  deviceId  断开蓝牙
export const closeBLEConnection = () => {
	return new Promise((resolve, reject) => {
		uni.closeBLEConnection({
			deviceId: deviceId,
			success(res) {
				bluetoothConnect = false; // 更新连接状态
				console.log('蓝牙断开成功', res);
				resolve();
			},
			fail(err) {
				console.log('蓝牙断开失败', err);
				reject(err);
			},
		});
	});
};
// 获取服务id
export const getServiceId = () => {
	uni.getBLEDeviceServices({
		deviceId: deviceId,
		success(res) {
			console.log('获取服务Id', res);
			let model = res.services[0];
			serviceId = model.uuid;

			// 调用蓝牙监听和写入功能
			getCharacteId();
		},
	});
};
// 获取蓝牙低功耗设备某个服务中所有特征
export const getCharacteId = () => {
	uni.getBLEDeviceCharacteristics({
		deviceId: deviceId, // 蓝牙设备id
		serviceId: serviceId, // 蓝牙服务UUID
		success(res) {
			console.log('数据监听', res);
			res.characteristics.forEach((item) => {
				// 通知
				if (item.properties.notify === true) {
					notify = item.uuid;
					startNotice();
				}
				// 写入
				if (item.properties.write === true) {
					writeId = item.uuid;
					uni.setStorageSync('writeId', writeId);
				}
			});
		},
		fail(err) {
			console.log('数据监听失败', err);
		},
	});
};
// 启用低功耗蓝牙设备特征值变化时的notify功能
export const startNotice = () => {
	uni.notifyBLECharacteristicValueChange({
		characteristicId: notify,
		deviceId: deviceId,
		serviceId: serviceId,
		state: true,
		success(res) {
			// 监听低功耗蓝牙设备的特征值变化
			uni.onBLECharacteristicValueChange((result) => {
				console.log('监听低功耗蓝牙设备的特征值变化', result);
				function arrayBufferToString(buffer) {
					const uint8Array = new Uint8Array(buffer);
					let str = '';

					for (let i = 0; i < uint8Array.length; i++) {
						str += String.fromCharCode(uint8Array[i]);
					}

					return str;
				}
				if (result.value) {
					// 将 result.value 视为 ArrayBuffer
					let data = arrayBufferToString(result.value);
					console.log('帽子返回数据', data);
				}
			});
		},
	});
};
// 蓝牙发送数据
export const writeData = (buffer) => {
	return new Promise((resolve, reject) => {
		uni.writeBLECharacteristicValue({
			characteristicId: uni.getStorageSync('writeId'),
			deviceId: deviceId,
			serviceId: serviceId,
			value: buffer,
			success(res) {
				console.log('写入成功', res);
				resolve();
			},
			fail(err) {
				console.log('写入失败', err);
				reject();
			},
		});
	});
};
