<template>
	<div class="date-time-box" v-if="markShow" @click="clickMask">
		<div
			class="date-time-picker"
			:class="{ 'animation-show': props.timeShow, 'animation-hide': !props.timeShow }"
		>
			<div class="control-box" v-if="props.showToolbar">
				<div class="cancel" :style="{ color: props.cancelColor }" @click.stop="cancel">{{
					props.cancelText
				}}</div>
				<div class="title">{{ props.title }}</div>
				<div class="confirm" :style="{ color: props.confirmColor }" @click.stop="confirm">{{
					props.confirmText
				}}</div>
			</div>
			<div class="description-box" v-if="props.showDescription">
				<template v-if="showYear"><div class="description-item">年</div></template>
				<template v-if="showMonth"><div class="description-item">月</div></template>
				<template v-if="showDay"><div class="description-item">日</div></template>
				<template v-if="showHour"><div class="description-item">时</div></template>
				<template v-if="showMinute"><div class="description-item">分</div></template>
			</div>
			<picker-view
				:indicator-style="indicatorStyle"
				:value="selectDate"
				:immediate-change="props.immediateChange"
				@change="bindChange"
				class="picker-view"
				:style="pickerStyle"
			>
				<picker-view-column v-if="showYear">
					<view class="item" v-for="(item, index) in years" :key="index">{{ item }}</view>
				</picker-view-column>
				<picker-view-column v-if="showMonth">
					<view class="item" v-for="(item, index) in formattedMonths" :key="index">{{ item }}</view>
				</picker-view-column>
				<picker-view-column v-if="showDay">
					<view class="item" v-for="(item, index) in formattedDays" :key="index">{{ item }}</view>
				</picker-view-column>
				<picker-view-column v-if="showHour">
					<view class="item" v-for="(item, index) in formattedHours" :key="index">{{ item }}</view>
				</picker-view-column>
				<picker-view-column v-if="showMinute">
					<view class="item" v-for="(item, index) in formattedMinutes" :key="index">{{
						item
					}}</view>
				</picker-view-column>
			</picker-view>
		</div>
	</div>
</template>

<script setup>
	import { ref, onMounted, watch, nextTick, computed } from 'vue';

	const props = defineProps({
		timeShow: {
			type: Boolean,
			required: true,
		},
		currentTime: {
			type: [Number, String],
		},
		type: {
			type: String,
			default: '1',
		},
		itemHeight: {
			type: Number,
			default: 40,
		},
		visibleItemCount: {
			type: Number,
			default: 5,
		},
		yearRange: {
			type: Number,
			default: 5,
		},
		closeOnClickOverlay: {
			type: Boolean,
			default: false,
		},
		showToolbar: {
			type: Boolean,
			default: true,
		},
		cancelText: {
			type: String,
			default: '取消',
		},
		cancelColor: {
			type: String,
			default: '#909193',
		},
		confirmText: {
			type: String,
			default: '确认',
		},
		confirmColor: {
			type: String,
			default: '#3c9cff',
		},
		title: {
			type: String,
			default: '',
		},
		showDescription: {
			type: Boolean,
			default: true,
		},
		immediateChange: {
			type: Boolean,
			default: true,
		},
	});
	const emit = defineEmits(['update:timeShow', 'update:currentTime', 'confirm']);

	onMounted(() => {
		indicatorStyle.value = `height: ${props.itemHeight}px;`;
		pickerStyle.value = `height: ${props.visibleItemCount * props.itemHeight}px;`;
	});

	const date = new Date();
	const years = ref([]);
	const months = ref([]);
	const days = ref([]);
	const hours = ref([]);
	const minutes = ref([]);
	const year = ref('');
	const month = ref('');
	const day = ref('');
	const hour = ref('');
	const minute = ref('');
	const selectDate = ref([]);
	const indicatorStyle = ref('');
	const pickerStyle = ref('');

	const showYear = computed(() => ['1', '2', '3', '7'].includes(props.type));
	const showMonth = computed(() => ['1', '2', '3', '4', '5', '8'].includes(props.type));
	const showDay = computed(() => ['1', '2', '4', '5', '6', '9'].includes(props.type));
	const showHour = computed(() => ['1', '5', '6', '10', '11'].includes(props.type));
	const showMinute = computed(() => ['1', '5', '6', '10', '12'].includes(props.type));

	const markShow = ref(false); // 遮罩层是否显示
	watch(
		() => props.timeShow,
		(val) => {
			if (val) {
				init();
				markShow.value = true;
			} else {
				setTimeout(() => {
					markShow.value = false;
				}, 500);
			}
		},
		{ immediate: true }
	);

	async function init() {
		let currentTime = props.currentTime || null;
		if (currentTime) {
			year.value = new Date(currentTime).getFullYear();
			month.value = new Date(currentTime).getMonth() + 1;
			day.value = new Date(currentTime).getDate();
			hour.value = new Date(currentTime).getHours();
			minute.value = new Date(currentTime).getMinutes();
		} else {
			year.value = date.getFullYear();
			month.value = date.getMonth() + 1;
			day.value = date.getDate();
			hour.value = date.getHours();
			minute.value = date.getMinutes();
		}

		years.value = [];
		months.value = [];
		days.value = [];
		hours.value = [];
		minutes.value = [];
		for (let i = year.value - props.yearRange; i <= year.value + props.yearRange; i++) {
			years.value.push(i);
		}
		for (let i = 1; i <= 12; i++) {
			months.value.push(i);
		}
		updateDays();
		for (let i = 0; i < 24; i++) {
			hours.value.push(i);
		}
		for (let i = 0; i < 60; i++) {
			minutes.value.push(i);
		}

		const currentYearIndex = years.value.indexOf(year.value);
		const currentMonthIndex = month.value - 1;
		const currentDayIndex = day.value - 1;
		const currentHourIndex = hour.value;
		const currentMinuteIndex = minute.value;

		await nextTick();
		selectDate.value = [
			showYear.value ? currentYearIndex : 0,
			showMonth.value ? currentMonthIndex : 0,
			showDay.value ? currentDayIndex : 0,
			showHour.value ? currentHourIndex : 0,
			showMinute.value ? currentMinuteIndex : 0,
		].filter((_, idx) => {
			if (idx === 0 && !showYear.value) return false;
			if (idx === 1 && !showMonth.value) return false;
			if (idx === 2 && !showDay.value) return false;
			if (idx === 3 && !showHour.value) return false;
			if (idx === 4 && !showMinute.value) return false;
			return true;
		});
	}

	function updateDays() {
		const daysInMonth = new Date(year.value, month.value, 0).getDate();
		days.value = Array.from({ length: daysInMonth }, (_, i) => i + 1);
		if (day.value > daysInMonth) day.value = daysInMonth;
	}

	function bindChange(e) {
		const val = e.detail.value;
		const selectedValues = [
			showYear.value ? years.value[val.shift()] : year.value,
			showMonth.value ? months.value[val.shift()] : month.value,
			showDay.value ? days.value[val.shift()] : day.value,
			showHour.value ? hours.value[val.shift()] : hour.value,
			showMinute.value ? minutes.value[val.shift()] : minute.value,
		];
		[year.value, month.value, day.value, hour.value, minute.value] = selectedValues;
		updateDays();
		if (!props.showToolbar) {
			let { timestamp } = getSelectedTime();
			emit('update:currentTime', timestamp);
		}
	}

	function formatNumber(n) {
		return n < 10 ? `0${n}` : n;
	}

	const formattedMonths = computed(() => months.value.map(formatNumber));
	const formattedDays = computed(() => days.value.map(formatNumber));
	const formattedHours = computed(() => hours.value.map(formatNumber));
	const formattedMinutes = computed(() => minutes.value.map(formatNumber));

	function clickMask() {
		if (props.closeOnClickOverlay) {
			emit('update:timeShow', false);
		}
	}
	function cancel() {
		emit('update:timeShow', false);
	}
	function confirm() {
		let { timestamp, formattedDate } = getSelectedTime();
		emit('confirm', timestamp, formattedDate);
		emit('update:currentTime', timestamp);
		emit('update:timeShow', false);
	}
	// 获取选中时间的毫秒数以及格式化后的展示时间
	// function getSelectedTime() {
	// 	const selectedDate = new Date(year.value, month.value - 1, day.value, hour.value, minute.value);
	// 	const timestamp = selectedDate.getTime();
	// 	const data_year = formatNumber(year.value);
	// 	const data_month = formatNumber(month.value);
	// 	const data_day = formatNumber(day.value);
	// 	const data_hours = formatNumber(hour.value);
	// 	const data_minutes = formatNumber(minute.value);
	// 	const formattedDate = `${data_year}-${data_month}-${data_day} ${data_hours}:${data_minutes}`;
	// 	return { timestamp, formattedDate };
	// }
	function getSelectedTime() {
		const selectedDate = new Date(year.value, month.value - 1, day.value, hour.value, minute.value);
		const timestamp = selectedDate.getTime();
		const data_year = formatNumber(year.value);
		const data_month = formatNumber(month.value);
		const data_day = formatNumber(day.value);
		const data_hours = formatNumber(hour.value);
		const data_minutes = formatNumber(minute.value);

		let formattedDate;
		switch (props.type) {
			case '1':
				formattedDate = `${data_year}-${data_month}-${data_day} ${data_hours}:${data_minutes}`;
				break;
			case '2':
				formattedDate = `${data_year}-${data_month}-${data_day}`;
				break;
			case '3':
				formattedDate = `${data_year}-${data_month}`;
				break;
			case '4':
				formattedDate = `${data_month}-${data_day}`;
				break;
			case '5':
				formattedDate = `${data_month}-${data_day} ${data_hours}:${data_minutes}`;
				break;
			case '6':
				formattedDate = `${data_day} ${data_hours}:${data_minutes}`;
				break;
			case '7':
				formattedDate = `${data_year}`;
				break;
			case '8':
				formattedDate = `${data_month}`;
				break;
			case '9':
				formattedDate = `${data_day}`;
				break;
			case '10':
				formattedDate = `${data_hours}:${data_minutes}`;
				break;
			case '11':
				formattedDate = `${data_hours}`;
				break;
			case '12':
				formattedDate = `${data_minutes}`;
				break;
			default:
				formattedDate = `${data_year}-${data_month}-${data_day} ${data_hours}:${data_minutes}`;
		}

		return { timestamp, formattedDate };
	}
</script>

<style lang="scss" scoped>
	.date-time-box {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		z-index: 9999;
		.date-time-picker {
			position: absolute;
			bottom: 0;
			left: 0;
			width: 100%;
			background: #fff;
			border-radius: 30rpx 30rpx 0 0;
			padding: 30rpx;
			box-sizing: border-box;
			.control-box {
				padding: 0 20rpx;
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 30rpx;
				.title {
					font-size: 32rpx;
					font-weight: 800;
					color: #333;
				}
				.cancel {
					font-size: 32rpx;
					font-weight: 800;
				}
				.confirm {
					font-size: 32rpx;
					font-weight: 800;
				}
			}
			.description-box {
				display: flex;
				justify-content: space-around;
				margin-bottom: 10rpx;
				.description-item {
					font-size: 28rpx;
					font-weight: 800;
					color: #333;
				}
			}
			.picker-view {
				.item {
					display: flex;
					justify-content: center;
					align-items: center;
				}
			}
		}
		@keyframes show {
			0% {
				transform: translateY(100%);
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
				transform: translateY(100%);
			}
		}
		.animation-hide {
			animation: hide 0.5s;
		}
	}
</style>
