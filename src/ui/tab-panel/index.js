// A container for tabs.

import Vue from 'vue';

export default Vue.extend({
	template: require('./index.html'),

	props: {
		active: {
			type: Number,
			default: 0
		}
	},

	data: () => ({}),

	computed: {
		singleWidthPercent() {
			return 1 / this.$children.length * 100;
		}
	}
});
