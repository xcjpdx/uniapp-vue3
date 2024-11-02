<template>
	<checkUpdate></checkUpdate>
</template>

<script setup>
	import { ref, onMounted, computed, watchEffect, getCurrentInstance } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	const { proxy } = getCurrentInstance();

	onMounted(() => {});
	onLoad((res) => {});

	import checkUpdate from './checkUpdate.vue';
</script>

<style lang="scss" scoped></style>
