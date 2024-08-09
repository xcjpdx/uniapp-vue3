let bluetoothOpen = false; // 手机蓝牙是否打开
let isSearch = false; // 是否正在搜索
let bluetoothArr = []; // 扫描到的蓝牙
let deviceId = null; // 设备id
let serviceId = null; // 服务id
let notifyId = null; // 通知服务的uuid
let writeId = null; // 写入服务的uuid

// 初始化蓝牙模块 并 获取本机蓝牙适配器状态(是否开启蓝牙)
const getBluetoothState = () => {
	return new Promise((resolve, reject) => {
		uni.openBluetoothAdapter({
			success: () => {
				console.log('蓝牙初始化成功');
				// 获取本机蓝牙适配器状态
				uni.getBluetoothAdapterState({
					success: function (res) {
						console.log('蓝牙是否正在搜索设备：', res.discovering);
						console.log('蓝牙适配器是否可用：', res.available);
						if (res.available) {
							bluetoothOpen = true;
							resolve();
						} else {
							uni.showToast({
								title: '请打开蓝牙',
								icon: 'none',
							});
							bluetoothOpen = false;
							reject();
						}
					},
					fail: function (err) {
						// 请开启蓝牙
						uni.showToast({
							title: '请打开蓝牙',
							icon: 'none',
						});
						bluetoothOpen = false;
						reject();
					},
				});
			},
			fail: () => {
				uni.showToast({
					title: '请打开蓝牙',
					icon: 'none',
				});
				bluetoothOpen = false;
				reject();
			},
		});
	});
};
// 开始搜索蓝牙设备
const startDiscoveryBluetooth = () => {
	return new Promise((resolve, reject) => {
		if (isSearch) {
			uni.showToast({
				title: '已经正在搜索蓝牙设备了',
				icon: 'none',
			});
			reject();
		}
		uni.startBluetoothDevicesDiscovery({
			success(res) {
				console.log('开始搜寻附近的蓝牙外围设备成功', res);
				isSearch = true;
				uni.showToast({
					title: '搜索蓝牙设备完成',
					icon: 'none',
				});
				resolve();
			},
			fail(err) {
				console.log('开始搜寻附近的蓝牙外围设备失败', err);
				isSearch = false;
				reject();
			},
		});
	});
};
// 停止搜索蓝牙设备
const stopDiscoveryBluetooth = () => {
	uni.stopBluetoothDevicesDiscovery({
		success(res) {
			console.log('停止搜寻附近的蓝牙外围设备成功', res);
			isSearch = false;
		},
	});
};
// 获取搜索到的蓝牙设备信息
const getBluetoothDevicesInfo = () => {
	return new Promise((resolve, reject) => {
		uni.getBluetoothDevices({
			success(res) {
				console.log('获取搜索到的蓝牙设备信息', res.devices);
				// 过滤掉name为空或者未知设备的设备
				let devices = res.devices.filter(function (obj) {
					return obj.name !== '' && obj.name !== '未知设备';
				});
				console.log('有名称的蓝牙列表', devices);
				bluetoothArr = devices;
				resolve(bluetoothArr);
			},
			fail() {
				console.log('获取搜索到的蓝牙设备信息失败');
				reject();
			},
		});
	});
};
// 连接蓝牙
const connectBluetooth = (deviceName) => {
	return new Promise((resolve, reject) => {
		let isHaveDevice = false;
		let lookupDeviceId = null;
		for (let index = 0; index < bluetoothArr.length; index++) {
			const e = bluetoothArr[index];
			if (e.name === deviceName) {
				lookupDeviceId = e.deviceId;
				isHaveDevice = true;
				break;
			}
		}
		if (!isHaveDevice) {
			uni.showToast({
				title: '未找到该设备',
				icon: 'none',
			});
			reject();
			return;
		}
		if (lookupDeviceId == deviceId) {
			uni.showToast({
				title: '已连接该设备',
				icon: 'none',
			});
			reject();
			return;
		}
		deviceId = lookupDeviceId;
		uni.createBLEConnection({
			deviceId: deviceId, // 设备id
			success() {
				console.log('连接蓝牙成功', {
					deviceName: deviceName,
					deviceId: deviceId,
				});
				if (isSearch) {
					stopDiscoveryBluetooth();
				}
				resolve();
				// 获取服务id
				getServiceId();
			},
			fail() {
				console.log('蓝牙连接失败');
				reject();
			},
		});
	});
};
// 断开蓝牙
const disconnectBluetooth = () => {
	return new Promise((resolve, reject) => {
		if (!deviceId) {
			uni.showToast({
				title: '请先连接蓝牙',
				icon: 'none',
			});
			reject();
			return;
		}
		uni.closeBLEConnection({
			deviceId: deviceId,
			success(res) {
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
const getServiceId = () => {
	uni.getBLEDeviceServices({
		deviceId: deviceId,
		success(res) {
			console.log('获取服务Id成功', res);
			/*
			res.services是一个数组，数组中的每一项代表一个蓝牙服务
			找到你需要的蓝牙服务,将其uuid赋值给serviceId
			*/
			for (let index = 0; index < res.services.length; index++) {
				const e = res.services[index];
				if (e.uuid == '49535343-FE7D-4AE5-8FA9-9FAFD205E455') {
					serviceId = e.uuid;
					// 调用蓝牙监听和写入功能
					getCharacteristics();
					break;
				}
			}
		},
	});
};
// 获取蓝牙设备某个服务中所有特征值
const getCharacteristics = () => {
	uni.getBLEDeviceCharacteristics({
		deviceId: deviceId, // 蓝牙设备id
		serviceId: serviceId, // 蓝牙服务UUID
		success(res) {
			console.log('服务中所有特征值', res);
			res.characteristics.forEach((item) => {
				// 通知
				if (item.properties.notify === true) {
					notifyId = item.uuid;
					startNotice();
				}
				// 写入
				if (item.properties.write === true) {
					writeId = item.uuid;
				}
			});
		},
		fail(err) {
			console.log('获取服务中所有特征值失败', err);
		},
	});
};
// 启用低功耗蓝牙设备特征值变化时的notify功能(通知)
const startNotice = () => {
	uni.notifyBLECharacteristicValueChange({
		deviceId: deviceId,
		serviceId: serviceId,
		characteristicId: notifyId,
		state: true,
		success() {
			// 监听低功耗蓝牙设备的特征值变化
			uni.onBLECharacteristicValueChange((result) => {
				console.log('监听低功耗蓝牙设备的特征值变化', result);
				if (result.value) {
					let data = ab2hex(result.value);
					console.log('16进度字符串', data);
				}
				// ArrayBuffer转16进度字符串
				function ab2hex(buffer) {
					const hexArr = Array.prototype.map.call(new Uint8Array(buffer), function (bit) {
						return ('00' + bit.toString(16)).slice(-2);
					});
					return hexArr.join('');
				}
			});
		},
	});
};
// 蓝牙发送数据
const writeData = (ArrayBuffer) => {
	return new Promise((resolve, reject) => {
		uni.writeBLECharacteristicValue({
			deviceId: deviceId,
			serviceId: serviceId,
			characteristicId: writeId,
			value: ArrayBuffer,
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

export default {
	getBluetoothState,
	startDiscoveryBluetooth,
	stopDiscoveryBluetooth,
	getBluetoothDevicesInfo,
	connectBluetooth,
	disconnectBluetooth,
	writeData,
};
