// A container for tabs.

import Vue from 'vue';
import eventHub from '../../vue/eventhub';

export default Vue.extend({
	template: require('./index.html'),

	props: {
		active: {
			type: String,
			default: "0"
		}
	},

	data: () => ({}),

	computed: {
		singleWidthPercent() {
			return 1 / this.$children.length * 100;
		},
	},

	methods: {
		changeActive(id){
			let newActive = id;
			eventHub.$emit('change-active', newActive);
		}
	}
});
