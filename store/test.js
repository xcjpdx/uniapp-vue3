import { defineStore } from 'pinia';
import { ref } from 'vue';
export const testStore = defineStore('test', () => {
	let data = ref(0);

	async function changeData() {
		data.value++;
	}

	return {
		data,
		changeData,
	};
});

/* 页面使用方法:
import { testStore } from '@/store/test.js'; // 引入仓库
const test_Store = testStore(); // 声明并拿到仓库示例
test_Store.data // 访问仓库的数据
test_Store.changeData() // 调用仓库的函数
*/
