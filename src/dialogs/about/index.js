import Vue from 'vue';

require('./index.less');

export default Vue.extend({
	data: () => ({
		origin: null
	}),

	template: require('./index.html'),

	components: {
		'modal-dialog': require('../../ui/modal-dialog'),
	},

	vuex: {
		getters: {
			appInfo: state => state.appInfo
		}
	}
});
