<script>
	import { downloadFont, checkUpdate } from '@/utils';
	export default {
		onLaunch: function () {
			// downloadFont();
			// checkUpdate();
		},
		onShow: function () {},
		onHide: function () {},
		methods: {},
	};
</script>

<style lang="scss">
	@import '@climblee/uv-ui/index.scss';

	/*
	引入字体 字体包的地址可本地地址可在线地址
	使用:在需要用到的元素的css样式中:font-family: 字体包的自定义名称;
	*/
	// @font-face {
	// 	font-family: '字体包的自定义名称';
	// 	src: url('字体包的地址') format('truetype');
	// 	font-weight: normal;
	// 	font-style: normal;
	// 	font-display: swap;
	// }

	view {
		box-sizing: border-box;
	}
	page {
		font-size: $uni-font-size-theme;
		background: $uni-bg-color;
		color: $uni-text-color;
		scroll-behavior: smooth;
	}
	uni-modal {
		z-index: 999999 !important;
	}
	uni-toast {
		z-index: 9999999 !important;
	}
</style>
