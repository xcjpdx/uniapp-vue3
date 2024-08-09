import { defineStore } from 'pinia';
import { ref } from 'vue';
export const useDataStore = defineStore(
	'song',
	() => {
		let data = ref(0); // 数据

		async function changeData() {
			data.value++;
		}

		return {
			data,
			changeData,
		};
	},
	{
		// persist: true,
		// 配置持久化
		persist: {
			// 兼容多端的API
			storage: {
				setItem(key, value) {
					uni.setStorageSync(key, value);
				},
				getItem(key) {
					return uni.getStorageSync(key);
				},
			},
		},
	}
);

/* 页面使用方法:
import { useDataStore } from '@/store/index.js'; // 引入仓库
const dataStore = useDataStore(); // 声明并拿到仓库示例
dataStore.data // 访问仓库的数据
dataStore.changeData() // 调用仓库的函数
*/
