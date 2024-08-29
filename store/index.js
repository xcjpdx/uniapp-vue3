import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';
export const setupStore = () => {
	const store = createPinia();
	store.use(
		createPersistedState({
			// 自动将所有 store 持久化
			auto: true,
			storage: {
				setItem(key, value) {
					uni.setStorageSync(key, value);
				},
				getItem(key) {
					return uni.getStorageSync(key);
				},
			},
		})
	);
	return store;
};
