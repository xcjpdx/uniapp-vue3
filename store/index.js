import { defineStore } from 'pinia';
import { ref } from 'vue';
export const useDataStore = defineStore(
	'song',
	() => {
		let data = ref(0); // 数据

		// 函数
		async function changeData(data) {
			data.value = data.value + 1;
			console.log('函数');
		}

		return {
			data,
			changeData,
		};
	},
	{
		persist: true,
	}
);

/* 页面使用方法:
import { useDataStore } from '../../store/index'; // 引入仓库
let songData = useDataStore(); // 声明并拿到仓库示例
songData.data // 访问仓库的数据
songData.changeData() // 调用仓库的函数
*/
