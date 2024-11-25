<template>
	<div class="main-box" v-if="mainShow" :style="{ top: props.offsetAmount }">
		<div class="mask-box"></div>
		<div
			class="box"
			:class="{ 'animation-show': props.popupShow, 'animation-hide': !props.popupShow }"
		></div>
	</div>
</template>

<script setup>
	import { ref, onMounted, computed, watch, getCurrentInstance } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	const { proxy } = getCurrentInstance();
	const props = defineProps({
		popupShow: {
			type: Boolean,
			required: true,
		},
		offsetAmount: {
			type: String,
			required: true,
		},
	});
	const mainShow = ref(false);
	watch(
		() => props.popupShow,
		(val) => {
			if (val) {
				mainShow.value = val;
			} else {
				setTimeout(() => {
					mainShow.value = val;
				}, 500);
			}
		},
		{ immediate: true }
	);
	onMounted(() => {});
	onLoad((res) => {});
</script>

<style lang="scss" scoped>
	.main-box {
		position: fixed;
		z-index: 1000;
		left: 0;
		width: 100%;
		height: 100vh;
		.mask-box {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: rgba(0, 0, 0, 0.5);
			z-index: -1;
		}
		.box {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			background: #fff;
		}
		@keyframes show {
			0% {
				transform: translateY(-100%);
			}
			100% {
				transform: translateY(0);
			}
		}
		.animation-show {
			animation: show 0.5s;
		}
		@keyframes hide {
			0% {
				transform: translateY(0);
			}
			100% {
				transform: translateY(-100%);
			}
		}
		.animation-hide {
			animation: hide 0.5s;
		}
	}
</style>
