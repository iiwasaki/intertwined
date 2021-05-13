/*
A toggle between light and dark themes.
*/

import Vue from 'vue';
const { setPref } = require('../../data/actions/pref');

export default Vue.extend({
	template: require('./theme-switcher.html'),

	methods: {
		setTheme(value) {
			this.setPref('appTheme', value);
		}
	},

	vuex: {
		actions: {
			setPref
		},

		getters: {
			themePref: state => state.pref.appTheme
		}
	}
});

