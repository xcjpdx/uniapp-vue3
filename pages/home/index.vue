<template>
	<div> </div>
</template>

<script setup>
	import { ref, onMounted, computed, watchEffect, getCurrentInstance } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	const { proxy } = getCurrentInstance();
	const example = proxy;
	const props = defineProps({
		xx: {
			type: String,
			default: '',
			required: true,
		},
	});
	const emit = defineEmits(['xx']);
	onMounted(() => {});
	onLoad((res) => {});
</script>

<style lang="scss" scoped></style>
