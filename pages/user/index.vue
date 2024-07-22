<template>
	<div>
		<button @click="initializeBluetooth">初始化蓝牙</button>
		<button @click="searchBluetoothDevices">搜索蓝牙设备</button>
		<button @click="stopBluetoothDiscovery">停止搜索蓝牙设备</button>
		<button @click="getFoundBluetoothDevices">获取搜索到的设备</button>
		<button @click="connectToBluetoothDevice">连接蓝牙设备</button>
		<button @click="disconnectFromBluetoothDevice">断开蓝牙设备</button>
		<button @click="sendDataToBluetoothDevice">发送数据到蓝牙设备</button>
	</div>
</template>

<script setup>
	import { ref, onMounted } from 'vue';
	import {
		getBluetoothState,
		discoveryBluetooth,
		stopDiscoveryBluetooth,
		getBluetoothDevices,
		connectBluetooth,
		closeBLEConnection,
		writeData,
	} from './ly'; // 更新为你的蓝牙工具文件路径

	const deviceName = 'XC12406200001'; // 更新为你要搜索的设备名称

	onMounted(() => {});

	// 初始化蓝牙
	const initializeBluetooth = async () => {
		try {
			await getBluetoothState();
			console.log('蓝牙初始化完成');
		} catch (error) {
			console.log('蓝牙初始化失败', error);
		}
	};

	// 搜索蓝牙设备
	const searchBluetoothDevices = async () => {
		try {
			await discoveryBluetooth();
			console.log('蓝牙设备搜索完成');
		} catch (error) {
			console.log('蓝牙设备搜索失败', error);
		}
	};

	// 停止搜索蓝牙设备
	const stopBluetoothDiscovery = () => {
		stopDiscoveryBluetooth();
	};

	// 获取搜索到的设备
	const getFoundBluetoothDevices = async () => {
		try {
			const found = await getBluetoothDevices(deviceName);
			if (found) {
				console.log('找到目标设备');
			} else {
				console.log('未找到目标设备');
			}
		} catch (error) {
			console.log('获取设备失败', error);
		}
	};

	// 连接蓝牙设备
	const connectToBluetoothDevice = async () => {
		try {
			await connectBluetooth();
			console.log('连接蓝牙设备成功');
		} catch (error) {
			console.log('连接蓝牙设备失败', error);
		}
	};

	// 断开蓝牙设备
	const disconnectFromBluetoothDevice = async () => {
		try {
			await closeBLEConnection();
			console.log('断开蓝牙设备成功');
		} catch (error) {
			console.log('断开蓝牙设备失败', error);
		}
	};

	// 发送数据到蓝牙设备
	const sendDataToBluetoothDevice = async () => {
		try {
			let buffer = stringToArrayBuffer('112552');
			console.log('buffer', buffer);
			await writeData(buffer);
			console.log('数据发送成功');
		} catch (error) {
			console.log('数据发送失败', error);
		}
	};
	function stringToArrayBuffer(str) {
		str = str.split('');
		str = str
			.map((item) => {
				return '0' + item;
			})
			.join('');
		console.log('str', str);
		let buffer = new ArrayBuffer(str.length);
		let dataView = new DataView(buffer);
		for (let i = 0; i < str.length; i++) {
			dataView.setUint8(i, str.charCodeAt(i));
		}
		return buffer;
	}
</script>

<style scoped>
	button {
		margin: 10px;
		padding: 10px;
		background-color: #007aff;
		color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}
	button:hover {
		background-color: #005bbb;
	}
</style>
