import Vue from 'vue';
import modal from '../../ui/modal-dialog';

require('./index.less');

export default Vue.extend({
	data: () => ({
		origin: null
	}),

	template: require('./index.html'),

	components: {
		'modal-dialog': modal,
	},

	vuex: {
		getters: {
			appInfo: state => state.appInfo
		}
	}
});
