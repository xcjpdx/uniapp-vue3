<template>
	<swiper
		:display-multiple-items="showNum"
		:circular="true"
		:autoplay="false"
		:interval="100"
		:duration="100"
		easing-function="linear"
		:style="{ height: cardHeigth + 'px' }"
	>
		<swiper-item v-for="(card, index) in props.list" :key="index" @click="clickCard(card)">
			<div class="card-item">
				<image :src="card.url" mode="" />
				<text>{{ card.name }}</text>
			</div>
		</swiper-item>
	</swiper>
</template>

<script setup>
	import { ref, onMounted, computed, watch, getCurrentInstance, nextTick } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	const { proxy } = getCurrentInstance();
	const example = proxy;
	const props = defineProps({
		list: {
			type: Array,
			required: true,
		},
		showNum: {
			type: Number,
			required: true,
		},
	});
	let showNum = ref(0);
	watch(
		() => props.list.length,
		(val) => {
			if (val) {
				showNum.value = props.showNum;
			}
		},
		{ immediate: true }
	);

	onMounted(async () => {
		await nextTick();
		let query = uni.createSelectorQuery().in(example);
		query
			.selectAll('.card-item')
			.boundingClientRect((arr) => {
				cardHeigth.value = arr[0].height;
			})
			.exec();
	});
	let cardHeigth = ref(0);

	const emit = defineEmits(['clickCard']);
	function clickCard(card) {
		emit('clickCard', card);
	}
</script>

<style lang="scss" scoped>
	.card-item {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		margin-right: 10rpx;
		image {
			width: 100%;
			height: 200rpx;
			margin-bottom: 10rpx;
		}
		text {
			font-size: 24rpx;
			color: #333;
			font-weight: 800;
		}
	}
</style>
